import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, ComposedChart, Line,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus,
  ArrowLeftRight, CalendarDays, Database,
  Tag, Layers, Moon, Award,
  PackageX, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Boxes,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

// ── Palette ───────────────────────────────────────────────────
const C = {
  blue:        '#12a6e0',
  blueLight:   'rgba(18,166,224,0.08)',
  green:       '#01a82e',
  greenLight:  'rgba(1,168,46,0.08)',
  red:         '#e53935',
  redLight:    'rgba(229,57,53,0.08)',
  amber:       '#e08a00',
  amberLight:  'rgba(224,138,0,0.08)',
  purple:      '#7c4dff',
  purpleLight: 'rgba(124,77,255,0.08)',
  border:      '#f0f0f0',
  text:        '#0d0c0c',
  muted:       '#888888',
  light:       '#c5c5c5',
};

// ── Helpers ───────────────────────────────────────────────────
const fmtNum = (n) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n ?? 0);

const fmtVal = (n) => {
  const v = Number(n ?? 0);
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000)     return `${(v / 1_000).toFixed(0)}k`;
  return fmtNum(v);
};

const fmtPct = (n) => `${Number(n ?? 0).toFixed(1)}%`;

const fmtShort = (d) => {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
};

const fmtRatio = (r) => {
  if (r === Infinity) return '∞';
  if (r === 0)        return '0';
  return r.toFixed(2);
};

const toISO = (raw) => {
  if (!raw) return '';
  if (typeof raw === 'string') return raw.slice(0, 10);
  if (raw instanceof Date)     return raw.toISOString().slice(0, 10);
  return String(raw).slice(0, 10);
};

// ── Détecteur de colonnes ─────────────────────────────────────
function useCols(data) {
  return useMemo(() => {
    if (!data || !data.length) return {};
    const keys = Object.keys(data[0]);
    const find = (...variants) =>
      keys.find(k =>
        variants.some(v =>
          k.toLowerCase().replace(/[\s_()]/g, '') === v.toLowerCase().replace(/[\s_()]/g, '')
        )
      ) || null;
    return {
      date:    find('Date', 'DateJour'),
      article: find('Article', 'AR_Ref'),
      design:  find('Designation', 'AR_Design', 'Désignation'),
      depot:   find('Depot', 'DE_No'),
      nomDep:  find('Nom Depot', 'NomDepot', 'DE_Intitule'),
      entrees: find('TotalEntrees', 'Total Entrees', 'TotalEntree'),
      sorties: find('TotalSorties', 'Total Sorties', 'TotalSortie'),
      valEnt:  find('Valeur Entree', 'ValeurEntree'),
      valSor:  find('Valeur Sortie', 'ValeurSortie'),
      stock:   find('StockFinal', 'Stock Final', 'stockfinal'),
      valeur:  find('ValeurFinalePermanente', 'Valeur Finale (Permanente)', 'ValeurFinale', 'valeurfinale', 'Solde'),
      catN1:   find('CatN1', 'Cat N1', 'CL_Intitule1'),
      famille: find('Intitule Famille', 'FA_Intitule', 'faintitule'),
    };
  }, [data]);
}

// ── Pagination commune ────────────────────────────────────────
const PAGE_SIZE = 15;

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const from = page * pageSize + 1;
  const to   = Math.min((page + 1) * pageSize, total);
  return (
    <div className="flex items-center justify-between pt-2 border-t border-[#f0f0f0]">
      <span className="text-[11px] text-[#888888]">
        {from}–{to} sur <b>{total}</b>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#eeeeee] text-[#888888] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={13} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i)
          .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
          .reduce((acc, i, idx, arr) => {
            if (idx > 0 && arr[idx - 1] !== i - 1) acc.push('…');
            acc.push(i);
            return acc;
          }, [])
          .map((item, i) =>
            item === '…'
              ? <span key={`sep-${i}`} className="text-[11px] text-[#cccccc] px-1">…</span>
              : (
                <button
                  key={item}
                  onClick={() => onChange(item)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-semibold transition-all"
                  style={{
                    background:   item === page ? C.blue : 'transparent',
                    color:        item === page ? '#fff'  : C.muted,
                    border:       item === page ? 'none'  : '1px solid #eeeeee',
                  }}
                >
                  {item + 1}
                </button>
              )
          )
        }
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages - 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#eeeeee] text-[#888888] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── TrendCard ─────────────────────────────────────────────────
function TrendCard({ icon: Icon, iconColor, iconBg, title, subtitle, children, badge }) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.05)] flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f4f4f4]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg, color: iconColor }}>
          <Icon size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[#0d0c0c] text-[13px] font-semibold m-0 leading-tight">{title}</p>
            {badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: iconBg, color: iconColor }}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[#aaaaaa] text-[11px] m-0 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}

// ── Empty ─────────────────────────────────────────────────────
function Empty({ msg }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <PackageX size={28} className="text-[#e0e0e0]" />
      <p className="text-[#c5c5c5] text-[12px] text-center max-w-[220px] leading-relaxed">{msg ?? 'Aucune donnée disponible'}</p>
    </div>
  );
}

// ── Bandeau contexte ──────────────────────────────────────────
function ContextBanner({ filters }) {
  const periodeLabel = () => {
    if (!filters?.dateDebut || !filters?.dateFin) return null;
    return `${fmtShort(filters.dateDebut)} → ${fmtShort(filters.dateFin)}`;
  };

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e8eaed',
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 20px', borderBottom: '1px solid #f3f4f6',
        background: 'linear-gradient(to right, #f8fcff, #f0f9ff)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: '#12a6e0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrendingUp size={14} color="#fff" />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Tendances</span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>— Analyse descriptive du stock filtré</span>
      </div>
      <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {filters?.base && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(1,168,46,0.08)', border: '1px solid rgba(1,168,46,0.20)',
            borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#01a82e',
          }}>
            <Database size={10} /> {filters.base}
          </span>
        )}
        {periodeLabel() && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(18,166,224,0.08)', border: '1px solid rgba(18,166,224,0.20)',
            borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#12a6e0',
          }}>
            <CalendarDays size={10} /> {periodeLabel()}
          </span>
        )}
        {filters?.fa_codefamille && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(124,77,255,0.08)', border: '1px solid rgba(124,77,255,0.20)',
            borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#7c4dff',
          }}>
            <Tag size={10} /> {filters.fa_codefamille}
          </span>
        )}
        {filters?.cl_no1 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(224,138,0,0.08)', border: '1px solid rgba(224,138,0,0.20)',
            borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#e08a00',
          }}>
            <Layers size={10} /> Cat N1 : {filters.cl_no1}
          </span>
        )}
        {!filters?.base && (
          <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
            Filtrez depuis le tableau de bord.
          </span>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  T1 — Taux de rotation par article  (CONSERVÉ — descriptif)
//  Sorties ÷ stock moyen. Identifie articles lents / rapides.
// ════════════════════════════════════════════════════════════════
function TauxRotation({ data, cols }) {
  const [sortBy,  setSortBy]  = useState('taux');
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    if (!data?.length || !cols.article) return [];
    const byArticle = {};
    for (const r of data) {
      const code = r[cols.article] ?? '?';
      if (!byArticle[code]) byArticle[code] = {
        code, name: r[cols.design] ?? code, catN1: r[cols.catN1] ?? '—',
        sorties: 0, stocks: [],
      };
      byArticle[code].sorties += Number(r[cols.sorties] ?? 0);
      const sf = Number(r[cols.stock] ?? 0);
      if (sf > 0) byArticle[code].stocks.push(sf);
    }
    return Object.values(byArticle)
      .map(a => {
        const stockMoyen = a.stocks.length
          ? a.stocks.reduce((s, v) => s + v, 0) / a.stocks.length : 0;
        const taux = stockMoyen > 0 ? (a.sorties / stockMoyen) * 100 : 0;
        return { ...a, stockMoyen, taux };
      })
      .filter(a => a.sorties > 0 || a.stockMoyen > 0)
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, cols, sortBy]);

  if (!rows.length) return <Empty msg="Aucun article avec mouvements trouvé" />;

  const displayed = showAll ? rows : rows.slice(0, 15);
  const tauxMax   = Math.max(...rows.map(r => r.taux), 1);

  const rotBadge = (taux) => {
    if (taux >= 100) return { label: 'Rapide',    color: C.green,  bg: C.greenLight };
    if (taux >= 30)  return { label: 'Moyen',     color: C.amber,  bg: C.amberLight };
    if (taux >= 5)   return { label: 'Lent',      color: C.red,    bg: C.redLight   };
    return                  { label: 'Très lent', color: '#888888',bg: '#f5f5f5'    };
  };

  const SortBtn = ({ id, label }) => (
    <button onClick={() => setSortBy(id)}
      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 ${sortBy === id ? 'bg-[#12a6e0] text-white shadow-sm' : 'text-[#888888] hover:bg-[#f0f0f0]'}`}>
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-[#f8f8f8] border border-[#eeeeee] rounded-xl p-1">
          <SortBtn id="taux"       label="Par taux %" />
          <SortBtn id="sorties"    label="Par sorties" />
          <SortBtn id="stockMoyen" label="Par stock" />
        </div>
        <div className="flex items-center gap-3 ml-auto">
          {[
            { label: 'Rapide ≥100%', color: C.green },
            { label: 'Moyen ≥30%',  color: C.amber },
            { label: 'Lent ≥5%',    color: C.red   },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] text-[#888888]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {['Article','Désignation','Sorties','Stock moyen','Taux rotation',''].map((h, i) => (
                <th key={i} className={`px-3 py-2 bg-[#f8f8f8] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888888] ${i >= 2 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row) => {
              const badge = rotBadge(row.taux);
              const pct   = tauxMax > 0 ? (row.taux / tauxMax) * 100 : 0;
              return (
                <tr key={row.code} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="inline-block font-mono text-[0.7rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{row.code}</span>
                  </td>
                  <td className="px-3 py-2.5 text-[#444444] max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.name}>{row.name}</td>
                  <td className="px-3 py-2.5 text-right"><span className="text-[#e53935] font-semibold">{fmtNum(row.sorties)}</span></td>
                  <td className="px-3 py-2.5 text-right text-[#555555]">{fmtNum(row.stockMoyen)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(pct, 100)}%`, background: badge.color }} />
                      </div>
                      <span className="font-bold w-14 text-right" style={{ color: badge.color }}>{fmtPct(row.taux)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > 15 && (
        <button onClick={() => setShowAll(s => !s)}
          className="flex items-center gap-1.5 mx-auto text-[12px] text-[#12a6e0] font-semibold hover:underline">
          {showAll ? <><ChevronUp size={13} /> Réduire</> : <><ChevronDown size={13} /> Voir les {rows.length - 15} autres</>}
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  T2 — Analyse ABC / Pareto  (NOUVEAU — descriptif)
//  Classe les articles selon leur part dans la valeur de sortie
//  cumulée (règle 80/20). Source : ValeurSortie ou Sorties.
// ════════════════════════════════════════════════════════════════
function AnalyseABC({ data, cols }) {
  const [metric, setMetric] = useState('valeur'); // 'valeur' | 'qte'

  const { rows, chartData, totals } = useMemo(() => {
    const empty = { rows: [], chartData: [], totals: { A: 0, B: 0, C: 0, total: 0 } };
    if (!data?.length || !cols.article) return empty;

    const useVal = metric === 'valeur' && (cols.valSor || cols.valeur);
    const byArt = {};
    for (const r of data) {
      const code = r[cols.article] ?? '?';
      if (!byArt[code]) byArt[code] = { code, name: r[cols.design] ?? code, valeur: 0 };
      const v = useVal
        ? Number(r[cols.valSor] ?? 0)
        : Number(r[cols.sorties] ?? 0);
      byArt[code].valeur += v;
    }

    const sorted = Object.values(byArt)
      .filter(a => a.valeur > 0)
      .sort((a, b) => b.valeur - a.valeur);

    const total = sorted.reduce((s, a) => s + a.valeur, 0);
    if (total === 0) return empty;

    let cumul = 0;
    const classed = sorted.map((a, i) => {
      cumul += a.valeur;
      const cumulPct = (cumul / total) * 100;
      const classe = cumulPct <= 80 ? 'A' : cumulPct <= 95 ? 'B' : 'C';
      return { ...a, rang: i + 1, part: (a.valeur / total) * 100, cumulPct, classe };
    });

    const tot = { A: 0, B: 0, C: 0, total: classed.length };
    for (const a of classed) tot[a.classe] += 1;

    // courbe Pareto réduite à ~50 points pour rester lisible
    const step = Math.max(1, Math.floor(classed.length / 50));
    const chart = classed
      .filter((_, i) => i % step === 0 || i === classed.length - 1)
      .map(a => ({ rang: a.rang, code: a.code, part: a.part, cumulPct: a.cumulPct, classe: a.classe }));

    return { rows: classed, chartData: chart, totals: tot };
  }, [data, cols, metric]);

  if (!rows.length) return <Empty msg="Aucune sortie sur la période pour classer les articles" />;

  const classColor = { A: C.green, B: C.amber, C: C.red };
  const classBg    = { A: C.greenLight, B: C.amberLight, C: C.redLight };
  const classDesc  = {
    A: 'Vital — ~80% de la valeur',
    B: 'Important — ~15% suivant',
    C: 'Marginal — le reste',
  };

  const MetBtn = ({ id, label }) => (
    <button onClick={() => setMetric(id)}
      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 ${metric === id ? 'bg-[#12a6e0] text-white shadow-sm' : 'text-[#888888] hover:bg-[#f0f0f0]'}`}>
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-[#f8f8f8] border border-[#eeeeee] rounded-xl p-1">
          <MetBtn id="valeur" label="Par valeur sortie" />
          <MetBtn id="qte"    label="Par quantité sortie" />
        </div>
        <span className="text-[11px] text-[#aaaaaa] italic">
          {rows.length} articles classés
        </span>
      </div>

      {/* Cartes A / B / C */}
      <div className="grid grid-cols-3 gap-3">
        {['A', 'B', 'C'].map(cl => (
          <div key={cl} className="rounded-xl px-4 py-3 border flex flex-col gap-1"
            style={{ background: classBg[cl], borderColor: `${classColor[cl]}33` }}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-bold text-white"
                style={{ background: classColor[cl] }}>{cl}</span>
              <p className="text-[1.3rem] font-bold m-0" style={{ color: classColor[cl] }}>{totals[cl]}</p>
            </div>
            <p className="text-[10px] m-0" style={{ color: C.muted }}>{classDesc[cl]}</p>
          </div>
        ))}
      </div>

      {/* Courbe de Pareto : barres = part individuelle, ligne = cumul % */}
      <div className="bg-[#f9f9f9] border border-[#eeeeee] rounded-xl p-4">
        <p className="text-[11px] font-semibold text-[#888888] mb-3 uppercase tracking-wide">
          Courbe de Pareto — part individuelle (barres) et cumul (ligne)
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="rang" tick={{ fontSize: 9, fill: C.muted }} tickLine={false}
              axisLine={{ stroke: C.border }} />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: C.muted }} tickLine={false}
              axisLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]}
              tick={{ fontSize: 9, fill: C.muted }} tickLine={false} axisLine={false}
              tickFormatter={v => `${v}%`} />
            <Tooltip cursor={{ fill: 'rgba(18,166,224,0.04)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload;
                if (!row) return null;
                return (
                  <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-lg px-4 py-3 text-[12px]">
                    <p className="font-semibold text-[#0d0c0c] mb-1">
                      #{row.rang} · {row.code}
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: classBg[row.classe], color: classColor[row.classe] }}>
                        {row.classe}
                      </span>
                    </p>
                    <p className="text-[#888888] m-0">Part : <b className="text-[#0d0c0c]">{fmtPct(row.part)}</b></p>
                    <p className="text-[#888888] m-0">Cumul : <b className="text-[#0d0c0c]">{fmtPct(row.cumulPct)}</b></p>
                  </div>
                );
              }}
            />
            <ReferenceLine yAxisId="right" y={80} stroke={C.green} strokeDasharray="6 3"
              label={{ value: '80%', position: 'insideTopRight', fontSize: 9, fill: C.green }} />
            <Bar yAxisId="left" dataKey="part" radius={[2, 2, 0, 0]}>
              {chartData.map((r, i) => <Cell key={i} fill={classColor[r.classe]} fillOpacity={0.65} />)}
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="cumulPct" stroke={C.blue}
              strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  T3 — Articles dormants  (NOUVEAU — descriptif, pas prédictif)
//  Stock final > 0 mais AUCUNE sortie sur toute la période.
//  Constat de capital immobilisé. Source : StockFinal + Sorties.
// ════════════════════════════════════════════════════════════════
function ArticlesDormants({ data, cols, filters }) {
  const [page, setPage] = useState(0);
  const [onlyVal, setOnlyVal] = useState(false); // trier par valeur immobilisée

  const { rows, totalValeur, totalUnites } = useMemo(() => {
    const empty = { rows: [], totalValeur: 0, totalUnites: 0 };
    if (!data?.length || !cols.article) return empty;

    // dernier StockFinal/ValeurFinale par (article, dépôt) + somme sorties
    const byKey = {};
    const sortedData = [...data].sort((a, b) =>
      toISO(a[cols.date]).localeCompare(toISO(b[cols.date]))
    );
    for (const r of sortedData) {
      const art = r[cols.article] ?? '?';
      const dep = r[cols.depot] ?? '?';
      const key = `${art}__${dep}`;
      if (!byKey[key]) byKey[key] = {
        article: art, name: r[cols.design] ?? '', depot: dep,
        nomDep: r[cols.nomDep] ?? '', catN1: r[cols.catN1] ?? '—',
        sorties: 0, stockFinal: 0, valeurFinale: 0, lastDate: '',
      };
      byKey[key].sorties     += Number(r[cols.sorties] ?? 0);
      byKey[key].stockFinal   = Number(r[cols.stock]  ?? 0);   // dernier (data triée)
      byKey[key].valeurFinale = Number(r[cols.valeur] ?? 0);
      byKey[key].lastDate     = toISO(r[cols.date]);
    }

    const dormants = Object.values(byKey)
      .filter(a => a.sorties === 0 && a.stockFinal > 0)
      .sort((a, b) => onlyVal
        ? b.valeurFinale - a.valeurFinale
        : b.stockFinal - a.stockFinal);

    return {
      rows: dormants,
      totalValeur: dormants.reduce((s, a) => s + a.valeurFinale, 0),
      totalUnites: dormants.reduce((s, a) => s + a.stockFinal, 0),
    };
  }, [data, cols, onlyVal]);

  const prevLen = React.useRef(rows.length);
  if (prevLen.current !== rows.length) { prevLen.current = rows.length; if (page !== 0) setPage(0); }

  if (!rows.length) return <Empty msg="Aucun article dormant — tout le stock a bougé sur la période 👍" />;

  const displayed = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl px-4 py-3 border flex flex-col gap-1"
          style={{ background: C.purpleLight, borderColor: `${C.purple}33` }}>
          <p className="text-[10px] font-medium m-0 uppercase tracking-wide" style={{ color: C.muted }}>Articles dormants</p>
          <p className="text-[1.35rem] font-bold m-0" style={{ color: C.purple }}>{rows.length}</p>
        </div>
        <div className="rounded-xl px-4 py-3 border flex flex-col gap-1"
          style={{ background: C.amberLight, borderColor: `${C.amber}33` }}>
          <p className="text-[10px] font-medium m-0 uppercase tracking-wide" style={{ color: C.muted }}>Valeur immobilisée</p>
          <p className="text-[1.35rem] font-bold m-0" style={{ color: C.amber }}>{fmtVal(totalValeur)} <span className="text-[11px] font-normal">MAD</span></p>
        </div>
        <div className="rounded-xl px-4 py-3 border flex flex-col gap-1"
          style={{ background: C.blueLight, borderColor: `${C.blue}33` }}>
          <p className="text-[10px] font-medium m-0 uppercase tracking-wide" style={{ color: C.muted }}>Unités bloquées</p>
          <p className="text-[1.35rem] font-bold m-0" style={{ color: C.blue }}>{fmtNum(totalUnites)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#888888]">Trier :</span>
        <button onClick={() => setOnlyVal(false)}
          className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: !onlyVal ? C.blue : 'transparent', color: !onlyVal ? '#fff' : C.muted, border: !onlyVal ? 'none' : '1px solid #eeeeee' }}>
          Par stock
        </button>
        <button onClick={() => setOnlyVal(true)}
          className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: onlyVal ? C.blue : 'transparent', color: onlyVal ? '#fff' : C.muted, border: onlyVal ? 'none' : '1px solid #eeeeee' }}>
          Par valeur
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {['Article','Désignation','Dépôt','Stock bloqué','Valeur immobilisée'].map((h, i) => (
                <th key={i} className={`px-3 py-2 bg-[#f8f8f8] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888888] ${i >= 3 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, idx) => (
              <tr key={idx} className="border-b border-[#f8f8f8] hover:bg-[rgba(124,77,255,0.03)] transition-colors">
                <td className="px-3 py-2.5">
                  <span className="inline-block font-mono text-[0.7rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{row.article}</span>
                </td>
                <td className="px-3 py-2.5 text-[#444444] max-w-[170px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.name}>{row.name || '—'}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-block font-mono text-[0.7rem] text-[#666666] bg-[#f4f4f4] border border-[#e8e8e8] rounded-md px-2 py-0.5">{row.depot}</span>
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-[#0d0c0c]">{fmtNum(row.stockFinal)}</td>
                <td className="px-3 py-2.5 text-right font-semibold" style={{ color: C.amber }}>{fmtVal(row.valeurFinale)} MAD</td>
              </tr>
            ))}
            {Array.from({ length: PAGE_SIZE - displayed.length }).map((_, i) => (
              <tr key={`ph-${i}`} style={{ height: 41 }}>
                {Array.from({ length: 5 }).map((__, j) => <td key={j} className="px-3 border-b border-[#f8f8f8]" />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  T4 — Évolution de la valeur par famille  (NOUVEAU — descriptif)
//  Valeur au 1er jour vs dernier jour de la période, par famille.
//  Comparatif début → fin (pas de projection).
// ════════════════════════════════════════════════════════════════
function EvolutionParFamille({ data, cols }) {
  const [groupBy, setGroupBy] = useState('famille'); // 'famille' | 'cat'

  const rows = useMemo(() => {
    if (!data?.length || !cols.article) return [];
    const keyCol = groupBy === 'famille' ? (cols.famille || cols.catN1) : (cols.catN1 || cols.famille);
    if (!keyCol) return [];

    // 1) dernier jour connu par (article, dépôt) AVANT la fin → valeur fin
    //    et premier jour connu → valeur début
    const byKey = {};
    for (const r of data) {
      const art = r[cols.article] ?? '?';
      const dep = r[cols.depot] ?? '?';
      const key = `${art}__${dep}`;
      const d   = toISO(r[cols.date]);
      if (!d) continue;
      const grp = r[keyCol] || 'Sans groupe';
      const val = Number(r[cols.valeur] ?? 0);
      if (!byKey[key]) byKey[key] = { grp, first: { d, val }, last: { d, val } };
      if (d < byKey[key].first.d) byKey[key].first = { d, val };
      if (d > byKey[key].last.d)  byKey[key].last  = { d, val };
      byKey[key].grp = grp;
    }

    // 2) agréger par groupe
    const byGrp = {};
    for (const entry of Object.values(byKey)) {
      const g = entry.grp;
      if (!byGrp[g]) byGrp[g] = { name: g, debut: 0, fin: 0 };
      byGrp[g].debut += entry.first.val;
      byGrp[g].fin   += entry.last.val;
    }

    return Object.values(byGrp)
      .map(g => {
        const diff = g.fin - g.debut;
        const pct  = g.debut > 0 ? (diff / g.debut) * 100 : (g.fin > 0 ? 100 : 0);
        return { ...g, diff, pct };
      })
      .filter(g => g.debut > 0 || g.fin > 0)
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 12);
  }, [data, cols, groupBy]);

  if (!rows.length) return <Empty msg="Pas de données de valeur par groupe sur la période" />;

  const GrpBtn = ({ id, label }) => (
    <button onClick={() => setGroupBy(id)}
      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 ${groupBy === id ? 'bg-[#12a6e0] text-white shadow-sm' : 'text-[#888888] hover:bg-[#f0f0f0]'}`}>
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-[#f8f8f8] border border-[#eeeeee] rounded-xl p-1">
          <GrpBtn id="famille" label="Par famille" />
          <GrpBtn id="cat"     label="Par catalogue N1" />
        </div>
        <span className="text-[11px] text-[#aaaaaa] italic">Valeur stock : début → fin de période</span>
      </div>

      {/* Barres groupées début vs fin */}
      <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 38)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 50, left: 8, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 9, fill: C.muted }} tickLine={false} axisLine={false}
            tickFormatter={v => fmtVal(v)} />
          <YAxis type="category" dataKey="name" width={120}
            tick={{ fontSize: 10, fill: C.text }} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: 'rgba(18,166,224,0.04)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const row = rows.find(r => r.name === label);
              if (!row) return null;
              return (
                <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-lg px-4 py-3 text-[12px]">
                  <p className="font-semibold text-[#0d0c0c] mb-1.5">{label}</p>
                  <p className="text-[#888888] m-0">Début : <b className="text-[#0d0c0c]">{fmtVal(row.debut)} MAD</b></p>
                  <p className="text-[#888888] m-0">Fin : <b className="text-[#0d0c0c]">{fmtVal(row.fin)} MAD</b></p>
                  <p className="m-0 mt-1 font-semibold" style={{ color: row.diff >= 0 ? C.green : C.red }}>
                    {row.diff >= 0 ? '+' : ''}{fmtVal(row.diff)} MAD ({row.pct >= 0 ? '+' : ''}{row.pct.toFixed(1)}%)
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="debut" name="Début" fill={C.light} radius={[0, 3, 3, 0]} fillOpacity={0.7} />
          <Bar dataKey="fin"   name="Fin"   radius={[0, 3, 3, 0]}>
            {rows.map((r, i) => <Cell key={i} fill={r.diff >= 0 ? C.green : C.red} fillOpacity={0.85} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Liste compacte des variations */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rows.slice(0, 6).map(r => (
          <div key={r.name} className="bg-[#f8f8f8] rounded-xl px-3 py-2.5 border border-[#eeeeee]">
            <p className="text-[#888888] text-[10px] m-0 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap" title={r.name}>{r.name}</p>
            <p className={`font-bold text-[0.95rem] m-0 flex items-center gap-1 ${r.diff > 0 ? 'text-[#01a82e]' : r.diff < 0 ? 'text-[#e53935]' : 'text-[#888888]'}`}>
              {r.diff > 0 ? <TrendingUp size={12} /> : r.diff < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
              {r.pct > 0 ? '+' : ''}{r.pct.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  T5 — Déséquilibre entrées / sorties  (CONSERVÉ — descriptif)
// ════════════════════════════════════════════════════════════════
function getDesequilibreCat(ratio, entrees, sorties) {
  if (sorties === 0 && entrees > 0) return { label: 'Accumulation',   color: C.purple, bg: C.purpleLight, dir: 'in'  };
  if (entrees === 0 && sorties > 0) return { label: 'Déstockage pur', color: C.red,    bg: C.redLight,    dir: 'out' };
  if (ratio >= 2)                   return { label: 'Sur-appro',      color: C.amber,  bg: C.amberLight,  dir: 'in'  };
  if (ratio >= 1.5)                 return { label: 'Excès entrées',  color: '#b36a00', bg: 'rgba(224,138,0,0.05)', dir: 'in' };
  if (ratio <= 0.2)                 return { label: 'Déstockage',     color: C.red,    bg: C.redLight,    dir: 'out' };
  if (ratio <= 0.5)                 return { label: 'Excès sorties',  color: '#b71c1c', bg: 'rgba(229,57,53,0.05)', dir: 'out' };
  return                                   { label: 'Équilibré',      color: C.green,  bg: C.greenLight,  dir: 'ok'  };
}

function DesequilibreEntreesSorties({ data, cols }) {
  const [page,    setPage]    = useState(0);
  const [sortDir, setSortDir] = useState('all');
  const [sortCol, setSortCol] = useState('ratio');

  const rows = useMemo(() => {
    if (!data?.length || !cols.article) return [];
    const byArt = {};
    for (const r of data) {
      const key = r[cols.article] ?? '?';
      if (!byArt[key]) byArt[key] = {
        article: key, name: r[cols.design] ?? key,
        catN1: r[cols.catN1] ?? '—', entrees: 0, sorties: 0,
      };
      byArt[key].entrees += Number(r[cols.entrees] ?? 0);
      byArt[key].sorties += Number(r[cols.sorties] ?? 0);
    }
    return Object.values(byArt)
      .filter(a => a.entrees > 0 || a.sorties > 0)
      .map(a => {
        const ratio = a.sorties > 0 ? a.entrees / a.sorties : a.entrees > 0 ? Infinity : 1;
        const cat   = getDesequilibreCat(ratio, a.entrees, a.sorties);
        const score = ratio === Infinity ? 999 : Math.abs(Math.log(ratio === 0 ? 0.001 : ratio));
        return { ...a, ratio, cat, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [data, cols]);

  const counts = useMemo(() => ({
    surAppro:   rows.filter(r => r.cat.dir === 'in').length,
    equilibre:  rows.filter(r => r.cat.dir === 'ok').length,
    destockage: rows.filter(r => r.cat.dir === 'out').length,
  }), [rows]);

  const chartRows = useMemo(() => {
    const top5in  = rows.filter(r => r.cat.dir === 'in').slice(0, 5).map(r => ({
      label: r.article, valeur: r.ratio === Infinity ? r.entrees : r.entrees - r.sorties,
      color: r.cat.color, ratio: r.ratio, dir: 'in',
    }));
    const top5out = rows.filter(r => r.cat.dir === 'out').slice(0, 5).map(r => ({
      label: r.article, valeur: -(r.sorties - r.entrees),
      color: r.cat.color, ratio: r.ratio, dir: 'out',
    }));
    return [...top5in.reverse(), ...top5out].reverse();
  }, [rows]);

  const tableRows = useMemo(() => {
    let list = sortDir === 'in'  ? rows.filter(r => r.cat.dir === 'in')
             : sortDir === 'out' ? rows.filter(r => r.cat.dir === 'out')
             : rows;
    if (sortCol === 'entrees') list = [...list].sort((a, b) => b.entrees - a.entrees);
    if (sortCol === 'sorties') list = [...list].sort((a, b) => b.sorties - a.sorties);
    return list;
  }, [rows, sortDir, sortCol]);

  const prevKey = React.useRef('');
  const curKey  = `${sortDir}-${sortCol}-${tableRows.length}`;
  if (prevKey.current !== curKey) { prevKey.current = curKey; if (page !== 0) setPage(0); }

  const displayed = tableRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (!rows.length) return <Empty msg="Aucun article avec entrées ou sorties sur la période" />;

  const DirBtn = ({ id, label, color }) => (
    <button onClick={() => { setSortDir(id); setPage(0); }}
      className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 border"
      style={{
        background:  sortDir === id ? color       : 'transparent',
        color:       sortDir === id ? '#fff'       : C.muted,
        borderColor: sortDir === id ? color       : C.border,
      }}>
      {label}
    </button>
  );

  const SortBtn = ({ id, label }) => (
    <button onClick={() => { setSortCol(id); setPage(0); }}
      className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
      style={{ background: sortCol === id ? C.blue : 'transparent', color: sortCol === id ? '#fff' : C.muted }}>
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sur-appro / Accumulation', count: counts.surAppro,   color: C.amber, bg: C.amberLight,  icon: TrendingUp     },
          { label: 'Équilibrés',               count: counts.equilibre,  color: C.green, bg: C.greenLight,  icon: ArrowLeftRight },
          { label: 'Déstockage',               count: counts.destockage, color: C.red,   bg: C.redLight,    icon: TrendingDown   },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label} className="rounded-xl px-4 py-3 border flex flex-col gap-1" style={{ background: bg, borderColor: `${color}33` }}>
            <div className="flex items-center gap-1.5">
              <Icon size={12} style={{ color }} />
              <p className="text-[10px] font-medium m-0 uppercase tracking-wide" style={{ color: C.muted }}>{label}</p>
            </div>
            <p className="text-[1.35rem] font-bold m-0" style={{ color }}>{count}</p>
          </div>
        ))}
      </div>

      {chartRows.length > 0 && (
        <div className="bg-[#f9f9f9] border border-[#eeeeee] rounded-xl p-4">
          <p className="text-[11px] font-semibold text-[#888888] mb-3 uppercase tracking-wide">
            Top articles déséquilibrés — excédent entrées (+) ou sorties (−)
          </p>
          <ResponsiveContainer width="100%" height={Math.max(160, chartRows.length * 32)}>
            <BarChart data={chartRows} layout="vertical" margin={{ top: 0, right: 20, left: 8, bottom: 0 }} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: C.muted }} tickLine={false} axisLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v <= -1000 ? `-${(Math.abs(v)/1000).toFixed(0)}k` : v} />
              <YAxis type="category" dataKey="label" width={72}
                tick={{ fontSize: 9, fill: C.blue, fontWeight: 600 }} tickLine={false} axisLine={false} />
              <ReferenceLine x={0} stroke={C.border} strokeWidth={2} />
              <Tooltip cursor={{ fill: 'rgba(18,166,224,0.04)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = chartRows.find(r => r.label === label);
                  return (
                    <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-lg px-4 py-3 text-[12px]">
                      <p className="font-semibold text-[#0d0c0c] mb-1">{label}</p>
                      <p className="text-[#888888] m-0">Ratio E/S : <b style={{ color: row?.color }}>{fmtRatio(row?.ratio)}</b></p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="valeur" radius={[0, 4, 4, 0]}>
                {chartRows.map((r, i) => <Cell key={i} fill={r.color} fillOpacity={0.75} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <DirBtn id="all"  label="Tous"         color={C.blue}  />
          <DirBtn id="in"   label="Sur-appro ↑"  color={C.amber} />
          <DirBtn id="out"  label="Déstockage ↓" color={C.red}   />
        </div>
        <div className="flex items-center gap-1 bg-[#f8f8f8] border border-[#eeeeee] rounded-xl p-1 ml-auto">
          <SortBtn id="ratio"   label="Par déséquilibre" />
          <SortBtn id="entrees" label="Par entrées"      />
          <SortBtn id="sorties" label="Par sorties"      />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {['Article','Désignation','Catalogue N1','Entrées','Sorties','Ratio E/S','Statut'].map((h, i) => (
                <th key={i} className={`px-3 py-2 bg-[#f8f8f8] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888888] ${i >= 3 && i <= 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, idx) => (
              <tr key={row.article + idx} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.02)] transition-colors">
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="inline-block font-mono text-[0.7rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{row.article}</span>
                </td>
                <td className="px-3 py-2.5 text-[#444444] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.name}>
                  {row.name !== row.article ? row.name : '—'}
                </td>
                <td className="px-3 py-2.5">
                  {row.catN1 !== '—'
                    ? <span className="inline-block bg-[rgba(18,166,224,0.08)] text-[#0b7db0] text-[0.65rem] px-2 py-0.5 rounded border border-[rgba(18,166,224,0.18)]">{row.catN1}</span>
                    : <span className="text-[#e0e0e0]">—</span>
                  }
                </td>
                <td className="px-3 py-2.5 text-right"><span className="text-[#01a82e] font-semibold">{fmtNum(row.entrees)}</span></td>
                <td className="px-3 py-2.5 text-right"><span className="text-[#e53935] font-semibold">{fmtNum(row.sorties)}</span></td>
                <td className="px-3 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-12 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.score * 25)}%`, background: row.cat.color }} />
                    </div>
                    <span className="font-bold w-10 text-right" style={{ color: row.cat.color }}>{fmtRatio(row.ratio)}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: row.cat.bg, color: row.cat.color }}>{row.cat.label}</span>
                </td>
              </tr>
            ))}
            {Array.from({ length: PAGE_SIZE - displayed.length }).map((_, i) => (
              <tr key={`ph-${i}`} style={{ height: 41 }}>
                {Array.from({ length: 7 }).map((__, j) => <td key={j} className="px-3 border-b border-[#f8f8f8]" />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={tableRows.length} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  );
}

// ── Barre d'onglets ───────────────────────────────────────────
function TrendTabs({ tabs, active, onChange }) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.05)] p-1.5
                    flex flex-wrap gap-1 overflow-x-auto">
      {tabs.map(t => {
        const on = active === t.id;
        const Icon = t.icon;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px] font-semibold
                       transition-all duration-150 whitespace-nowrap shrink-0"
            style={{
              background: on ? t.color : 'transparent',
              color:      on ? '#fff'  : C.muted,
              boxShadow:  on ? `0 2px 8px ${t.color}40` : 'none',
            }}>
            <Icon size={15} />
            <span>{t.label}</span>
            {t.badge != null && t.badge > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                style={{
                  background: on ? 'rgba(255,255,255,0.25)' : `${t.color}1a`,
                  color:      on ? '#fff' : t.color,
                }}>
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════
export default function PageTrends() {
  const { tableData, currentFilters, hasFiltered } = useDashboard();

  const cols    = useCols(tableData);
  const hasData = hasFiltered && tableData && tableData.length > 0;

  const [active, setActive] = useState('rotation');

  // Badges d'onglet : nb dormants + nb déséquilibrés (descriptifs)
  const badges = useMemo(() => {
    if (!hasData || !cols.article) return {};
    const byKey = {};
    const byArt = {};
    for (const r of tableData) {
      const art = r[cols.article] ?? '?';
      const dep = r[cols.depot] ?? '';
      const k1  = `${art}__${dep}`;
      if (!byKey[k1]) byKey[k1] = { s: 0, sf: 0 };
      byKey[k1].s  += Number(r[cols.sorties] ?? 0);
      byKey[k1].sf  = Number(r[cols.stock]   ?? 0);

      if (!byArt[art]) byArt[art] = { e: 0, s: 0 };
      byArt[art].e += Number(r[cols.entrees] ?? 0);
      byArt[art].s += Number(r[cols.sorties] ?? 0);
    }
    const dormants = Object.values(byKey).filter(a => a.s === 0 && a.sf > 0).length;
    const desequilibres = Object.values(byArt).filter(a => {
      if (a.e === 0 && a.s === 0) return false;
      const ratio = a.s > 0 ? a.e / a.s : a.e > 0 ? Infinity : 1;
      return ratio >= 2 || ratio <= 0.5 || ratio === Infinity || (a.s > 0 && a.e === 0);
    }).length;
    return { dormants, desequilibres };
  }, [hasData, tableData, cols]);

  // Définition des onglets (label, icône, couleur, sous-titre, badge)
  const TABS = [
    { id: 'rotation',     label: 'Rotation',      icon: ArrowLeftRight, color: C.blue,
      title: 'Taux de rotation des articles',
      subtitle: 'Sorties ÷ stock moyen sur la période — identifie les articles lents et rapides',
      desc: "Cet onglet mesure la vitesse à laquelle chaque article s'écoule : on divise les sorties par le stock moyen sur la période. Un taux élevé veut dire que l'article tourne vite (il se vend et se réapprovisionne souvent) ; un taux faible signale un article qui stagne. Utile pour repérer les références à dynamiser ou à ne plus sur-commander." },
    { id: 'abc',          label: 'ABC / Pareto',  icon: Award,          color: C.green,
      title: 'Analyse ABC (Pareto)',
      subtitle: 'Classement 80/20 des articles selon leur poids dans la valeur de sortie',
      desc: "Cet onglet applique la règle 80/20 : il classe les articles en A, B et C selon leur poids cumulé dans la valeur des sorties. La classe A regroupe le petit nombre d'articles qui représentent l'essentiel de la valeur, à surveiller en priorité ; la classe C, le grand nombre d'articles à faible impact. La courbe de Pareto montre cette concentration." },
    { id: 'dormants',     label: 'Dormants',      icon: Moon,           color: C.purple,
      title: 'Articles dormants',
      subtitle: 'En stock mais sans aucune sortie sur la période — capital immobilisé',
      desc: "Cet onglet liste les articles qui ont du stock mais qui n'ont enregistré aucune sortie sur la période : c'est du capital immobilisé qui dort en rayon. On y voit le nombre d'articles concernés, la valeur totale bloquée en MAD et les unités immobilisées, pour cibler les déstockages ou promotions à lancer.",
      badge: badges.dormants },
    { id: 'valeurFamille',label: 'Valeur famille',icon: Boxes,          color: C.amber,
      title: 'Évolution de la valeur par famille',
      subtitle: 'Valeur du stock au début vs à la fin de la période, par famille ou catalogue',
      desc: "Cet onglet compare la valeur du stock au début et à la fin de la période, regroupée par famille ou par catalogue N1. Les barres montrent l'écart début → fin et le pourcentage de variation : on voit immédiatement quelles familles se sont valorisées (accumulation) et lesquelles ont fondu (déstockage)." },
    { id: 'desequilibre', label: 'Déséquilibre',  icon: ArrowLeftRight, color: C.red,
      title: 'Déséquilibre entrées / sorties',
      subtitle: 'Ratio E÷S — identifie les sur-approvisionnements et déstockages',
      desc: "Cet onglet compare les entrées et les sorties de chaque article via leur ratio E÷S. Un ratio bien supérieur à 1 indique un sur-approvisionnement (on rentre plus qu'on ne sort) ; un ratio bien inférieur à 1, un déstockage. Les articles équilibrés sont sains. Pratique pour ajuster les commandes et éviter l'accumulation.",
      badge: badges.desequilibres },
  ];

  const activeTab = TABS.find(t => t.id === active) ?? TABS[0];

  const renderActive = () => {
    switch (active) {
      case 'rotation':      return <TauxRotation data={tableData} cols={cols} />;
      case 'abc':           return <AnalyseABC data={tableData} cols={cols} />;
      case 'dormants':      return <ArticlesDormants data={tableData} cols={cols} filters={currentFilters} />;
      case 'valeurFamille': return <EvolutionParFamille data={tableData} cols={cols} />;
      case 'desequilibre':  return <DesequilibreEntreesSorties data={tableData} cols={cols} />;
      default:              return null;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <ContextBanner filters={currentFilters} />

      {!hasData && (
        <div className="bg-[rgba(18,166,224,0.04)] border border-[rgba(18,166,224,0.15)] rounded-xl px-5 py-4 text-[#0b7db0] text-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#12a6e0] shrink-0 animate-pulse" />
          <span>
            Rendez-vous sur le <strong>Tableau de bord</strong> pour sélectionner une base et une
            période, puis cliquez sur <strong>Filtrer</strong> pour afficher les tendances.
          </span>
        </div>
      )}

      {hasData && (
        <>
          <TrendTabs tabs={TABS} active={active} onChange={setActive} />

          {/* Description de l'onglet actif */}
          <div className="flex items-start gap-3 rounded-2xl px-5 py-3.5 border"
            style={{ background: `${activeTab.color}0a`, borderColor: `${activeTab.color}26` }}>
            <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${activeTab.color}1f`, color: activeTab.color }}>
              <activeTab.icon size={15} />
            </span>
            <p className="text-[12px] text-[#555555] m-0 leading-relaxed">
              {activeTab.desc}
            </p>
          </div>

          <TrendCard
            icon={activeTab.icon}
            iconColor={activeTab.color}
            iconBg={`${activeTab.color}14`}
            title={activeTab.title}
            subtitle={activeTab.subtitle}
            badge={
              active === 'dormants' && badges.dormants > 0
                ? `${badges.dormants} dormant${badges.dormants > 1 ? 's' : ''}`
                : active === 'desequilibre' && badges.desequilibres > 0
                ? `${badges.desequilibres} déséquilibré${badges.desequilibres > 1 ? 's' : ''}`
                : undefined
            }>
            {renderActive()}
          </TrendCard>
        </>
      )}
    </div>
  );
}