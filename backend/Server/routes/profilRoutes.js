// // ══════════════════════════════════════════════════════════════
// //  profilRoutes.js
// //  Routes de gestion du profil — accessibles à tout utilisateur connecté
// //
// //  GET  /api/profil          — voir son propre profil
// //  PUT  /api/profil          — modifier ses infos (nom, tel, poste)
// //  POST /api/profil/photo    — uploader sa photo de profil
// // ══════════════════════════════════════════════════════════════

// const express = require('express');
// const router  = express.Router();
// const multer  = require('multer');
// const path    = require('path');
// const fs      = require('fs');

// const { getPool, sql } = require('../../db');
// const auth             = require('../middleware/authMiddleware');

// // Toutes les routes profil nécessitent d'être connecté
// router.use(auth);

// // ── Configuration Multer (stockage photos de profil) ──────────
// const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'profils');

// // Créer le dossier s'il n'existe pas
// if (!fs.existsSync(UPLOADS_DIR)) {
//   fs.mkdirSync(UPLOADS_DIR, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, UPLOADS_DIR),
//   filename: (req, file, cb) => {
//     // Nom unique : userId_timestamp.extension
//     const ext = path.extname(file.originalname).toLowerCase();
//     cb(null, `user_${req.user.UtilisateurId}_${Date.now()}${ext}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
//   fileFilter: (req, file, cb) => {
//     const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowed.includes(ext)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Format non supporté. Utilisez JPG, PNG ou WEBP.'));
//     }
//   },
// });

// // ══════════════════════════════════════════════════════════════
// //  GET /api/profil — voir son propre profil complet
// // ══════════════════════════════════════════════════════════════
// router.get('/', async (req, res) => {
//   try {
//     const pool = await getPool();

//     const result = await pool.request()
//       .input('UtilisateurId', sql.Int, req.user.UtilisateurId)
//       .execute('stock.SP_GetUtilisateurById');

//     const user = result.recordset[0];
//     if (!user) return res.status(404).json({ error: 'Profil introuvable.' });

//     // Pour les employés, récupérer aussi leurs bases
//     let bases = [];
//     if (user.Role === 'employe') {
//       const basesResult = await pool.request()
//         .input('UtilisateurId', sql.Int, req.user.UtilisateurId)
//         .execute('stock.SP_GetBasesUtilisateur');
//       bases = basesResult.recordset;
//     }

//     res.json({ ...user, bases });

//   } catch (err) {
//     console.error('[GET /profil]', err.message);
//     res.status(500).json({ error: 'Erreur serveur.' });
//   }
// });

// // ══════════════════════════════════════════════════════════════
// //  PUT /api/profil — modifier ses informations personnelles
// // ══════════════════════════════════════════════════════════════
// router.put('/', async (req, res) => {
//   const { nom, prenom,email, telephone, poste,societe  } = req.body;

//   if (!nom || !prenom) {
//     return res.status(400).json({ error: 'Nom et prénom sont obligatoires.' });
//   }

//   if (email) {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.(com|fr|net|org|ma|io|co|eu|be|ca|uk|de|es|it|nl|ch|tn|dz|info|biz|edu|gov|pro)$/i;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ error: 'Email invalide.' });
//     }
//   }

//   try {
//     const pool = await getPool();

//     await pool.request()
//       .input('UtilisateurId', sql.Int,          req.user.UtilisateurId)
//       .input('Nom',           sql.NVarChar(100), nom.trim())
//       .input('Prenom',        sql.NVarChar(100), prenom.trim())
//       .input('Telephone',     sql.NVarChar(30),  telephone || null)
//       .input('Poste',         sql.NVarChar(100), poste || null)
//       .input('PhotoUrl',      sql.NVarChar(500), null) // null = garde l'ancienne photo
//       .input('Societe', sql.NVarChar(200), societe || null)
//       .execute('stock.SP_UpdateProfil');

      
//     res.json({ message: 'Profil mis à jour avec succès.' });

//   } catch (err) {
//     console.error('[PUT /profil]', err.message);
//     res.status(500).json({ error: 'Erreur serveur lors de la mise à jour.' });
//   }
// });

// // ══════════════════════════════════════════════════════════════
// //  POST /api/profil/photo — upload photo de profil
// // ══════════════════════════════════════════════════════════════
// router.post('/photo', upload.single('photo'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'Aucun fichier reçu.' });
//   }

//   try {
//     const pool = await getPool();

//     // URL relative accessible depuis le frontend
//     const photoUrl = `/uploads/profils/${req.file.filename}`;

//     // Récupérer l'ancienne photo pour la supprimer
//     const oldResult = await pool.request()
//       .input('UtilisateurId', sql.Int, req.user.UtilisateurId)
//       .execute('stock.SP_GetUtilisateurById');

//     const oldPhotoUrl = oldResult.recordset[0]?.PhotoUrl;

//     // Mettre à jour l'URL en base
//     await pool.request()
//       .input('UtilisateurId', sql.Int,          req.user.UtilisateurId)
//       .input('Nom',           sql.NVarChar(100), req.user.Nom)
//       .input('Prenom',        sql.NVarChar(100), req.user.Prenom)
//       .input('Telephone',     sql.NVarChar(30),  null)
//       .input('Poste',         sql.NVarChar(100), null)
//       .input('PhotoUrl',      sql.NVarChar(500), photoUrl)
//       .execute('stock.SP_UpdateProfil');

//     // Supprimer l'ancienne photo si elle existe
//     if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
//       const oldPath = path.join(__dirname, '..', oldPhotoUrl);
//       if (fs.existsSync(oldPath)) {
//         fs.unlink(oldPath, err => {
//           if (err) console.warn('[profil/photo] Impossible de supprimer l\'ancienne photo:', err.message);
//         });
//       }
//     }

//     res.json({
//       message: 'Photo de profil mise à jour.',
//       photoUrl,
//     });

//   } catch (err) {
//     // Supprimer le fichier uploadé si erreur base de données
//     if (req.file) {
//       fs.unlink(req.file.path, () => {});
//     }
//     console.error('[POST /profil/photo]', err.message);
//     res.status(500).json({ error: 'Erreur serveur lors de l\'upload.' });
//   }
// });
// // ══════════════════════════════════════════════════════════════
// //  PUT /api/profil/password — changer son mot de passe
// // ══════════════════════════════════════════════════════════════
// router.put('/password', async (req, res) => {
//   const { actuel, nouveau } = req.body;

//   if (!actuel || !nouveau) {
//     return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis.' });
//   }
//   if (nouveau.length < 6) {
//     return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
//   }

//   try {
//     const pool = await getPool();

//     // Récupérer le hash actuel
//     const result = await pool.request()
//       .input('Email', sql.NVarChar(255), req.user.Email)
//       .execute('stock.SP_GetUtilisateurByEmail');

//     const user = result.recordset[0];
//     if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

//     // Vérifier le mot de passe actuel
//     const bcrypt = require('bcrypt');
//     const ok = await bcrypt.compare(actuel, user.MotDePasseHash);
//     if (!ok) {
//       return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
//     }

//     // Hasher et sauvegarder le nouveau
//     const hash = await bcrypt.hash(nouveau, 10);
//     await pool.request()
//       .input('UtilisateurId', sql.Int, req.user.UtilisateurId)
//       .input('Hash',          sql.NVarChar(255), hash)
//       .query(`UPDATE stock.Utilisateurs SET MotDePasseHash = @Hash WHERE UtilisateurId = @UtilisateurId`);

//     res.json({ message: 'Mot de passe changé avec succès.' });

//   } catch (err) {
//     console.error('[PUT /profil/password]', err.message);
//     res.status(500).json({ error: 'Erreur serveur.' });
//   }
// });

// // ── Gestion des erreurs Multer ────────────────────────────────
// router.use((err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ error: 'Fichier trop volumineux. Maximum 5 Mo.' });
//     }
//   }
//   if (err) {
//     return res.status(400).json({ error: err.message });
//   }
//   next();
// });

// module.exports = router;

// ══════════════════════════════════════════════════════════════
//  profilRoutes.js
// ══════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const { getPool, sql } = require('../../db');
const auth             = require('../middleware/authMiddleware');

router.use(auth);

// ── Multer ────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'profils');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user_${req.user.UtilisateurId}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Format non supporté. Utilisez JPG, PNG ou WEBP.'));
  },
});

// ══════════════════════════════════════════════════════════════
//  GET /api/profil
// ══════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('UtilisateurId', sql.Int, req.user.UtilisateurId)
      .execute('stock.SP_GetUtilisateurById');

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ error: 'Profil introuvable.' });

    let bases = [];
    if (user.Role === 'employe') {
      const basesResult = await pool.request()
        .input('UtilisateurId', sql.Int, req.user.UtilisateurId)
        .execute('stock.SP_GetBasesUtilisateur');
      bases = basesResult.recordset;
    }

    res.json({ ...user, bases });
  } catch (err) {
    console.error('[GET /profil]', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/profil — modifier nom, prénom, email, tel, poste, société
// ══════════════════════════════════════════════════════════════
router.put('/', async (req, res) => {
  const { nom, prenom, email, telephone, poste, societe } = req.body;
  console.log('[PUT /profil] body reçu:', { nom, prenom, email, telephone, poste, societe });

  if (!nom || !prenom) {
    return res.status(400).json({ error: 'Nom et prénom sont obligatoires.' });
  }

  // if (email) {
  //   // const emailRegex = /^[^\s@]+@[^\s@]+\.(com|fr|net|org|ma|io|co|eu|be|ca|uk|de|es|it|nl|ch|tn|dz|info|biz|edu|gov|pro)$/i;
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.(com|fr|net|org|ma|io|co|eu|be|ca|uk|de|es|it|nl|ch|tn|dz|info|biz|edu|gov|pro|local)$/i;
  //   if (!emailRegex.test(email)) {
  //     return res.status(400).json({ error: 'Email invalide.' });
  //   }
  // }
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email invalide.' });
    }
  }

  try {
    const pool = await getPool();

    // ── Mettre à jour nom, prénom, tel, poste, société ────────
    await pool.request()
      .input('UtilisateurId', sql.Int,          req.user.UtilisateurId)
      .input('Nom',           sql.NVarChar(100), nom.trim())
      .input('Prenom',        sql.NVarChar(100), prenom.trim())
      .input('Telephone',     sql.NVarChar(30),  telephone || null)
      .input('Poste',         sql.NVarChar(100), poste     || null)
      .input('Societe',       sql.NVarChar(200), societe   || null)
      .input('PhotoUrl',      sql.NVarChar(500), null) // null = garde l'ancienne photo
      .execute('stock.SP_UpdateProfil');

    // ── Mettre à jour l'email si changé ──────────────────────
    if (email && email.toLowerCase().trim() !== req.user.Email) {
      const check = await pool.request()
        .input('Email', sql.NVarChar(255), email.toLowerCase().trim())
        .execute('stock.SP_GetUtilisateurByEmail');

      if (check.recordset.length > 0 && check.recordset[0].UtilisateurId !== req.user.UtilisateurId) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre compte.' });
      }

      await pool.request()
        .input('UtilisateurId', sql.Int,          req.user.UtilisateurId)
        .input('Email',         sql.NVarChar(255), email.toLowerCase().trim())
        .query(`UPDATE stock.Utilisateurs SET Email = @Email WHERE UtilisateurId = @UtilisateurId`);
    }

    res.json({ message: 'Profil mis à jour avec succès.' });

  } catch (err) {
    console.error('[PUT /profil]', err.message);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/profil/password — changer son mot de passe
// ══════════════════════════════════════════════════════════════
router.put('/password', async (req, res) => {
  const { actuel, nouveau } = req.body;

  if (!actuel || !nouveau) {
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis.' });
  }
  if (nouveau.length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
  }

  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('Email', sql.NVarChar(255), req.user.Email)
      .execute('stock.SP_GetUtilisateurByEmail');

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    const bcrypt = require('bcrypt');
    const ok = await bcrypt.compare(actuel, user.MotDePasseHash);
    if (!ok) return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });

    const hash = await bcrypt.hash(nouveau, 10);
    await pool.request()
      .input('UtilisateurId', sql.Int,          req.user.UtilisateurId)
      .input('Hash',          sql.NVarChar(255), hash)
      .query(`UPDATE stock.Utilisateurs SET MotDePasseHash = @Hash WHERE UtilisateurId = @UtilisateurId`);

    res.json({ message: 'Mot de passe changé avec succès.' });

  } catch (err) {
    console.error('[PUT /profil/password]', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/profil/photo — upload photo de profil
// ══════════════════════════════════════════════════════════════
router.post('/photo', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });

  try {
    const pool     = await getPool();
    const photoUrl = `/uploads/profils/${req.file.filename}`;

    // Récupérer les données actuelles (pour ne pas écraser tel/poste/société)
    const current = await pool.request()
      .input('UtilisateurId', sql.Int, req.user.UtilisateurId)
      .execute('stock.SP_GetUtilisateurById');

    const u           = current.recordset[0];
    const oldPhotoUrl = u?.PhotoUrl;

    // Mettre à jour avec les données existantes + nouvelle photo
    await pool.request()
      .input('UtilisateurId', sql.Int,          req.user.UtilisateurId)
      .input('Nom',           sql.NVarChar(100), u.Nom)
      .input('Prenom',        sql.NVarChar(100), u.Prenom)
      .input('Telephone',     sql.NVarChar(30),  u.Telephone || null)
      .input('Poste',         sql.NVarChar(100), u.Poste     || null)
      .input('Societe',       sql.NVarChar(200), u.Societe   || null)
      .input('PhotoUrl',      sql.NVarChar(500), photoUrl)
      .execute('stock.SP_UpdateProfil');

    // Supprimer l'ancienne photo
    if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
      const oldPath = path.join(__dirname, '..', oldPhotoUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, err => {
          if (err) console.warn('[profil/photo] Impossible de supprimer l\'ancienne photo:', err.message);
        });
      }
    }

    res.json({ message: 'Photo de profil mise à jour.', photoUrl });

  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error('[POST /profil/photo]', err.message);
    res.status(500).json({ error: 'Erreur serveur lors de l\'upload.' });
  }
});

// ── Gestion erreurs Multer ────────────────────────────────────
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'Fichier trop volumineux. Maximum 5 Mo.' });
  }
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;