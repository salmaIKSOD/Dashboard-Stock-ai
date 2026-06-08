import React, { useState, useRef, useEffect } from 'react';
import {useNavigate , useLocation } from 'react-router-dom';
import {
  Menu, X, Bell, UserCircle2,
  LayoutDashboard, PackageSearch, ArrowDownUp,
  BarChart3, Settings, Boxes, Warehouse,
  BellRing, BrainCircuit, FileText, TrendingUp, Star,
  Database, LogOut,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const PAGE_META = {
  '/':                       { title: 'Stock Dashboard',  icon: TrendingUp      },
  '/dashboard':              { title: 'Stock Dashboard',  icon: TrendingUp      },
  '/dashboard/charts':       { title: 'Graphiques',       icon: BarChart3       },
  '/dashboard/trends':       { title: 'Tendances',        icon: TrendingUp      },
  '/dashboard/reports':      { title: 'Rapports',         icon: FileText        },
  '/dashboard/favorites':    { title: 'Favoris',          icon: Star            },
  '/stock-journalier':       { title: 'Stock journalier', icon: PackageSearch   },
  '/mouvements':             { title: 'Mouvements',       icon: ArrowDownUp     },
  '/articles':               { title: 'Articles',         icon: Boxes           },
  '/depots':                 { title: 'Dépôts',           icon: Warehouse       },
  '/analyses':               { title: 'Analyses',         icon: BarChart3       },
  '/alertes':                { title: 'Alertes',          icon: BellRing        },
  '/previsions':             { title: 'AI Prévisions',    icon: BrainCircuit    },
  '/rapports':               { title: 'Rapports',         icon: FileText        },
  '/parametres':             { title: 'Paramètres',       icon: Settings        },
};

export default function SidebarP({ sidebarOpen, onToggleSidebar }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const location = useLocation();
  const { currentFilters } = useDashboard();

  const notifRef = useRef(null);
  const userRef  = useRef(null);

  const navigate = useNavigate();

  // Fermer les dropdowns au clic en dehors
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isDashboard = location.pathname === '/' || location.pathname.startsWith('/dashboard');
  const activeBase  = currentFilters?.base;

  const meta = Object.entries(PAGE_META)
    .filter(([path]) => location.pathname === path || location.pathname.startsWith(path + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? PAGE_META['/'];

  const PageIcon  = meta.icon;
  const pageTitle = meta.title;

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const SIDEBAR_WIDTH = 240;
  const leftOffset = sidebarOpen && window.innerWidth >= 1024 ? SIDEBAR_WIDTH : 0;

  const btnStyle = {
    width: '2rem', height: '2rem', display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: '0.5rem', background: 'transparent',
    border: 'none', cursor: 'pointer', color: '#888888', transition: 'all 0.15s',
  };

  const dropdownStyle = {
    position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
    background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '0.75rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 50, overflow: 'hidden',
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
      }}>

        {/* ── Gauche ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onToggleSidebar}
            title={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            style={btnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PageIcon size={16} style={{ color: '#12a6e0' }} />
            <span style={{ color: '#0d0c0c', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.01em' }}>
              {pageTitle}
            </span>
            <span
              className="hidden sm:inline"
              style={{ color: '#c5c5c5', fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 300 }}
            >
              {dateStr}
            </span>
          </div>
        </div>

        {/* ── Droite ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>

          {/* Badge base active */}
          {activeBase && (
            <div className="flex items-center gap-1.5 bg-[rgba(1,214,58,0.08)] border border-[rgba(1,214,58,0.25)] rounded-full py-1 px-2.5">
              <Database size={11} className="text-[#01a82e]" />
              <span className="text-[#01a82e] text-[11px] font-bold uppercase tracking-wide">
                {activeBase}
              </span>
            </div>
          )}

          {/* ── Notifications ── */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
              style={{ ...btnStyle, position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; }}
            >
              <Bell size={17} />
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#12a6e0', border: '1.5px solid #ffffff',
              }} />
            </button>

            {notifOpen && (
              <div style={{ ...dropdownStyle, width: '288px' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0' }}>
                  <p style={{ color: '#0d0c0c', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                    Notifications
                  </p>
                </div>
                {[
                  { dot: '#12a6e0', text: 'Base STE_NGDM synchronisée',          time: 'Il y a 2 min'  },
                  { dot: '#01d63a', text: 'Nouveaux mouvements détectés (BIJOU)', time: 'Il y a 15 min' },
                ].map((n, i) => (
                  <div key={i}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f8f8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.dot, marginTop: '4px', flexShrink: 0 }} />
                    <div>
                      <p style={{ color: '#0d0c0c', fontSize: '0.75rem', margin: 0 }}>{n.text}</p>
                      <p style={{ color: '#c5c5c5', fontSize: '0.625rem', margin: '2px 0 0' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#12a6e0', fontSize: '0.6875rem', fontWeight: 500 }}>
                    Voir tout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── User ── */}
          <div style={{ position: 'relative' }} ref={userRef}>
            <button
              onClick={() => { setUserOpen(o => !o); setNotifOpen(false); }}
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
              <div style={{ ...dropdownStyle, width: '208px' }}>

                {/* Header */}
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0' }}>
                  <p style={{ color: '#0d0c0c', fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>Administrateur</p>
                  <p style={{ color: '#c5c5c5', fontSize: '0.625rem', margin: '2px 0 0' }}>admin@sage.local</p>
                </div>

                {/* Gestion de bases */}
                <button
                  style={menuItemStyle}
                  onClick={() => { navigate('/gestion-bases'); setUserOpen(false); }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#555555'; }}
                >
                  <Database size={13} />
                  Gestion des bases
                </button>

                {/* Mon profil */}
                <button
                  style={menuItemStyle}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#555555'; }}
                >
                  <UserCircle2 size={13} />
                  Mon profil
                </button>

                {/* Déconnexion */}
                <button
                  style={{ ...menuItemStyle, color: '#e53935', borderTop: '1px solid #f0f0f0' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,57,53,0.05)'; e.currentTarget.style.color = '#c62828'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none';                  e.currentTarget.style.color = '#e53935'; }}
                >
                  <LogOut size={13} />
                  Déconnexion
                </button>

              </div>
            )}
          </div>

        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: '53px', flexShrink: 0 }} />
    </>
  );
}