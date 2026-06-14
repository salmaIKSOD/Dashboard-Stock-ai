import React, { useEffect, useState } from 'react';

export default function EmptyStateDashboard({ onRelancer }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes es-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes es-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes es-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .es-root  { animation: es-in .45s cubic-bezier(.22,.68,0,1.1) both; }
        .es-float { animation: es-float 4s ease-in-out infinite; }
        .es-ring  { animation: es-spin 14s linear infinite; }

        .es-feat-card {
          background: #fff;
          border: 1.5px solid #f0f6fb;
          border-radius: 12px;
          padding: 13px 16px;
          flex: 1;
          transition: border-color .18s, transform .18s;
        }
        .es-feat-card:hover { border-color: rgba(18,166,224,0.25); transform: translateY(-2px); }

        .es-step-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1.5px solid #f0f6fb;
          border-radius: 99px;
          padding: 5px 13px 5px 7px;
          width: 100%;
        }

        .es-tag {
          display: inline-flex;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          border-radius: 20px;
          padding: 2px 8px;
          letter-spacing: 0.03em;
        }
      `}</style>

      <div className="es-root" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', padding: '20px 8px 0px' }}>

        {/* ── LIGNE HAUTE ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '0 4px 20px' }}>

          {/* Icône flottante */}
          <div className="es-float" style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <svg className="es-ring" width="80" height="80" viewBox="0 0 72 72"
              style={{ position: 'absolute', inset: 0 }} fill="none">
              <circle cx="36" cy="36" r="33" stroke="rgba(18,166,224,0.18)" strokeWidth="1" strokeDasharray="4 6"/>
            </svg>
            <div style={{ position:'absolute', inset:11, borderRadius:'50%', background:'#12a6e0', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
          </div>

          {/* Texte */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#0d1a26', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Aucune donnée à afficher
            </p>
            <p style={{ fontSize: 14, color: '#94a8b8', margin: 0, lineHeight: 1.55 }}>
              Sélectionnez une base, définissez une période et cliquez sur{' '}
              <strong style={{ color: '#12a6e0', fontWeight: 700 }}>Filtrer</strong> pour voir vos stocks.
            </p>
          </div>

          {/* Étapes pills avec connecteur + numéro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flexShrink: 0, minWidth: 150 }}>
            {[
              { color: '#12a6e0', bg: 'rgba(18,166,224,0.12)', label: 'Base SAGE', num: '1', icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
              )},
              { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Période', num: '2', icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              )},
              { color: '#01a82e', bg: 'rgba(1,168,46,0.12)', label: 'Filtrer', num: '3', icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              )},
            ].map(({ color, bg, label, num, icon }, i) => (
              <React.Fragment key={label}>
                <div className="es-step-pill">
                  <div style={{ width:22, height:22, borderRadius:'50%', background:bg, color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {icon}
                  </div>
                  <span style={{ fontSize:12, color:'#7a9ab2', flex:1, fontWeight:500 }}>{label}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:'#b0c4d4' }}>{num}</span>
                </div>
                {i < 2 && (
                  <div style={{ paddingLeft: 11 }}>
                    <div style={{ width:1, height:6, background:'#e4ecf2' }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── CE QUE VOUS POUVEZ FAIRE ── */}
        <div style={{ borderTop: '1.5px solid #f0f6fb', paddingTop: 18 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.09em', color:'#b0c4d4', textTransform:'uppercase', margin:'0 0 12px 2px' }}>
            Ce que vous pouvez faire
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            {[
              {
                color: '#12a6e0', bg: 'rgba(18,166,224,0.10)', tagColor: '#0a7ab5', tagBg: 'rgba(18,166,224,0.10)',
                title: 'Tableau de bord', tags: ['KPIs', 'Journalier'],
                items: ['Mouvements journaliers avec et sans mouvement', 'KPIs : stock final, entrées, sorties'],
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                ),
              },
              {
                color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', tagColor: '#6d28d9', tagBg: 'rgba(124,58,237,0.09)',
                title: 'Mouvements', tags: ['Filtrage', 'Par article'],
                items: ['Lignes avec mouvement uniquement', 'Filtrage par article ou dépôt'],
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 1 21 5 17 9"/>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                    <polyline points="7 23 3 19 7 15"/>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                  </svg>
                ),
              },
              {
                color: '#01a82e', bg: 'rgba(1,168,46,0.10)', tagColor: '#057a1f', tagBg: 'rgba(1,168,46,0.09)',
                title: 'Export & Rapports', tags: ['Excel', 'Rapports'],
                items: ['Exportation Excel des données filtrées', 'Génération de rapports détaillés'],
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                ),
              },
            ].map(({ color, bg, tagColor, tagBg, title, items, tags, icon }) => (
              <div className="es-feat-card" key={title}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:bg, color, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {icon}
                  </div>
                  <span style={{ fontSize:14, fontWeight:700, color:'#0d1a26' }}>{title}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
                  {items.map(item => (
                    <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:6 }}>
                      <span style={{ fontSize:14, color, lineHeight:'1.2', flexShrink:0 }}>·</span>
                      <span style={{ fontSize:12, color:'#9ab0c0', lineHeight:1.4 }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {tags.map(tag => (
                    <span key={tag} className="es-tag" style={{ background:tagBg, color:tagColor, fontSize:10 }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, paddingTop:8, paddingBottom:4, opacity:0.38 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#12a6e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
          <span style={{ fontSize:12, fontWeight:700, color:'#7a9ab2', letterSpacing:'0.05em' }}>IMRASOFT</span>
          <span style={{ color:'#c0d0dc', fontSize:12 }}>·</span>
          <span style={{ fontSize:12, color:'#94aaba' }}>Sage Business Partner</span>
        </div>

      </div>
    </>
  );
}