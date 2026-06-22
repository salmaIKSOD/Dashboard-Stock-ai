// ══════════════════════════════════════════════════════════════
//  authMiddleware.js
//  Vérifie le cookie JWT httpOnly à chaque requête protégée.
//  Attache req.user = { UtilisateurId, Email, Role, Statut }
// ══════════════════════════════════════════════════════════════

const jwt        = require('jsonwebtoken');
const { getPool, sql } = require('../../db');

const JWT_SECRET = process.env.JWT_SECRET || 'stockanalytics_secret_change_in_prod';

module.exports = async function authMiddleware(req, res, next) {
  try {
    // ── 1. Lire le token depuis le cookie httpOnly ────────────
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'Non authentifié — veuillez vous connecter.' });
    }

    // ── 2. Vérifier la signature et l'expiration du JWT ──────
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Session expirée — veuillez vous reconnecter.' });
    }

    // ── 3. Vérifier que le compte existe toujours et est valide ──
    const pool   = await getPool();
    const result = await pool.request()
      .input('UtilisateurId', sql.Int, payload.UtilisateurId)
      .execute('stock.SP_GetUtilisateurById');

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ error: 'Compte introuvable.' });
    }
    if (user.Statut !== 'valide') {
      return res.status(403).json({ error: 'Votre compte est en attente de validation ou a été refusé.' });
    }

    // ── 4. Attacher l'utilisateur à la requête ────────────────
    req.user = {
      UtilisateurId: user.UtilisateurId,
      Email:         user.Email,
      Nom:           user.Nom,
      Prenom:        user.Prenom,
      Role:          user.Role,
      Statut:        user.Statut,
      PhotoUrl:      user.PhotoUrl,
    };

    next();
  } catch (err) {
    console.error('[authMiddleware]', err.message);
    res.status(500).json({ error: 'Erreur serveur lors de la vérification de session.' });
  }
};