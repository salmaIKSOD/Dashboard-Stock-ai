// import React from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import {
//   LayoutDashboard, ArrowDownUp, LineChart, ClipboardCheck,
//   ChevronRight, Users, LogOut, User,
// } from 'lucide-react';
// import logo from '../images/logo.png';
// import { useAuth } from '../context/AuthContext';

// // ── Items selon le rôle ────────────────────────────────────────
// const NAV_ITEMS_COMMUN = [
//   { label: 'Tableau de bord',  path: '/',           icon: LayoutDashboard },
//   { label: 'Mouvements',       path: '/mouvements', icon: ArrowDownUp     },
//   { label: 'Actions à faire',  path: '/alertes',    icon: ClipboardCheck  },
// ];

// const NAV_ITEM_PREDICTIONS = { label: 'Prédictions', path: '/previsions', icon: LineChart };
// const NAV_ITEM_GESTION      = { label: 'Gestion des comptes', path: '/gestion-comptes', icon: Users };

// function getInitials(nom = '', prenom = '') {
//   return `${(prenom[0] || '').toUpperCase()}${(nom[0] || '').toUpperCase()}`;
// }

// export default function Sidebar({ open, onClose }) {
//   const navigate  = useNavigate();
//   const location  = useLocation();
//   const { user, logout, isAdmin } = useAuth();

//   // ── Construire la liste selon le rôle ────────────────────
//   const navItems = [
//     ...NAV_ITEMS_COMMUN,
//     // Prédictions : admin seulement
//     ...(isAdmin() ? [NAV_ITEM_PREDICTIONS] : []),
//     // Gestion des comptes : admin seulement
//     ...(isAdmin() ? [NAV_ITEM_GESTION] : []),
//   ];

//   const handleNav = (path) => {
//     navigate(path);
//     if (window.innerWidth < 1024 && onClose) onClose();
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login');
//   };

//   // ── Infos utilisateur connecté ────────────────────────────
//   const displayName = user ? `${user.Prenom || ''} ${user.Nom || ''}`.trim() : 'Utilisateur';
//   const displayEmail = user?.Email || '';
//   const initials = user ? getInitials(user.Nom, user.Prenom) : 'U';

//   return (
//     <aside
//       className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 ease-in-out ${open ? 'w-60' : 'w-0 overflow-hidden'}`}
//       style={{ background: '#ffffff', borderRight: '1px solid #e8e8e8', boxShadow: open ? '2px 0 12px rgba(0,0,0,0.06)' : 'none' }}
//     >
//       {/* Logo */}
//       <div className="flex flex-col items-center gap-1 px-6 py-5 shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
//         <img src={logo} alt="StockAnalytics" className="w-50 h-50 object-contain" />
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 py-4 overflow-y-auto"
//         style={{ colorScheme: 'light', scrollbarWidth: 'thin', scrollbarColor: '#e0e0e0 transparent' }}>
//         <p className="px-6 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#c5c5c5' }}>Menu</p>
//         <ul className="space-y-0.5 px-3">
//           {navItems.map(({ label, path, icon: Icon }) => {
//             const active = location.pathname === path ||
//               (path === '/' && location.pathname === '/dashboard');
//             return (
//               <li key={path}>
//                 <button
//                   onClick={() => handleNav(path)}
//                   className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
//                   style={{
//                     background:   active ? 'rgba(18,166,224,0.08)' : 'transparent',
//                     color:        active ? '#12a6e0' : '#888888',
//                     fontWeight:   active ? 500 : 400,
//                     borderTop:    'none', borderRight: 'none', borderBottom: 'none',
//                     borderLeft:   active ? '3px solid #12a6e0' : '3px solid transparent',
//                     cursor:       'pointer',
//                     textAlign:    'left',
//                   }}
//                   onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; } }}
//                   onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; } }}
//                 >
//                   <Icon size={16} style={{ color: active ? '#12a6e0' : '#c5c5c5', flexShrink: 0 }} />
//                   <span className="flex-1 text-left">{label}</span>
//                   {active && <ChevronRight size={14} style={{ color: 'rgba(18,166,224,0.5)' }} />}
//                 </button>
//               </li>
//             );
//           })}
//         </ul>

//         {/* Séparateur + Profil + Déconnexion */}
//         <div className="mt-4 px-3">
//           <div className="h-px bg-[#f0f0f0] mx-3 mb-3" />
//           <button onClick={() => handleNav('/profil')}
//             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer"
//             style={{ background: location.pathname === '/profil' ? 'rgba(18,166,224,0.08)' : 'transparent', color: location.pathname === '/profil' ? '#12a6e0' : '#888888', border: 'none', textAlign: 'left' }}
//             onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; }}
//             onMouseLeave={e => { e.currentTarget.style.background = location.pathname === '/profil' ? 'rgba(18,166,224,0.08)' : 'transparent'; e.currentTarget.style.color = location.pathname === '/profil' ? '#12a6e0' : '#888888'; }}>
//             <User size={16} style={{ color: '#c5c5c5', flexShrink: 0 }} />
//             <span className="flex-1 text-left">Mon profil</span>
//           </button>
//           <button onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer"
//             style={{ background: 'transparent', color: '#888888', border: 'none', textAlign: 'left' }}
//             onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.color = '#c62828'; }}
//             onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; }}>
//             <LogOut size={16} style={{ color: '#c5c5c5', flexShrink: 0 }} />
//             <span className="flex-1 text-left">Déconnexion</span>
//           </button>
//         </div>
//       </nav>

//       {/* Footer — vrai nom/email de l'utilisateur connecté */}
//       <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid #f0f0f0' }}>
//         <div className="flex items-center gap-3">
//           <div className="flex items-center justify-center text-xs font-bold flex-shrink-0"
//             style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'linear-gradient(135deg, #12a6e0, #01d63a)', color: '#ffffff', fontSize: '0.6875rem' }}>
//             {initials}
//           </div>
//           <div className="leading-tight min-w-0">
//             <p className="text-xs font-medium truncate" style={{ color: '#0d0c0c', margin: 0 }}>{displayName}</p>
//             <p className="text-[10px] truncate" style={{ color: '#c5c5c5', margin: 0 }}>{displayEmail}</p>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ArrowDownUp, LineChart, ClipboardCheck,
  ChevronRight, Users, LogOut, User,
} from 'lucide-react';
import logo from '../images/logo.png';
import { useAuth } from '../context/AuthContext';

// ── Items communs (tous les rôles) ────────────────────────────
const NAV_ITEMS_COMMUN = [
  { label: 'Tableau de bord', path: '/',           icon: LayoutDashboard },
  { label: 'Mouvements',      path: '/mouvements', icon: ArrowDownUp     },
];

// Items admin seulement
const NAV_ITEM_PREDICTIONS = { label: 'Prédictions',        path: '/previsions',       icon: LineChart      };
const NAV_ITEM_ACTIONS     = { label: 'Actions à faire',    path: '/alertes',          icon: ClipboardCheck };
const NAV_ITEM_GESTION     = { label: 'Gestion des comptes',path: '/gestion-comptes',  icon: Users          };

// Items employé seulement
const NAV_ITEM_ACTIONS_EMP = { label: 'Actions à faire',    path: '/alertes',          icon: ClipboardCheck };

function getInitials(nom = '', prenom = '') {
  return `${(prenom[0] || '').toUpperCase()}${(nom[0] || '').toUpperCase()}`;
}

export default function Sidebar({ open, onClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, isAdmin } = useAuth();

  // ── Ordre admin : Dashboard → Mouvements → Prédictions → Actions à faire → Gestion des comptes
  // ── Ordre employé : Dashboard → Mouvements → Actions à faire
  const navItems = isAdmin()
    ? [
        ...NAV_ITEMS_COMMUN,
        NAV_ITEM_PREDICTIONS,
        NAV_ITEM_ACTIONS,
        NAV_ITEM_GESTION,
      ]
    : [
        ...NAV_ITEMS_COMMUN,
        NAV_ITEM_ACTIONS_EMP,
      ];

  const handleNav = (path) => {
    navigate(path);
    if (window.innerWidth < 1024 && onClose) onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName  = user ? `${user.Prenom || ''} ${user.Nom || ''}`.trim() : 'Utilisateur';
  const displayEmail = user?.Email || '';
  const initials     = user ? getInitials(user.Nom, user.Prenom) : 'U';

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
      <nav className="flex-1 py-4 overflow-y-auto"
        style={{ colorScheme: 'light', scrollbarWidth: 'thin', scrollbarColor: '#e0e0e0 transparent' }}>
        <p className="px-6 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#c5c5c5' }}>Menu</p>
        <ul className="space-y-0.5 px-3">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path ||
              (path === '/' && location.pathname === '/dashboard');
            return (
              <li key={path}>
                <button
                  onClick={() => handleNav(path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
                  style={{
                    background: active ? 'rgba(18,166,224,0.08)' : 'transparent',
                    color:      active ? '#12a6e0' : '#888888',
                    fontWeight: active ? 500 : 400,
                    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                    borderLeft: active ? '3px solid #12a6e0' : '3px solid transparent',
                    cursor:     'pointer',
                    textAlign:  'left',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; } }}
                >
                  <Icon size={16} style={{ color: active ? '#12a6e0' : '#c5c5c5', flexShrink: 0 }} />
                  <span className="flex-1 text-left">{label}</span>
                  {active && <ChevronRight size={14} style={{ color: 'rgba(18,166,224,0.5)' }} />}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Séparateur + Profil + Déconnexion */}
        <div className="mt-4 px-3">
          <div className="h-px bg-[#f0f0f0] mx-3 mb-3" />
          <button onClick={() => handleNav('/profil')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer"
            style={{ background: location.pathname === '/profil' ? 'rgba(18,166,224,0.08)' : 'transparent', color: location.pathname === '/profil' ? '#12a6e0' : '#888888', border: 'none', textAlign: 'left' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0d0c0c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = location.pathname === '/profil' ? 'rgba(18,166,224,0.08)' : 'transparent'; e.currentTarget.style.color = location.pathname === '/profil' ? '#12a6e0' : '#888888'; }}>
            <User size={16} style={{ color: '#c5c5c5', flexShrink: 0 }} />
            <span className="flex-1 text-left">Mon profil</span>
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer"
            style={{ background: 'transparent', color: '#888888', border: 'none', textAlign: 'left' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.color = '#c62828'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888'; }}>
            <LogOut size={16} style={{ color: '#c5c5c5', flexShrink: 0 }} />
            <span className="flex-1 text-left">Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid #f0f0f0' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'linear-gradient(135deg, #12a6e0, #01d63a)', color: '#ffffff', fontSize: '0.6875rem' }}>
            {initials}
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: '#0d0c0c', margin: 0 }}>{displayName}</p>
            <p className="text-[10px] truncate" style={{ color: '#c5c5c5', margin: 0 }}>{displayEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}