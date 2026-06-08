import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, TrendingUp, FileText, Star,
} from 'lucide-react';

const INNER_ITEMS = [
  { key: 'dashboard', path: '/dashboard',           icon: LayoutDashboard, tooltip: 'Tableau de bord' },
  { key: 'charts',    path: '/dashboard/charts',    icon: BarChart3,       tooltip: 'Graphiques'      },
  { key: 'trends',    path: '/dashboard/trends',    icon: TrendingUp,      tooltip: 'Tendances'       },
  { key: 'reports',   path: '/dashboard/reports',   icon: FileText,        tooltip: 'Rapports'        },
  { key: 'favorites', path: '/dashboard/favorites', icon: Star,            tooltip: 'Favoris'         },
];

const HEADER_HEIGHT = 53;
const SIDEBAR_WIDTH = 240;

export default function InnerSidebar({ sidebarOpen }) {
  const [hovered, setHovered] = useState(null);
  const navigate  = useNavigate();
  const location  = useLocation();
  const leftOffset = sidebarOpen && window.innerWidth >= 1024 ? SIDEBAR_WIDTH : 0;

  const activeKey = INNER_ITEMS.slice().reverse()
    .find(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'))?.key ?? 'dashboard';

  return (
    <div style={{
      position: 'fixed', top: HEADER_HEIGHT, left: leftOffset, bottom: 0,
      width: '56px', background: '#ffffff', borderRight: '1px solid #e8e8e8',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: '1rem', paddingBottom: '1rem', gap: '4px',
      zIndex: 15, transition: 'left 0.3s ease-in-out',
    }}>
      {INNER_ITEMS.map(({ key, path, icon: Icon, tooltip }) => {
        const isActive  = activeKey === key;
        const isHovered = hovered === key;
        return (
          <div key={key} style={{ position: 'relative' }}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
          >
            <button
              onClick={() => navigate(path)}
              title={tooltip}
              style={{
                width: '40px', height: '40px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', borderRadius: '0.625rem', border: 'none',
                cursor: 'pointer', outline: 'none', position: 'relative',
                background: isActive ? 'rgba(18,166,224,0.12)' : isHovered ? '#f5f5f5' : 'transparent',
                color: isActive ? '#12a6e0' : isHovered ? '#0d0c0c' : '#c5c5c5',
                transition: 'all 0.15s',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', left: '-8px', top: '50%',
                  transform: 'translateY(-50%)', width: '3px', height: '20px',
                  borderRadius: '0 2px 2px 0', background: '#12a6e0',
                }} />
              )}
              <Icon size={18} />
            </button>

            {isHovered && (
              <div style={{
                position: 'absolute', left: 'calc(100% + 10px)', top: '50%',
                transform: 'translateY(-50%)', background: '#0d0c0c', color: '#ffffff',
                fontSize: '0.6875rem', fontWeight: 500, padding: '4px 10px',
                borderRadius: '6px', whiteSpace: 'nowrap', pointerEvents: 'none',
                zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}>
                {tooltip}
                <span style={{
                  position: 'absolute', right: '100%', top: '50%',
                  transform: 'translateY(-50%)', borderWidth: '4px', borderStyle: 'solid',
                  borderColor: 'transparent #0d0c0c transparent transparent',
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}