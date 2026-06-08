import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle2, Database, Settings, LogOut, ChevronRight } from 'lucide-react';

const PAGE_META = {
  '/gestion-bases': { title: 'Gestion des bases', icon: Database    },
  '/profil':        { title: 'Mon profil',         icon: UserCircle2 },
  '/parametres':    { title: 'Paramètres',          icon: Settings   },
};

export default function HeaderG({ sidebarOpen, onToggleSidebar }) {
  const [userOpen, setUserOpen] = useState(false);
  const userRef   = useRef(null);
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const meta     = PAGE_META[location.pathname] ?? PAGE_META['/gestion-bases'];
  const PageIcon = meta.icon;

  const SIDEBAR_WIDTH = 240;
  const leftOffset    = sidebarOpen && window.innerWidth >= 1024 ? SIDEBAR_WIDTH : 0;

  const now     = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const btnStyle = {
    width: '2rem', height: '2rem', display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: '0.5rem', background: 'transparent',
    border: 'none', cursor: 'pointer', color: '#888888', transition: 'all 0.15s',
  };

  const menuItemStyle = {
    width: '100%', textAlign: 'left', padding: '0.625rem 1rem',
    color: '#555555', fontSize: '0.75rem', background: 'none', border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
    transition: 'all 0.1s',
  };

  return (
    <>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.25rem', background: '#ffffff', borderBottom: '1px solid #e8e8e8',
        position: 'fixed', top: 0, left: leftOffset, right: 0, zIndex: 20,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'left 0.3s ease-in-out',
        minHeight: '53px',
      }}>

        {/* ── Gauche ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onToggleSidebar}
            style={btnStyle}
            title={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PageIcon size={16} style={{ color: '#12a6e0' }} />
            <span style={{ color: '#0d0c0c', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.01em' }}>
              {meta.title}
            </span>
            <span className="hidden sm:inline"
              style={{ color: '#c5c5c5', fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 300 }}>
              {dateStr}
            </span>
          </div>
        </div>

        {/* ── Droite ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>

          {/* Badge Administration */}
          <div className="flex items-center gap-1.5 rounded-full py-1 px-2.5"
            style={{ background: 'rgba(18,166,224,0.08)', border: '1px solid rgba(18,166,224,0.20)' }}>
            <Database size={11} style={{ color: '#12a6e0' }} />
            <span style={{ color: '#12a6e0', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Administration
            </span>
          </div>

          {/* ── User ── */}
          <div style={{ position: 'relative' }} ref={userRef}>
            <button
              onClick={() => setUserOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.5rem', borderRadius: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'linear-gradient(135deg, #12a6e0, #01d63a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 700 }}>
                AD
              </div>
              <span className="hidden sm:inline" style={{ color: '#666666', fontSize: '0.75rem' }}>Admin</span>
            </button>

            {userOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
                background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '0.75rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 50, overflow: 'hidden', width: '208px',
              }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0' }}>
                  <p style={{ color: '#0d0c0c', fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>Administrateur</p>
                  <p style={{ color: '#c5c5c5', fontSize: '0.625rem', margin: '2px 0 0' }}>admin@sage.local</p>
                </div>

                {/* ← Retour dashboard */}
                <button
                  style={menuItemStyle}
                  onClick={() => { navigate('/'); setUserOpen(false); }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#555555'; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Retour au tableau de bord
                </button>

                {/* Déconnexion */}
                <button
                  style={{ ...menuItemStyle, color: '#e53935', borderTop: '1px solid #f0f0f0' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,57,53,0.05)'; e.currentTarget.style.color = '#c62828'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#e53935'; }}>
                  <LogOut size={13} /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div style={{ height: '53px', flexShrink: 0 }} />
    </>
  );
}