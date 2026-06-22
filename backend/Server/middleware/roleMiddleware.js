// ══════════════════════════════════════════════════════════════
//  roleMiddleware.js
//  Vérifie que l'utilisateur connecté a le rôle requis.
//  Toujours utilisé APRÈS authMiddleware.
//
//  Usage :
//    router.get('/route', auth, role('admin'), handler)
//    router.get('/route', auth, role('employe', 'admin'), handler)
// ══════════════════════════════════════════════════════════════

module.exports = function roleMiddleware(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié.' });
    }

    if (!rolesAutorises.includes(req.user.Role)) {
      return res.status(403).json({
        error: `Accès refusé — cette action nécessite le rôle : ${rolesAutorises.join(' ou ')}.`,
      });
    }

    next();
  };
};