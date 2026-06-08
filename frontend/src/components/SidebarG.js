import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Database, UserCircle2, Settings, ChevronRight, ArrowLeft, Users } from 'lucide-react';
import logo from '../images/logo.png';

const NAV_ITEMS = [
  { label: 'Gestion des bases', path: '/gestion-bases', icon: Database    },
  { label: 'Mon profil',        path: '/profil',        icon: UserCircle2 },
  { label: 'Gestion des comptes',        path: '/gestion-comptes',    icon: Users    },
];

export default function SidebarG({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    if (window.innerWidth < 1024 && onClose) onClose();
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 ease-in-out ${open ? 'w-60' : 'w-0 overflow-hidden'}`}
      style={{ background: '#ffffff', borderRight: '1px solid #e8e8e8', boxShadow: open ? '2px 0 12px rgba(0,0,0,0.06)' : 'none' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-1 px-6 py-5 shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <img src={logo} alt="StockAnalytics" className="w-50 h-50 object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <p className="px-6 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#c5c5c5' }}>
          Administration
        </p>
        <ul className="space-y-0.5 px-3">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <li key={path}>
                <button
                  onClick={() => handleNav(path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
                  style={{
                    background:  active ? 'rgba(18,166,224,0.08)' : 'transparent',
                    color:       active ? '#12a6e0' : '#888888',
                    fontWeight:  active ? 500 : 400,
                    border:      'none',
                    borderLeft:  active ? '3px solid #12a6e0' : '3px solid transparent',
                    cursor:      'pointer',
                    textAlign:   'left',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; }}}
                >
                  <Icon size={16} style={{ color: active ? '#12a6e0' : '#c5c5c5', flexShrink: 0 }} />
                  <span className="flex-1 text-left">{label}</span>
                  {active && <ChevronRight size={14} style={{ color: 'rgba(18,166,224,0.5)' }} />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ← Retour dashboard — en bas avant le footer */}
      <div className="px-3 pb-3" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' }}>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
          style={{ background: 'linear-gradient(135deg, #12a6e0, #0d8fc4)', color: '#ffffff', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(18,166,224,0.30)' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(18,166,224,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(18,166,224,0.30)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <ArrowLeft size={16} style={{ flexShrink: 0 }} />
          <span className="flex-1 text-left">Retour au Dashboard</span>
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid #f0f0f0' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center text-xs font-bold"
            style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'linear-gradient(135deg, #12a6e0, #01d63a)', color: '#ffffff', fontSize: '0.6875rem', flexShrink: 0 }}>
            AD
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: '#0d0c0c', margin: 0 }}>Administrateur</p>
            <p className="text-[10px] truncate" style={{ color: '#c5c5c5', margin: 0 }}>admin@sage.local</p>
          </div>
        </div>
      </div>
    </aside>
  );
}