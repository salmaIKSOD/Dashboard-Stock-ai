// ══════════════════════════════════════════════════════════════
//  authRoutes.js
//  Routes publiques d'authentification
//  POST /api/auth/register  — inscription employé
//  POST /api/auth/login     — connexion (génère cookie JWT)
//  POST /api/auth/logout    — déconnexion (supprime cookie)
//  GET  /api/auth/me        — infos utilisateur connecté
// ══════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');

const { getPool, sql }  = require('../../db');
const authMiddleware    = require('../middleware/authMiddleware');

const JWT_SECRET  = process.env.JWT_SECRET || 'stockanalytics_secret_change_in_prod';
const SALT_ROUNDS = 10;

// ── Cookie options ────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,    // inaccessible depuis JavaScript côté client
  secure:   false,   // passer à true en production (HTTPS)
  sameSite: 'lax',
  maxAge:   8 * 60 * 60 * 1000, // 8 heures
};

// ══════════════════════════════════════════════════════════════
//  POST /api/auth/register — Inscription employé
//  Crée un compte avec statut 'en_attente'
//  L'admin doit valider avant que l'employé puisse se connecter
// ══════════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  const { nom, prenom, email, password, telephone, poste,societe } = req.body;

  // ── Validation des champs obligatoires ────────────────────
  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ error: 'Nom, prénom, email et mot de passe sont obligatoires.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  try {
    const pool = await getPool();

    // ── Hash du mot de passe ──────────────────────────────────
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    // ── Insertion via procédure stockée ───────────────────────
    await pool.request()
      .input('Email',          sql.NVarChar(255), email.toLowerCase().trim())
      .input('MotDePasseHash', sql.NVarChar(255), hash)
      .input('Nom',            sql.NVarChar(100), nom.trim())
      .input('Prenom',         sql.NVarChar(100), prenom.trim())
      .input('Telephone',      sql.NVarChar(30),  telephone || null)
      .input('Poste',          sql.NVarChar(100), poste || null)
      .input('Societe',        sql.NVarChar(200), societe || null)
      .input('Role',           sql.NVarChar(20),  'employe')
      .input('Statut',         sql.NVarChar(20),  'en_attente')
      .input('CreePar',        sql.Int,           null)
      .execute('stock.SP_CreerUtilisateur');

    res.status(201).json({
      message: 'Inscription enregistrée. Un administrateur doit valider votre compte avant que vous puissiez vous connecter.',
    });

  } catch (err) {
    if (err.message.includes('existe déjà')) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' });
    }
    console.error('[POST /auth/register]', err.message);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/auth/login — Connexion
//  Vérifie email + mot de passe, génère un JWT dans un cookie httpOnly
// ══════════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const pool = await getPool();

    // ── Récupérer l'utilisateur par email ─────────────────────
    const result = await pool.request()
      .input('Email', sql.NVarChar(255), email.toLowerCase().trim())
      .execute('stock.SP_GetUtilisateurByEmail');

    const user = result.recordset[0];

    // ── Vérifications ──────────────────────────────────────────
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    if (user.Statut === 'en_attente') {
      return res.status(403).json({ error: 'Votre compte est en attente de validation par un administrateur.' });
    }

    if (user.Statut === 'refuse') {
      return res.status(403).json({ error: 'Votre demande d\'inscription a été refusée. Contactez un administrateur.' });
    }

    // ── Vérifier le mot de passe ──────────────────────────────
    const passwordOk = await bcrypt.compare(password, user.MotDePasseHash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // ── Générer le JWT ────────────────────────────────────────
    const token = jwt.sign(
      {
        UtilisateurId: user.UtilisateurId,
        Email:         user.Email,
        Role:          user.Role,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // ── Marquer comme connecté en base ────────────────────────
    await pool.request()
      .input('UtilisateurId', sql.Int, user.UtilisateurId)
      .input('EstConnecte',   sql.Bit, 1)
      .execute('stock.SP_SetConnexionStatut');

    // ── Envoyer le cookie httpOnly ────────────────────────────
    res.cookie('token', token, cookieOptions);

    // ── Réponse (sans le mot de passe) ───────────────────────
    res.json({
      message: 'Connexion réussie.',
      user: {
        UtilisateurId: user.UtilisateurId,
        Email:         user.Email,
        Nom:           user.Nom,
        Prenom:        user.Prenom,
        Telephone:     user.Telephone,
        Poste:         user.Poste,
        Societe:       user.Societe,
        PhotoUrl:      user.PhotoUrl,
        Role:          user.Role,
      },
    });

  } catch (err) {
    console.error('[POST /auth/login]', err.message);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/auth/logout — Déconnexion
//  Supprime le cookie JWT + marque déconnecté en base
// ══════════════════════════════════════════════════════════════
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const pool = await getPool();

    // ── Marquer comme déconnecté en base ─────────────────────
    await pool.request()
      .input('UtilisateurId', sql.Int, req.user.UtilisateurId)
      .input('EstConnecte',   sql.Bit, 0)
      .execute('stock.SP_SetConnexionStatut');

    // ── Supprimer le cookie ───────────────────────────────────
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    res.json({ message: 'Déconnexion réussie.' });

  } catch (err) {
    console.error('[POST /auth/logout]', err.message);
    res.status(500).json({ error: 'Erreur lors de la déconnexion.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/auth/me — Infos utilisateur connecté
//  Utilisé par le frontend au chargement pour savoir qui est connecté
// ══════════════════════════════════════════════════════════════
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const pool = await getPool();

    // ── Récupérer les bases de l'employé si rôle employé ─────
    let bases = [];
    if (req.user.Role === 'employe') {
      const basesResult = await pool.request()
        .input('UtilisateurId', sql.Int, req.user.UtilisateurId)
        .execute('stock.SP_GetBasesUtilisateur');
      bases = basesResult.recordset;
    }

    res.json({
      ...req.user,
      bases,
    });

  } catch (err) {
    console.error('[GET /auth/me]', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;