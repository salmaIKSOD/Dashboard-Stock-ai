// ══════════════════════════════════════════════════════════════
//  AuthContext.js
//  État global d'authentification — accessible depuis toute l'app
//  Fournit : user, loading, login(), logout(), isAdmin(), isEmploye()
// ══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);   // null = non connecté
  const [loading, setLoading] = useState(true);   // true pendant la vérification initiale

  // ── Vérifier si une session existe au chargement de l'app ──
  // Lit le cookie httpOnly via GET /api/auth/me
  const checkSession = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/auth/me`, { withCredentials: true });
      setUser(res.data);
    } catch {
      setUser(null); // pas de session ou session expirée
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await axios.post(
      `${API}/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    setUser(res.data.user);
    return res.data.user;
  };

  // ── Logout ────────────────────────────────────────────────
  // const logout = async () => {
  //   try {
  //     await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
  //   } catch { /* silently ignore */ }
  //   finally { setUser(null); }
  // };
   const logout = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch { /* silently ignore */ }
    finally {
      // Effacer tout le storage pour réinitialiser les filtres du dashboard
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
    }
  };

  // ── Helpers de rôle ───────────────────────────────────────
  const isAdmin   = () => user?.Role === 'admin';
  const isEmploye = () => user?.Role === 'employe';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isEmploye, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pratique
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}