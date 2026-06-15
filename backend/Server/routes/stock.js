const express = require('express');
const router  = express.Router();
const { getPool, sql } = require('../../db');

// ── Cache mémoire (TTL différencié par endpoint) ──────────────
const cache = new Map();
const TTL = {
  bases:    30 * 60 * 1000,
  filtres:  30 * 60 * 1000,
  mouvements: 2 * 60 * 1000,
};

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  const ttl = TTL[key.split(':')[0]] || 5 * 60 * 1000;
  if (Date.now() - entry.ts > ttl) { cache.delete(key); return null; }
  return entry.data;
}
function setCached(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// ── Préchargement au démarrage ────────────────────────────────
async function warmupCache() {
  try {
    const pool = await getPool();

    // ✅ Vérifie si le cache SQL est périmé (> 8h) et le rafraîchit si besoin
    const refreshResult = await pool.request()
      .input('HeuresMax', sql.Int, 8)
      .execute('stock.SP_RefreshSiNecessaire');

    const statut = refreshResult.recordset[0]?.Statut;
    if (statut === 'REFRESHED') {
      console.log('[warmup] Cache SQL rafraîchi automatiquement');
    } else {
      const age = refreshResult.recordset[0]?.AgeMinutes;
      console.log(`[warmup] Cache SQL OK — âge: ${age} min`);
    }

    // Charger les bases en mémoire Node
    const bases = await pool.request().execute('stock.SP_GetBases');
    setCached('bases', bases.recordset);
    console.log(`[warmup] bases chargées (${bases.recordset.length})`);

    for (const b of bases.recordset) {
      const cacheKey = `filtres:${b.BaseName}:null:null`;
      const req = pool.request();
      req.input('Base',           sql.NVarChar(128), b.BaseName);
      req.input('CL_No1',         sql.Int,           null);
      req.input('FA_CodeFamille', sql.NVarChar(10),  null);
      const result = await req.execute('stock.SP_GetFiltres');
      const [articles, depots, familles, cat1, cat2, cat3, cat4] = result.recordsets;
      setCached(cacheKey, { articles, depots, familles, cat1, cat2, cat3, cat4 });
      console.log(`[warmup] filtres ${b.BaseName} préchargés`);
    }
  } catch (err) {
    console.warn('[warmup] échec (non bloquant):', err.message);
  }
}

// 
function splitPeriod(dateDebut, dateFin, monthsPerChunk = 3) {
  const chunks  = [];
  let   current = new Date(dateDebut);
  const end     = new Date(dateFin);
  const fmt     = d => d.toISOString().split('T')[0];

  while (current <= end) {
    const chunkStart = new Date(current);
    const chunkEnd   = new Date(current);
    chunkEnd.setMonth(chunkEnd.getMonth() + monthsPerChunk);
    chunkEnd.setDate(chunkEnd.getDate() - 1);
    if (chunkEnd > end) chunkEnd.setTime(end.getTime());
    chunks.push({ dateDebut: fmt(chunkStart), dateFin: fmt(chunkEnd) });
    current.setMonth(current.getMonth() + monthsPerChunk);
  }
  return chunks;
}

async function runStockChunk(pool, sqlLib, params, dateDebut, dateFin) {
  const req = pool.request();
  req.timeout = 120000;
  req.input('Base',           sqlLib.NVarChar(128), params.base);
  req.input('DateDebut',      sqlLib.Date,          dateDebut);
  req.input('DateFin',        sqlLib.Date,          dateFin);
  req.input('Depot',          sqlLib.Int,            params.depot          ? parseInt(params.depot)  : null);
  req.input('Article',        sqlLib.NVarChar(50),  params.article        || null);
  req.input('FA_CodeFamille', sqlLib.NVarChar(10),  params.fa_codefamille || null);
  req.input('CL_No1',         sqlLib.Int,            params.cl_no1         ? parseInt(params.cl_no1) : null);
  req.input('CL_No2',         sqlLib.Int,            params.cl_no2         ? parseInt(params.cl_no2) : null);
  req.input('CL_No3',         sqlLib.Int,            params.cl_no3         ? parseInt(params.cl_no3) : null);
  req.input('CL_No4',         sqlLib.Int,            params.cl_no4         ? parseInt(params.cl_no4) : null);
  const result = await req.execute('stock.SP_GetStockJournalier');
  return result.recordset || [];
}

// ── GET /api/bases ────────────────────────────────────────────
router.get('/bases', async (req, res) => {
  const force = req.query.force === '1';
  if (!force) {
    const cached = getCached('bases');
    if (cached) return res.json(cached);
  }
  try {
    const pool   = await getPool();
    const result = await pool.request().execute('stock.SP_GetBases');
    setCached('bases', result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error('[GET /bases]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/bases — ajouter une base ────────────────────────
router.post('/bases', async (req, res) => {
  const { baseName, baseLabel } = req.body;
  if (!baseName) return res.status(400).json({ error: 'Paramètre baseName requis' });

  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('BaseName',  sql.NVarChar(128), baseName)
      .input('BaseLabel', sql.NVarChar(255), baseLabel || baseName)
      .execute('stock.SP_AddBase');  // ← attend que tout soit fini

    cache.clear();
    res.json(result.recordset[0]);   // ← répond seulement quand c'est prêt

  } catch (err) {
    console.error('[POST /bases]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/bases/:name — désactiver une base ─────────────
router.delete('/bases/:name', async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('BaseName', sql.NVarChar(128), req.params.name)
      .execute('stock.SP_RemoveBase');

    // ✅ Vider TOUT le cache
    cache.clear();
    setTimeout(warmupCache, 3000);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('[DELETE /bases/:name]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/bases/refresh-one ───────────────────────────────
router.post('/bases/refresh-one', async (req, res) => {
  const { baseName } = req.body;
  if (!baseName) return res.status(400).json({ error: 'Paramètre baseName requis' });
  try {
    const pool = await getPool();
    const request = pool.request();
    request.timeout = 600000;
    await request
      .input('BaseName', sql.NVarChar(128), baseName)
      .execute('stock.SP_RefreshStockCacheBase');
    cache.clear();
    setTimeout(warmupCache, 500);
    res.json({ ok: true, message: `Base ${baseName} synchronisée.` });
  } catch (err) {
    console.error('[POST /bases/refresh-one]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/bases/disponibles — bases SQL non encore ajoutées ──
// ── GET /api/bases/disponibles — bases SQL non encore ajoutées ──
router.get('/bases/disponibles', async (req, res) => {
  try {
    const pool = await getPool();

    // 1. Récupérer toutes les bases candidates
    const basesResult = await pool.request().query(`
      SELECT name AS BaseName
      FROM sys.databases
      WHERE name NOT IN (
        SELECT BaseName FROM Test.stock.SAGE_Bases WHERE IsActive = 1
      )
      AND name NOT IN ('master', 'tempdb', 'model', 'msdb', 'Test')
      AND state_desc = 'ONLINE'
      AND name NOT LIKE 'snapshot_%'
      ORDER BY name
    `);

    // 2. Filtrer celles qui ont P_DOSSIER
    const basesValides = [];
    for (const row of basesResult.recordset) {
      try {
        const check = await pool.request().query(`
          SELECT COUNT(*) AS nb 
          FROM [${row.BaseName}].sys.tables 
          WHERE name = 'P_DOSSIER'
        `);
        if (check.recordset[0].nb > 0) {
          basesValides.push(row);
        }
      } catch (e) {
        // Base inaccessible → on l'ignore silencieusement
        console.warn(`[bases/disponibles] ${row.BaseName} inaccessible:`, e.message);
      }
    }

    res.json(basesValides);
  } catch (err) {
    console.error('[GET /bases/disponibles]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/filtres ──────────────────────────────────────────
router.get('/filtres', async (req, res) => {
  const { base, cl_no1, fa_codefamille } = req.query;
  if (!base) return res.status(400).json({ error: 'Paramètre base requis' });
  const cacheKey = `filtres:${base}:${cl_no1 || 'null'}:${fa_codefamille || 'null'}`;
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[/filtres] cache hit — ${cacheKey}`);
    return res.json(cached);
  }
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.timeout = 15000;
    request.input('Base',           sql.NVarChar(128), base);
    request.input('CL_No1',         sql.Int,           cl_no1         ? parseInt(cl_no1) : null);
    request.input('FA_CodeFamille', sql.NVarChar(10),  fa_codefamille || null);

    const t0     = Date.now();
    const result = await request.execute('stock.SP_GetFiltres');
    console.log(`[/filtres] ${Date.now() - t0}ms — ${base}`);

    const [articles, depots, familles, cat1, cat2, cat3, cat4] = result.recordsets;
    const data = { articles, depots, familles, cat1, cat2, cat3, cat4 };
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('[/filtres]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/mouvements ───────────────────────────────────────
router.get('/mouvements', async (req, res) => {
  const {
    base, dateDebut, dateFin, depot, article,
    fa_codefamille, cl_no1, cl_no2, cl_no3, cl_no4,
  } = req.query;
  if (!base) return res.status(400).json({ error: 'Paramètre base requis' });

  const cacheKey = `mouvements:${JSON.stringify(req.query)}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const pool    = await getPool();
    const request = pool.request();
    request.timeout = 120000;
    request.input('Base',           sql.NVarChar(128), base);
    request.input('DateDebut',      sql.Date,          dateDebut      || null);
    request.input('DateFin',        sql.Date,          dateFin        || null);
    request.input('Depot',          sql.Int,           depot          ? parseInt(depot)  : null);
    request.input('Article',        sql.NVarChar(50),  article        || null);
    request.input('FA_CodeFamille', sql.NVarChar(10),  fa_codefamille || null);
    request.input('CL_No1',        sql.Int,            cl_no1         ? parseInt(cl_no1) : null);
    request.input('CL_No2',        sql.Int,            cl_no2         ? parseInt(cl_no2) : null);
    request.input('CL_No3',        sql.Int,            cl_no3         ? parseInt(cl_no3) : null);
    request.input('CL_No4',        sql.Int,            cl_no4         ? parseInt(cl_no4) : null);

    const t0     = Date.now();
    const result = await request.execute('stock.SP_GetMouvements');
    console.log(`[/mouvements] ${result.recordset.length} lignes en ${Date.now() - t0}ms`);
    setCached(cacheKey, result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error('[/mouvements]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/stock ────────────────────────────────────────────
router.get('/stock', async (req, res) => {
  const {
    base, dateDebut, dateFin, depot, article,
    fa_codefamille, cl_no1, cl_no2, cl_no3, cl_no4,
  } = req.query;

  if (!base)      return res.status(400).json({ error: 'Paramètre base requis' });
  if (!dateDebut) return res.status(400).json({ error: 'Paramètre dateDebut requis' });
  if (!dateFin)   return res.status(400).json({ error: 'Paramètre dateFin requis' });

  const params = { base, depot, article, fa_codefamille, cl_no1, cl_no2, cl_no3, cl_no4 };
  const chunks = splitPeriod(dateDebut, dateFin, 3);
  console.log(`[/stock] ${chunks.length} tranche(s) pour ${dateDebut}→${dateFin}`);

  try {
    const pool = await getPool();
    const t0   = Date.now();
    let allRows = [];

    for (const chunk of chunks) {
      const t1   = Date.now();
      const rows = await runStockChunk(pool, sql, params, chunk.dateDebut, chunk.dateFin);
      console.log(`[/stock] ${chunk.dateDebut}→${chunk.dateFin} : ${rows.length} lignes en ${Date.now()-t1}ms`);
      allRows = allRows.concat(rows);
    }

    console.log(`[/stock] TOTAL ${allRows.length} lignes en ${Date.now()-t0}ms`);
    res.json(allRows);
  } catch (err) {
    console.error('[/stock]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/stock/chunk', async (req, res) => {
  const {
    base, dateDebut, dateFin, depot, article,
    fa_codefamille, cl_no1, cl_no2, cl_no3, cl_no4,
  } = req.query;

  if (!base || !dateDebut || !dateFin)
    return res.status(400).json({ error: 'base, dateDebut, dateFin requis' });

  const params = { base, depot, article, fa_codefamille, cl_no1, cl_no2, cl_no3, cl_no4 };

  try {
    const pool = await getPool();
    const t0   = Date.now();
    const rows = await runStockChunk(pool, sql, params, dateDebut, dateFin);
    console.log(`[/stock/chunk] ${dateDebut}→${dateFin} : ${rows.length} lignes en ${Date.now()-t0}ms`);
    res.json(rows);
  } catch (err) {
    console.error('[/stock/chunk]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/cache — forcer un rechargement ────────────────
router.delete('/cache', async (req, res) => {
  const size = cache.size;
  cache.clear();
  console.log(`[/cache] ${size} entrées supprimées`);
  try {
    const pool = await getPool();
    await pool.request().execute('stock.SP_RefreshCacheFiltres');
    console.log('[/cache] Cache SQL rechargé');
  } catch (err) {
    console.warn('[/cache] Refresh SQL échoué:', err.message);
  }
  setTimeout(warmupCache, 500);
  res.json({ message: `Cache vidé (${size} entrées) et rechargé` });
});


// ── GET /api/cache/status ─────────────────────────────────────
router.get('/cache/status', async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT
        MAX(DateRefresh)                                  AS DernierRefresh,
        DATEDIFF(MINUTE, MAX(DateRefresh), GETDATE())     AS AgeMinutes,
        COUNT(*)                                          AS NbLignes
      FROM stock.StockJournalierCache
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/cache/refresh ───────────────────────────────────
router.post('/cache/refresh', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().execute('stock.SP_RefreshCacheFiltres');
    await pool.request().execute('stock.SP_RefreshStockCache');
    cache.clear();
    setTimeout(warmupCache, 500);
    res.json({ message: 'Refresh complet lancé', date: new Date() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;