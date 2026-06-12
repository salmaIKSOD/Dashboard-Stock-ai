import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  PackageX,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { exportExcel } from './exportExcel.js';

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// const fmtNum = (n) => {
//   if (n === null || n === undefined || n === '') return '—';
//   const num = Number(n);
//   if (isNaN(num)) return '—';
//   return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
// };
const fmtNum = (n) => {
  if (n === null || n === undefined || n === '') return '—';
  const num = Number(n);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(num);
};

/* ══════════════════════════════════════════════════════════════
   DETECT COLUMNS
══════════════════════════════════════════════════════════════ */
function detectColumns(data) {
  if (!data || data.length === 0) return {};
  const keys = Object.keys(data[0]);
  const find = (...variants) =>
    keys.find(k =>
      variants.some(v => k.toLowerCase().replace(/[\s_()]/g, '') === v.toLowerCase().replace(/[\s_()]/g, ''))
    ) || null;
  return {
    date:       find('Date', 'DateJour', 'datejour'),
    catN1:      find('CatN1', 'Cat N1', 'CL_Intitule1', 'clintitule1'),
    nomDepot:   find('NomDepot', 'Nom Depot', 'DE_Intitule', 'deintitule'),
    article:    find('Article', 'AR_Ref', 'arref'),
    design:     find('Designation', 'AR_Design', 'ardesign', 'Désignation'),
    entrees:    find('TotalEntrees', 'Total Entrees', 'TotalEntree', 'totalentree'),
    sorties:    find('TotalSorties', 'Total Sorties', 'TotalSortie', 'totalsortie'),
    solde:      find('ValeurFinalePermanente', 'Valeur Finale (Permanente)', 'ValeurFinale', 'valeurfinale', 'Solde', 'solde'),
    stockFinal: find('StockFinal', 'Stock Final', 'stockfinal'),
  };
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANTS UI
══════════════════════════════════════════════════════════════ */
function StockBadge({ value }) {
  if (value === null || value === undefined || value === '') return <span className="text-[#c5c5c5]">—</span>;
  const v = Number(value);
  if (isNaN(v)) return <span className="text-[#c5c5c5]">—</span>;
  if (v > 0) return (
    <span className="inline-flex items-center gap-1 text-[#c47a00] font-semibold text-[0.8rem] bg-[rgba(224,138,0,0.08)] border border-[rgba(224,138,0,0.2)] rounded-md px-2 py-0.5">
      <TrendingUp size={11} /> {fmtNum(v)}
    </span>
  );
  if (v < 0) return (
    <span className="inline-flex items-center gap-1 text-[#b71c1c] font-semibold text-[0.8rem] bg-[rgba(229,57,53,0.07)] border border-[rgba(229,57,53,0.18)] rounded-md px-2 py-0.5">
      <TrendingDown size={11} /> {fmtNum(v)}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[#c5c5c5] text-[0.75rem] bg-[#fafafa] border border-[#eeeeee] rounded-md px-2 py-0.5">
      <Minus size={10} /> 0
    </span>
  );
}

function Th({ label, colKey, sortKey, sortDir, onSort, align = 'left' }) {
  const active  = sortKey === colKey;
  const isRight = align === 'right';
  const SortIcon = () => {
    if (!colKey) return null;
    if (active) return sortDir === 'asc'
      ? <ArrowUp   size={13} className="text-[#12a6e0] shrink-0" />
      : <ArrowDown size={13} className="text-[#12a6e0] shrink-0" />;
    return <ArrowUpDown size={13} className="text-[#c5c5c5] shrink-0" />;
  };
  return (
    <th
      onClick={() => colKey && onSort(colKey)}
      className={`px-4 py-3 bg-[#f8f8f8] whitespace-nowrap overflow-hidden ${colKey ? 'cursor-pointer select-none' : 'cursor-default'} ${isRight ? 'text-right' : 'text-left'}`}
    >
      <div className={`flex items-center gap-1.5 ${isRight ? 'justify-end' : 'justify-start'}`}>
        <span className={`text-[0.6875rem] font-semibold uppercase tracking-[0.06em] transition-colors duration-150 ${active ? 'text-[#12a6e0]' : 'text-[#888888]'}`}>
          {label}
        </span>
        <SortIcon />
      </div>
    </th>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function StockTable({ data, loading, dateDebut, dateFin }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 31;

  const tableTopRef = useRef(null);
  const cols = useMemo(() => detectColumns(data), [data]);
  useEffect(() => { setPage(1); }, [data]);

  const sorted = useMemo(() => {
    if (!data || !data.length) return [];
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
      const na = Number(av), nb = Number(bv);
      if (!isNaN(na) && !isNaN(nb)) return sortDir === 'asc' ? na - nb : nb - na;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv), 'fr')
        : String(bv).localeCompare(String(av), 'fr');
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); setSortDir(null); }
    setPage(1);
  };

  const goToPage = (p, scroll = false) => {
    setPage(p);
    if (scroll) tableTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
      <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#12a6e0] animate-pulse" />
        <div className="h-3 w-40 bg-[#f0f0f0] rounded" />
      </div>
      <div className="p-5 flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-[#f8f8f8] rounded-lg" />
        ))}
      </div>
    </div>
  );

  if (!data || data.length === 0) return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-16 text-center shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
      <PackageX size={36} className="text-[#e0e0e0] mx-auto mb-3" />
      <p className="text-[#c5c5c5] text-sm">Aucun résultat — ajustez vos filtres et cliquez sur Filtrer</p>
    </div>
  );

  return (
    <div ref={tableTopRef} className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#01d63a]" />
          <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Résultats</span>
          <span className="bg-[#f0f0f0] text-[#666666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
            {sorted.length.toLocaleString('fr-FR')} lignes
          </span>
        </div>
        <button
          onClick={() => exportExcel(sorted, cols, dateDebut, dateFin)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold bg-[#f0fdf4] text-[#15803d] border border-[rgba(21,128,61,0.25)] cursor-pointer transition-all duration-150 hover:bg-[#dcfce7] hover:shadow-[0_1px_6px_rgba(21,128,61,0.18)] active:scale-[0.97]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 16l-5-5h3V4h4v7h3l-5 5z" fill="#15803d"/>
            <path d="M5 20h14" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Exporter Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse table-auto">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              <Th label="Date"         colKey={cols.date}       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <Th label="Catalogue N1" />
              <Th label="Dépôt"        colKey={cols.nomDepot}   sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <Th label="Article"      colKey={cols.article}    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <Th label="Nom Article" />
              <Th label="Entrées"      colKey={cols.entrees}    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
              <Th label="Sorties"      colKey={cols.sorties}    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
              <Th label="Solde"        colKey={cols.solde}      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
              <Th label="Stock Final"  colKey={cols.stockFinal} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, idx) => {
              const entrees  = Number(row[cols.entrees] ?? 0);
              const sorties  = Number(row[cols.sorties] ?? 0);
              const solde    = Number(row[cols.solde]   ?? 0);
              const hasMvt   = entrees > 0 || sorties > 0;
              const nomDepot = row[cols.nomDepot] ?? '—';
              return (
                <tr key={idx} className={`border-b border-[#f8f8f8] transition-colors duration-100 ${hasMvt ? 'opacity-100 hover:bg-[rgba(18,166,224,0.04)]' : 'opacity-75 hover:bg-[#fafafa]'}`}>
                  <td className="px-4 py-3 font-mono text-[0.75rem] text-[#888888] whitespace-nowrap">{fmtDate(row[cols.date])}</td>
                  <td className="px-4 py-3">
                    {row[cols.catN1]
                      ? <span className="inline-block bg-[rgba(18,166,224,0.08)] text-[#0b7db0] text-[0.6875rem] px-2 py-0.5 rounded border border-[rgba(18,166,224,0.18)] whitespace-nowrap overflow-hidden text-ellipsis max-w-[110px]" title={row[cols.catN1]}>{row[cols.catN1]}</span>
                      : <span className="text-[#e0e0e0]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[#555555] text-[0.75rem] whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]" title={nomDepot}>{nomDepot}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-block font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{row[cols.article] ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-[#444444] text-[0.75rem] whitespace-nowrap overflow-hidden text-ellipsis max-w-[260px]" title={row[cols.design]}>{row[cols.design] ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {entrees > 0
                      ? <span className="inline-block text-[#01773d] font-semibold text-[0.8rem] bg-[rgba(1,168,46,0.07)] border border-[rgba(1,168,46,0.18)] rounded-md px-2 py-0.5">{fmtNum(entrees)}</span>
                      : <span className="text-[#e0e0e0] text-[0.75rem]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {sorties > 0
                      ? <span className="inline-block text-[#b71c1c] font-semibold text-[0.8rem] bg-[rgba(229,57,53,0.07)] border border-[rgba(229,57,53,0.18)] rounded-md px-2 py-0.5">{fmtNum(sorties)}</span>
                      : <span className="text-[#e0e0e0] text-[0.75rem]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="inline-block font-semibold text-[0.8rem] rounded-md px-2 py-0.5 border"
                      style={solde > 0
                        ? { color: '#0b7db0', background: 'rgba(18,166,224,0.07)', borderColor: 'rgba(18,166,224,0.18)' }
                        : solde < 0
                        ? { color: '#b71c1c', background: 'rgba(229,57,53,0.07)', borderColor: 'rgba(229,57,53,0.18)' }
                        : { color: '#c5c5c5', background: '#fafafa', borderColor: '#eeeeee' }}
                    >
                      {fmtNum(solde)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right"><StockBadge value={row[cols.stockFinal]} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f0]">
          <span className="text-[#c5c5c5] text-[0.75rem]">Page {page} / {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666666] border border-[#e0e0e0] transition-all duration-150 hover:bg-[#eaeaea] hover:text-[#0d0c0c] disabled:opacity-35 disabled:cursor-not-allowed"
            >
              ← Préc.
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p, true)}
                  className={`w-8 h-8 rounded-lg text-[0.75rem] cursor-pointer transition-all duration-150 ${page === p ? 'bg-[#12a6e0] text-white font-semibold border-0' : 'bg-[#f5f5f5] text-[#666666] border border-[#e0e0e0] font-normal hover:bg-[#eaeaea] hover:text-[#0d0c0c]'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666666] border border-[#e0e0e0] transition-all duration-150 hover:bg-[#eaeaea] hover:text-[#0d0c0c] disabled:opacity-35 disabled:cursor-not-allowed"
            >
              Suiv. →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}