// ══════════════════════════════════════════════════════════════
//  ProtectedRoute.js
//  Protège les routes selon l'état de connexion et le rôle.
//
//  Usage :
//    <ProtectedRoute>                     → connexion requise
//    <ProtectedRoute requiredRole="admin"> → admin seulement
// ══════════════════════════════════════════════════════════════

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ── Attendre que la vérification de session soit terminée ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
        <div className="flex flex-col items-center gap-3 text-[#12a6e0]">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm text-[#888]">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  // ── Non connecté → rediriger vers login ───────────────────
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Rôle insuffisant → rediriger vers l'accueil ───────────
  if (requiredRole && user.Role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}