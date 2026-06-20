// ══════════════════════════════════════════════════════════════
//  PageAlertes.js — Actions à faire
//  Design en onglets — cohérent avec AIPrevisions.js et StockTable.js
//  + Résumé visuel en haut (pastilles + phrase auto + jauges)
//  + Affichage du nom (désignation) des articles
// ══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Database, ChevronDown, Loader2, RefreshCw, AlertTriangle,
  CheckCircle, Clock, XCircle, ShoppingCart, Radar, Star, PackageCheck,
  AlertCircle, Search,
} from 'lucide-react';
import { fetchBases } from '../api/stockApi';
import { fetchPipelineStatus, fetchPredictionResults } from '../api/predictionsApi';

// ── Helpers ───────────────────────────────────────────────────
const fmtNum = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '—';
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(Number(n));
};

// Convertit un nombre de jours décimal (ex: 2.5) en "X j Y h" lisible.
const fmtJoursHeures = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '—';
  const v = Number(n);
  if (v <= 0) return '0 h';
  const totalHeures = Math.round(v * 24);
  const jours  = Math.floor(totalHeures / 24);
  const heures = totalHeures % 24;
  if (jours === 0) return `${heures} h`;
  if (heures === 0) return `${jours} j`;
  return `${jours} j ${heures} h`;
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Récupère le nom de l'article quel que soit le format renvoyé par le backend
const getDesign = (r) => r.AR_Design || r.ar_design || r.Design || '—';

function exportCSV(rows, filename, headers, getRow) {
  const lines = [headers.join(',')];
  rows.forEach(r => lines.push(getRow(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')));
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Bouton export — même design que StockTable.js ──────────────
function ExportButton({ onClick, label = 'Exporter CSV' }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold bg-[#f0fdf4] text-[#15803d] border border-[rgba(21,128,61,0.25)] cursor-pointer transition-all duration-150 hover:bg-[#dcfce7] hover:shadow-[0_1px_6px_rgba(21,128,61,0.18)] active:scale-[0.97]"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M12 16l-5-5h3V4h4v7h3l-5 5z" fill="#15803d"/>
        <path d="M5 20h14" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      {label}
    </button>
  );
}

// ── Pagination — même design que AIPrevisions.js ────────────────
function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
    Math.max(1, Math.min(totalPages - 4, page - 2)) + i
  ).filter(p => p >= 1 && p <= totalPages);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0]">
      <span className="text-[0.75rem] text-[#c5c5c5]">Page {page} / {totalPages}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] hover:bg-[#eaeaea] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer">← Préc.</button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)} className="w-8 h-8 rounded-lg text-[0.75rem] transition-all cursor-pointer"
            style={{ background: p === page ? '#12a6e0' : '#f5f5f5', color: p === page ? 'white' : '#666', border: p === page ? 'none' : '1px solid #e0e0e0', fontWeight: p === page ? 500 : 400 }}>{p}</button>
        ))}
        <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] hover:bg-[#eaeaea] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer">Suiv. →</button>
      </div>
    </div>
  );
}

// ── ExplainBanner (même style que Prédictions) ────────────────
function ExplainBanner({ icon: Icon, color, title, description, tip }) {
  return (
    <div className="rounded-xl border p-4 flex gap-4" style={{ background: `${color}08`, borderColor: `${color}25` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold m-0 mb-1" style={{ color }}>{title}</p>
        <p className="text-[12px] text-[#555] m-0 leading-relaxed">{description}</p>
        {tip && <p className="text-[11px] text-[#888] m-0 mt-1.5">{tip}</p>}
      </div>
    </div>
  );
}

function KpiCard({ label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 border border-[#e8e8e8]">
      <p className="text-[11px] text-[#aaaaaa] uppercase tracking-wide m-0 mb-1">{label}</p>
      <p className="text-[1.4rem] font-bold m-0" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-[#aaa] mt-0.5 m-0">{sub}</p>}
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div className="flex items-center gap-2 py-6 text-[#15803d]">
      <CheckCircle size={16} />
      <span className="text-sm">{msg}</span>
    </div>
  );
}

const PAGE_SIZE = 20;

// ── Jauge simple (barre de progression) ─────────────────────────
// Affiche le niveau de stock restant sous forme de barre colorée.
// pct = 0 (vide) à 100 (plein). Pas de courbe, pas de lecture complexe.
function StockGauge({ pct, color }) {
  const clamped = Math.max(2, Math.min(100, pct));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${clamped}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold flex-shrink-0" style={{ color }}>{Math.round(clamped)}%</span>
    </div>
  );
}

// ── Card article urgent (avec nom + jauge) ──────────────────────
function ArticleCard({ article, design, jours, stock, rythme, urgence }) {
  const cfg = urgence === 'critique'
    ? { bg: '#FFF5F5', border: '#FCA5A5', dot: '#EF4444', badge: { bg: '#FEE2E2', text: '#991B1B' }, label: 'Commander maintenant' }
    : urgence === 'alerte'
    ? { bg: '#FFFBEB', border: '#FCD34D', dot: '#F59E0B', badge: { bg: '#FEF3C7', text: '#92400E' }, label: 'Planifier une commande' }
    : { bg: '#F0FDF4', border: '#86EFAC', dot: '#22C55E', badge: { bg: '#DCFCE7', text: '#166534' }, label: 'Stock suffisant' };

  // Jauge basée sur les jours restants (cap visuel à 30 jours = 100%)
  const gaugePct = Math.min(100, (Number(jours) / 30) * 100);

  return (
    <div className="rounded-xl border p-4 flex flex-col gap-2" style={{ background: cfg.bg, borderColor: cfg.border }}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
          <span className="font-mono text-[0.75rem] font-semibold text-[#0b7db0] bg-white border border-[#B5D4F4] rounded px-2 py-0.5 flex-shrink-0">{article}</span>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: cfg.badge.bg, color: cfg.badge.text }}>{cfg.label}</span>
      </div>

      {/* Nom de l'article */}
      <p className="text-[0.8rem] text-[#444] m-0 font-medium truncate" title={design}>{design}</p>

      {/* Jauge stock restant — visuel simple, pas un graphique */}
      <div className="mt-1">
        <p className="text-[10px] text-[#aaa] m-0 mb-1">Niveau de stock</p>
        <StockGauge pct={gaugePct} color={cfg.dot} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-1">
        <div className="bg-white rounded-lg px-3 py-2 border border-[#f0f0f0]">
          <p className="text-[10px] text-[#aaa] m-0">Stock restant</p>
          <p className="text-[0.9rem] font-bold m-0" style={{ color: cfg.dot }}>{fmtNum(stock)} u.</p>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-[#f0f0f0]">
          <p className="text-[10px] text-[#aaa] m-0">Ventes / jour</p>
          <p className="text-[0.9rem] font-bold m-0 text-[#555]">{fmtNum(rythme)} u.</p>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-[#f0f0f0]">
          <p className="text-[10px] text-[#aaa] m-0">Jours restants</p>
          <p className="text-[0.85rem] font-bold m-0" style={{ color: cfg.dot }}>{fmtJoursHeures(jours)}</p>
        </div>
      </div>
    </div>
  );
}

// ── Sélecteur de base ─────────────────────────────────────────
// function BaseSelector({ bases, value, onChange, loading }) {
//   const [open, setOpen] = useState(false);
//   const selected = bases.find(b => b.BaseName === value);
//   return (
//     <div className="relative">
//       <button onClick={() => setOpen(o => !o)}
//         className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer"
//         style={{ background: value ? '#E6F1FB' : 'white', borderColor: value ? '#B5D4F4' : '#e0e0e0', color: value ? '#0C447C' : '#888' }}>
//         <Database size={14} />
//         {loading ? <Loader2 size={14} className="animate-spin" /> : (selected?.BaseLabel || selected?.BaseName || 'Sélectionner une base')}
//         <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
//       </button>
//       {open && (
//         <div className="absolute top-full mt-1 left-0 bg-white border border-[#e0e0e0] rounded-lg shadow-lg z-50 min-w-[200px]">
//           {bases.map(b => (
//             <button key={b.BaseName} onClick={() => { onChange(b.BaseName); setOpen(false); }}
//               className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#f2faff] transition-colors cursor-pointer"
//               style={{ color: b.BaseName === value ? '#12a6e0' : '#333', fontWeight: b.BaseName === value ? 500 : 400 }}>
//               {b.BaseLabel || b.BaseName}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// ── Sélecteur de base ─────────────────────────────────────────
function BaseSelector({ bases, value, onChange, loading }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null); // 👈 ajout

  // Ferme le dropdown si clic en dehors
  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const selected = bases.find(b => b.BaseName === value);
  return (
    <div className="relative" ref={ref}> {/* 👈 ref ici */}
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer"
        style={{ background: value ? '#E6F1FB' : 'white', borderColor: value ? '#B5D4F4' : '#e0e0e0', color: value ? '#0C447C' : '#888' }}>
        <Database size={14} />
        {loading ? <Loader2 size={14} className="animate-spin" /> : (selected?.BaseLabel || selected?.BaseName || 'Sélectionner une base')}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-[#e0e0e0] rounded-lg shadow-lg z-50 min-w-[200px]">
          {bases.map(b => (
            <button key={b.BaseName} onClick={() => { onChange(b.BaseName); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#f2faff] transition-colors cursor-pointer"
              style={{ color: b.BaseName === value ? '#12a6e0' : '#333', fontWeight: b.BaseName === value ? 500 : 400 }}>
              {b.BaseLabel || b.BaseName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Résumé visuel en haut de page — pastilles + phrase automatique
// ══════════════════════════════════════════════════════════════
function ResumeBandeau({ critiques, alertes, suspects, prioritaires, baseName }) {
  // Phrase générée automatiquement selon la situation
  const genererPhrase = () => {
    if (critiques === 0 && alertes === 0 && suspects === 0) {
      return `Tout est sous contrôle pour ${baseName}. Aucune action urgente requise aujourd'hui.`;
    }
    const parties = [];
    if (critiques > 0) parties.push(`${critiques} article${critiques > 1 ? 's' : ''} à commander d'urgence`);
    if (alertes > 0) parties.push(`${alertes} à planifier cette semaine`);
    if (suspects > 0) parties.push(`${suspects} mouvement${suspects > 1 ? 's' : ''} à vérifier`);
    return `Aujourd'hui pour ${baseName} : ${parties.join(', ')}.`;
  };

  const PASTILLES = [
    { label: 'Urgents', value: critiques, color: '#EF4444', bg: '#FEE2E2', Icon: AlertCircle },
    { label: 'Bientôt', value: alertes, color: '#F59E0B', bg: '#FEF3C7', Icon: Clock },
    { label: 'À vérifier', value: suspects, color: '#8B5CF6', bg: '#EDE9FE', Icon: Search },
    { label: 'Prioritaires', value: prioritaires, color: '#0EA5E9', bg: '#E0F2FE', Icon: Star },
  ];

  const urgent = critiques > 0;

  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-4"
      style={{ background: urgent ? '#FFF5F5' : '#F0FDF4', borderColor: urgent ? '#FCA5A5' : '#86EFAC' }}>

      {/* Phrase automatique */}
      <p className="text-[0.95rem] font-medium m-0" style={{ color: urgent ? '#991B1B' : '#166534' }}>
        {genererPhrase()}
      </p>

      {/* Pastilles résumé */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PASTILLES.map((p, i) => (
          <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#f0f0f0]">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: p.bg }}>
              <p.Icon size={15} style={{ color: p.color }} />
            </div>
            <div>
              <p className="text-[1.1rem] font-bold m-0 leading-none" style={{ color: p.color }}>{p.value}</p>
              <p className="text-[10px] text-[#aaa] m-0 mt-0.5">{p.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Onglet 1 : Commandes urgentes
// ══════════════════════════════════════════════════════════════
function TabCommandes({ ruptures, baseName }) {
  const [pageCrit, setPageCrit] = useState(1);
  const [pageAlert, setPageAlert] = useState(1);
  const [pageOk, setPageOk] = useState(1);

  const rupturesSorted = [...ruptures]
    .filter(r => !isNaN(Number(r.jours_estimes)) && Number(r.jours_estimes) > 0)
    .sort((a, b) => Number(a.jours_estimes) - Number(b.jours_estimes));

  const critiques = rupturesSorted.filter(r => Number(r.jours_estimes) < 7);
  const alertes   = rupturesSorted.filter(r => Number(r.jours_estimes) >= 7 && Number(r.jours_estimes) < 30);
  const ok        = rupturesSorted.filter(r => Number(r.jours_estimes) >= 30);

  if (!ruptures.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <ShoppingCart size={36} className="mb-3" /><p className="text-sm">Aucune donnée disponible</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <ExplainBanner icon={ShoppingCart} color="#EF4444"
        title="Quoi commander et quand"
        description="Cette liste indique, pour chaque article, le temps restant avant la rupture de stock, calculé à partir du rythme de ventes récent."
        tip="Rouge : commander aujourd'hui. Orange : planifier cette semaine. Vert : aucune action requise." />

      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Urgent" value={critiques.length} color="#A32D2D" sub="moins de 7 jours" />
        <KpiCard label="Bientôt" value={alertes.length} color="#854F0B" sub="7 à 30 jours" />
        <KpiCard label="OK" value={ok.length} color="#3B6D11" sub="plus de 30 jours" />
      </div>

      {/* Urgent */}
      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#e53935]" />
            <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Commander maintenant</span>
            <span className="bg-[#f0f0f0] text-[#666666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{critiques.length} articles</span>
          </div>
          {critiques.length > 0 && (
            <ExportButton onClick={() => exportCSV(critiques, `commander_maintenant_${baseName}.csv`,
              ['Article', 'Désignation', 'Temps restant', 'Stock actuel', 'Ventes/jour'],
              r => [r.AR_Ref, getDesign(r), fmtJoursHeures(r.jours_estimes), Number(r.StockFinal).toFixed(0), Number(r.rolling_mean_7).toFixed(1)])} />
          )}
        </div>
        <div className="p-4">
          {critiques.length === 0 ? <EmptyState msg="Aucun article en rupture critique." /> : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {critiques.slice((pageCrit - 1) * PAGE_SIZE, pageCrit * PAGE_SIZE).map((r, i) => (
                  <ArticleCard key={i} article={r.AR_Ref} design={getDesign(r)} jours={r.jours_estimes} stock={r.StockFinal} rythme={r.rolling_mean_7} urgence="critique" />
                ))}
              </div>
              <Pagination page={pageCrit} total={critiques.length} pageSize={PAGE_SIZE} onChange={setPageCrit} />
            </>
          )}
        </div>
      </div>

      {/* Bientôt */}
      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#EF9F27]" />
            <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Planifier cette semaine</span>
            <span className="bg-[#f0f0f0] text-[#666666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{alertes.length} articles</span>
          </div>
          {alertes.length > 0 && (
            <ExportButton onClick={() => exportCSV(alertes, `planifier_${baseName}.csv`,
              ['Article', 'Désignation', 'Temps restant', 'Stock actuel', 'Ventes/jour'],
              r => [r.AR_Ref, getDesign(r), fmtJoursHeures(r.jours_estimes), Number(r.StockFinal).toFixed(0), Number(r.rolling_mean_7).toFixed(1)])} />
          )}
        </div>
        <div className="p-4">
          {alertes.length === 0 ? <EmptyState msg="Aucun article en alerte." /> : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {alertes.slice((pageAlert - 1) * PAGE_SIZE, pageAlert * PAGE_SIZE).map((r, i) => (
                  <ArticleCard key={i} article={r.AR_Ref} design={getDesign(r)} jours={r.jours_estimes} stock={r.StockFinal} rythme={r.rolling_mean_7} urgence="alerte" />
                ))}
              </div>
              <Pagination page={pageAlert} total={alertes.length} pageSize={PAGE_SIZE} onChange={setPageAlert} />
            </>
          )}
        </div>
      </div>

      {/* OK */}
      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#01d63a]" />
            <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Stock suffisant</span>
            <span className="bg-[#f0f0f0] text-[#666666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{ok.length} articles</span>
          </div>
          {ok.length > 0 && (
            <ExportButton onClick={() => exportCSV(ok, `stock_ok_${baseName}.csv`,
              ['Article', 'Désignation', 'Temps restant', 'Stock actuel', 'Ventes/jour'],
              r => [r.AR_Ref, getDesign(r), fmtJoursHeures(r.jours_estimes), Number(r.StockFinal).toFixed(0), Number(r.rolling_mean_7).toFixed(1)])} />
          )}
        </div>
        <div className="p-4">
          {ok.length === 0 ? <EmptyState msg="Aucun article avec stock suffisant." /> : (
            <>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ok.slice((pageOk - 1) * PAGE_SIZE, pageOk * PAGE_SIZE).map((r, i) => (
                  <div key={i} className="bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] px-3 py-2 flex items-center justify-between gap-2 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-[0.72rem] text-[#0b7db0]">{r.AR_Ref}</span>
                      <span className="text-[10px] text-[#555] truncate" title={getDesign(r)}>{getDesign(r)}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#16A34A] flex-shrink-0">{fmtJoursHeures(r.jours_estimes)}</span>
                  </div>
                ))}
              </div>
              <Pagination page={pageOk} total={ok.length} pageSize={PAGE_SIZE} onChange={setPageOk} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Onglet 2 : Prévisions du mois
// ══════════════════════════════════════════════════════════════
function TabPrevisions({ prophet, baseName }) {
  const [page, setPage] = useState(1);
  const [filtreFiabilite, setFiltreFiabilite] = useState('tous');
  useEffect(() => { setPage(1); }, [prophet, filtreFiabilite]);

  if (!prophet.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <PackageCheck size={36} className="mb-3" /><p className="text-sm">Aucune donnée disponible</p>
    </div>
  );

  const getFiabilite = (r) => {
    const mape = Number(r.MAPE);
    if (isNaN(mape)) return 'na';
    if (mape < 30) return 'tres_fiable';
    if (mape < 60) return 'fiable';
    return 'peu_fiable';
  };

  const tresFiables = prophet.filter(r => getFiabilite(r) === 'tres_fiable').length;
  const fiables     = prophet.filter(r => getFiabilite(r) === 'fiable').length;
  const peuFiables  = prophet.filter(r => getFiabilite(r) === 'peu_fiable').length;
  const nonDispo    = prophet.filter(r => getFiabilite(r) === 'na').length;

  const FILTRES = [
    { id: 'tous',        label: 'Tous',         count: prophet.length, color: '#0d0c0c' },
    { id: 'tres_fiable',  label: 'Très fiable',  count: tresFiables,    color: '#15803d' },
    { id: 'fiable',       label: 'Fiable',       count: fiables,        color: '#854F0B' },
    { id: 'peu_fiable',   label: 'Peu fiable',   count: peuFiables,     color: '#A32D2D' },
    { id: 'na',           label: 'N/A',          count: nonDispo,       color: '#888' },
  ].filter(f => f.id === 'tous' || f.count > 0);

  const filtres = filtreFiabilite === 'tous' ? prophet : prophet.filter(r => getFiabilite(r) === filtreFiabilite);
  const paginated = filtres.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <ExplainBanner icon={PackageCheck} color="#0EA5E9"
        title="Ce qu'il faut prévoir pour le mois prochain"
        description="Pour chaque article important, le système estime la quantité qui va se vendre. Plus la fiabilité est élevée, plus l'estimation peut être utilisée directement pour passer commande."
        tip="« Très fiable » : utilisez le chiffre directement. « Peu fiable » : appuyez-vous plutôt sur votre expérience." />

      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Articles analysés" value={prophet.length} color="#0d0c0c" />
        <KpiCard label="Prévisions fiables" value={tresFiables + fiables} color="#15803d" sub={`sur ${prophet.length} articles`} />
      </div>

      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#12a6e0]" />
            <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Détail par article</span>
            <span className="bg-[#f0f0f0] text-[#666666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{filtres.length} articles</span>
          </div>
          <ExportButton onClick={() => exportCSV(filtres, `previsions_${baseName}.csv`,
            ['Article', 'Désignation', 'Erreur moyenne/jour', 'Fiabilité', 'Conseil'],
            r => {
              const mape = Number(r.MAPE);
              const fiable = isNaN(mape) ? 'N/A' : mape < 30 ? 'Très fiable' : mape < 60 ? 'Fiable' : 'Peu fiable';
              const conseil = isNaN(mape) ? 'Vérifier les données' : mape < 30 ? 'Utiliser cette prévision' : mape < 60 ? 'Prévision indicative' : 'Commander selon expérience';
              return [r.AR_Ref, getDesign(r), Number(r.MAE).toFixed(1), fiable, conseil];
            })} />
        </div>

        {/* Filtres par fiabilité */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f0f0f0] flex-wrap">
          {FILTRES.map(f => (
            <button key={f.id} onClick={() => setFiltreFiabilite(f.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all cursor-pointer"
              style={{
                background: filtreFiabilite === f.id ? f.color + '18' : '#f5f5f5',
                color: filtreFiabilite === f.id ? f.color : '#666',
                border: filtreFiabilite === f.id ? `1px solid ${f.color}44` : '1px solid #e0e0e0',
              }}>
              {f.label}
              <span className="font-mono text-[0.6875rem] opacity-80">({f.count})</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="px-4 py-3 bg-[#f8f8f8] text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Article</th>
                <th className="px-4 py-3 bg-[#f8f8f8] text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Désignation</th>
                <th className="px-4 py-3 bg-[#f8f8f8] text-right text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Erreur moy./jour</th>
                <th className="px-4 py-3 bg-[#f8f8f8] text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Fiabilité</th>
                <th className="px-4 py-3 bg-[#f8f8f8] text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Conseil</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#aaa] text-sm">Aucun article dans cette catégorie</td></tr>
              ) : paginated.map((r, i) => {
                const mape = Number(r.MAPE);
                const fiable = isNaN(mape) ? null : mape < 30 ? 'Très fiable' : mape < 60 ? 'Fiable' : 'Peu fiable';
                const fiableColor = isNaN(mape) ? '#aaa' : mape < 30 ? '#15803d' : mape < 60 ? '#854F0B' : '#A32D2D';
                const conseil = isNaN(mape) ? 'Vérifier les données' : mape < 30 ? 'Utiliser cette prévision' : mape < 60 ? 'Prévision indicative' : 'Commander selon expérience';
                return (
                  <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.04)] transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-block font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{r.AR_Ref}</span>
                    </td>
                    <td className="px-4 py-3 text-[0.78rem] text-[#444] max-w-[220px] truncate" title={getDesign(r)}>{getDesign(r)}</td>
                    <td className="px-4 py-3 text-right text-[0.8rem] text-[#444]">{fmtNum(r.MAE)} unités</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: fiableColor + '18', color: fiableColor }}>{fiable || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#777]">{conseil}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtres.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Onglet 3 : Mouvements suspects — TOUS affichés, paginés
// ══════════════════════════════════════════════════════════════
function TabAnomalies({ anomalies, baseName }) {
  const [page, setPage] = useState(1);
  const [filtreSeverite, setFiltreSeverite] = useState('tous');

  const severes = useMemo(() =>
    [...anomalies]
      .filter(r => r.is_anomalie === 1)
      .sort((a, b) => Number(a.anomaly_score) - Number(b.anomaly_score)),
    [anomalies]
  );

  useEffect(() => { setPage(1); }, [anomalies, filtreSeverite]);

  if (!anomalies.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <Radar size={36} className="mb-3" /><p className="text-sm">Aucune donnée disponible</p>
    </div>
  );

  const getSeverite = (r) => {
    const abs = Math.abs(r.anomaly_score);
    if (abs > 0.2) return 'tres_suspect';
    if (abs > 0.1) return 'suspect';
    return 'a_verifier';
  };

  const tresSuspects = severes.filter(r => getSeverite(r) === 'tres_suspect').length;
  const suspects      = severes.filter(r => getSeverite(r) === 'suspect').length;
  const aVerifier      = severes.filter(r => getSeverite(r) === 'a_verifier').length;

  const FILTRES = [
    { id: 'tous',          label: 'Tous',          count: severes.length, color: '#0d0c0c' },
    { id: 'tres_suspect',  label: 'Très suspect',  count: tresSuspects,   color: '#A32D2D' },
    { id: 'suspect',       label: 'Suspect',       count: suspects,       color: '#854F0B' },
    { id: 'a_verifier',    label: 'À vérifier',    count: aVerifier,      color: '#666' },
  ].filter(f => f.id === 'tous' || f.count > 0);

  const filtres = filtreSeverite === 'tous' ? severes : severes.filter(r => getSeverite(r) === filtreSeverite);
  const paginated = filtres.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <ExplainBanner icon={Radar} color="#8B5CF6"
        title="Mouvements suspects à vérifier"
        description="Le système a repéré automatiquement les journées où une quantité sortie était inhabituelle par rapport au comportement normal de l'article. Une vérification dans SAGE est recommandée."
        tip="« Très suspect » : vérification prioritaire. « À vérifier » : contrôle de routine." />

      <KpiCard label="Mouvements suspects détectés" value={severes.length} color="#8B5CF6" sub={`sur ${anomalies.length} mouvements analysés`} />

      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
            <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Liste détaillée</span>
            <span className="bg-[#f0f0f0] text-[#666666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{filtres.length} mouvements</span>
          </div>
          {severes.length > 0 && (
            <ExportButton onClick={() => exportCSV(filtres, `anomalies_${baseName}.csv`,
              ['Date', 'Article', 'Désignation', 'Qté sortie', 'Stock restant', 'Sévérité'],
              r => [r.DateJour, r.AR_Ref, getDesign(r), Number(r.TotalSortie).toFixed(1), Number(r.StockFinal).toFixed(1),
                Math.abs(r.anomaly_score) > 0.2 ? 'Très suspect' : Math.abs(r.anomaly_score) > 0.1 ? 'Suspect' : 'À vérifier'])} />
          )}
        </div>

        {severes.length > 0 && (
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f0f0f0] flex-wrap">
            {FILTRES.map(f => (
              <button key={f.id} onClick={() => setFiltreSeverite(f.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all cursor-pointer"
                style={{
                  background: filtreSeverite === f.id ? f.color + '18' : '#f5f5f5',
                  color: filtreSeverite === f.id ? f.color : '#666',
                  border: filtreSeverite === f.id ? `1px solid ${f.color}44` : '1px solid #e0e0e0',
                }}>
                {f.label}
                <span className="font-mono text-[0.6875rem] opacity-80">({f.count})</span>
              </button>
            ))}
          </div>
        )}

        {severes.length === 0 ? (
          <div className="p-4"><EmptyState msg="Aucun mouvement suspect détecté." /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    <th className="px-4 py-3 bg-[#f8f8f8] text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Date</th>
                    <th className="px-4 py-3 bg-[#f8f8f8] text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Article</th>
                    <th className="px-4 py-3 bg-[#f8f8f8] text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Désignation</th>
                    <th className="px-4 py-3 bg-[#f8f8f8] text-right text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Qté sortie</th>
                    <th className="px-4 py-3 bg-[#f8f8f8] text-right text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Stock restant</th>
                    <th className="px-4 py-3 bg-[#f8f8f8] text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888]">Sévérité</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-[#aaa] text-sm">Aucun mouvement dans cette catégorie</td></tr>
                  ) : paginated.map((r, i) => {
                    const sev = Math.abs(r.anomaly_score) > 0.2 ? 'Très suspect' : Math.abs(r.anomaly_score) > 0.1 ? 'Suspect' : 'À vérifier';
                    const color = Math.abs(r.anomaly_score) > 0.2 ? '#A32D2D' : Math.abs(r.anomaly_score) > 0.1 ? '#854F0B' : '#666';
                    return (
                      <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(139,92,246,0.04)] transition-colors">
                        <td className="px-4 py-3 font-mono text-[0.75rem] text-[#888]">{fmtDate(r.DateJour)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{r.AR_Ref}</span>
                        </td>
                        <td className="px-4 py-3 text-[0.78rem] text-[#444] max-w-[200px] truncate" title={getDesign(r)}>{getDesign(r)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-block text-[#b71c1c] font-semibold text-[0.8rem] bg-[rgba(229,57,53,0.07)] border border-[rgba(229,57,53,0.18)] rounded-md px-2 py-0.5">{fmtNum(r.TotalSortie)}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-[0.8rem] text-[#444]">{fmtNum(r.StockFinal)}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: color + '18', color }}>{sev}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={filtres.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Onglet 4 : Articles prioritaires
// ══════════════════════════════════════════════════════════════
function TabPrioritaires({ kmeans, segments, baseName }) {
  if (!kmeans.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <Star size={36} className="mb-3" /><p className="text-sm">Aucune donnée disponible</p>
    </div>
  );

  const COLORS = { 'forte rotation': '#EF4444', 'rotation moyenne': '#F59E0B', 'faible rotation': '#0EA5E9', 'quasi-immobile': '#888' };
  const CONSEILS = {
    'forte rotation'   : 'Commander souvent et en grande quantité. Ne jamais laisser ce groupe en rupture.',
    'rotation moyenne' : 'Vérifier le stock chaque semaine. Commander régulièrement en quantité standard.',
    'faible rotation'  : 'Commander uniquement sur demande ou en petites quantités ponctuelles.',
    'quasi-immobile'   : 'Éviter de sur-stocker. Envisager de réduire ou arrêter ces références.',
  };

  const prioritaires = segments.filter(s => String(s.segment ?? '').toLowerCase().includes('forte'));

  return (
    <div className="flex flex-col gap-4">
      <ExplainBanner icon={Star} color="#0EA5E9"
        title="Vos articles les plus importants"
        description="Le système regroupe automatiquement les articles selon leur niveau de vente. Les articles à forte rotation sont les meilleures ventes — une rupture sur ces produits impacte directement le chiffre d'affaires."
        tip="Concentrer l'attention sur le groupe en rouge en priorité." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {kmeans.map((c, i) => {
          const color = COLORS[c.Segment] || '#888';
          const conseil = CONSEILS[c.Segment] || '';
          return (
            <div key={i} className="bg-white rounded-xl border p-4" style={{ borderColor: color + '33' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-[13px] font-semibold capitalize" style={{ color }}>{c.Segment}</span>
                </div>
                <span className="text-[0.8rem] font-bold" style={{ color }}>{c.Nb_articles} articles</span>
              </div>
              <p className="text-[12px] text-[#555] m-0 leading-relaxed">{conseil}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#e53935]" />
            <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Liste des articles prioritaires</span>
            <span className="bg-[#f0f0f0] text-[#666666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{prioritaires.length} articles</span>
          </div>
          {prioritaires.length > 0 && (
            <ExportButton onClick={() => exportCSV(prioritaires, `articles_prioritaires_${baseName}.csv`,
              ['Article', 'Désignation', 'Segment', 'Conseil'],
              r => [r.AR_Ref, getDesign(r), r.segment, 'Commander souvent et en grande quantité'])} />
          )}
        </div>
        {prioritaires.length === 0 ? (
          <div className="p-4"><EmptyState msg="Aucun article à forte rotation détecté." /></div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto">
            {prioritaires.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-3 bg-[rgba(18,166,224,0.05)] border border-[rgba(18,166,224,0.15)] rounded-lg px-3 py-2">
                <span className="font-mono text-[0.72rem] font-semibold text-[#0b7db0] flex-shrink-0">{s.AR_Ref}</span>
                <span className="text-[0.78rem] text-[#444] truncate text-right" title={getDesign(s)}>{getDesign(s)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Onglets config ────────────────────────────────────────────
const TABS = [
  { id: 'commandes',    label: 'Commandes urgentes',    icon: ShoppingCart },
  { id: 'previsions',   label: 'Prévisions du mois',    icon: PackageCheck },
  { id: 'anomalies',    label: 'Mouvements suspects',   icon: Radar },
  { id: 'prioritaires', label: 'Articles prioritaires', icon: Star },
];

// ══════════════════════════════════════════════════════════════
//  Page principale
// ══════════════════════════════════════════════════════════════
export default function PageAlertes() {
  const [bases,       setBases]       = useState([]);
  const [baseName,    setBaseName]    = useState('');
  const [activeTab,   setActiveTab]   = useState('commandes');
  const [loadingBase, setLoadingBase] = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [status,      setStatus]      = useState(null);
  const [results,     setResults]     = useState(null);

  useEffect(() => {
    fetchBases()
      .then(data => { setBases(data); })
      .catch(e => setError(e.message))
      .finally(() => setLoadingBase(false));
  }, []);

  const loadData = useCallback(async (base) => {
    if (!base) return;
    setLoading(true); setError(null); setResults(null); setStatus(null);
    try {
      const st = await fetchPipelineStatus(base);
      setStatus(st);
      if (st.status === 'success') {
        const res = await fetchPredictionResults(base);
        setResults(res);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (baseName) loadData(baseName); }, [baseName, loadData]);

  const ruptures  = results?.results?.rf       || [];
  const anomalies = results?.results?.iforest  || [];
  const kmeans    = results?.results?.kmeans   || [];
  const segments  = results?.results?.segments || [];
  const prophet   = results?.results?.prophet  || [];

  // ── Calculs pour le bandeau résumé (basés sur les mêmes règles que les onglets) ──
  const resumeData = useMemo(() => {
    const rupturesSorted = ruptures.filter(r => !isNaN(Number(r.jours_estimes)) && Number(r.jours_estimes) > 0);
    const critiques = rupturesSorted.filter(r => Number(r.jours_estimes) < 7).length;
    const alertesCount = rupturesSorted.filter(r => Number(r.jours_estimes) >= 7 && Number(r.jours_estimes) < 30).length;
    const suspects = anomalies.filter(r => r.is_anomalie === 1).length;
    const prioritairesCount = segments.filter(s => String(s.segment ?? '').toLowerCase().includes('forte')).length;
    return { critiques, alertes: alertesCount, suspects, prioritaires: prioritairesCount };
  }, [ruptures, anomalies, segments]);

  // return (
  //   <div className="flex flex-col gap-4">
  //     {/* En-tête */}
  //     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  //       <div>
  //         <h1 className="text-[1.1rem] font-semibold text-[#0d0c0c] m-0">Actions à faire</h1>
  //         <p className="text-[0.8rem] text-[#aaaaaa] m-0 mt-0.5">Ce que vous devez faire aujourd'hui — en langage simple</p>
  //       </div>
  //       <div className="flex items-center gap-2">
  //         <BaseSelector bases={bases} value={baseName} onChange={setBaseName} loading={loadingBase} />
  //         <button onClick={() => loadData(baseName)} disabled={loading}
  //           className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
  //           style={{ background: loading ? '#f5f5f5' : 'white', borderColor: '#e0e0e0', color: loading ? '#aaa' : '#555', cursor: loading ? 'not-allowed' : 'pointer' }}>
  //           <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
  //           {loading ? 'Chargement…' : 'Actualiser'}
  //         </button>
  //       </div>
  //     </div>

  //     {status?.status === 'failed' && (
  //       <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FCEBEB] border-[#F7C1C1] text-[#791F1F]">
  //         <XCircle size={15} /><span>Le calcul a échoué. Allez dans Prédictions puis Relancer.</span>
  //       </div>
  //     )}
  //     {status?.status === 'not_started' && (
  //       <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FAEEDA] border-[#FAC775] text-[#633806]">
  //         <Clock size={15} /><span>Aucune analyse pour <strong>{baseName}</strong>. Allez dans Prédictions pour lancer le calcul.</span>
  //       </div>
  //     )}
  //     {error && (
  //       <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FCEBEB] border-[#F7C1C1] text-[#791F1F]">
  //         <XCircle size={15} /><span>{error}</span>
  //       </div>
  //     )}

  //     {/* Bandeau résumé — phrase auto + pastilles — visible avant les onglets */}
  //     {status?.status === 'success' && (
  //       <ResumeBandeau
  //         critiques={resumeData.critiques}
  //         alertes={resumeData.alertes}
  //         suspects={resumeData.suspects}
  //         prioritaires={resumeData.prioritaires}
  //         baseName={baseName}
  //       />
  //     )}

  //     {status?.status === 'success' && (
  //       <div className="flex gap-1 border-b border-[#e8e8e8]">
  //         {TABS.map(({ id, label, icon: Icon }) => (
  //           <button key={id} onClick={() => setActiveTab(id)}
  //             className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer"
  //             style={{ borderBottomColor: activeTab === id ? '#12a6e0' : 'transparent', color: activeTab === id ? '#12a6e0' : '#888888', background: 'transparent' }}>
  //             <Icon size={14} />{label}
  //           </button>
  //         ))}
  //       </div>
  //     )}

  //     {loading ? (
  //       <div className="flex items-center justify-center py-20 gap-3 text-[#12a6e0]">
  //         <Loader2 size={20} className="animate-spin" /><span className="text-sm">Chargement des alertes…</span>
  //       </div>
  //     ) : status?.status === 'success' && (
  //       <>
  //         {activeTab === 'commandes'    && <TabCommandes ruptures={ruptures} baseName={baseName} />}
  //         {activeTab === 'previsions'   && <TabPrevisions prophet={prophet} baseName={baseName} />}
  //         {activeTab === 'anomalies'    && <TabAnomalies anomalies={anomalies} baseName={baseName} />}
  //         {activeTab === 'prioritaires' && <TabPrioritaires kmeans={kmeans} segments={segments} baseName={baseName} />}
  //       </>
  //     )}
  //   </div>
  // );
return (
  <div className="flex flex-col gap-4">
    {/* En-tête */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-[1.1rem] font-semibold text-[#0d0c0c] m-0">Actions à faire</h1>
        <p className="text-[0.8rem] text-[#aaaaaa] m-0 mt-0.5">Ce que vous devez faire aujourd'hui — en langage simple</p>
      </div>
      <div className="flex items-center gap-2">
        <BaseSelector bases={bases} value={baseName} onChange={setBaseName} loading={loadingBase} />
        <button onClick={() => loadData(baseName)} disabled={loading || !baseName}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
          style={{ background: loading || !baseName ? '#f5f5f5' : 'white', borderColor: '#e0e0e0', color: loading || !baseName ? '#aaa' : '#555', cursor: loading || !baseName ? 'not-allowed' : 'pointer' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>
    </div>

    {/* Banners — uniquement si base sélectionnée */}
    {baseName && status?.status === 'failed' && (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FCEBEB] border-[#F7C1C1] text-[#791F1F]">
        <XCircle size={15} /><span>Le calcul a échoué. Allez dans Prédictions puis Relancer.</span>
      </div>
    )}
    {baseName && status?.status === 'not_started' && (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FAEEDA] border-[#FAC775] text-[#633806]">
        <Clock size={15} /><span>Aucune analyse pour <strong>{baseName}</strong>. Allez dans Prédictions pour lancer le calcul.</span>
      </div>
    )}
    {error && (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FCEBEB] border-[#F7C1C1] text-[#791F1F]">
        <XCircle size={15} /><span>{error}</span>
      </div>
    )}

    {/* Bandeau résumé — uniquement si données disponibles */}
    {baseName && status?.status === 'success' && (
      <ResumeBandeau
        critiques={resumeData.critiques}
        alertes={resumeData.alertes}
        suspects={resumeData.suspects}
        prioritaires={resumeData.prioritaires}
        baseName={baseName}
      />
    )}

    {/* ── Onglets — TOUJOURS visibles comme dans Prédictions ── */}
    <div className="flex gap-1 border-b border-[#e8e8e8]">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setActiveTab(id)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer"
          style={{ borderBottomColor: activeTab === id ? '#12a6e0' : 'transparent', color: activeTab === id ? '#12a6e0' : '#888888', background: 'transparent' }}>
          <Icon size={14} />{label}
        </button>
      ))}
    </div>

    {/* ── Contenu ── */}
    {loading ? (
      <div className="flex items-center justify-center py-20 gap-3 text-[#12a6e0]">
        <Loader2 size={20} className="animate-spin" /><span className="text-sm">Chargement des alertes…</span>
      </div>
    ) : !baseName ? (
      // Aucune base — état vide identique à Prédictions
      <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
        {activeTab === 'commandes'    && <ShoppingCart size={36} className="mb-3" />}
        {activeTab === 'previsions'   && <PackageCheck size={36} className="mb-3" />}
        {activeTab === 'anomalies'    && <Radar size={36} className="mb-3" />}
        {activeTab === 'prioritaires' && <Star size={36} className="mb-3" />}
        <p className="text-sm">Sélectionnez une base pour afficher les données</p>
      </div>
    ) : status?.status === 'success' ? (
      <>
        {activeTab === 'commandes'    && <TabCommandes ruptures={ruptures} baseName={baseName} />}
        {activeTab === 'previsions'   && <TabPrevisions prophet={prophet} baseName={baseName} />}
        {activeTab === 'anomalies'    && <TabAnomalies anomalies={anomalies} baseName={baseName} />}
        {activeTab === 'prioritaires' && <TabPrioritaires kmeans={kmeans} segments={segments} baseName={baseName} />}
      </>
    ) : null}
  </div>
);

}