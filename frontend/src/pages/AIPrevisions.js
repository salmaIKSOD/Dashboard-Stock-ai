// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Database, ChevronDown, Loader2,
//   TrendingUp, AlertTriangle, Radar, Shapes,
//   RefreshCw, CheckCircle, XCircle, Clock,
// } from 'lucide-react';
// import { fetchBases } from '../api/stockApi';
// import { fetchPipelineStatus, fetchPredictionResults, runPipeline } from '../api/predictionsApi';

// // ── Helpers ───────────────────────────────────────────────────
// const fmtNum = (n) => {
//   if (n === null || n === undefined || isNaN(Number(n))) return '—';
//   return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n));
// };

// // ── Badge MAPE ────────────────────────────────────────────────
// function MAPEBadge({ value }) {
//   if (!value || isNaN(value)) return <span className="text-[#c5c5c5] text-xs">N/A</span>;
//   const v = Number(value);
//   const color = v < 30
//     ? { bg: '#EAF3DE', text: '#27500A' }
//     : v < 60
//     ? { bg: '#FAEEDA', text: '#633806' }
//     : { bg: '#FCEBEB', text: '#791F1F' };
//   return (
//     <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
//       style={{ background: color.bg, color: color.text }}>
//       {v.toFixed(1)}%
//     </span>
//   );
// }

// // ── Badge jours rupture ───────────────────────────────────────
// function RuptureBadge({ value }) {
//   if (!value || isNaN(value)) return <span className="text-[#c5c5c5] text-xs">—</span>;
//   const v = Number(value);
//   const color = v < 7
//     ? { bg: '#FCEBEB', text: '#791F1F' }
//     : v < 30
//     ? { bg: '#FAEEDA', text: '#633806' }
//     : { bg: '#EAF3DE', text: '#27500A' };
//   return (
//     <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
//       style={{ background: color.bg, color: color.text }}>
//       {v.toFixed(0)}j
//     </span>
//   );
// }

// // ── KPI Card simple ───────────────────────────────────────────
// function KpiCard({ label, value, color }) {
//   return (
//     <div className="bg-white rounded-xl px-4 py-3 border border-[#e8e8e8]">
//       <p className="text-[11px] text-[#aaaaaa] uppercase tracking-wide mb-1">{label}</p>
//       <p className="text-[1.4rem] font-bold m-0" style={{ color }}>{value}</p>
//     </div>
//   );
// }

// // ── Sélecteur de base ─────────────────────────────────────────
// function BaseSelector({ bases, value, onChange, loading }) {
//   const [open, setOpen] = useState(false);
//   const selected = bases.find(b => b.BaseName === value);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen(o => !o)}
//         className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer"
//         style={{
//           background  : value ? '#E6F1FB' : 'white',
//           borderColor : value ? '#B5D4F4' : '#e0e0e0',
//           color       : value ? '#0C447C' : '#888888',
//         }}
//       >
//         <Database size={14} />
//         {loading
//           ? <Loader2 size={14} className="animate-spin" />
//           : (selected?.BaseLabel || selected?.BaseName || 'Sélectionner une base')}
//         <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
//       </button>

//       {open && (
//         <div className="absolute top-full mt-1 left-0 bg-white border border-[#e0e0e0] rounded-lg shadow-lg z-50 min-w-[200px]">
//           {bases.map(b => (
//             <button
//               key={b.BaseName}
//               onClick={() => { onChange(b.BaseName); setOpen(false); }}
//               className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#f2faff] transition-colors cursor-pointer"
//               style={{ color: b.BaseName === value ? '#12a6e0' : '#333', fontWeight: b.BaseName === value ? 500 : 400 }}
//             >
//               {b.BaseLabel || b.BaseName}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Graphe prévision ──────────────────────────────────────────
// function ForecastChart({ baseName, arRef, onClose }) {
//   const [data,    setData]    = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error,   setError]   = useState(null);

//   useEffect(() => {
//     const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
//     fetch(`${BASE_URL}/pipeline/forecast/${baseName}/${arRef}`)
//       .then(r => r.json())
//       .then(d => { if (d.error) throw new Error(d.error); setData(d); })
//       .catch(e => setError(e.message))
//       .finally(() => setLoading(false));
//   }, [baseName, arRef]);

//   if (loading) return (
//     <div className="flex items-center justify-center py-12 gap-3 text-[#12a6e0]">
//       <Loader2 size={18} className="animate-spin" />
//       <span className="text-sm">Génération des prédictions…</span>
//     </div>
//   );

//   if (error) return (
//     <div className="py-8 text-center text-sm text-[#b71c1c]">
//       Erreur : {error}
//     </div>
//   );

//   if (!data) return null;

//   const W = 680, H = 200, PL = 48, PR = 16, PT = 16, PB = 32;
//   const chartW = W - PL - PR;
//   const chartH = H - PT - PB;

//   const allValues = [
//     ...data.train.values,
//     ...data.test.values_real,
//     ...data.test.values_pred,
//     ...data.futur.values,
//   ];
//   const maxY   = Math.max(...allValues, 1);
//   const rangeY = maxY || 1;

//   const nTrain = data.train.dates.length;
//   const nTest  = data.test.dates.length;
//   const total  = nTrain + nTest + data.futur.dates.length;

//   const toX = (i) => PL + (i / (total - 1)) * chartW;
//   const toY = (v) => PT + chartH - (v / rangeY) * chartH;

//   const makePath = (values, offset) =>
//     values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(offset + i)} ${toY(v)}`).join(' ');

//   const xSepTest  = toX(nTrain);
//   const xSepFutur = toX(nTrain + nTest);
//   const yTicks    = [0, Math.round(maxY * 0.5), Math.round(maxY)];

//   return (
//     <div className="flex flex-col gap-3">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <span className="font-mono text-sm font-semibold text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
//             {arRef}
//           </span>
//           <span className="text-xs text-[#aaa]">Prévision AutoARIMA — J+30</span>
//         </div>
//         <button onClick={onClose}
//           className="text-xs text-[#888] hover:text-[#333] px-2 py-1 rounded border border-[#e0e0e0] hover:bg-[#f5f5f5] transition-all cursor-pointer">
//           ✕ Fermer
//         </button>
//       </div>

//       <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
//         {yTicks.map((v, i) => (
//           <g key={i}>
//             <line x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)}
//               stroke="#f0f0f0" strokeWidth="1" />
//             <text x={PL - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#aaa">{v}</text>
//           </g>
//         ))}

//         <line x1={xSepTest}  y1={PT} x2={xSepTest}  y2={H - PB} stroke="#c5c5c5" strokeWidth="1" strokeDasharray="4 3" />
//         <line x1={xSepFutur} y1={PT} x2={xSepFutur} y2={H - PB} stroke="#c5c5c5" strokeWidth="1" strokeDasharray="4 3" />
//         <text x={xSepTest + 4}  y={PT + 10} fontSize="9" fill="#aaa">test</text>
//         <text x={xSepFutur + 4} y={PT + 10} fontSize="9" fill="#aaa">futur</text>

//         <path d={makePath(data.train.values, 0)}
//           fill="none" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//         <path d={makePath(data.test.values_real, nTrain)}
//           fill="none" stroke="#3B6D11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//         <path d={makePath(data.test.values_pred, nTrain)}
//           fill="none" stroke="#EF9F27" strokeWidth="1.5" strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round" />
//         <path d={makePath(data.futur.values, nTrain + nTest)}
//           fill="none" stroke="#E24B4A" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round" strokeLinejoin="round" />
//       </svg>

//       <div className="flex gap-4 flex-wrap text-xs text-[#555]">
//         {[
//           { color: '#378ADD', label: 'Historique (train)', dash: false },
//           { color: '#3B6D11', label: 'Réel (test)',        dash: false },
//           { color: '#EF9F27', label: 'Prédit (test)',      dash: true  },
//           { color: '#E24B4A', label: 'Futur J+30',         dash: true  },
//         ].map(({ color, label, dash }) => (
//           <div key={label} className="flex items-center gap-1.5">
//             <svg width="20" height="8">
//               <line x1="0" y1="4" x2="20" y2="4" stroke={color} strokeWidth="2"
//                 strokeDasharray={dash ? '4 2' : undefined} />
//             </svg>
//             {label}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ── Onglet 1 : Prévision sorties (AutoARIMA) ──────────────────
// function TabPrevision({ data, baseName }) {
//   const rows          = data?.results?.prophet || [];
//   const [sortKey,     setSortKey]     = useState('MAPE');
//   const [selectedArt, setSelectedArt] = useState(null);

//   if (!rows.length) return (
//     <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
//       <TrendingUp size={36} className="mb-3" />
//       <p className="text-sm">Aucune donnée de prévision disponible</p>
//     </div>
//   );

//   const maeM      = (rows.reduce((s, r) => s + (Number(r.MAE) || 0), 0) / rows.length).toFixed(1);
//   const mapeValid = rows.filter(r => r.MAPE && !isNaN(r.MAPE));
//   const mapeM     = mapeValid.length
//     ? (mapeValid.reduce((s, r) => s + Number(r.MAPE), 0) / mapeValid.length).toFixed(1)
//     : null;

//   const sorted = [...rows].sort((a, b) => {
//     if (sortKey === 'MAPE') return (Number(a.MAPE) || 999) - (Number(b.MAPE) || 999);
//     if (sortKey === 'MAE')  return Number(a.MAE) - Number(b.MAE);
//     return 0;
//   });

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//         <KpiCard label="Modèle"           value="AutoARIMA"                    color="#185FA5" />
//         <KpiCard label="Articles prédits" value={rows.length}                  color="#0d0c0c" />
//         <KpiCard label="MAE moyen"        value={`${maeM} u/j`}               color="#854F0B" />
//         <KpiCard label="MAPE moyen"       value={mapeM ? `${mapeM}%` : 'N/A'} color="#3B6D11" />
//       </div>

//       {selectedArt && (
//         <div className="bg-white border border-[#e8e8e8] rounded-xl p-4">
//           <ForecastChart
//             baseName={baseName}
//             arRef={selectedArt}
//             onClose={() => setSelectedArt(null)}
//           />
//         </div>
//       )}

//       <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//         <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 rounded-full bg-[#12a6e0]" />
//             <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
//               Performances par article
//             </span>
//             <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
//               {rows.length} articles · cliquer pour voir le graphe
//             </span>
//           </div>
//           <div className="flex items-center gap-2 text-xs text-[#888]">
//             Trier par :
//             {['MAPE', 'MAE'].map(k => (
//               <button key={k} onClick={() => setSortKey(k)}
//                 className="px-2 py-1 rounded text-xs transition-all cursor-pointer"
//                 style={{
//                   background : sortKey === k ? '#E6F1FB' : '#f5f5f5',
//                   color      : sortKey === k ? '#185FA5' : '#666',
//                   fontWeight : sortKey === k ? 500 : 400,
//                 }}>
//                 {k}
//               </button>
//             ))}
//           </div>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm border-collapse">
//             <thead>
//               <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
//                 <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">MAE</th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">RMSE</th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">MAPE</th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Train</th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Test</th>
//               </tr>
//             </thead>
//             <tbody>
//               {sorted.map((r, i) => (
//                 <tr
//                   key={i}
//                   onClick={() => setSelectedArt(selectedArt === r.AR_Ref ? null : r.AR_Ref)}
//                   className="border-b border-[#f8f8f8] transition-colors cursor-pointer"
//                   style={{ background: selectedArt === r.AR_Ref ? 'rgba(18,166,224,0.06)' : undefined }}
//                   onMouseEnter={e => { if (selectedArt !== r.AR_Ref) e.currentTarget.style.background = 'rgba(18,166,224,0.03)'; }}
//                   onMouseLeave={e => { if (selectedArt !== r.AR_Ref) e.currentTarget.style.background = ''; }}
//                 >
//                   <td className="px-4 py-2.5">
//                     <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
//                       {r.AR_Ref}
//                     </span>
//                   </td>
//                   <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.MAE)}</td>
//                   <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.RMSE)}</td>
//                   <td className="px-4 py-2.5 text-right"><MAPEBadge value={r.MAPE} /></td>
//                   <td className="px-4 py-2.5 text-right text-[0.75rem] text-[#888]">{fmtNum(r.nb_train)}</td>
//                   <td className="px-4 py-2.5 text-right text-[0.75rem] text-[#888]">{fmtNum(r.nb_test)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Onglet 2 : Ruptures estimées (Random Forest) ──────────────
// function TabRuptures({ data }) {
//   const rows        = data?.results?.rf || [];
//   const importances = data?.results?.rf_importance || [];

//   if (!rows.length) return (
//     <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
//       <AlertTriangle size={36} className="mb-3" />
//       <p className="text-sm">Aucune donnée de rupture disponible</p>
//     </div>
//   );

//   const sorted = [...rows].sort((a, b) => (Number(a.jours_estimes) || 999) - (Number(b.jours_estimes) || 999));
//   const danger = sorted.filter(r => Number(r.jours_estimes) < 7).length;
//   const alerte = sorted.filter(r => Number(r.jours_estimes) >= 7 && Number(r.jours_estimes) < 30).length;
//   const ok     = sorted.filter(r => Number(r.jours_estimes) >= 30).length;
//   const maxImp = importances.length ? Math.max(...importances.map(i => Number(i.importance) || 0)) : 1;

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="grid grid-cols-3 gap-3">
//         <KpiCard label="Rupture critique (< 7j)" value={danger} color="#A32D2D" />
//         <KpiCard label="Alerte (7-30j)"           value={alerte} color="#854F0B" />
//         <KpiCard label="OK (> 30j)"               value={ok}     color="#3B6D11" />
//       </div>

//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//         <div className="lg:col-span-2 bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//           <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
//             <div className="w-2 h-2 rounded-full bg-[#e53935]" />
//             <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
//               Articles triés par urgence
//             </span>
//           </div>
//           <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
//             <table className="w-full text-sm border-collapse">
//               <thead className="sticky top-0">
//                 <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
//                   <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
//                   <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Jours estimés</th>
//                   <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Stock final</th>
//                   <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Rythme 7j</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {sorted.map((r, i) => (
//                   <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors">
//                     <td className="px-4 py-2.5">
//                       <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
//                         {r.AR_Ref}
//                       </span>
//                     </td>
//                     <td className="px-4 py-2.5 text-right"><RuptureBadge value={r.jours_estimes} /></td>
//                     <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.StockFinal)}</td>
//                     <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.rolling_mean_7)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {importances.length > 0 && (
//           <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//             <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
//               <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
//                 Feature importance
//               </span>
//             </div>
//             <div className="px-4 py-3 flex flex-col gap-2">
//               {[...importances]
//                 .sort((a, b) => Number(b.importance) - Number(a.importance))
//                 .map((imp, i) => (
//                   <div key={i}>
//                     <div className="flex justify-between text-xs mb-1">
//                       <span className="text-[#555] font-mono">{imp.feature}</span>
//                       <span className="text-[#888]">{(Number(imp.importance) * 100).toFixed(1)}%</span>
//                     </div>
//                     <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
//                       <div className="h-full rounded-full"
//                         style={{ width: `${(Number(imp.importance) / maxImp) * 100}%`, background: '#12a6e0' }} />
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Onglet 3 : Anomalies (Isolation Forest) ───────────────────
// function TabAnomalies({ data }) {
//   const rows = data?.results?.iforest || [];

//   if (!rows.length) return (
//     <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
//       <Radar size={36} className="mb-3" />
//       <p className="text-sm">Aucune donnée d'anomalie disponible</p>
//     </div>
//   );

//   const anomalies = rows.filter(r => r.is_anomalie === 1);
//   const pctAno    = ((anomalies.length / rows.length) * 100).toFixed(1);
//   const top20     = [...anomalies]
//     .sort((a, b) => Number(a.anomaly_score) - Number(b.anomaly_score))
//     .slice(0, 20);

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="grid grid-cols-3 gap-3">
//         <KpiCard label="Total analysés"    value={fmtNum(rows.length)}       color="#0d0c0c" />
//         <KpiCard label="Anomalies"         value={fmtNum(anomalies.length)}  color="#A32D2D" />
//         <KpiCard label="% anomalies"       value={`${pctAno}%`}             color="#854F0B" />
//       </div>

//       <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//         <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
//           <div className="w-2 h-2 rounded-full bg-[#e53935]" />
//           <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
//             Top 20 anomalies les plus sévères
//           </span>
//           <span className="bg-[#FCEBEB] text-[#791F1F] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
//             score bas = plus sévère
//           </span>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm border-collapse">
//             <thead>
//               <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
//                 <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Date</th>
//                 <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Total Sortie</th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Stock Final</th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Score</th>
//               </tr>
//             </thead>
//             <tbody>
//               {top20.map((r, i) => (
//                 <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(229,57,53,0.02)] transition-colors">
//                   <td className="px-4 py-2.5 font-mono text-[0.72rem] text-[#888]">
//                     {r.DateJour ? new Date(r.DateJour).toLocaleDateString('fr-FR') : '—'}
//                   </td>
//                   <td className="px-4 py-2.5">
//                     <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
//                       {r.AR_Ref}
//                     </span>
//                   </td>
//                   <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#b71c1c] font-semibold">{fmtNum(r.TotalSortie)}</td>
//                   <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.StockFinal)}</td>
//                   <td className="px-4 py-2.5 text-right">
//                     <span className="text-[0.72rem] font-mono text-[#854F0B] bg-[#FAEEDA] px-2 py-0.5 rounded">
//                       {Number(r.anomaly_score).toFixed(4)}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Onglet 4 : Segmentation (K-Means) ────────────────────────
// function TabSegmentation({ data }) {
//   const clusters = data?.results?.kmeans   || [];
//   const segments = data?.results?.segments || [];
//   const [filtre, setFiltre] = useState('');

//   if (!clusters.length) return (
//     <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
//       <Shapes size={36} className="mb-3" />
//       <p className="text-sm">Aucune donnée de segmentation disponible</p>
//     </div>
//   );

//   const segmentColors = {
//     'forte rotation'   : { bg: '#FCEBEB', text: '#791F1F', dot: '#e53935' },
//     'rotation moyenne' : { bg: '#FAEEDA', text: '#633806', dot: '#EF9F27' },
//     'faible rotation'  : { bg: '#E6F1FB', text: '#0C447C', dot: '#378ADD' },
//     'quasi-immobile'   : { bg: '#F1EFE8', text: '#444441', dot: '#888780' },
//   };
//   const getColor = (seg) => segmentColors[seg] || { bg: '#f0f0f0', text: '#555', dot: '#aaa' };

//   const articlesFiltres = filtre
//     ? segments.filter(s => s.segment === filtre)
//     : segments;

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//         {clusters.map((c, i) => {
//           const col = getColor(c.Segment);
//           return (
//             <div key={i} className="bg-white border rounded-xl px-4 py-3" style={{ borderColor: col.dot + '44' }}>
//               <div className="flex items-center gap-2 mb-1">
//                 <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.dot }} />
//                 <span className="text-[11px] font-semibold capitalize" style={{ color: col.text }}>{c.Segment}</span>
//               </div>
//               <p className="text-[1.4rem] font-bold m-0" style={{ color: col.dot }}>{fmtNum(c.Nb_articles)}</p>
//               <p className="text-[10px] text-[#aaa] mt-0.5">articles</p>
//             </div>
//           );
//         })}
//       </div>

//       {segments.length > 0 && (
//         <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//           <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-[#7F77DD]" />
//               <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
//                 Articles par segment
//               </span>
//               <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
//                 {articlesFiltres.length} articles
//               </span>
//             </div>
//             <div className="flex gap-1 flex-wrap">
//               <button onClick={() => setFiltre('')}
//                 className="px-2 py-1 text-xs rounded transition-all cursor-pointer"
//                 style={{ background: !filtre ? '#EEEDFE' : '#f5f5f5', color: !filtre ? '#3C3489' : '#666' }}>
//                 Tous
//               </button>
//               {clusters.map(c => {
//                 const col = getColor(c.Segment);
//                 return (
//                   <button key={c.Segment} onClick={() => setFiltre(c.Segment)}
//                     className="px-2 py-1 text-xs rounded capitalize transition-all cursor-pointer"
//                     style={{ background: filtre === c.Segment ? col.bg : '#f5f5f5', color: filtre === c.Segment ? col.text : '#666' }}>
//                     {c.Segment}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//           <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
//             <table className="w-full text-sm border-collapse">
//               <thead className="sticky top-0">
//                 <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
//                   <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
//                   <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Segment</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {articlesFiltres.map((s, i) => {
//                   const col = getColor(s.segment);
//                   return (
//                     <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors">
//                       <td className="px-4 py-2.5">
//                         <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
//                           {s.AR_Ref}
//                         </span>
//                       </td>
//                       <td className="px-4 py-2.5">
//                         <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
//                           style={{ background: col.bg, color: col.text }}>
//                           {s.segment}
//                         </span>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Onglets config ────────────────────────────────────────────
// const TABS = [
//   { id: 'prevision',    label: 'Prévision sorties', icon: TrendingUp    },
//   { id: 'ruptures',     label: 'Ruptures estimées', icon: AlertTriangle },
//   { id: 'anomalies',    label: 'Anomalies',         icon: Radar         },
//   { id: 'segmentation', label: 'Segmentation',      icon: Shapes        },
// ];

// // ── Page principale ───────────────────────────────────────────
// export default function AIPrevisions() {
//   const [bases,       setBases]       = useState([]);
//   const [baseName,    setBaseName]    = useState('');
//   const [activeTab,   setActiveTab]   = useState('prevision');
//   const [status,      setStatus]      = useState(null);
//   const [results,     setResults]     = useState(null);
//   const [loading,     setLoading]     = useState(false);
//   const [loadingBase, setLoadingBase] = useState(true);
//   const [error,       setError]       = useState(null);
//   const [polling,     setPolling]     = useState(false);

//   // Charger les bases
//   useEffect(() => {
//     fetchBases()
//       .then(data => {
//         setBases(data);
//         if (data.length > 0) setBaseName(data[0].BaseName);
//       })
//       .catch(e => setError(e.message))
//       .finally(() => setLoadingBase(false));
//   }, []);

//   // Charger statut + résultats quand la base change
//   const loadData = useCallback(async (base) => {
//     if (!base) return;
//     setLoading(true);
//     setError(null);
//     setResults(null);
//     try {
//       const st = await fetchPipelineStatus(base);
//       setStatus(st);
//       if (st.status === 'success') {
//         const res = await fetchPredictionResults(base);
//         setResults(res);
//       } else if (st.status === 'running') {
//         setPolling(true);
//       }
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (baseName) loadData(baseName);
//   }, [baseName, loadData]);

//   // Polling toutes les 5s si pipeline en cours
//   useEffect(() => {
//     if (!polling || !baseName) return;
//     const interval = setInterval(async () => {
//       try {
//         const st = await fetchPipelineStatus(baseName);
//         setStatus(st);
//         if (st.status === 'success') {
//           setPolling(false);
//           const res = await fetchPredictionResults(baseName);
//           setResults(res);
//         } else if (st.status === 'failed') {
//           setPolling(false);
//           setError('Le pipeline a échoué. Vérifiez les logs backend.');
//         }
//       } catch (e) {
//         setPolling(false);
//       }
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [polling, baseName]);

//   // Relancer le pipeline manuellement
//   const handleRunPipeline = async () => {
//     if (!baseName) return;
//     setError(null);
//     setResults(null);
//     setStatus({ status: 'running' });
//     setPolling(true);
//     try {
//       await runPipeline(baseName);
//     } catch (e) {
//       setError(e.message);
//       setPolling(false);
//     }
//   };

//   // Bandeau statut
//   const StatusBanner = () => {
//     if (!status) return null;
//     if (status.status === 'running' || polling) return (
//       <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
//         style={{ background: '#E6F1FB', borderColor: '#B5D4F4', color: '#0C447C' }}>
//         <Loader2 size={15} className="animate-spin flex-shrink-0" />
//         <span>Pipeline en cours pour <strong>{baseName}</strong>… Vérification toutes les 5s.</span>
//       </div>
//     );
//     if (status.status === 'success') return (
//       <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
//         style={{ background: '#EAF3DE', borderColor: '#C0DD97', color: '#27500A' }}>
//         <CheckCircle size={15} className="flex-shrink-0" />
//         <span>Prédictions disponibles pour <strong>{baseName}</strong>{status.duration_s ? ` — durée : ${status.duration_s}s` : ''}</span>
//       </div>
//     );
//     if (status.status === 'failed') return (
//       <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
//         style={{ background: '#FCEBEB', borderColor: '#F7C1C1', color: '#791F1F' }}>
//         <XCircle size={15} className="flex-shrink-0" />
//         <span>Pipeline échoué pour <strong>{baseName}</strong>. Relancez manuellement.</span>
//       </div>
//     );
//     if (status.status === 'not_started') return (
//       <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
//         style={{ background: '#FAEEDA', borderColor: '#FAC775', color: '#633806' }}>
//         <Clock size={15} className="flex-shrink-0" />
//         <span>Aucune prédiction pour <strong>{baseName}</strong>. Lancez le pipeline.</span>
//       </div>
//     );
//     return null;
//   };

//   return (
//     <div className="flex flex-col gap-4">

//       {/* En-tête */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-[1.1rem] font-semibold text-[#0d0c0c] m-0">Analyse prédictive</h1>
//           <p className="text-[0.8rem] text-[#aaaaaa] m-0 mt-0.5">
//             AutoARIMA · Random Forest · Isolation Forest · K-Means
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <BaseSelector
//             bases={bases}
//             value={baseName}
//             onChange={setBaseName}
//             loading={loadingBase}
//           />
//           <button
//             onClick={handleRunPipeline}
//             disabled={!baseName || polling}
//             className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
//             style={{
//               background  : polling ? '#f5f5f5' : 'white',
//               borderColor : '#e0e0e0',
//               color       : polling ? '#aaa' : '#555',
//               cursor      : polling ? 'not-allowed' : 'pointer',
//             }}
//             title="Relancer le pipeline ML"
//           >
//             <RefreshCw size={13} className={polling ? 'animate-spin' : ''} />
//             {polling ? 'En cours…' : 'Relancer'}
//           </button>
//         </div>
//       </div>

//       {/* Statut */}
//       <StatusBanner />

//       {/* Erreur */}
//       {error && (
//         <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
//           style={{ background: '#FCEBEB', borderColor: '#F7C1C1', color: '#791F1F' }}>
//           <XCircle size={15} className="flex-shrink-0" />
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Onglets */}
//       <div className="flex gap-1 border-b border-[#e8e8e8]">
//         {TABS.map(({ id, label, icon: Icon }) => (
//           <button
//             key={id}
//             onClick={() => setActiveTab(id)}
//             className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer"
//             style={{
//               borderBottomColor : activeTab === id ? '#12a6e0' : 'transparent',
//               color             : activeTab === id ? '#12a6e0' : '#888888',
//               background        : 'transparent',
//             }}
//           >
//             <Icon size={14} />
//             {label}
//           </button>
//         ))}
//       </div>

//       {/* Contenu */}
//       {loading ? (
//         <div className="flex items-center justify-center py-20 gap-3 text-[#12a6e0]">
//           <Loader2 size={20} className="animate-spin" />
//           <span className="text-sm">Chargement des prédictions…</span>
//         </div>
//       ) : (
//         <>
//           {activeTab === 'prevision'    && <TabPrevision    data={results} baseName={baseName} />}
//           {activeTab === 'ruptures'     && <TabRuptures     data={results} />}
//           {activeTab === 'anomalies'    && <TabAnomalies    data={results} />}
//           {activeTab === 'segmentation' && <TabSegmentation data={results} />}
//         </>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database, ChevronDown, Loader2,
  TrendingUp, AlertTriangle, Radar, Shapes,
  RefreshCw, CheckCircle, XCircle, Clock, BarChart2,
} from 'lucide-react';
import { fetchBases } from '../api/stockApi';
import { fetchPipelineStatus, fetchPredictionResults, runPipeline } from '../api/predictionsApi';

const fmtNum = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '—';
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n));
};

function MAPEBadge({ value }) {
  if (!value || isNaN(value)) return <span className="text-[#c5c5c5] text-xs">N/A</span>;
  const v = Number(value);
  const color = v < 30
    ? { bg: '#EAF3DE', text: '#27500A' }
    : v < 60
    ? { bg: '#FAEEDA', text: '#633806' }
    : { bg: '#FCEBEB', text: '#791F1F' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: color.bg, color: color.text }}>
      {v.toFixed(1)}%
    </span>
  );
}

function RuptureBadge({ value }) {
  if (!value || isNaN(value)) return <span className="text-[#c5c5c5] text-xs">—</span>;
  const v = Number(value);
  const color = v < 7
    ? { bg: '#FCEBEB', text: '#791F1F' }
    : v < 30
    ? { bg: '#FAEEDA', text: '#633806' }
    : { bg: '#EAF3DE', text: '#27500A' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: color.bg, color: color.text }}>
      {v.toFixed(0)}j
    </span>
  );
}

function KpiCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 border border-[#e8e8e8]">
      <p className="text-[11px] text-[#aaaaaa] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[1.4rem] font-bold m-0" style={{ color }}>{value}</p>
    </div>
  );
}

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    return Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
  }).filter(p => p >= 1 && p <= totalPages);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0]">
      <span className="text-[0.75rem] text-[#c5c5c5]">Page {page} / {totalPages}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] hover:bg-[#eaeaea] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
        >← Préc.</button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)}
            className="w-8 h-8 rounded-lg text-[0.75rem] transition-all cursor-pointer"
            style={{
              background: p === page ? '#12a6e0' : '#f5f5f5',
              color     : p === page ? 'white'   : '#666',
              border    : p === page ? 'none'    : '1px solid #e0e0e0',
              fontWeight: p === page ? 500       : 400,
            }}>
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] hover:bg-[#eaeaea] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
        >Suiv. →</button>
      </div>
    </div>
  );
}

function BaseSelector({ bases, value, onChange, loading }) {
  const [open, setOpen] = useState(false);
  const selected = bases.find(b => b.BaseName === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer"
        style={{
          background  : value ? '#E6F1FB' : 'white',
          borderColor : value ? '#B5D4F4' : '#e0e0e0',
          color       : value ? '#0C447C' : '#888888',
        }}
      >
        <Database size={14} />
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : (selected?.BaseLabel || selected?.BaseName || 'Sélectionner une base')}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-[#e0e0e0] rounded-lg shadow-lg z-50 min-w-[200px]">
          {bases.map(b => (
            <button key={b.BaseName}
              onClick={() => { onChange(b.BaseName); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#f2faff] transition-colors cursor-pointer"
              style={{ color: b.BaseName === value ? '#12a6e0' : '#333', fontWeight: b.BaseName === value ? 500 : 400 }}>
              {b.BaseLabel || b.BaseName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ForecastChart({ baseName, arRef, onClose }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    fetch(`${BASE_URL}/pipeline/forecast/${baseName}/${arRef}`)
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setData(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [baseName, arRef]);

  if (loading) return (
    <div className="flex items-center justify-center py-10 gap-3 text-[#12a6e0]">
      <Loader2 size={18} className="animate-spin" />
      <span className="text-sm">Génération des prédictions…</span>
    </div>
  );
  if (error) return (
    <div className="py-6 text-center text-sm text-[#b71c1c]">Erreur : {error}</div>
  );
  if (!data) return null;

  const W = 660, H = 200, PL = 48, PR = 16, PT = 16, PB = 32;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  const allValues = [
    ...data.train.values,
    ...data.test.values_real,
    ...data.test.values_pred,
    ...data.futur.values,
  ];
  const maxY   = Math.max(...allValues, 1);
  const nTrain = data.train.dates.length;
  const nTest  = data.test.dates.length;
  const total  = nTrain + nTest + data.futur.dates.length;

  const toX = (i) => PL + (i / (total - 1)) * chartW;
  const toY = (v) => PT + chartH - (v / maxY) * chartH;

  const makePath = (values, offset) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(offset + i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');

  const yTicks = [0, Math.round(maxY * 0.5), Math.round(maxY)];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
            {arRef}
          </span>
          <span className="text-xs text-[#aaa]">Prévision AutoARIMA — J+30</span>
        </div>
        <button onClick={onClose}
          className="text-xs text-[#888] hover:text-[#333] px-2 py-1 rounded border border-[#e0e0e0] hover:bg-[#f5f5f5] transition-all cursor-pointer">
          ✕ Fermer
        </button>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)} stroke="#f0f0f0" strokeWidth="1" />
            <text x={PL - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#aaa">{v}</text>
          </g>
        ))}
        <line x1={toX(nTrain)} y1={PT} x2={toX(nTrain)} y2={H - PB}
          stroke="#c5c5c5" strokeWidth="1" strokeDasharray="4 3" />
        <line x1={toX(nTrain + nTest)} y1={PT} x2={toX(nTrain + nTest)} y2={H - PB}
          stroke="#c5c5c5" strokeWidth="1" strokeDasharray="4 3" />
        <text x={toX(nTrain) + 4}       y={PT + 10} fontSize="9" fill="#aaa">test</text>
        <text x={toX(nTrain + nTest) + 4} y={PT + 10} fontSize="9" fill="#aaa">futur</text>

        <path d={makePath(data.train.values, 0)}
          fill="none" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={makePath(data.test.values_real, nTrain)}
          fill="none" stroke="#3B6D11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={makePath(data.test.values_pred, nTrain)}
          fill="none" stroke="#EF9F27" strokeWidth="1.5" strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={makePath(data.futur.values, nTrain + nTest)}
          fill="none" stroke="#E24B4A" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="flex gap-4 flex-wrap text-xs text-[#555]">
        {[
          { color: '#378ADD', label: 'Historique (train)', dash: false },
          { color: '#3B6D11', label: 'Réel (test)',        dash: false },
          { color: '#EF9F27', label: 'Prédit (test)',      dash: true  },
          { color: '#E24B4A', label: 'Futur J+30',         dash: true  },
        ].map(({ color, label, dash }) => (
          <div key={label} className="flex items-center gap-1.5">
            <svg width="20" height="8">
              <line x1="0" y1="4" x2="20" y2="4" stroke={color} strokeWidth="2"
                strokeDasharray={dash ? '4 2' : undefined} />
            </svg>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

const PAGE_SIZE_PROPHET = 20;

function TabPrevision({ data, baseName }) {
  const rows          = data?.results?.prophet || [];
  const [sortKey,     setSortKey]     = useState('MAPE');
  const [selectedArt, setSelectedArt] = useState(null);
  const [page,        setPage]        = useState(1);

  useEffect(() => { setPage(1); setSelectedArt(null); }, [data]);

  if (!rows.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <TrendingUp size={36} className="mb-3" />
      <p className="text-sm">Aucune donnée de prévision disponible</p>
    </div>
  );

  const maeM      = (rows.reduce((s, r) => s + (Number(r.MAE) || 0), 0) / rows.length).toFixed(1);
  const mapeValid = rows.filter(r => r.MAPE && !isNaN(r.MAPE));
  const mapeM     = mapeValid.length
    ? (mapeValid.reduce((s, r) => s + Number(r.MAPE), 0) / mapeValid.length).toFixed(1)
    : null;

  const sorted = [...rows].sort((a, b) => {
    if (sortKey === 'MAPE') return (Number(a.MAPE) || 999) - (Number(b.MAPE) || 999);
    return Number(a.MAE) - Number(b.MAE);
  });

  const paginated = sorted.slice((page - 1) * PAGE_SIZE_PROPHET, page * PAGE_SIZE_PROPHET);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Modèle"           value="AutoARIMA"                    color="#185FA5" />
        <KpiCard label="Articles prédits" value={rows.length}                  color="#0d0c0c" />
        <KpiCard label="MAE moyen"        value={`${maeM} u/j`}               color="#854F0B" />
        <KpiCard label="MAPE moyen"       value={mapeM ? `${mapeM}%` : 'N/A'} color="#3B6D11" />
      </div>

      {selectedArt && (
        <div className="bg-white border border-[#e8e8e8] rounded-xl p-4">
          <ForecastChart baseName={baseName} arRef={selectedArt} onClose={() => setSelectedArt(null)} />
        </div>
      )}

      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#12a6e0]" />
            <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
              Performances par article
            </span>
            <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
              {rows.length} articles
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#888]">
            Trier par :
            {['MAPE', 'MAE'].map(k => (
              <button key={k} onClick={() => { setSortKey(k); setPage(1); }}
                className="px-2 py-1 rounded text-xs transition-all cursor-pointer"
                style={{
                  background : sortKey === k ? '#E6F1FB' : '#f5f5f5',
                  color      : sortKey === k ? '#185FA5' : '#666',
                  fontWeight : sortKey === k ? 500 : 400,
                }}>
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
                <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">MAE</th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">RMSE</th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">MAPE</th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Train</th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Test</th>
                <th className="px-4 py-2.5 text-center text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Graphe</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, i) => (
                <tr key={i}
                  className="border-b border-[#f8f8f8] transition-colors"
                  style={{ background: selectedArt === r.AR_Ref ? 'rgba(18,166,224,0.06)' : undefined }}>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
                      {r.AR_Ref}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.MAE)}</td>
                  <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.RMSE)}</td>
                  <td className="px-4 py-2.5 text-right"><MAPEBadge value={r.MAPE} /></td>
                  <td className="px-4 py-2.5 text-right text-[0.75rem] text-[#888]">{fmtNum(r.nb_train)}</td>
                  <td className="px-4 py-2.5 text-right text-[0.75rem] text-[#888]">{fmtNum(r.nb_test)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => setSelectedArt(selectedArt === r.AR_Ref ? null : r.AR_Ref)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.7rem] font-medium transition-all cursor-pointer"
                      style={{
                        background  : selectedArt === r.AR_Ref ? '#E6F1FB' : '#f5f5f5',
                        color       : selectedArt === r.AR_Ref ? '#185FA5' : '#666',
                        border      : selectedArt === r.AR_Ref ? '1px solid #B5D4F4' : '1px solid #e0e0e0',
                      }}>
                      <BarChart2 size={11} />
                      {selectedArt === r.AR_Ref ? 'Fermer' : 'Voir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          total={rows.length}
          pageSize={PAGE_SIZE_PROPHET}
          onChange={setPage}
        />
      </div>
    </div>
  );
}

const PAGE_SIZE_RF = 20;

function TabRuptures({ data }) {
  const rows        = data?.results?.rf || [];
  const importances = data?.results?.rf_importance || [];
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [data]);

  if (!rows.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <AlertTriangle size={36} className="mb-3" />
      <p className="text-sm">Aucune donnée de rupture disponible</p>
    </div>
  );

  const sorted   = [...rows].sort((a, b) => (Number(a.jours_estimes) || 999) - (Number(b.jours_estimes) || 999));
  const danger   = sorted.filter(r => Number(r.jours_estimes) < 7).length;
  const alerte   = sorted.filter(r => Number(r.jours_estimes) >= 7 && Number(r.jours_estimes) < 30).length;
  const ok       = sorted.filter(r => Number(r.jours_estimes) >= 30).length;
  const maxImp   = importances.length ? Math.max(...importances.map(i => Number(i.importance) || 0)) : 1;
  const paginated = sorted.slice((page - 1) * PAGE_SIZE_RF, page * PAGE_SIZE_RF);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Rupture critique (< 7j)" value={danger} color="#A32D2D" />
        <KpiCard label="Alerte (7-30j)"           value={alerte} color="#854F0B" />
        <KpiCard label="OK (> 30j)"               value={ok}     color="#3B6D11" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
            <div className="w-2 h-2 rounded-full bg-[#e53935]" />
            <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
              Articles triés par urgence
            </span>
            <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
              {rows.length} articles
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
                  <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
                  <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Jours estimés</th>
                  <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Stock final</th>
                  <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Rythme 7j</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, i) => (
                  <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
                        {r.AR_Ref}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right"><RuptureBadge value={r.jours_estimes} /></td>
                    <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.StockFinal)}</td>
                    <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.rolling_mean_7)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE_RF} onChange={setPage} />
        </div>

        {importances.length > 0 && (
          <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
              <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
                Feature importance
              </span>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2">
              {[...importances].sort((a, b) => Number(b.importance) - Number(a.importance)).map((imp, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#555] font-mono">{imp.feature}</span>
                    <span className="text-[#888]">{(Number(imp.importance) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${(Number(imp.importance) / maxImp) * 100}%`, background: '#12a6e0' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PAGE_SIZE_IF = 20;

function TabAnomalies({ data }) {
  const rows   = data?.results?.iforest || [];
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [data]);

  if (!rows.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <Radar size={36} className="mb-3" />
      <p className="text-sm">Aucune donnée d'anomalie disponible</p>
    </div>
  );

  const anomalies = rows.filter(r => r.is_anomalie === 1);
  const pctAno    = ((anomalies.length / rows.length) * 100).toFixed(1);
  const top20     = [...anomalies].sort((a, b) => Number(a.anomaly_score) - Number(b.anomaly_score)).slice(0, 100);
  const paginated = top20.slice((page - 1) * PAGE_SIZE_IF, page * PAGE_SIZE_IF);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total analysés" value={fmtNum(rows.length)}      color="#0d0c0c" />
        <KpiCard label="Anomalies"      value={fmtNum(anomalies.length)} color="#A32D2D" />
        <KpiCard label="% anomalies"    value={`${pctAno}%`}            color="#854F0B" />
      </div>

      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
          <div className="w-2 h-2 rounded-full bg-[#e53935]" />
          <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
            Anomalies les plus sévères
          </span>
          <span className="bg-[#FCEBEB] text-[#791F1F] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
            score bas = plus sévère
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
                <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Date</th>
                <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Total Sortie</th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Stock Final</th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Score</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, i) => (
                <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(229,57,53,0.02)] transition-colors">
                  <td className="px-4 py-2.5 font-mono text-[0.72rem] text-[#888]">
                    {r.DateJour ? new Date(r.DateJour).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
                      {r.AR_Ref}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#b71c1c] font-semibold">{fmtNum(r.TotalSortie)}</td>
                  <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.StockFinal)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-[0.72rem] font-mono text-[#854F0B] bg-[#FAEEDA] px-2 py-0.5 rounded">
                      {Number(r.anomaly_score).toFixed(4)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={top20.length} pageSize={PAGE_SIZE_IF} onChange={setPage} />
      </div>
    </div>
  );
}

const PAGE_SIZE_SEG = 20;

function TabSegmentation({ data }) {
  const clusters = data?.results?.kmeans   || [];
  const segments = data?.results?.segments || [];
  const [filtre, setFiltre] = useState('');
  const [page,   setPage]   = useState(1);

  useEffect(() => { setPage(1); }, [data, filtre]);

  if (!clusters.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <Shapes size={36} className="mb-3" />
      <p className="text-sm">Aucune donnée de segmentation disponible</p>
    </div>
  );

  const segmentColors = {
    'forte rotation'   : { bg: '#FCEBEB', text: '#791F1F', dot: '#e53935' },
    'rotation moyenne' : { bg: '#FAEEDA', text: '#633806', dot: '#EF9F27' },
    'faible rotation'  : { bg: '#E6F1FB', text: '#0C447C', dot: '#378ADD' },
    'quasi-immobile'   : { bg: '#F1EFE8', text: '#444441', dot: '#888780' },
  };
  const getColor = (seg) => segmentColors[seg] || { bg: '#f0f0f0', text: '#555', dot: '#aaa' };

  const articlesFiltres = filtre ? segments.filter(s => s.segment === filtre) : segments;
  const paginated       = articlesFiltres.slice((page - 1) * PAGE_SIZE_SEG, page * PAGE_SIZE_SEG);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {clusters.map((c, i) => {
          const col = getColor(c.Segment);
          return (
            <div key={i} className="bg-white border rounded-xl px-4 py-3" style={{ borderColor: col.dot + '44' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.dot }} />
                <span className="text-[11px] font-semibold capitalize" style={{ color: col.text }}>{c.Segment}</span>
              </div>
              <p className="text-[1.4rem] font-bold m-0" style={{ color: col.dot }}>{fmtNum(c.Nb_articles)}</p>
              <p className="text-[10px] text-[#aaa] mt-0.5">articles</p>
            </div>
          );
        })}
      </div>

      {segments.length > 0 && (
        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#7F77DD]" />
              <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
                Articles par segment
              </span>
              <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
                {articlesFiltres.length} articles
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setFiltre('')}
                className="px-2 py-1 text-xs rounded transition-all cursor-pointer"
                style={{ background: !filtre ? '#EEEDFE' : '#f5f5f5', color: !filtre ? '#3C3489' : '#666' }}>
                Tous
              </button>
              {clusters.map(c => {
                const col = getColor(c.Segment);
                return (
                  <button key={c.Segment} onClick={() => setFiltre(c.Segment)}
                    className="px-2 py-1 text-xs rounded capitalize transition-all cursor-pointer"
                    style={{ background: filtre === c.Segment ? col.bg : '#f5f5f5', color: filtre === c.Segment ? col.text : '#666' }}>
                    {c.Segment}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
                  <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
                  <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Segment</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s, i) => {
                  const col = getColor(s.segment);
                  return (
                    <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors">
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
                          {s.AR_Ref}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: col.bg, color: col.text }}>
                          {s.segment}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={articlesFiltres.length} pageSize={PAGE_SIZE_SEG} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: 'prevision',    label: 'Prévision sorties', icon: TrendingUp    },
  { id: 'ruptures',     label: 'Ruptures estimées', icon: AlertTriangle },
  { id: 'anomalies',    label: 'Anomalies',         icon: Radar         },
  { id: 'segmentation', label: 'Segmentation',      icon: Shapes        },
];

export default function AIPrevisions() {
  const [bases,       setBases]       = useState([]);
  const [baseName,    setBaseName]    = useState('');
  const [activeTab,   setActiveTab]   = useState('prevision');
  const [status,      setStatus]      = useState(null);
  const [results,     setResults]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingBase, setLoadingBase] = useState(true);
  const [error,       setError]       = useState(null);
  const [polling,     setPolling]     = useState(false);

  useEffect(() => {
    fetchBases()
      .then(data => { setBases(data); if (data.length > 0) setBaseName(data[0].BaseName); })
      .catch(e => setError(e.message))
      .finally(() => setLoadingBase(false));
  }, []);

  const loadData = useCallback(async (base) => {
    if (!base) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const st = await fetchPipelineStatus(base);
      setStatus(st);
      if (st.status === 'success') {
        const res = await fetchPredictionResults(base);
        setResults(res);
      } else if (st.status === 'running') {
        setPolling(true);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (baseName) loadData(baseName); }, [baseName, loadData]);

  useEffect(() => {
    if (!polling || !baseName) return;
    const interval = setInterval(async () => {
      try {
        const st = await fetchPipelineStatus(baseName);
        setStatus(st);
        if (st.status === 'success') {
          setPolling(false);
          const res = await fetchPredictionResults(baseName);
          setResults(res);
        } else if (st.status === 'failed') {
          setPolling(false);
          setError('Le pipeline a échoué.');
        }
      } catch (e) { setPolling(false); }
    }, 5000);
    return () => clearInterval(interval);
  }, [polling, baseName]);

  const handleRunPipeline = async () => {
    if (!baseName) return;
    setError(null); setResults(null); setStatus({ status: 'running' }); setPolling(true);
    try { await runPipeline(baseName); }
    catch (e) { setError(e.message); setPolling(false); }
  };

  const StatusBanner = () => {
    if (!status) return null;
    if (status.status === 'running' || polling) return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
        style={{ background: '#E6F1FB', borderColor: '#B5D4F4', color: '#0C447C' }}>
        <Loader2 size={15} className="animate-spin flex-shrink-0" />
        <span>Pipeline en cours pour <strong>{baseName}</strong>… Vérification toutes les 5s.</span>
      </div>
    );
    if (status.status === 'success') return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
        style={{ background: '#EAF3DE', borderColor: '#C0DD97', color: '#27500A' }}>
        <CheckCircle size={15} className="flex-shrink-0" />
        <span>Prédictions disponibles pour <strong>{baseName}</strong>{status.duration_s ? ` — durée : ${status.duration_s}s` : ''}</span>
      </div>
    );
    if (status.status === 'failed') return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
        style={{ background: '#FCEBEB', borderColor: '#F7C1C1', color: '#791F1F' }}>
        <XCircle size={15} className="flex-shrink-0" />
        <span>Pipeline échoué pour <strong>{baseName}</strong>. Relancez manuellement.</span>
      </div>
    );
    if (status.status === 'not_started') return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
        style={{ background: '#FAEEDA', borderColor: '#FAC775', color: '#633806' }}>
        <Clock size={15} className="flex-shrink-0" />
        <span>Aucune prédiction pour <strong>{baseName}</strong>. Lancez le pipeline.</span>
      </div>
    );
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.1rem] font-semibold text-[#0d0c0c] m-0">Analyse prédictive</h1>
          <p className="text-[0.8rem] text-[#aaaaaa] m-0 mt-0.5">
            AutoARIMA · Random Forest · Isolation Forest · K-Means
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BaseSelector bases={bases} value={baseName} onChange={setBaseName} loading={loadingBase} />
          <button onClick={handleRunPipeline} disabled={!baseName || polling}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
            style={{
              background  : polling ? '#f5f5f5' : 'white',
              borderColor : '#e0e0e0',
              color       : polling ? '#aaa' : '#555',
              cursor      : polling ? 'not-allowed' : 'pointer',
            }}>
            <RefreshCw size={13} className={polling ? 'animate-spin' : ''} />
            {polling ? 'En cours…' : 'Relancer'}
          </button>
        </div>
      </div>

      <StatusBanner />

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
          style={{ background: '#FCEBEB', borderColor: '#F7C1C1', color: '#791F1F' }}>
          <XCircle size={15} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-1 border-b border-[#e8e8e8]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer"
            style={{
              borderBottomColor : activeTab === id ? '#12a6e0' : 'transparent',
              color             : activeTab === id ? '#12a6e0' : '#888888',
              background        : 'transparent',
            }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-[#12a6e0]">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Chargement des prédictions…</span>
        </div>
      ) : (
        <>
          {activeTab === 'prevision'    && <TabPrevision    data={results} baseName={baseName} />}
          {activeTab === 'ruptures'     && <TabRuptures     data={results} />}
          {activeTab === 'anomalies'    && <TabAnomalies    data={results} />}
          {activeTab === 'segmentation' && <TabSegmentation data={results} />}
        </>
      )}
    </div>
  );
}