import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText, Boxes, Scale, Package, Warehouse,
  Database, CalendarDays, Loader2, Printer, Download,
  ChevronDown, Check, Search, X, PackageX,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  fetchBases, fetchFiltres,
  fetchEtatStock, fetchBalanceStock, fetchStockParDepot,
  fetchMouvements, fetchStock,
} from '../api/stockApi';
import { useDashboard } from '../context/DashboardContext'; // ✅ AJOUTÉ

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const fmtNum = (n) => {
  const v = Number(n ?? 0);
  if (isNaN(v)) return '—';
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const todayISO = () => new Date().toISOString().slice(0, 10);
const firstOfMonthISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

/* ══════════════════════════════════════════════════════════
   DÉFINITION DES ÉTATS
══════════════════════════════════════════════════════════ */
const RAPPORTS = [
  {
    id: 'etatStock',
    label: 'État de stock',
    sousTitre: 'Photo du stock à une date donnée',
    icon: Boxes,
    color: '#12a6e0',
    needs: ['base', 'date', 'depot'],
    columns: [
      { key: 'Article', label: 'Article' },
      { key: 'Designation', label: 'Désignation' },
      { key: 'Code Famille', label: 'Famille' },
      { key: 'Nom Depot', label: 'Dépôt' },
      { key: 'Stock', label: 'Stock', align: 'right', num: true },
      { key: 'Valeur', label: 'Valeur (MAD)', align: 'right', num: true },
    ],
  },
  {
    id: 'journalMouvements',
    label: 'Journal des mouvements',
    sousTitre: "Toutes les entrées/sorties sur une période",
    icon: FileText,
    color: '#01a82e',
    needs: ['base', 'periode', 'depot', 'article'],
    columns: [
      { key: 'Date', label: 'Date' },
      { key: 'Article', label: 'Article' },
      { key: 'Designation', label: 'Désignation' },
      { key: 'Nom Depot', label: 'Dépôt' },
      { key: 'Total Entrees', label: 'Entrées', align: 'right', num: true },
      { key: 'Total Sorties', label: 'Sorties', align: 'right', num: true },
    ],
  },
  {
    id: 'balanceStock',
    label: 'Balance des stocks',
    sousTitre: 'Stock début + mouvements = stock fin',
    icon: Scale,
    color: '#e08a00',
    needs: ['base', 'periode', 'groupBy'],
    columns: [
      { key: 'Code', label: 'Code' },
      { key: 'Libelle', label: 'Libellé' },
      { key: 'Stock Debut', label: 'Stock début', align: 'right', num: true },
      { key: 'Total Entrees', label: 'Entrées', align: 'right', num: true },
      { key: 'Total Sorties', label: 'Sorties', align: 'right', num: true },
      { key: 'Stock Fin', label: 'Stock fin', align: 'right', num: true },
      { key: 'Valeur Fin', label: 'Valeur fin (MAD)', align: 'right', num: true },
    ],
  },
  {
    id: 'ficheArticle',
    label: 'Fiche article',
    sousTitre: "Historique complet d'un seul article",
    icon: Package,
    color: '#7c4dff',
    needs: ['base', 'periode', 'articleObligatoire'],
    columns: [
      { key: 'Date', label: 'Date' },
      { key: 'Total Entrees', label: 'Entrées', align: 'right', num: true },
      { key: 'Total Sorties', label: 'Sorties', align: 'right', num: true },
      { key: 'Stock Final', label: 'Stock final', align: 'right', num: true },
      { key: 'Valeur Finale (Permanente)', label: 'Valeur (MAD)', align: 'right', num: true },
    ],
  },
  {
    id: 'stockParDepot',
    label: 'État par dépôt',
    sousTitre: 'Récapitulatif comparatif multi-dépôts',
    icon: Warehouse,
    color: '#e53935',
    needs: ['base', 'date'],
    columns: [
      { key: 'Nom Depot', label: 'Dépôt' },
      { key: 'Nb Articles', label: 'Nb articles', align: 'right', num: true },
      { key: 'Stock Total', label: 'Stock total', align: 'right', num: true },
      { key: 'Valeur Totale', label: 'Valeur totale (MAD)', align: 'right', num: true },
    ],
  },
];

/* ══════════════════════════════════════════════════════════
   SELECT générique (réutilisé du style existant)
══════════════════════════════════════════════════════════ */
function Select({ label, icon: Icon, value, onChange, options, placeholder, disabled, loading }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const buttonRef = React.useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePos = () => {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: Math.max(r.width, 240) });
    }
  };

  const selected = options.find(o => String(o.value) === String(value));
  const filtered = search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="flex flex-col gap-[6px]">
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
        {Icon && <Icon size={11} />} {label}
      </label>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || loading}
        onClick={() => { updatePos(); setOpen(o => !o); }}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left text-sm border outline-none
          ${disabled ? 'bg-[#f5f5f5] text-[#aaaaaa] cursor-not-allowed border-[#e0e0e0]' : 'bg-white border-[#c5c5c5] hover:border-[#12a6e0] cursor-pointer'}
          ${selected ? 'text-[#0d0c0c]' : 'text-[#aaaaaa]'}`}
      >
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        {loading ? <Loader2 size={13} className="animate-spin text-[#12a6e0]" /> : <ChevronDown size={13} className="text-[#c5c5c5]" />}
      </button>

      {open && !disabled && createPortal(
        <div
          style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width }}
          className="bg-white border border-[#cce8f6] rounded-xl shadow-[0_8px_28px_rgba(18,166,224,0.2)] z-[99999]"
        >
          <div className="px-3 py-2 border-b border-[#eef6fb] flex items-center gap-2">
            <Search size={11} className="text-[#c5c5c5]" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="flex-1 text-[12px] outline-none bg-transparent"
            />
            {search && <X size={11} className="text-[#c5c5c5] cursor-pointer" onClick={() => setSearch('')} />}
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            <div onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
              className="px-4 py-2 text-[13px] italic text-[#999999] cursor-pointer hover:bg-[#f2faff]">
              {placeholder}
            </div>
            {filtered.map(o => (
              <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); setSearch(''); }}
                className={`px-4 py-2 text-[13px] cursor-pointer flex items-center justify-between gap-2 hover:bg-[#f2faff]
                  ${String(value) === String(o.value) ? 'bg-[rgba(18,166,224,0.07)] text-[#0d8fc4] font-semibold' : 'text-[#1a1a1a]'}`}>
                <span className="truncate">{o.label}</span>
                {String(value) === String(o.value) && <Check size={13} className="text-[#12a6e0]" />}
              </div>
            ))}
            {filtered.length === 0 && <div className="py-4 text-center text-[13px] text-[#c5c5c5]">Aucun résultat</div>}
          </div>
        </div>,
        document.body
      )}
      {open && createPortal(<div className="fixed inset-0 z-[99998]" onClick={() => setOpen(false)} />, document.body)}
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
        <CalendarDays size={11} /> {label}
      </label>
      <input
        type="date" value={value} onChange={e => onChange(e.target.value)}
        className="px-3 py-2.5 rounded-lg border border-[#c5c5c5] text-sm outline-none focus:border-[#12a6e0] [color-scheme:light]"
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   EXPORT
══════════════════════════════════════════════════════════ */
function exportToExcel(rows, columns, title) {
  const headerRow = columns.map(c => c.label);
  const dataRows = rows.map(r => columns.map(c => r[c.key] ?? ''));
  const ws = XLSX.utils.aoa_to_sheet([[title], [], headerRow, ...dataRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}
function fmtNumPDF(n) {
  const v = Number(n ?? 0);
  if (isNaN(v)) return '—';
  const rounded = Math.round(v * 100) / 100;
  const parts = rounded.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const decimals = parts[1] === '00' ? '' : ',' + parts[1];
  return parts[0] + decimals;
}
function sanitizePDF(str) {
  if (str === null || str === undefined) return '—';
  return String(str)
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/[\u00A0\u202F]/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, '-');
}

function exportToPDF(rows, columns, rapport, base, periodeLabel, depotLabel, articleLabel) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(sanitizePDF(rapport.label), 14, 15);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  let infoLine = `Societe : ${sanitizePDF(base) || '-'}   |   Periode/Date : ${sanitizePDF(periodeLabel)}`;
  if (depotLabel) infoLine += `   |   Depot : ${sanitizePDF(depotLabel)}`;
  if (articleLabel) infoLine += `   |   Article : ${sanitizePDF(articleLabel)}`;
  doc.text(infoLine, 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, 14, 27);
  doc.setTextColor(0);

  const head = [columns.map(c => sanitizePDF(c.label))];
  const body = rows.map(r => columns.map(c => {
    const val = r[c.key];
    if (c.key === 'Date') return val ? new Date(val).toLocaleDateString('fr-FR') : '-';
    if (c.num) return fmtNumPDF(val);
    return sanitizePDF(val);
  }));

  const totalRow = columns.map((c, i) => {
    if (i === 0) return 'TOTAL';
    if (c.num) return fmtNumPDF(rows.reduce((s, r) => s + Number(r[c.key] ?? 0), 0));
    return '';
  });

 autoTable(doc, {
    head,
    body,
    foot: [totalRow],
    startY: 32,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, lineColor: [220, 220, 220], lineWidth: 0.1 },
    headStyles: { fillColor: [13, 12, 12], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' },
    columnStyles: columns.reduce((acc, c, i) => {
      acc[i] = c.align === 'right'
        ? { halign: 'right' }
        : { halign: 'left' };
      return acc;
    }, {}),
    tableWidth: 'auto',
    margin: { left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable.finalY || 32;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`${rows.length} ligne${rows.length > 1 ? 's' : ''} - Document genere automatiquement`, 14, finalY + 8);

  doc.save(`${rapport.label.replace(/\s+/g, '_')}_${base}.pdf`);
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function PageRapports() {
  const { currentFilters } = useDashboard(); // ✅ AJOUTÉ

  const [bases, setBases] = useState([]);
  const [loadingBases, setLoadingBases] = useState(true);

  const [typeRapport, setTypeRapport] = useState('etatStock');
  const [base, setBase] = useState(currentFilters.base || ''); // ✅ MODIFIÉ
  const [date, setDate] = useState(todayISO());
  const [dateDebut, setDateDebut] = useState(firstOfMonthISO());
  const [dateFin, setDateFin] = useState(todayISO());
  const [depot, setDepot] = useState('');
  const [article, setArticle] = useState('');
  const [groupBy, setGroupBy] = useState('article');

  const [depots, setDepots] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loadingFiltres, setLoadingFiltres] = useState(false);

  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rapport = RAPPORTS.find(r => r.id === typeRapport);

  useEffect(() => {
    fetchBases()
      .then(d => setBases(d.map(b => ({ value: b.BaseName, label: b.BaseLabel || b.BaseName }))))
      .catch(console.error)
      .finally(() => setLoadingBases(false));
  }, []);

  const loadFiltres = useCallback(async (b) => {
    if (!b) return;
    setLoadingFiltres(true);
    try {
      const data = await fetchFiltres(b, null, null);
      setDepots((data.depots || []).map(d => ({ value: String(d.Code), label: d.Libelle })));
      setArticles((data.articles || []).map(a => ({ value: a.Code, label: `${a.Code} — ${a.Libelle}` })));
    } catch (e) { console.error(e); }
    finally { setLoadingFiltres(false); }
  }, []);

  // ✅ AJOUTÉ — Sync sens unique depuis le Dashboard :
  // si une base est déjà choisie dans le Dashboard, on la reprend ici
  // et on charge directement ses dépôts/articles, une seule fois au montage.
  useEffect(() => {
    if (currentFilters.base) {
      loadFiltres(currentFilters.base);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBaseChange = (val) => {
    setBase(val); setDepot(''); setArticle(''); setRows(null);
    setDepots([]); setArticles([]);
    if (val) loadFiltres(val);
  };

  const handleTypeChange = (id) => {
    setTypeRapport(id); setRows(null); setError(null);
  };

  const handleGenerer = async () => {
    if (!base) return;
    setLoading(true); setError(null);
    try {
      let data;
      switch (typeRapport) {
        case 'etatStock':
          data = await fetchEtatStock({ base, date, depot: depot || null });
          break;
        case 'journalMouvements':
          data = await fetchMouvements({
            base, dateDebut, dateFin,
            depot: depot || null, article: article || null,
          });
          break;
        case 'balanceStock':
          data = await fetchBalanceStock({ base, dateDebut, dateFin, groupBy });
          break;
        case 'ficheArticle':
          if (!article) { setError('Veuillez sélectionner un article.'); setLoading(false); return; }
          data = await fetchStock({ base, dateDebut, dateFin, article });
          break;
        case 'stockParDepot':
          data = await fetchStockParDepot({ base, date });
          break;
        default:
          data = [];
      }
      setRows(data);
    } catch (e) {
      setError(e.message);
      setRows(null);
    } finally {
      setLoading(false);
    }
  };

  const baseLabel = bases.find(b => b.value === base)?.label || base;
  const periodeLabel = useMemo(() => {
    if (typeRapport === 'etatStock' || typeRapport === 'stockParDepot') return fmtDate(date);
    return `${fmtDate(dateDebut)} → ${fmtDate(dateFin)}`;
  }, [typeRapport, date, dateDebut, dateFin]);

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 no-print">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow-md">
          <FileText size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-[#0d0c0c] text-base font-semibold m-0">Rapports</h1>
          <p className="text-[#aaaaaa] text-[12px] m-0">États officiels de stock — exportables et imprimables</p>
        </div>
      </div>

      {/* ── Sélecteur de type ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 no-print">
        {RAPPORTS.map(r => {
          const Icon = r.icon;
          const active = typeRapport === r.id;
          return (
            <button
              key={r.id}
              onClick={() => handleTypeChange(r.id)}
              className="flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all duration-150"
              style={{
                borderColor: active ? r.color : '#e8e8e8',
                background: active ? `${r.color}0c` : '#ffffff',
                boxShadow: active ? `0 2px 12px ${r.color}22` : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${r.color}1a`, color: r.color }}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-[13px] font-semibold m-0" style={{ color: active ? r.color : '#0d0c0c' }}>{r.label}</p>
                <p className="text-[11px] text-[#aaaaaa] m-0 mt-0.5">{r.sousTitre}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Filtres ── */}
      <div className="bg-white border border-[#e4e4e4] rounded-2xl p-5 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Base SAGE" icon={Database} value={base} onChange={handleBaseChange}
            options={bases} placeholder="Sélectionner une base" loading={loadingBases} />

          {(rapport.needs.includes('date')) && (
            <DateField label="Date" value={date} onChange={setDate} />
          )}

          {rapport.needs.includes('periode') && (
            <>
              <DateField label="Du" value={dateDebut} onChange={setDateDebut} />
              <DateField label="Au" value={dateFin} onChange={setDateFin} />
            </>
          )}

          {rapport.needs.includes('depot') && (
            <Select label="Dépôt" icon={Warehouse} value={depot} onChange={setDepot}
              options={depots} placeholder="Tous les dépôts" disabled={!base} loading={loadingFiltres} />
          )}

          {(rapport.needs.includes('article') || rapport.needs.includes('articleObligatoire')) && (
            <Select label={rapport.needs.includes('articleObligatoire') ? 'Article *' : 'Article'}
              icon={Package} value={article} onChange={setArticle}
              options={articles} placeholder="Tous les articles" disabled={!base} loading={loadingFiltres} />
          )}

          {rapport.needs.includes('groupBy') && (
            <Select label="Regrouper par" value={groupBy} onChange={setGroupBy}
              options={[{ value: 'article', label: 'Article' }, { value: 'famille', label: 'Famille' }]}
              placeholder="Article" />
          )}
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#f0f0f0]">
          <button
            onClick={handleGenerer}
            disabled={!base || loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${!base || loading ? 'bg-[#e8f6fd] text-[#92cfe8] cursor-not-allowed' : 'bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] text-white shadow-md'}`}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {loading ? 'Génération…' : 'Générer le rapport'}
          </button>

          {rows && rows.length > 0 && (
            <>
              <button
                onClick={() => exportToPDF(
                  rows, rapport.columns, rapport, baseLabel, periodeLabel,
                  depots.find(d => d.value === depot)?.label,
                  article
                )}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#fef3e7] text-[#c47a00] border border-[rgba(224,138,0,0.25)] hover:bg-[#fde8cc]"
              >
                <FileText size={14} /> Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-[rgba(229,57,53,0.06)] border border-[rgba(229,57,53,0.2)] rounded-xl px-5 py-3 text-[#c62828] text-sm">
          {error}
        </div>
      )}

      {/* ── Document imprimable ── */}
      {rows && (
        <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.05)] print:shadow-none print:border-0">
          <div className="px-6 py-5 border-b-2 border-[#0d0c0c]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#0d0c0c] m-0">{rapport.label}</h2>
                <p className="text-[12px] text-[#666666] m-0 mt-1">
                  Société : <b>{baseLabel || '—'}</b> &nbsp;·&nbsp; Période/Date : <b>{periodeLabel}</b>
                  {depot && <> &nbsp;·&nbsp; Dépôt : <b>{depots.find(d => d.value === depot)?.label}</b></>}
                  {article && <> &nbsp;·&nbsp; Article : <b>{article}</b></>}
                </p>
              </div>
              <p className="text-[10px] text-[#aaaaaa] m-0">
                Généré le {new Date().toLocaleString('fr-FR')}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-[#c5c5c5] text-sm">Chargement…</div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center">
              <PackageX size={32} className="text-[#e0e0e0] mx-auto mb-2" />
              <p className="text-[#c5c5c5] text-sm">Aucune donnée pour ces critères.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#0d0c0c]">
                    {rapport.columns.map(c => (
                      <th key={c.key} className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#555555] ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-[#f0f0f0]">
                      {rapport.columns.map(c => (
                        <td key={c.key} className={`px-4 py-2 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                          {c.key === 'Date' ? fmtDate(row[c.key]) : c.num ? fmtNum(row[c.key]) : (row[c.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#0d0c0c] font-semibold bg-[#fafafa]">
                    {rapport.columns.map((c, i) => (
                      <td key={c.key} className={`px-4 py-2.5 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                        {i === 0 ? 'TOTAL' : c.num ? fmtNum(rows.reduce((s, r) => s + Number(r[c.key] ?? 0), 0)) : ''}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="px-6 py-3 border-t border-[#f0f0f0] text-[10px] text-[#aaaaaa]">
            {rows.length} ligne{rows.length > 1 ? 's' : ''} — Document généré automatiquement
          </div>
        </div>
      )}
    </div>
  );
}