// ══════════════════════════════════════════════════════════════
//  adminRoutes.js
//  Routes réservées aux admins — gestion des comptes utilisateurs
//
//  GET  /api/admin/utilisateurs           — liste tous les utilisateurs
//  POST /api/admin/creer-admin            — crée un compte admin validé
//  POST /api/admin/utilisateurs/:id/valider  — valide inscription employé
//  POST /api/admin/utilisateurs/:id/refuser  — refuse inscription employé
//  GET  /api/admin/utilisateurs/:id/bases    — bases ajoutées par un employé
//  GET  /api/admin/connectes              — qui est connecté en ce moment
// ══════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');

const { getPool, sql } = require('../../db');
const auth             = require('../middleware/authMiddleware');
const role             = require('../middleware/roleMiddleware');

const SALT_ROUNDS = 10;

// Toutes les routes de ce fichier nécessitent d'être connecté ET d'être admin
router.use(auth);
router.use(role('admin'));

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/utilisateurs
//  Liste tous les utilisateurs (filtrables par role et/ou statut)
//  Query params : ?role=admin|employe  &  ?statut=en_attente|valide|refuse
// ══════════════════════════════════════════════════════════════
router.get('/utilisateurs', async (req, res) => {
  const { statut, role: roleFilter } = req.query;

  try {
    const pool = await getPool();

    // SP_ListerUtilisateurs supporte un filtre statut optionnel
    const result = await pool.request()
      .input('Statut', sql.NVarChar(20), statut || null)
      .execute('stock.SP_ListerUtilisateurs');

    let utilisateurs = result.recordset;

    // Filtre côté Node si role demandé
    if (roleFilter) {
      utilisateurs = utilisateurs.filter(u => u.Role === roleFilter);
    }

    // Pour chaque employé validé, récupérer ses bases ajoutées
    const utilisateursAvecBases = await Promise.all(
      utilisateurs.map(async (u) => {
        if (u.Role === 'employe' && u.Statut === 'valide') {
          try {
            const basesResult = await pool.request()
              .input('UtilisateurId', sql.Int, u.UtilisateurId)
              .execute('stock.SP_GetBasesUtilisateur');
            return { ...u, bases: basesResult.recordset };
          } catch {
            return { ...u, bases: [] };
          }
        }
        return { ...u, bases: [] };
      })
    );

    res.json(utilisateursAvecBases);

  } catch (err) {
    console.error('[GET /admin/utilisateurs]', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/admin/creer-admin
//  Crée un compte administrateur directement validé
//  (pas de passage par "en_attente")
// ══════════════════════════════════════════════════════════════
router.post('/creer-admin', async (req, res) => {
  const { nom, prenom, email, password, telephone, poste } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ error: 'Nom, prénom, email et mot de passe sont obligatoires.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  try {
    const pool = await getPool();
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.request()
      .input('Email',          sql.NVarChar(255), email.toLowerCase().trim())
      .input('MotDePasseHash', sql.NVarChar(255), hash)
      .input('Nom',            sql.NVarChar(100), nom.trim())
      .input('Prenom',         sql.NVarChar(100), prenom.trim())
      .input('Telephone',      sql.NVarChar(30),  telephone || null)
      .input('Poste',          sql.NVarChar(100), poste || null)
      .input('Role',           sql.NVarChar(20),  'admin')
      .input('Statut',         sql.NVarChar(20),  'valide')   // admin validé directement
      .input('CreePar',        sql.Int,           req.user.UtilisateurId)
      .execute('stock.SP_CreerUtilisateur');

    res.status(201).json({
      message: 'Compte administrateur créé avec succès.',
      UtilisateurId: result.recordset[0]?.UtilisateurId,
    });

  } catch (err) {
    if (err.message.includes('existe déjà')) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' });
    }
    console.error('[POST /admin/creer-admin]', err.message);
    res.status(500).json({ error: 'Erreur serveur lors de la création du compte.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/admin/utilisateurs/:id/valider
//  Valide une inscription employé en attente
// ══════════════════════════════════════════════════════════════
router.post('/utilisateurs/:id/valider', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });

  try {
    const pool = await getPool();
    await pool.request()
      .input('UtilisateurId', sql.Int, id)
      .execute('stock.SP_ValiderUtilisateur');

    res.json({ message: 'Compte validé — l\'employé peut maintenant se connecter.' });

  } catch (err) {
    if (err.message.includes('introuvable ou déjà traité')) {
      return res.status(404).json({ error: 'Utilisateur introuvable ou déjà traité.' });
    }
    console.error('[POST /admin/utilisateurs/:id/valider]', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/admin/utilisateurs/:id/refuser
//  Refuse une inscription employé en attente
// ══════════════════════════════════════════════════════════════
router.post('/utilisateurs/:id/refuser', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });

  try {
    const pool = await getPool();
    await pool.request()
      .input('UtilisateurId', sql.Int, id)
      .execute('stock.SP_RefuserUtilisateur');

    res.json({ message: 'Inscription refusée.' });

  } catch (err) {
    if (err.message.includes('introuvable ou déjà traité')) {
      return res.status(404).json({ error: 'Utilisateur introuvable ou déjà traité.' });
    }
    console.error('[POST /admin/utilisateurs/:id/refuser]', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  DELETE /api/admin/utilisateurs/:id
//  Supprime un compte admin (ne peut pas supprimer son propre compte)
// ══════════════════════════════════════════════════════════════
router.delete('/utilisateurs/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });

  if (id === req.user.UtilisateurId) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .query(`DELETE FROM stock.Utilisateurs WHERE UtilisateurId = ${id}`);

    res.json({ message: 'Compte supprimé avec succès.' });

  } catch (err) {
    console.error('[DELETE /admin/utilisateurs/:id]', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/utilisateurs/:id/bases
//  Voir quelles bases un employé a ajoutées
// ══════════════════════════════════════════════════════════════
router.get('/utilisateurs/:id/bases', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('UtilisateurId', sql.Int, id)
      .execute('stock.SP_GetBasesUtilisateur');

    res.json(result.recordset);

  } catch (err) {
    console.error('[GET /admin/utilisateurs/:id/bases]', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/connectes
//  Voir qui est connecté / déconnecté en temps réel
// ══════════════════════════════════════════════════════════════
router.get('/connectes', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .execute('stock.SP_GetUtilisateursConnectes');

    res.json(result.recordset);

  } catch (err) {
    console.error('[GET /admin/connectes]', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;