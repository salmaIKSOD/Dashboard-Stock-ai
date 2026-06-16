const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Utilitaire fetch ──────────────────────────────────────────
async function apiFetch(endpoint) {
  const url = BASE_URL.startsWith('http')
    ? `${BASE_URL}${endpoint}`
    : `${window.location.origin}${BASE_URL}${endpoint}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
  return res.json();
}

// ── Statut du pipeline pour une base ─────────────────────────
export async function fetchPipelineStatus(baseName) {
  return apiFetch(`/pipeline/status/${baseName}`);
}

// ── Résultats ML complets pour une base ──────────────────────
// Retourne : { prophet, rf, iforest, kmeans, segments, rf_importance }
export async function fetchPredictionResults(baseName) {
  return apiFetch(`/pipeline/results/${baseName}`);
}

// ── Lancer le pipeline pour une base ─────────────────────────
export async function runPipeline(baseName) {
  const url = `${BASE_URL}/pipeline/run`;
  const res = await fetch(url, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ baseName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
  return res.json();
}