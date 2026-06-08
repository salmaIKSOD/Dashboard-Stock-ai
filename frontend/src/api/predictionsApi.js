// frontend/src/api/predictionsApi.js
// ─────────────────────────────────────────────────────────────
//  Toutes les requêtes vers Express /api/predictions
//  qui relaie vers le service FastAPI Python (port 8000)
// ─────────────────────────────────────────────────────────────

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper général
async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}/predictions${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Erreur ${res.status}`);
  }
  return res.json();
}

// ── Santé du service ML ───────────────────────────────────────
export async function checkMLHealth() {
  return apiFetch("/health");
}

// ── Liste des bases actives ───────────────────────────────────
export async function getBases() {
  return apiFetch("/bases");
}

// ── Articles modélisables pour une base ──────────────────────
export async function getArticles(baseName) {
  return apiFetch(`/articles/${encodeURIComponent(baseName)}`);
}

// ── Modèles déjà entraînés pour une base ─────────────────────
export async function getTrainedModels(baseName) {
  return apiFetch(`/models/${encodeURIComponent(baseName)}`);
}

// ── Prévision pour un article / dépôt ────────────────────────
// horizon : 7 | 30 | 60 | 90
export async function getPrediction(baseName, arRef, deNo, horizon = 30) {
  return apiFetch(
    `/predict?base=${encodeURIComponent(baseName)}&article=${encodeURIComponent(arRef)}&depot=${deNo}&horizon=${horizon}`
  );
}

// ── Lancer l'entraînement pour une base (POST) ────────────────
export async function trainBase(baseName) {
  const res = await fetch(
    `${BASE_URL}/predictions/train/${encodeURIComponent(baseName)}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(`Erreur entraînement ${res.status}`);
  return res.json();
}

// ── Lancer l'entraînement de toutes les bases ─────────────────
export async function trainAll() {
  const res = await fetch(`${BASE_URL}/predictions/train-all`, { method: "POST" });
  if (!res.ok) throw new Error(`Erreur entraînement global ${res.status}`);
  return res.json();
}