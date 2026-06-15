const sql  = require('mssql');
const fs   = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

// ── Config de connexion (sans database pour le init) ──────────
const baseConfig = {
  server:  process.env.DB_SERVER,
  user:    process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:    parseInt(process.env.DB_PORT) || 1433,
  requestTimeout:   300000,
  connectionTimeout: 30000,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

// ── Config normale avec la base Test ─────────────────────────
const config = {
  ...baseConfig,
  database: process.env.DB_NAME || 'Test',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

// ── Découpe le script SQL en blocs séparés par GO ────────────
function splitSqlByGo(sqlText) {
  return sqlText
    .split(/^\s*GO\s*$/im)
    .map(b => b.trim())
    .filter(b => b.length > 0);
}

// ── Initialisation automatique au premier démarrage ──────────
async function initDatabase() {
  console.log('🔍 Vérification de la base Test...');

  // 1. Connexion à master (pas de database cible)
  const masterPool = await sql.connect({ ...baseConfig, database: 'master' });

  try {
    // 2. Est-ce que Test existe déjà ?
    const check = await masterPool.request().query(
      `SELECT COUNT(*) AS nb FROM sys.databases WHERE name = 'Test'`
    );
    const exists = check.recordset[0].nb > 0;

    if (exists) {
      // 3a. Vérifier que les procédures essentielles sont là
      const spCheck = await masterPool.request().query(`
        SELECT COUNT(*) AS nb
        FROM Test.sys.procedures p
        INNER JOIN Test.sys.schemas s ON s.schema_id = p.schema_id
        WHERE s.name = 'stock'
          AND p.name IN (
            'SP_GetBases','SP_GetFiltres','SP_GetMouvements',
            'SP_GetStockJournalier','SP_AddBase','SP_RemoveBase',
            'SP_RefreshCacheFiltres','SP_RefreshStockCache',
            'SP_RebuildUnifiedViews','SP_RefreshSiNecessaire'
          )
      `);
      const nbSP = spCheck.recordset[0].nb;

      if (nbSP >= 10) {
        console.log('✅ Base Test déjà initialisée — démarrage normal');
        await masterPool.close();
        return;
      }

      console.log(`⚠️  Base Test existe mais incomplète (${nbSP}/10 procédures) — réinitialisation...`);
    } else {
      console.log('🆕 Base Test absente — création en cours...');
    }

    // 4. Lire et exécuter init.sql
    const sqlFilePath = path.join(__dirname, 'Server', 'init.sql');
    const sqlText     = fs.readFileSync(sqlFilePath, 'utf8');
    const blocs       = splitSqlByGo(sqlText);

    console.log(`📋 Exécution de ${blocs.length} blocs SQL...`);

    for (let i = 0; i < blocs.length; i++) {
      try {
        await masterPool.request().query(blocs[i]);
      } catch (err) {
        // Ignorer les erreurs "déjà existe" non bloquantes
        if (
          err.message.includes('already exists') ||
          err.message.includes('existe déjà')    ||
          err.message.includes('There is already')
        ) {
          continue;
        }
        console.error(`❌ Erreur bloc ${i + 1}:`, err.message);
        console.error('Bloc :', blocs[i].substring(0, 200));
        throw err;
      }
    }

    console.log('✅ Base Test initialisée avec succès !');
    console.log('ℹ️  L\'encadrant peut maintenant ajouter ses bases SAGE via l\'interface.');

  } finally {
    await masterPool.close();
  }
}

// ── Pool principal vers Test ──────────────────────────────────
async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✅ Connecté à SQL Server — StockAnalytics');
  }
  return pool;
}

module.exports = { getPool, sql, initDatabase };

// const sql = require('mssql');
// require('dotenv').config({ path: '../.env' });

// const config = {
//   server: process.env.DB_SERVER,
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   port: parseInt(process.env.DB_PORT),

//   //  deux 
//   requestTimeout:    300000,   
//   connectionTimeout:  30000,   
  
//   options: {
//     encrypt: false,
//     trustServerCertificate: true,
//     enableArithAbort: true,
//   },
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000,
//   },
// };

// let pool = null;

// async function getPool() {
//   if (!pool) {
//     pool = await sql.connect(config);
//     console.log('✅ Connecté à SQL Server — StockAnalytics');
//   }
//   return pool;
// }

// module.exports = { getPool, sql };