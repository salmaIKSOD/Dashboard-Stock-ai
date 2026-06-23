// ══════════════════════════════════════════════════════════════
//  seedAdmin.js — Création du premier compte administrateur
//  Exécuter UNE SEULE FOIS :  node seedAdmin.js
//  Depuis le dossier : D:\Dashboard-Stock-ai\backend
// ══════════════════════════════════════════════════════════════

require('dotenv').config({ path: './.env' });
const bcrypt = require('bcrypt');
const sql    = require('mssql');

// ── Config connexion ──────────────────────────────────────────
const config = {
  server:   process.env.DB_SERVER,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:     parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'StockAnalytics',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

// ── Données du premier admin — modifie ici ────────────────────
const ADMIN = {
  nom:       'Administrateur',
  prenom:    'Principal',
  email:     'admin@sage.local',
  password:  'Admin@123',         // ← change ce mot de passe
  telephone: null,
  poste:     'Administrateur système',
};

async function main() {
  console.log('🔑 Création du compte administrateur initial...');

  let pool;
  try {
    pool = await sql.connect(config);
    console.log('✅ Connecté à la base StockAnalytics');

    // Vérifie si un admin existe déjà
    const check = await pool.request().query(`
      SELECT COUNT(*) AS nb FROM stock.Utilisateurs WHERE Role = 'admin'
    `);
    if (check.recordset[0].nb > 0) {
      console.log('⚠️  Un compte admin existe déjà — aucune action effectuée.');
      console.log('   Si vous voulez créer un autre admin, utilisez l\'interface web.');
      return;
    }

    // Hash du mot de passe
    const hash = await bcrypt.hash(ADMIN.password, 10);

    // Insertion via la procédure stockée
    await pool.request()
      .input('Email',          sql.NVarChar(255), ADMIN.email)
      .input('MotDePasseHash', sql.NVarChar(255), hash)
      .input('Nom',            sql.NVarChar(100), ADMIN.nom)
      .input('Prenom',         sql.NVarChar(100), ADMIN.prenom)
      .input('Telephone',      sql.NVarChar(30),  ADMIN.telephone)
      .input('Poste',          sql.NVarChar(100), ADMIN.poste)
      .input('Role',           sql.NVarChar(20),  'admin')
      .input('Statut',         sql.NVarChar(20),  'valide')
      .input('CreePar',        sql.Int,           null)
      .execute('stock.SP_CreerUtilisateur');

    console.log('');
    console.log('✅ Compte administrateur créé avec succès !');
    console.log('');
    console.log('   Email    :', ADMIN.email);
    console.log('   Mot de passe :', ADMIN.password);
    console.log('');
    console.log('⚠️  Changez le mot de passe après la première connexion.');

  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    if (pool) await pool.close();
  }
}

main();