// ══════════════════════════════════════════════════════════════
//  routes/pipeline.js
//  Déclenche le pipeline ML Python quand une base est ajoutée
// ══════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const { spawn } = require('child_process');
const path    = require('path');
const fs      = require('fs');

// Chemin vers run_pipeline.py
const PIPELINE_SCRIPT = path.join(
  __dirname, '..', '..', '..', 'ml', 'pipeline', 'run_pipeline.py'
);

// Dossier output pour lire le statut
const OUTPUT_DIR = path.join(
  __dirname, '..', '..', '..', 'output'
);

// ── POST /api/pipeline/run ────────────────────────────────────
// Lance le pipeline pour une base donnée
// Body : { baseName: "PHARMA" }
router.post('/run', async (req, res) => {
  const { baseName } = req.body;

  if (!baseName) {
    return res.status(400).json({ error: 'baseName est requis' });
  }

  console.log(`🚀 Lancement pipeline pour : ${baseName}`);

  // Vérifier que le script existe
  if (!fs.existsSync(PIPELINE_SCRIPT)) {
    return res.status(500).json({
      error: `Script pipeline introuvable : ${PIPELINE_SCRIPT}`
    });
  }

  // Répondre immédiatement — le pipeline tourne en arrière-plan
  res.json({
    status  : 'started',
    baseName: baseName,
    message : `Pipeline démarré pour ${baseName}`
  });

  // Lancer le script Python en arrière-plan
  const python = spawn('python', [PIPELINE_SCRIPT, '--base', baseName], {
    cwd  : path.join(__dirname, '..', '..', '..', 'ml'),
    shell: true
  });

  python.stdout.on('data', (data) => {
    console.log(`[PIPELINE ${baseName}] ${data.toString().trim()}`);
  });

  python.stderr.on('data', (data) => {
    console.error(`[PIPELINE ${baseName} ERR] ${data.toString().trim()}`);
  });

  python.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ Pipeline ${baseName} terminé avec succès`);
    } else {
      console.error(`❌ Pipeline ${baseName} échoué (code ${code})`);
    }
  });
});

// ── GET /api/pipeline/status/:baseName ───────────────────────
// Retourne le statut du pipeline pour une base
router.get('/status/:baseName', (req, res) => {
  const { baseName } = req.params;

  const statusFile = path.join(OUTPUT_DIR, baseName, 'pipeline_status.json');

  if (!fs.existsSync(statusFile)) {
    return res.json({
      status  : 'not_started',
      baseName: baseName,
      message : 'Pipeline jamais exécuté pour cette base'
    });
  }

  try {
    const status = JSON.parse(fs.readFileSync(statusFile, 'utf-8'));
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: 'Impossible de lire le statut' });
  }
});

// ── GET /api/pipeline/results/:baseName ──────────────────────
// Retourne les résultats ML (CSV performances) pour une base
router.get('/results/:baseName', (req, res) => {
  const { baseName } = req.params;
  const perfDir = path.join(OUTPUT_DIR, baseName, 'performance');

  if (!fs.existsSync(perfDir)) {
    return res.status(404).json({
      error  : `Aucun résultat trouvé pour ${baseName}`,
      message: 'Le pipeline n\'a pas encore été exécuté pour cette base'
    });
  }

  try {
    const results = {};

    // Lire perf_prophet.csv
    const prophetFile = path.join(perfDir, 'perf_prophet.csv');
    if (fs.existsSync(prophetFile)) {
      results.prophet = parseCSV(fs.readFileSync(prophetFile, 'utf-8'));
    }

    // Lire perf_rf.csv
    const rfFile = path.join(perfDir, 'perf_rf.csv');
    if (fs.existsSync(rfFile)) {
      results.rf = parseCSV(fs.readFileSync(rfFile, 'utf-8'));
    }

    // Lire perf_iforest.csv
    const iforestFile = path.join(perfDir, 'perf_iforest.csv');
    if (fs.existsSync(iforestFile)) {
      results.iforest = parseCSV(fs.readFileSync(iforestFile, 'utf-8'));
    }

    // Lire kmeans_tableau_clusters.csv
    const kmeansFile = path.join(perfDir, 'kmeans_tableau_clusters.csv');
    if (fs.existsSync(kmeansFile)) {
      results.kmeans = parseCSV(fs.readFileSync(kmeansFile, 'utf-8'));
    }

    // Lire kmeans_articles_segments.csv
    const segmentsFile = path.join(perfDir, 'kmeans_articles_segments.csv');
    if (fs.existsSync(segmentsFile)) {
      results.segments = parseCSV(fs.readFileSync(segmentsFile, 'utf-8'));
    }

    // Lire rf_feature_importance.csv
    const importanceFile = path.join(perfDir, 'rf_feature_importance.csv');
    if (fs.existsSync(importanceFile)) {
      results.rf_importance = parseCSV(fs.readFileSync(importanceFile, 'utf-8'));
    }

    res.json({ baseName, results });

  } catch (e) {
    res.status(500).json({ error: `Erreur lecture résultats : ${e.message}` });
  }
});

// ── Helper : parser CSV simple ────────────────────────────────
function parseCSV(content) {
  const lines  = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj    = {};
    headers.forEach((h, i) => {
      const val = values[i]?.trim();
      // Convertir en nombre si possible
      obj[h] = isNaN(val) || val === '' ? val : Number(val);
    });
    return obj;
  });
}
// ── GET /api/pipeline/forecast/:baseName/:arRef ──────────────
// Génère les prédictions pour un article via le modèle pkl
router.get('/forecast/:baseName/:arRef', (req, res) => {
  const { baseName, arRef } = req.params;
  const horizon = parseInt(req.query.horizon) || 30;

  const forecastScript = path.join(
    __dirname, '..', '..', '..', 'ml', 'pipeline', 'forecast.py'
  );

  if (!fs.existsSync(forecastScript)) {
    return res.status(500).json({ error: 'Script forecast.py introuvable' });
  }

  const python = spawn('python', [
    forecastScript,
    '--base',    baseName,
    '--article', arRef,
    '--horizon', horizon
  ], {
    cwd  : path.join(__dirname, '..', '..', '..', 'ml'),
    shell: true,
    env  : { ...process.env, PYTHONIOENCODING: 'utf-8' }
  });

  let output = '';
  let errOut = '';

  python.stdout.on('data', d => { output += d.toString(); });
  python.stderr.on('data', d => { errOut += d.toString(); });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error(`[forecast] Erreur ${baseName}/${arRef}:`, errOut);
      return res.status(500).json({ error: errOut || 'Erreur script forecast' });
    }
    try {
      const result = JSON.parse(output.trim());
      if (result.error) return res.status(404).json(result);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: `JSON invalide : ${output}` });
    }
  });
});

module.exports = router;