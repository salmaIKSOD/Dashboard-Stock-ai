import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUp, ArrowDown, ArrowUpDown,
  Warehouse, PackageX, Search, Database,
  CalendarDays, X, ChevronDown, Loader2, Check,
  TrendingUp, TrendingDown, Minus,
  PackageCheck, PackageOpen, Boxes, Eye,
  RefreshCw,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { fetchMouvements, fetchFiltres, fetchBases } from '../api/stockApi';
import { exportExcelMouvements } from './exportExcelMouvements';

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
    keys.find(k => variants.some(v =>
      k.toLowerCase().replace(/[\s_()]/g, '') === v.toLowerCase().replace(/[\s_()]/g, '')
    )) || null;
  return {
    date:       find('Date', 'DateJour'),
    article:    find('Article', 'AR_Ref'),
    design:     find('Designation', 'AR_Design', 'Désignation'),
    nomDepot:   find('Nom Depot', 'NomDepot', 'DE_Intitule'),
    entrees:    find('Total Entrees', 'TotalEntree', 'TotalEntrees'),
    pruEntree:  find('Valeur Entree', 'ValeurEntree', 'valeurentree', 'Valeur entree'),
    sorties:    find('Total Sorties', 'TotalSortie', 'TotalSorties'),
    pruSortie:  find('Valeur Sortie', 'ValeurSortie', 'valeursortie', 'Valeur sortie'),
    valeurMvt:  find('Total Valeur Mouvement', 'TotalValeurMouvement'),
    solde:      find('Valeur Finale Permanente', 'ValeurFinalePermanente', 'Valeur Finale (Permanente)', 'ValeurFinale'),
    stockFinal: find('Stock Final', 'StockFinal'),
  };
}

/* ══════════════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════════════ */
function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return { isMobile: width < 640, isTablet: width >= 640 && width < 1024, isDesktop: width >= 1024 };
}

/* ══════════════════════════════════════════════════════════════
   SELECT AVEC PORTAL
══════════════════════════════════════════════════════════════ */
function Select({ label, icon: Icon, value, onChange, options, placeholder, disabled, loading }) {
  const [open, setOpen]               = useState(false);
  const [search, setSearch]           = useState('');
  const [dropdownStyle, setDropStyle] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef   = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef    = useRef(null);

  const updatePos = () => {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setDropStyle({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: Math.max(r.width, 280) });
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (buttonRef.current?.contains(e.target))   return;
      if (dropdownRef.current?.contains(e.target)) return;
      setOpen(false); setSearch('');
    };
    if (open) {
      updatePos();
      document.addEventListener('mousedown', handler);
      window.addEventListener('scroll', updatePos);
      window.addEventListener('resize', updatePos);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', updatePos);
      window.removeEventListener('resize', updatePos);
    };
  }, [open]);

  const selected   = options.find(o => String(o.value) === String(value));
  const isDisabled = disabled || loading;
  const filtered   = search.trim()
    ? options.filter(o => o.label.toLowerCase().startsWith(search.toLowerCase()))
    : options;

  return (
    <div className="flex flex-col gap-[6px]">
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
        {Icon && <Icon size={11} />}
        {label}
      </label>
      <div className="relative w-full">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => { if (!isDisabled) { updatePos(); setOpen(p => !p); } }}
          className={`
            w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg
            text-left text-sm transition-[border-color,box-shadow] duration-150 outline-none border
            ${open
              ? 'border-[#12a6e0] shadow-[0_0_0_3px_rgba(18,166,224,0.12)]'
              : isDisabled
              ? 'border-[#e0e0e0] bg-[#f5f5f5]'
              : 'border-[#c5c5c5] bg-white hover:border-[#12a6e0]'}
            ${isDisabled ? 'cursor-not-allowed text-[#aaaaaa]' : 'cursor-pointer'}
            ${selected ? 'text-[#0d0c0c]' : 'text-[#aaaaaa]'}
          `}
        >
          <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
          {loading
            ? <Loader2 size={13} className="text-[#12a6e0] flex-shrink-0 animate-spin" />
            : <ChevronDown size={13} className={`text-[#c5c5c5] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />}
        </button>

        {open && !isDisabled && createPortal(
          <div
            ref={dropdownRef}
            style={{ position: 'absolute', top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width, maxWidth: '500px' }}
            className="bg-white border border-[#cce8f6] rounded-[0.65rem] shadow-[0_8px_28px_rgba(18,166,224,0.2),0_4px_12px_rgba(0,0,0,0.15)] z-[99999]"
          >
            <div className="px-3 py-2 border-b border-[#eef6fb]">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-[#d8d8d8] bg-[#fafafa] focus-within:border-[#12a6e0] focus-within:shadow-[0_0_0_3px_rgba(18,166,224,0.10)] transition-all">
                <Search size={11} className="text-[#c5c5c5] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="flex-1 text-[12px] outline-none bg-transparent text-[#0d0c0c] placeholder-[#c5c5c5]"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-[#c5c5c5] hover:text-[#888] cursor-pointer">
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-[220px] overflow-y-auto">
              <div
                onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
                className={`px-4 py-2 text-[13px] cursor-pointer flex items-center justify-between gap-4 border-b border-[#eef6fb] ${!value ? 'bg-[rgba(18,166,224,0.05)]' : 'hover:bg-[#f2faff]'}`}
              >
                <span className="italic text-[#999999]">{placeholder}</span>
                {!value && <Check size={13} className="text-[#12a6e0] flex-shrink-0" />}
              </div>
              {filtered.map(o => (
                <div
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); setSearch(''); }}
                  className={`px-4 py-2 text-[13px] cursor-pointer flex items-center justify-between gap-4 border-b border-[#f5f9fc] transition-colors
                    ${String(value) === String(o.value) ? 'bg-[rgba(18,166,224,0.07)] text-[#0d8fc4] font-semibold' : 'text-[#1a1a1a] hover:bg-[#f2faff]'}`}
                >
                  <span className="flex-1 truncate">{o.label}</span>
                  {String(value) === String(o.value) && <Check size={13} className="text-[#12a6e0] flex-shrink-0" />}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-4 text-[13px] text-[#c5c5c5] text-center">Aucun résultat</div>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DATE INPUT
══════════════════════════════════════════════════════════════ */
function DateInputInline({ label, value, onChange, min, max }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-center gap-[6px] flex-1 min-w-0">
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#12a6e0] whitespace-nowrap flex-shrink-0">
        <CalendarDays size={11} />
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          py-[0.35rem] px-[0.65rem] rounded-[0.45rem] border bg-[#fafafa]
          text-[13px] outline-none cursor-pointer transition-all duration-150 [color-scheme:light]
          w-full min-w-0
          ${focused
            ? 'border-[#12a6e0] shadow-[0_0_0_3px_rgba(18,166,224,0.10)] bg-white'
            : 'border-[#d8d8d8] hover:border-[#12a6e0] hover:bg-white hover:shadow-[0_0_0_3px_rgba(18,166,224,0.10)]'}
        `}
        style={{ color: value ? '#0d0c0c' : '#aaaaaa' }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EN-TÊTE TRIABLE
══════════════════════════════════════════════════════════════ */
function Th({ label, colKey, sortKey, sortDir, onSort, align = 'left' }) {
  const active  = sortKey === colKey;
  const isRight = align === 'right';
  const SortIcon = () => {
    if (!colKey) return null;
    if (active) return sortDir === 'asc'
      ? <ArrowUp   size={12} className="text-[#12a6e0] shrink-0" />
      : <ArrowDown size={12} className="text-[#12a6e0] shrink-0" />;
    return <ArrowUpDown size={12} className="text-[#d0d0d0] shrink-0" />;
  };
  return (
    <th
      onClick={() => colKey && onSort(colKey)}
      className={`px-4 py-3 bg-[#f8f8f8] whitespace-nowrap ${colKey ? 'cursor-pointer select-none' : 'cursor-default'} ${isRight ? 'text-right' : 'text-left'}`}
    >
      <div className={`flex items-center gap-1.5 ${isRight ? 'justify-end' : 'justify-start'}`}>
        <span className={`text-[0.6875rem] font-semibold uppercase tracking-[0.06em] transition-colors ${active ? 'text-[#12a6e0]' : 'text-[#888888]'}`}>
          {label}
        </span>
        <SortIcon />
      </div>
    </th>
  );
}

/* ══════════════════════════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════════════════════════ */
function KpiCard({ label, value, sub, color, bgColor, borderColor, icon: Icon, iconBg }) {
  return (
    <div
      className="bg-white rounded-xl px-4 py-4 flex items-center gap-4"
      style={{ border: `1.5px solid ${borderColor}`, boxShadow: `0 2px 12px ${bgColor}` }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[#aaaaaa] text-[11px] font-medium m-0 mb-0.5 uppercase tracking-wide">{label}</p>
        <p className="m-0 text-[1.45rem] font-bold leading-tight tracking-tight" style={{ color }}>{value}</p>
        <p className="text-[#c5c5c5] text-[10px] mt-0.5 m-0">{sub}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function PageMovements() {
  const {
    currentFilters,
    setCurrentFilters,
    triggerDashboardReload,
    setHasFiltered,
  } = useDashboard();

  const { isMobile, isTablet } = useBreakpoint();

  /* ── États filtres ── */
  const [base,      setBase]      = useState(currentFilters.base      || '');
  const [dateDebut, setDateDebut] = useState(currentFilters.dateDebut || '');
  const [dateFin,   setDateFin]   = useState(currentFilters.dateFin   || '');
  const [depot,     setDepot]     = useState('');
  const [article,   setArticle]   = useState('');

  /* ── États données ── */
  const [mouvData,    setMouvData]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [exporting,   setExporting]   = useState(false);

  /* ── États options filtres ── */
  const [bases,          setBases]          = useState([]);
  const [articleOptions, setArticleOptions] = useState([]);
  const [depotOptions,   setDepotOptions]   = useState([]);
  const [loadingBases,   setLoadingBases]   = useState(true);
  const [loadingFiltres, setLoadingFiltres] = useState(false);

  /* ── Tri / pagination ── */
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 50;

  // const didInit = useRef(false);

  /* ── Chargement bases ── */
  useEffect(() => {
    fetchBases()
      .then(data => setBases(data.map(b => ({ value: b.BaseName, label: b.BaseLabel || b.BaseName }))))
      .catch(console.error)
      .finally(() => setLoadingBases(false));
  }, []);

  /* ── Sync filtres globaux → état local ── */
  const prevBase  = useRef(currentFilters.base);
  const prevDebut = useRef(currentFilters.dateDebut);
  const prevFin   = useRef(currentFilters.dateFin);
  useEffect(() => {
    if (
      currentFilters.base      !== prevBase.current  ||
      currentFilters.dateDebut !== prevDebut.current ||
      currentFilters.dateFin   !== prevFin.current
    ) {
      setBase(currentFilters.base      || '');
      setDateDebut(currentFilters.dateDebut || '');
      setDateFin(currentFilters.dateFin     || '');
      prevBase.current  = currentFilters.base;
      prevDebut.current = currentFilters.dateDebut;
      prevFin.current   = currentFilters.dateFin;
    }
  }, [currentFilters.base, currentFilters.dateDebut, currentFilters.dateFin]);

  /* ── Chargement filtres (articles / dépôts) ── */
  const loadFiltres = useCallback(async (selectedBase) => {
    if (!selectedBase) return;
    setLoadingFiltres(true);
    try {
      const data = await fetchFiltres(selectedBase, null, null);
      setArticleOptions((data.articles || []).map(a => ({ value: a.Code, label: `${a.Code} — ${a.Libelle}` })));
      setDepotOptions(  (data.depots   || []).map(d => ({ value: String(d.Code), label: d.Libelle })));
    } catch (e) { console.error(e); }
    finally { setLoadingFiltres(false); }
  }, []);

  useEffect(() => { if (base) loadFiltres(base); }, [base, loadFiltres]);

  /* ── Init auto ── */
  // useEffect(() => {
  //   if (didInit.current || !currentFilters.base) return;
  //   didInit.current = true;
  //   doLoadMouv({ base: currentFilters.base, dateDebut: currentFilters.dateDebut, dateFin: currentFilters.dateFin, depot: null, article: null });
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentFilters.base]);

  /* ── Chargement mouvements ── */
  const doLoadMouv = useCallback(async (params) => {
    setLoading(true); setError(null);
    try {
      const data = await fetchMouvements(params);
      setMouvData(data); setPage(1);
    } catch (e) { setError(e.message); setMouvData(null); }
    finally { setLoading(false); }
  }, []);

  /* ── Filtrer ── */
  const handleFilter = async () => {
    if (!base) return;
    setIsFiltering(true);

    setCurrentFilters(prev => ({ ...prev, base, dateDebut: dateDebut || null, dateFin: dateFin || null, article: null }));
    setHasFiltered(true);

    triggerDashboardReload({
      base,
      dateDebut: dateDebut || null,
      dateFin:   dateFin   || null,
      depot: null, article: null,
      fa_codefamille: currentFilters.fa_codefamille || null,
      cl_no1: currentFilters.cl_no1 || null,
      cl_no2: currentFilters.cl_no2 || null,
      cl_no3: currentFilters.cl_no3 || null,
      cl_no4: currentFilters.cl_no4 || null,
    });

    await doLoadMouv({ base, dateDebut: dateDebut || null, dateFin: dateFin || null, depot: depot || null, article: article || null });
    setIsFiltering(false);
  };

  /* ── Changement de base ── */
  const handleBaseChange = (val) => {
    setBase(val);
    setArticle(''); setDepot('');
    setArticleOptions([]); setDepotOptions([]);
    setMouvData(null);
    if (val) loadFiltres(val);
    setCurrentFilters(prev => ({ ...prev, base: val || null }));
  };

  /* ── Reset ── */
  const handleReset = () => {
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    setBase(currentFilters.base || '');
    setDateDebut(`${yyyy}-${mm}-01`);
    setDateFin(`${yyyy}-${mm}-${dd}`);
    setArticle(''); setDepot('');
    setMouvData(null); setError(null); setPage(1);
  };

  /* ── Export Excel ── */
  const handleExportExcel = async () => {
    if (!sorted.length) return;
    setExporting(true);
    try {
      await exportExcelMouvements(sorted, cols, dateDebut || null, dateFin || null);
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  /* ── Dérivés ── */
  const cols = useMemo(() => detectColumns(mouvData), [mouvData]);

  const sorted = useMemo(() => {
    if (!mouvData?.length || !sortKey || !sortDir) return mouvData || [];
    return [...mouvData].sort((a, b) => {
      const av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
      const na = Number(av), nb = Number(bv);
      if (!isNaN(na) && !isNaN(nb)) return sortDir === 'asc' ? na - nb : nb - na;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv), 'fr')
        : String(bv).localeCompare(String(av), 'fr');
    });
  }, [mouvData, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); setSortDir(null); }
    setPage(1);
  };

  // const kpis = useMemo(() => {
  //   if (!sorted.length || !cols.entrees) return null;
  //   let totalE = 0, totalS = 0;
  //   for (const r of sorted) {
  //     totalE += Number(r[cols.entrees] ?? 0);
  //     totalS += Number(r[cols.sorties] ?? 0);
  //   }
  //   const articles = new Set(sorted.map(r => r[cols.article]).filter(Boolean));
  //   const depots   = new Set(sorted.map(r => r[cols.nomDepot]).filter(Boolean));
  //   return { totalE, totalS, nbArticles: articles.size, nbDepots: depots.size };
  // }, [sorted, cols]);


  // tu change
  const kpis = useMemo(() => {
    if (!sorted.length || !cols.entrees) return null;

    let totalE = 0, totalS = 0;
    // Map pour garder la dernière ligne par article+dépôt
    const dernierParArticleDepot = new Map();

    for (const r of sorted) {
        totalE += Number(r[cols.entrees] ?? 0);
        totalS += Number(r[cols.sorties] ?? 0);

        // Clé unique article + dépôt
        const key = `${r[cols.article]}_${r[cols.nomDepot]}`;
        const dateActuelle = new Date(r[cols.date]);
        const existant = dernierParArticleDepot.get(key);

        if (!existant || dateActuelle >= new Date(existant[cols.date])) {
            dernierParArticleDepot.set(key, r);
        }
    }

    // Sommer les dernières valeurs par article/dépôt
    let totalStockFinal = 0, totalValeurPermanente = 0;
    for (const r of dernierParArticleDepot.values()) {
        totalStockFinal      += Number(r[cols.stockFinal] ?? 0);
        totalValeurPermanente += Number(r[cols.solde]     ?? 0);
    }

    const articles = new Set(sorted.map(r => r[cols.article]).filter(Boolean));
    const depots   = new Set(sorted.map(r => r[cols.nomDepot]).filter(Boolean));

    return { totalE, totalS, totalStockFinal, totalValeurPermanente, nbArticles: articles.size, nbDepots: depots.size };
}, [sorted, cols]);
  const gridCols = isMobile
    ? 'grid-cols-1'
    : isTablet
    ? 'grid-cols-2'
    : 'grid-cols-[repeat(auto-fill,minmax(240px,1fr))]';

  /* ══════════════════════════════════════════════════════════
     RENDU
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .animate-spin { animation: spin 1s linear infinite }
      `}</style>

      <div className="flex flex-col gap-3">

        {/* ══════════════════════════════════════════════════
            PANNEAU FILTRES
        ══════════════════════════════════════════════════ */}
        <div className="bg-white border border-[#e4e4e4] rounded-[1.1rem] shadow-[0_2px_12px_rgba(18,166,224,0.07),0_1px_3px_rgba(0,0,0,0.05)] overflow-visible animate-[fadeSlideIn_0.3s_ease_both]">

          {/* Header filtres */}
          <div className="flex flex-col gap-3 px-5 py-4 bg-gradient-to-r from-[#f8fcff] to-[#f0f9ff] border-b border-[#e8f4fb] rounded-[1.1rem] rounded-b-none sm:flex-row sm:items-center sm:flex-wrap">
            <div className="flex items-center gap-[0.55rem] flex-shrink-0">
              <div className="w-7 h-7 rounded-[0.55rem] bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow-md shadow-[rgba(18,166,224,0.30)]">
                <Eye size={13} className="text-white" />
              </div>
              <span className="text-[#0d0c0c] text-[13px] font-semibold tracking-wide">
                Filtres de recherche
              </span>
            </div>
            <div className="hidden sm:block w-px h-[22px] flex-shrink-0 bg-gradient-to-b from-transparent via-[#c8e8f8] to-transparent" />
            <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:flex-1 sm:gap-2">
              <DateInputInline label="Début" value={dateDebut} onChange={setDateDebut} max={dateFin || undefined} />
              <div className="hidden sm:block text-[#c5c5c5] text-xs flex-shrink-0">→</div>
              <DateInputInline label="Fin"   value={dateFin}   onChange={setDateFin}   min={dateDebut || undefined} />
            </div>
          </div>

          {/* Body filtres */}
          <div className="p-5">
            <div className={`grid ${gridCols} gap-4`}>
              <Select
                label="Base SAGE" icon={Database}
                value={base} onChange={handleBaseChange}
                options={bases} placeholder="Sélectionner une base"
                loading={loadingBases}
              />
              <Select
                label="Article" icon={Search}
                value={article} onChange={setArticle}
                options={articleOptions} placeholder="Tous les articles"
                disabled={!base} loading={loadingFiltres && !articleOptions.length}
              />
              <Select
                label="Dépôt" icon={Warehouse}
                value={depot} onChange={setDepot}
                options={depotOptions} placeholder="Tous les dépôts"
                disabled={!base} loading={loadingFiltres && !depotOptions.length}
              />
            </div>

            {/* Footer filtres */}
            <div className="flex flex-col gap-[0.65rem] mt-[1.1rem] pt-4 border-t border-[#f0f0f0] sm:flex-row sm:items-center">
              {/* Bouton Filtrer */}
              <button
                onClick={handleFilter}
                disabled={!base || isFiltering}
                className={`
                  flex items-center justify-center gap-[0.45rem] px-[1.35rem] py-[0.58rem] rounded-[0.55rem] text-sm font-semibold
                  transition-all duration-200
                  ${!base || isFiltering
                    ? 'bg-[#e8f6fd] text-[#92cfe8] cursor-not-allowed'
                    : 'bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] text-white shadow-md shadow-[rgba(18,166,224,0.35)] hover:shadow-lg cursor-pointer'}
                `}
              >
                {isFiltering ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                {isFiltering ? 'Chargement…' : 'Filtrer'}
              </button>

              {/* Bouton Reset */}
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-[0.45rem] px-[1.1rem] py-[0.58rem] rounded-[0.55rem] text-sm font-medium bg-[#f5f5f5] text-[#666666] border border-[#e0e0e0] cursor-pointer transition-all duration-200 hover:bg-[#ebebeb] hover:text-[#0d0c0c]"
              >
                <RefreshCw size={14} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ERREUR
        ══════════════════════════════════════════════════ */}
        {error && (
          <div className="bg-[rgba(229,57,53,0.06)] border border-[rgba(229,57,53,0.20)] rounded-xl px-5 py-4 text-[#c62828] text-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#e53935] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            AVERTISSEMENT (pas de base sélectionnée)
        ══════════════════════════════════════════════════ */}
        {!base && !loading && (
          <div className="bg-[rgba(18,166,224,0.04)] border border-[rgba(18,166,224,0.15)] rounded-xl px-5 py-4 text-[#0b7db0] text-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#12a6e0] shrink-0 animate-pulse" />
            <span>Sélectionnez une <strong>base SAGE</strong>, une <strong>période</strong> puis cliquez sur <strong>Filtrer</strong>.</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            KPIs
        ══════════════════════════════════════════════════ */}
        {kpis && !loading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* tu chnage */}
            <KpiCard
                label="Stock Final Total"
                value={fmtNum(kpis.totalStockFinal)}
                sub="unités en stock à la fin de la période"
                color="#c47a00" bgColor="rgba(224,138,0,0.06)" borderColor="rgba(224,138,0,0.18)" iconBg="rgba(224,138,0,0.08)"
                icon={Boxes}
            />
            {/* tu change */}
            <KpiCard
                label="Valeur Permanente"
                value={fmtNum(kpis.totalValeurPermanente)}
                sub="valeur stock permanent"
                color="#0b7db0" bgColor="rgba(18,166,224,0.06)" borderColor="rgba(18,166,224,0.18)" iconBg="rgba(18,166,224,0.08)"
                icon={TrendingUp}
            />
            <KpiCard
              label="Total Entrées"
              value={fmtNum(kpis.totalE)}
              sub="unités reçues sur la période"
              color="#01a82e" bgColor="rgba(1,168,46,0.06)" borderColor="rgba(1,168,46,0.18)" iconBg="rgba(1,168,46,0.08)"
              icon={PackageCheck}
            />
            <KpiCard
              label="Total Sorties"
              value={fmtNum(kpis.totalS)}
              sub="unités expédiées sur la période"
              color="#e53935" bgColor="rgba(229,57,53,0.06)" borderColor="rgba(229,57,53,0.18)" iconBg="rgba(229,57,53,0.08)"
              icon={PackageOpen}
            />
            <KpiCard
              label="Articles uniques"
              value={kpis.nbArticles}
              sub={`sur ${kpis.nbDepots} dépôt${kpis.nbDepots > 1 ? 's' : ''}`}
              color="#12a6e0" bgColor="rgba(18,166,224,0.06)" borderColor="rgba(18,166,224,0.18)" iconBg="rgba(18,166,224,0.08)"
              icon={Boxes}
            />
          </div>
        )}

        {/* MESSAGE GUIDE */}
        {!loading && mouvData === null && (
          <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f0f0f0]">
              <div className="w-2 h-2 rounded-full bg-[#01d63a]" />
              <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Mouvements</span>
              <span className="bg-[#f0f0f0] text-[#666666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">0 lignes</span>
            </div>
            {/* <div className="p-16 text-center"> */}
            <div className="min-h-[320px] flex flex-col items-center justify-center">
              <PackageX size={36} className="text-[#e0e0e0] mx-auto mb-3" />
              <p className="text-[#c5c5c5] text-sm">
                Définissez vos filtres et cliquez sur <strong className="text-[#888]">Filtrer</strong> pour voir les mouvements.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TABLEAU
        ══════════════════════════════════════════════════ */}
        {(loading || mouvData !== null) && (
          <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">

            {/* Header tableau */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#01d63a]" />
                <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Mouvements</span>
                {!loading && (
                  <span className="bg-[#f0f0f0] text-[#666666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
                    {sorted.length.toLocaleString('fr-FR')} lignes
                  </span>
                )}
              </div>

              {/* ✅ Bouton Exporter Excel */}
              {!loading && mouvData?.length > 0 && (
                <button
                  onClick={handleExportExcel}
                  disabled={exporting}
                  className={`
                    inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold
                    border transition-all duration-150 active:scale-[0.97]
                    ${exporting
                      ? 'bg-[#f0f0f0] text-[#aaaaaa] border-[#e0e0e0] cursor-not-allowed'
                      : 'bg-[#f0fdf4] text-[#15803d] border-[rgba(21,128,61,0.25)] cursor-pointer hover:bg-[#dcfce7] hover:shadow-[0_1px_6px_rgba(21,128,61,0.18)]'}
                  `}
                >
                  {exporting
                    ? <Loader2 size={13} className="animate-spin" />
                    : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M12 16l-5-5h3V4h4v7h3l-5 5z" fill="#15803d" />
                        <path d="M5 20h14" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )
                  }
                  {exporting ? 'Export…' : 'Exporter Excel'}
                </button>
              )}
            </div>

            {/* Skeleton loading */}
            {loading && (
              <div className="p-5 flex flex-col gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-10 bg-[#f8f8f8] rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
            )}

            {/* Vide */}
            {/* {!loading && sorted.length === 0 && (
              <div className="p-16 text-center">
                <PackageX size={36} className="text-[#e0e0e0] mx-auto mb-3" />
                <p className="text-[#c5c5c5] text-sm">Aucun mouvement pour ces filtres.</p>
              </div>
            )} */}
            {!loading && sorted.length === 0 && (
              // <div className="p-16 text-center">
              <div className="min-h-[320px] flex flex-col items-center justify-center">
                <PackageX size={36} className="text-[#e0e0e0] mx-auto mb-3" />
                <p className="text-[#c5c5c5] text-sm">Aucun mouvement pour ces filtres.</p>
              </div>
            )}

            {/* Tableau */}
            {!loading && sorted.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <colgroup>
                    <col style={{ minWidth: 95 }} />
                    <col style={{ minWidth: 100 }} />
                    <col style={{ minWidth: 180 }} />
                    <col style={{ minWidth: 130 }} />
                    <col style={{ minWidth: 85 }} />
                    <col style={{ minWidth: 95 }} />
                    <col style={{ minWidth: 85 }} />
                    <col style={{ minWidth: 95 }} />
                    <col style={{ minWidth: 110 }} />
                    <col style={{ minWidth: 120 }} />
                    <col style={{ minWidth: 100 }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-[#f0f0f0]">
                      <Th label="Date"            colKey={cols.date}       sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <Th label="Article"         colKey={cols.article}    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <Th label="Désignation" />
                      <Th label="Nom Dépôt" />
                      <Th label="Entrées"         colKey={cols.entrees}    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                      <Th label="Val Entrée"      colKey={cols.pruEntree}  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                      <Th label="Sorties"         colKey={cols.sorties}    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                      <Th label="Val Sortie"      colKey={cols.pruSortie}  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                      <Th label="Valeur Mvt"      colKey={cols.valeurMvt}  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                      <Th label="Solde Permanent" colKey={cols.solde}      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                      <Th label="Stock Final"     colKey={cols.stockFinal} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row, idx) => {
                      const e         = Number(row[cols.entrees]    ?? 0);
                      const pruE      = Number(row[cols.pruEntree]  ?? 0);
                      const s         = Number(row[cols.sorties]    ?? 0);
                      const pruS      = Number(row[cols.pruSortie]  ?? 0);
                      const valeurMvt = Number(row[cols.valeurMvt]  ?? 0);
                      const solde     = Number(row[cols.solde]      ?? 0);
                      const stockFin  = Number(row[cols.stockFinal] ?? 0);
                      const hasMvt    = e > 0 || s > 0;

                      return (
                        <tr
                          key={idx}
                          className={`border-b border-[#f8f8f8] transition-colors duration-100 ${hasMvt ? 'hover:bg-[rgba(18,166,224,0.03)]' : 'opacity-60 hover:bg-[#fafafa]'}`}
                        >
                          {/* Date */}
                          <td className="px-4 py-3 font-mono text-[0.75rem] text-[#888888] whitespace-nowrap">
                            {fmtDate(row[cols.date])}
                          </td>

                          {/* Article */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-block font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
                              {row[cols.article] ?? '—'}
                            </span>
                          </td>

                          {/* Désignation */}
                          <td className="px-4 py-3 text-[#444444] text-[0.75rem] whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]" title={row[cols.design]}>
                            {row[cols.design] ?? '—'}
                          </td>

                          {/* Nom Dépôt */}
                          <td className="px-4 py-3 text-[#555555] text-[0.75rem] whitespace-nowrap">
                            {row[cols.nomDepot] ?? '—'}
                          </td>

                          {/* Entrées qté */}
                          <td className="px-4 py-3 text-right">
                            {e > 0
                              ? <span className="inline-block text-[#01773d] font-semibold text-[0.8rem] bg-[rgba(1,168,46,0.07)] border border-[rgba(1,168,46,0.18)] rounded-md px-2 py-0.5">{fmtNum(e)}</span>
                              : <span className="text-[#e0e0e0] text-[0.75rem]">—</span>}
                          </td>

                          {/* Val Entrée */}
                          <td className="px-4 py-3 text-right">
                            {pruE > 0
                              ? <span className="inline-block text-[#01773d] font-semibold text-[0.8rem] bg-[rgba(1,168,46,0.07)] border border-[rgba(1,168,46,0.18)] rounded-md px-2 py-0.5">{fmtNum(pruE)}</span>
                              : <span className="text-[#e0e0e0] text-[0.75rem]">—</span>}
                          </td>

                          {/* Sorties qté */}
                          <td className="px-4 py-3 text-right">
                            {s > 0
                              ? <span className="inline-block text-[#b71c1c] font-semibold text-[0.8rem] bg-[rgba(229,57,53,0.07)] border border-[rgba(229,57,53,0.18)] rounded-md px-2 py-0.5">{fmtNum(s)}</span>
                              : <span className="text-[#e0e0e0] text-[0.75rem]">—</span>}
                          </td>

                          {/* Val Sortie */}
                          <td className="px-4 py-3 text-right">
                            {pruS > 0
                              ? <span className="inline-block text-[#b71c1c] font-semibold text-[0.8rem] bg-[rgba(229,57,53,0.07)] border border-[rgba(229,57,53,0.18)] rounded-md px-2 py-0.5">{fmtNum(pruS)}</span>
                              : <span className="text-[#e0e0e0] text-[0.75rem]">—</span>}
                          </td>

                          {/* Valeur Mvt */}
                          <td className="px-4 py-3 text-right">
                            {valeurMvt !== 0
                              ? <span
                                  className="inline-block text-[0.75rem] font-medium rounded-md px-2 py-0.5 border"
                                  style={valeurMvt > 0
                                    ? { color: '#4a4a4a', background: '#f7f7f7', borderColor: '#e4e4e4' }
                                    : { color: '#b71c1c', background: 'rgba(229,57,53,0.05)', borderColor: 'rgba(229,57,53,0.15)' }}
                                >{fmtNum(valeurMvt)}</span>
                              : <span className="text-[#e0e0e0] text-[0.75rem]">—</span>}
                          </td>

                          {/* Solde Permanent */}
                          <td className="px-4 py-3 text-right">
                            {cols.solde
                              ? <span
                                  className="inline-block font-semibold text-[0.8rem] rounded-md px-2 py-0.5 border"
                                  style={solde > 0
                                    ? { color: '#0b7db0', background: 'rgba(18,166,224,0.07)', borderColor: 'rgba(18,166,224,0.18)' }
                                    : solde < 0
                                    ? { color: '#b71c1c', background: 'rgba(229,57,53,0.07)', borderColor: 'rgba(229,57,53,0.18)' }
                                    : { color: '#c5c5c5', background: '#fafafa', borderColor: '#eeeeee' }}
                                >{fmtNum(solde)}</span>
                              : <span className="text-[0.7rem] italic text-[#cccccc]">—</span>}
                          </td>

                          {/* Stock Final */}
                          <td className="px-4 py-3 text-right">
                            {!cols.stockFinal
                              ? <span className="text-[0.7rem] italic text-[#cccccc]">—</span>
                              : stockFin > 0
                              ? <span className="inline-flex items-center gap-1 text-[#c47a00] font-semibold text-[0.8rem] bg-[rgba(224,138,0,0.08)] border border-[rgba(224,138,0,0.2)] rounded-md px-2 py-0.5">
                                  <TrendingUp size={11} />{fmtNum(stockFin)}
                                </span>
                              : stockFin < 0
                              ? <span className="inline-flex items-center gap-1 text-[#b71c1c] font-semibold text-[0.8rem] bg-[rgba(229,57,53,0.07)] border border-[rgba(229,57,53,0.18)] rounded-md px-2 py-0.5">
                                  <TrendingDown size={11} />{fmtNum(stockFin)}
                                </span>
                              : <span className="inline-flex items-center gap-1 text-[#c5c5c5] text-[0.75rem] bg-[#fafafa] border border-[#eeeeee] rounded-md px-2 py-0.5">
                                  <Minus size={10} />0
                                </span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f0]">
                <span className="text-[#c5c5c5] text-[0.75rem]">Page {page} / {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666666] border border-[#e0e0e0] transition-all hover:bg-[#eaeaea] hover:text-[#0d0c0c] disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    ← Préc.
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-[0.75rem] cursor-pointer transition-all ${page === p ? 'bg-[#12a6e0] text-white font-semibold border-0' : 'bg-[#f5f5f5] text-[#666666] border border-[#e0e0e0] hover:bg-[#eaeaea]'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666666] border border-[#e0e0e0] transition-all hover:bg-[#eaeaea] hover:text-[#0d0c0c] disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    Suiv. →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}