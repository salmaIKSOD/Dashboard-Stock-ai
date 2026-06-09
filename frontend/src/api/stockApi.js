const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Utilitaire fetch 
// async function apiFetch(endpoint, params = {}) {
//   const url = new URL(`${BASE_URL}${endpoint}`);
//   Object.entries(params).forEach(([k, v]) => {
//     if (v !== null && v !== undefined && v !== '') {
//       url.searchParams.append(k, v);
//     }
//   });
//   const res = await fetch(url.toString());
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({ error: res.statusText }));
//     throw new Error(err.error || 'Erreur serveur');
//   }
//   return res.json();
// }
async function apiFetch(endpoint, params = {}) {
  // Construire l'URL correctement selon si BASE_URL est relatif ou absolu
  let url;
  if (BASE_URL.startsWith('http')) {
    url = new URL(`${BASE_URL}${endpoint}`);
  } else {
    url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
  }
  
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') {
      url.searchParams.append(k, v);
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
  return res.json();
}
// ── Bases SAGE actives 
export async function fetchBases() {
  return apiFetch('/bases');
}

// ── Filtres (articles, dépôts, catalogues) 
export async function fetchFiltres(base, cl_no1 = null, fa_codefamille = null) {
  return apiFetch('/filtres', { base, cl_no1, fa_codefamille });
}

// ── Mouvements journaliers
export async function fetchMouvements(params) {
  return apiFetch('/mouvements', params);
}

// ── Stock journalier (avec jours sans mouvement)
export async function fetchStock(params) {
  return apiFetch('/stock', params);
}

