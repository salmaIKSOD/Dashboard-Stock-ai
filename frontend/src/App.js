import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SidebarP from './components/SidebarP';
import SidebarG from './components/SidebarG';
import HeaderG from './components/HeaderG';
import Filters from './components/Filters';
import StockTable from './components/StockTable';
import { fetchStock } from './api/stockApi';
import InnerSidebar from './components/InnerSidebar';

import { DashboardProvider, useDashboard } from './context/DashboardContext';

// Pages principales
import PageStockJournalier from './pages/PageStockJournalier';
import PageMovements from './pages/PageMovements';
import PageArticles from './pages/PageArticles';
import PageDepots from './pages/PageDepots';
import PageAnalyses from './pages/PageAnalyses';
import PageAlertes from './pages/PageAlertes';
import PageRapports from './pages/PageRapports';
import PageParametres from './pages/PageParametres';

// Pages inner dashboard
import PageCharts from './page/PageCharts';
import PageTrends from './page/PageTrends';
import PageDashboardReports from './page/PageDashboardReports';
import PageFavorites from './page/PageFavorites';
import AIPrevisions from './pages/AIPrevisions';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Page Administration
import GestionBases from './pages/GestionBases';
import GestionComptes from './pages/GestionComptes';
import PageProfil from './pages/PageProfil';

// ─────────────────────────────────────────────────────────────
const SIDEBAR_WIDTH = 240;
const INNER_WIDTH   = 56;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

// ── Sparkline ─────────────────────────────────────────────────
function Sparkline({ data = [], color = '#12a6e0' }) {
  const W = 96, H = 36;
  const pts = data.length >= 2 ? data : [2, 5, 3, 8, 6, 9, 7, 11, 9, 13, 10, 12, 14, 13];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const range = max - min || 1;
  const coords = pts.map((v, i) => ({
    x: (i / (pts.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 5) - 2,
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x},${c.y}`).join(' ');
  const last = coords[coords.length - 1];
  const first = coords[0];
  const fillPath = `${linePath} L ${last.x},${H} L ${first.x},${H} Z`;
  const gradId = `sg-a-${color.replace('#', '')}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradId})`} />
      <path d={linePath} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="5"   fill={color} opacity="0.18" />
      <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
    </svg>
  );
}

// ── Icônes KPI ────────────────────────────────────────────────
function IconStock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function IconEntrees() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}
function IconSorties() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────
const fmtNum = (n) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n || 0);

function useBreakpoint() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return {
    isMobile:  width < 640,
    isTablet:  width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ title, value, unit, bottomContent, icon, iconBg, iconColor, valueColor, sparkColor, sparkData }) {
  return (
    <div
      className="bg-white rounded-2xl px-6 py-5 flex flex-col flex-1 min-w-0"
      style={{
        border:     `1.5px solid ${iconBg.replace('0.10', '0.18')}`,
        boxShadow:  `0 2px 12px ${iconBg.replace('0.10', '0.06')}`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#888888] text-[0.8125rem] font-medium mb-[0.3rem] mt-0">{title}</p>
          <p className="text-[1.75rem] font-bold leading-none tracking-[-0.02em] m-0" style={{ color: valueColor }}>
            {fmtNum(value)}
          </p>
          <p className="text-[#bbbbbb] text-xs mt-[0.2rem] mb-0">{unit}</p>
        </div>
        <div className="pt-2 shrink-0">
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      </div>
      <div className="border-t border-[#f5f5f5] mt-[0.875rem] pt-[0.625rem]">
        {bottomContent}
      </div>
    </div>
  );
}

// ── KPI Grid ──────────────────────────────────────────────────
function KpiGrid({ children }) {
  const { isMobile, isTablet } = useBreakpoint();
  const items = React.Children.toArray(children);
  if (isMobile) return <div className="grid grid-cols-1 gap-4">{children}</div>;
  if (isTablet) return (
    <div className="grid grid-cols-2 gap-4">
      {items[0]}{items[1]}
      <div className="col-span-2 flex justify-center">
        <div className="w-[calc(50%-0.5rem)]">{items[2]}</div>
      </div>
    </div>
  );
  return <div className="grid grid-cols-3 gap-4">{children}</div>;
}

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard({ sidebarOpen }) {
  const {
    tableData, setTableData,
    hasFiltered, setHasFiltered,
    loading, setLoading,
    error, setError,
    currentFilters, setCurrentFilters,
    defaultDebut, defaultFin,
    registerReloadDashboard,
  } = useDashboard();

  const loadData = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStock(params);
      setTableData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setTableData(null);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setTableData]);

  useEffect(() => {
    registerReloadDashboard(loadData);
  }, [registerReloadDashboard, loadData]);

  const handleFilter = async (params) => {
    if (!params) {
      const d = {
        base: 'BIJOU',
        dateDebut: defaultDebut,
        dateFin:   defaultFin,
        depot: null, article: null,
        cl_no1: null, cl_no2: null, cl_no3: null, cl_no4: null,
        fa_codefamille: null,
      };
      setCurrentFilters(d);
      setHasFiltered(false);
      setTableData(null);
      return;
    }
    setHasFiltered(true);
    setCurrentFilters(params);
    await loadData(params);
  };


  const kpis = useMemo(() => {
    if (!tableData || tableData.length === 0) return null;
 
    const keys = Object.keys(tableData[0]);
    const find = (...variants) =>
      keys.find(k =>
        variants.some(v =>
          k.toLowerCase().replace(/[\s_()]/g, '') === v.toLowerCase().replace(/[\s_()]/g, '')
        )
      ) || null;
 
    const kDate       = find('Date', 'DateJour', 'datejour');
    const kArticle    = find('Article', 'AR_Ref', 'arref');
    const kDepot      = find('Depot', 'DE_No', 'depot');
    const kEntrees    = find('TotalEntrees', 'Total Entrees', 'TotalEntree', 'totalentree');
    const kSorties    = find('TotalSorties', 'Total Sorties', 'TotalSortie', 'totalsortie');
    const kStockFinal = find('StockFinal', 'Stock Final', 'stockfinal');
    const kSolde      = find('ValeurFinalePermanente', 'Valeur Finale (Permanente)', 'ValeurFinale', 'valeurfinale', 'Solde');
 
    // ─────────────────────────────────────────────────────────
    //  CORRECTION : dernier stock connu par (article, dépôt)
    //  → les articles sans mouvement le dernier jour sont quand
    //    même inclus via leur dernière valeur disponible
    // ─────────────────────────────────────────────────────────
    const lastStockMap  = {}; // "artCode|||depotKey" → { stockFinal, date, valeur }
    const lastValeurMap = {}; // "artCode|||depotKey" → { valeur, date }
 
    const entreesParJour = {};
    const sortiesParJour = {};
    let totalEntrees = 0;
    let totalSorties = 0;
 
    for (const r of tableData) {
      const rawDate = r[kDate];
      if (!rawDate) continue;
 
      const d = typeof rawDate === 'string'
        ? rawDate.slice(0, 10)
        : new Date(rawDate).toISOString().slice(0, 10);
 
      const rowDate  = new Date(d);
      const artCode  = String(r[kArticle] ?? '(sans code)');
      const depotKey = String(r[kDepot]   ?? '(sans dépôt)');
      const key      = `${artCode}|||${depotKey}`;
 
      const e  = Number(r[kEntrees]    ?? 0);
      const s  = Number(r[kSorties]    ?? 0);
      const sf = Number(r[kStockFinal] ?? 0);
      const v  = Number(r[kSolde]      ?? 0);
 
      totalEntrees += e;
      totalSorties += s;
 
      if (e > 0) entreesParJour[d] = (entreesParJour[d] || 0) + e;
      if (s > 0) sortiesParJour[d] = (sortiesParJour[d] || 0) + s;
 
      // ✅ Garder le DERNIER stock final connu par (article, dépôt)
      if (
        r[kStockFinal] !== null &&
        r[kStockFinal] !== undefined &&
        (!lastStockMap[key] || rowDate >= lastStockMap[key].date)
      ) {
        lastStockMap[key] = { stockFinal: sf, date: rowDate };
      }
 
      // ✅ Garder la DERNIÈRE valeur permanente connue par (article, dépôt)
      if (
        r[kSolde] !== null &&
        r[kSolde] !== undefined &&
        (!lastValeurMap[key] || rowDate >= lastValeurMap[key].date)
      ) {
        lastValeurMap[key] = { valeur: v, date: rowDate };
      }
    }
 
    // ✅ Stock total = somme des derniers stocks de chaque (article, dépôt)
    const stockFinalTotal = Object.values(lastStockMap)
      .reduce((sum, e) => sum + e.stockFinal, 0);
 
    // ✅ Valeur permanente totale = somme des dernières valeurs de chaque (article, dépôt)
    const valeurPermanenteTotal = Object.values(lastValeurMap)
      .reduce((sum, e) => sum + e.valeur, 0);
 
    // Date la plus récente trouvée dans les données
    const allDates = Object.values(lastStockMap).map(e => e.date);
    const maxDate  = allDates.length > 0
      ? new Date(Math.max(...allDates.map(d => d.getTime())))
      : null;
 
    // Pic d'entrée / sortie
    let picEntreeDate = '', picEntreeVal = 0;
    let picSortieDate = '', picSortieVal = 0;
 
    for (const [d, e] of Object.entries(entreesParJour)) {
      if (e > picEntreeVal) { picEntreeVal = e; picEntreeDate = d; }
    }
    for (const [d, s] of Object.entries(sortiesParJour)) {
      if (s > picSortieVal) { picSortieVal = s; picSortieDate = d; }
    }
 
    const fmtISO = (iso) => {
      if (!iso) return '';
      const [y, m, dd] = iso.split('-');
      return `${dd}/${m}/${y}`;
    };
 
    const fmtDate = (d) => {
      if (!d) return '';
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
 
    // Sparklines : basées sur les entrées/sorties journalières
    const sortedDates = Object.keys({
      ...entreesParJour,
      ...sortiesParJour,
    }).sort();
 
    // Pour le sparkline stock : reconstituer une série journalière
    // en prenant la somme des stocks de toutes les lignes de ce jour
    const stockParJourSpark = {};
    for (const r of tableData) {
      const rawDate = r[kDate];
      if (!rawDate) continue;
      const d  = typeof rawDate === 'string' ? rawDate.slice(0, 10) : new Date(rawDate).toISOString().slice(0, 10);
      const sf = Number(r[kStockFinal] ?? 0);
      stockParJourSpark[d] = (stockParJourSpark[d] || 0) + sf;
    }
    const allSortedDates = Object.keys(stockParJourSpark).sort();
 
    return {
      // ✅ Stock et valeur corrects
      stockFinalDernierJour:       stockFinalTotal,
      valeurPermanenteDernierJour: valeurPermanenteTotal,
      dateFinalLabel:              fmtDate(maxDate),
 
      totalEntrees,
      totalSorties,
 
      picEntreeJour:    [fmtISO(picEntreeDate), picEntreeVal],
      picSortieJour:    [fmtISO(picSortieDate), picSortieVal],
      joursAvecEntrees: Object.keys(entreesParJour).length,
      joursAvecSorties: Object.keys(sortiesParJour).length,
 
      sparkStock:   allSortedDates.slice(-60).map(d => stockParJourSpark[d]  || 0),
      sparkEntrees: allSortedDates.slice(-60).map(d => entreesParJour[d]     || 0),
      sparkSorties: allSortedDates.slice(-60).map(d => sortiesParJour[d]     || 0),
    };
  }, [tableData]);

  return (
    <>
      <Filters
        onFilter={handleFilter}
        initialBase={currentFilters.base}
        initialDateDebut={currentFilters.dateDebut}
        initialDateFin={currentFilters.dateFin}
        initialDepot={currentFilters.depot || ''}
        initialFamille={currentFilters.fa_codefamille || ''}
        initialCat1={currentFilters.cl_no1 || ''}
      />

      {error && (
        <div className="bg-[rgba(229,57,53,0.06)] border border-[rgba(229,57,53,0.20)] rounded-xl px-5 py-4 text-[#c62828] text-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#e53935] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {kpis && !loading && (
        <KpiGrid>
          <KpiCard
            title="Stock total" value={kpis.stockFinalDernierJour} unit="Unités"
            icon={<IconStock />} iconBg="rgba(18,166,224,0.10)" iconColor="#12a6e0"
            valueColor="#12a6e0" sparkColor="#12a6e0" sparkData={kpis.sparkStock}
            bottomContent={
              <p className="m-0 text-[#aaaaaa] text-xs">
                Valeur permanente au{' '}
                <span className="text-[#555555] font-semibold">{kpis.dateFinalLabel}</span>
                {' : '}
                <span className="text-[#12a6e0] font-semibold">{fmtNum(kpis.valeurPermanenteDernierJour)} MAD</span>
              </p>
            }
          />
          <KpiCard
            title="Entrées totales" value={kpis.totalEntrees} unit="Unités sur la période"
            icon={<IconEntrees />} iconBg="rgba(1,168,46,0.10)" iconColor="#01a82e"
            valueColor="#01a82e" sparkColor="#01a82e" sparkData={kpis.sparkEntrees}
            bottomContent={
              <p className="m-0 text-[#aaaaaa] text-xs">
                {kpis.joursAvecEntrees > 0 ? (
                  <>Pic le <span className="text-[#555555] font-semibold">{kpis.picEntreeJour[0]}</span>{' : '}
                  <span className="text-[#01a82e] font-semibold">{fmtNum(kpis.picEntreeJour[1])} unités</span>
                  {' · '}<span className="text-[#aaaaaa]">{kpis.joursAvecEntrees} jour{kpis.joursAvecEntrees > 1 ? 's' : ''} actif{kpis.joursAvecEntrees > 1 ? 's' : ''}</span></>
                ) : <span>Aucune entrée sur la période</span>}
              </p>
            }
          />
          <KpiCard
            title="Sorties totales" value={kpis.totalSorties} unit="Unités sur la période"
            icon={<IconSorties />} iconBg="rgba(229,57,53,0.10)" iconColor="#e53935"
            valueColor="#e53935" sparkColor="#e53935" sparkData={kpis.sparkSorties}
            bottomContent={
              <p className="m-0 text-[#aaaaaa] text-xs">
                {kpis.joursAvecSorties > 0 ? (
                  <>Pic le <span className="text-[#555555] font-semibold">{kpis.picSortieJour[0]}</span>{' : '}
                  <span className="text-[#e53935] font-semibold">{fmtNum(kpis.picSortieJour[1])} unités</span>
                  {' · '}<span className="text-[#aaaaaa]">{kpis.joursAvecSorties} jour{kpis.joursAvecSorties > 1 ? 's' : ''} actif{kpis.joursAvecSorties > 1 ? 's' : ''}</span></>
                ) : <span>Aucune sortie sur la période</span>}
              </p>
            }
          />
        </KpiGrid>
      )}

      {/* {(loading || tableData !== null) && <StockTable data={tableData} loading={loading} dateDebut={filters.dateDebut} dateFin={filters.dateFin}  />} */}
      {(loading || tableData !== null) && <StockTable data={tableData} loading={loading} dateDebut={currentFilters.dateDebut} dateFin={currentFilters.dateFin} />}

      {!loading && tableData !== null && tableData.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p className="text-[#888888] text-sm font-medium m-0">
            Aucune donnée pour cette période ou ces filtres.
          </p>
        </div>
      )}
    </>
  );
}

// ── Shell dashboard (Sidebar + SidebarP + InnerSidebar) ───────
function DashboardShell({ sidebarOpen, children }) {
  return (
    <>
      <InnerSidebar sidebarOpen={sidebarOpen} />
      {children}
    </>
  );
}

// ── Shell administration (SidebarG + HeaderG) ─────────────────
function AdminShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const marginLeft = sidebarOpen && window.innerWidth >= 1024 ? SIDEBAR_WIDTH : 0;

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <SidebarG open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-[rgba(13,12,12,0.35)] z-20"
        />
      )}

      <ScrollToTop />

      <HeaderG
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main
        className="flex flex-col gap-5 px-5 pb-5 pt-1 transition-[margin-left] duration-300 ease-in-out min-h-[calc(100vh-53px)]"
        style={{ marginLeft, marginTop: '28px' }}
      >
        {children}
      </main>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  const isAuthPage  = location.pathname === '/login' || location.pathname === '/signup';
  const isAdminPage = location.pathname.startsWith('/gestion-bases') ||
                      location.pathname.startsWith('/profil') ||
                      location.pathname.startsWith('/gestion-comptes');

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const isDashboard = location.pathname === '/' || location.pathname.startsWith('/dashboard');

  const mainMarginLeft =
    (sidebarOpen && window.innerWidth >= 1024 ? SIDEBAR_WIDTH : 0) +
    (isDashboard ? INNER_WIDTH : 0);

  // Les pages admin ont leur propre layout complet (AdminShell)
  // donc on les rend directement sans le shell principal
  if (isAdminPage) {
    return (
      <DashboardProvider>
        <Routes>
          <Route path="/gestion-bases" element={
            <AdminShell><GestionBases /></AdminShell>
          } />
          <Route path="/profil" element={
            <AdminShell>
              <PageProfil/>
            </AdminShell>
          } />

          {/* ← ajouter */}
          <Route path="/gestion-comptes" element={
            <AdminShell>
              <GestionComptes />  {/* ou ton composant */}
            </AdminShell>
          } />

        </Routes>
      </DashboardProvider>
    );
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#f4f5f7]">

        {!isAuthPage && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        {!isAuthPage && sidebarOpen && window.innerWidth < 1024 && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-[rgba(13,12,12,0.35)] z-20"
          />
        )}

        <ScrollToTop />

        {!isAuthPage && (
          <SidebarP
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(o => !o)}
          />
        )}

        <main
          className="flex flex-col gap-5 px-5 pb-5 pt-1 transition-[margin-left] duration-300 ease-in-out min-h-[calc(100vh-53px)]"
          style={{
            marginLeft: !isAuthPage ? mainMarginLeft : 0,
            marginTop:  !isAuthPage ? '28px' : '0',
          }}
        >
          <Routes>
            {/* ── Dashboard + inner tabs ── */}
            <Route path="/" element={
              <DashboardShell sidebarOpen={sidebarOpen}>
                <Dashboard sidebarOpen={sidebarOpen} />
              </DashboardShell>
            } />
            <Route path="/dashboard" element={
              <DashboardShell sidebarOpen={sidebarOpen}>
                <Dashboard sidebarOpen={sidebarOpen} />
              </DashboardShell>
            } />
            <Route path="/dashboard/charts" element={
              <DashboardShell sidebarOpen={sidebarOpen}>
                <PageCharts />
              </DashboardShell>
            } />
            <Route path="/dashboard/trends" element={
              <DashboardShell sidebarOpen={sidebarOpen}>
                <PageTrends />
              </DashboardShell>
            } />
            <Route path="/dashboard/reports" element={
              <DashboardShell sidebarOpen={sidebarOpen}>
                <PageDashboardReports />
              </DashboardShell>
            } />
            <Route path="/dashboard/favorites" element={
              <DashboardShell sidebarOpen={sidebarOpen}>
                <PageFavorites />
              </DashboardShell>
            } />

            {/* ── Auth ── */}
            <Route path="/login"  element={<LoginPage  />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* ── Pages principales ── */}
            <Route path="/stock-journalier" element={<PageStockJournalier />} />
            <Route path="/mouvements"       element={<PageMovements />}       />
            <Route path="/articles"         element={<PageArticles />}        />
            <Route path="/depots"           element={<PageDepots />}          />
            <Route path="/analyses"         element={<PageAnalyses />}        />
            <Route path="/alertes"          element={<PageAlertes />}         />
            <Route path="/previsions"       element={<AIPrevisions />}        />
            <Route path="/rapports"         element={<PageRapports />}        />
            <Route path="/parametres"       element={<PageParametres />}      />
          </Routes>
        </main>
      </div>
    </DashboardProvider>
  );
}