import React, { createContext, useContext, useState, useCallback } from 'react';

function getDefaultDates() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return {
    dateDebut: `${yyyy}-${mm}-01`,
    dateFin:   `${yyyy}-${mm}-${dd}`,
  };
}

const { dateDebut: defaultDebut, dateFin: defaultFin } = getDefaultDates();

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [tableData,    setTableData]   = useState(null);
  const [hasFiltered,  setHasFiltered] = useState(false);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState(null);

  // Filtres partagés base + dates — lus ET écrits depuis Dashboard ET Mouvements
  const [currentFilters, setCurrentFilters] = useState({
    base:           'BIJOU',
    dateDebut:      defaultDebut,
    dateFin:        defaultFin,
    depot:          null,
    article:        null,
    fa_codefamille: null,
    cl_no1:         null,
    cl_no2:         null,
    cl_no3:         null,
    cl_no4:         null,
  });

  // Callback partagé pour recharger le dashboard — sera injecté par Dashboard
  const [reloadDashboardFn, setReloadDashboardFn] = useState(null);

  const registerReloadDashboard = useCallback((fn) => {
    setReloadDashboardFn(() => fn);
  }, []);

  const triggerDashboardReload = useCallback((params) => {
    if (reloadDashboardFn) reloadDashboardFn(params);
  }, [reloadDashboardFn]);

  return (
    <DashboardContext.Provider value={{
      tableData, setTableData,
      hasFiltered, setHasFiltered,
      loading, setLoading,
      error, setError,
      currentFilters, setCurrentFilters,
      registerReloadDashboard,
      triggerDashboardReload,
      defaultDebut, defaultFin,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider');
  return ctx;
}