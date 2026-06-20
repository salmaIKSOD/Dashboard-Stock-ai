// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Database, ChevronDown, Loader2,
//   TrendingUp, AlertTriangle, Radar, Shapes,
//   RefreshCw, CheckCircle, XCircle, Clock, BarChart2, Info,
// } from 'lucide-react';
// import { fetchBases } from '../api/stockApi';
// import { fetchPipelineStatus, fetchPredictionResults, runPipeline } from '../api/predictionsApi';

// const fmtNum = (n) => {
//   if (n === null || n === undefined || isNaN(Number(n))) return '—';
//   return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n));
// };

// const fmtDate = (d) => {
//   if (!d) return '—';
//   return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
// };

// // ── Tooltip ───────────────────────────────────────────────────
// function Tooltip({ text }) {
//   const [show, setShow] = useState(false);
//   return (
//     <span className="relative inline-flex items-center ml-1 cursor-help"
//       onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
//       <Info size={12} className="text-[#c5c5c5] hover:text-[#12a6e0] transition-colors" />
//       {show && (
//         <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-60 px-3 py-2 rounded-lg text-xs text-white leading-relaxed shadow-xl"
//           style={{ background: '#1a1a2e', whiteSpace: 'normal' }}>
//           {text}
//           <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: '#1a1a2e' }} />
//         </span>
//       )}
//     </span>
//   );
// }

// // ── Bandeau explication ───────────────────────────────────────
// function ExplainBanner({ icon: Icon, color, title, description, tip }) {
//   return (
//     <div className="rounded-xl border p-4 flex gap-4" style={{ background: `${color}08`, borderColor: `${color}25` }}>
//       <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
//         <Icon size={18} style={{ color }} />
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-[13px] font-semibold m-0 mb-1" style={{ color }}>{title}</p>
//         <p className="text-[12px] text-[#555] m-0 leading-relaxed">{description}</p>
//         {tip && <p className="text-[11px] text-[#888] m-0 mt-1.5 flex items-center gap-1"><Info size={11} className="flex-shrink-0" style={{ color }} />{tip}</p>}
//       </div>
//     </div>
//   );
// }

// function MAPEBadge({ value }) {
//   if (!value || isNaN(value)) return <span className="text-[#c5c5c5] text-xs">N/A</span>;
//   const v = Number(value);
//   const c = v < 30 ? { bg: '#EAF3DE', text: '#27500A' } : v < 60 ? { bg: '#FAEEDA', text: '#633806' } : { bg: '#FCEBEB', text: '#791F1F' };
//   return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>{v.toFixed(1)}%</span>;
// }

// function RuptureBadge({ value }) {
//   if (!value || isNaN(value)) return <span className="text-[#c5c5c5] text-xs">—</span>;
//   const v = Number(value);
//   const c = v < 7 ? { bg: '#FCEBEB', text: '#791F1F' } : v < 30 ? { bg: '#FAEEDA', text: '#633806' } : { bg: '#EAF3DE', text: '#27500A' };
//   return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>{v.toFixed(0)}j</span>;
// }

// function KpiCard({ label, value, color, hint, sub }) {
//   return (
//     <div className="bg-white rounded-xl px-4 py-3 border border-[#e8e8e8]">
//       <div className="flex items-center gap-1 mb-1">
//         <p className="text-[11px] text-[#aaaaaa] uppercase tracking-wide m-0">{label}</p>
//         {hint && <Tooltip text={hint} />}
//       </div>
//       <p className="text-[1.4rem] font-bold m-0" style={{ color }}>{value}</p>
//       {sub && <p className="text-[10px] text-[#aaa] mt-0.5 m-0">{sub}</p>}
//     </div>
//   );
// }

// function Pagination({ page, total, pageSize, onChange }) {
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));
//   if (totalPages <= 1) return null;
//   const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
//     Math.max(1, Math.min(totalPages - 4, page - 2)) + i
//   ).filter(p => p >= 1 && p <= totalPages);
//   return (
//     <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0]">
//       <span className="text-[0.75rem] text-[#c5c5c5]">Page {page} / {totalPages}</span>
//       <div className="flex items-center gap-1">
//         <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
//           className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] hover:bg-[#eaeaea] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer">← Préc.</button>
//         {pages.map(p => (
//           <button key={p} onClick={() => onChange(p)} className="w-8 h-8 rounded-lg text-[0.75rem] transition-all cursor-pointer"
//             style={{ background: p === page ? '#12a6e0' : '#f5f5f5', color: p === page ? 'white' : '#666', border: p === page ? 'none' : '1px solid #e0e0e0', fontWeight: p === page ? 500 : 400 }}>{p}</button>
//         ))}
//         <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
//           className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] hover:bg-[#eaeaea] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer">Suiv. →</button>
//       </div>
//     </div>
//   );
// }

// function BaseSelector({ bases, value, onChange, loading }) {
//   const [open, setOpen] = useState(false);
//   const selected = bases.find(b => b.BaseName === value);
//   return (
//     <div className="relative">
//       <button onClick={() => setOpen(o => !o)}
//         className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer"
//         style={{ background: value ? '#E6F1FB' : 'white', borderColor: value ? '#B5D4F4' : '#e0e0e0', color: value ? '#0C447C' : '#888888' }}>
//         <Database size={14} />
//         {loading ? <Loader2 size={14} className="animate-spin" /> : (selected?.BaseLabel || selected?.BaseName || 'Sélectionner une base')}
//         <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
//       </button>
//       {open && (
//         <div className="absolute top-full mt-1 left-0 bg-white border border-[#e0e0e0] rounded-lg shadow-lg z-50 min-w-[200px]">
//           {bases.map(b => (
//             <button key={b.BaseName} onClick={() => { onChange(b.BaseName); setOpen(false); }}
//               className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#f2faff] transition-colors cursor-pointer"
//               style={{ color: b.BaseName === value ? '#12a6e0' : '#333', fontWeight: b.BaseName === value ? 500 : 400 }}>
//               {b.BaseLabel || b.BaseName}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Graphe prévision article ENRICHI ─────────────────────────
// function ForecastChart({ baseName, arRef, onClose }) {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
//     fetch(`${BASE_URL}/pipeline/forecast/${baseName}/${arRef}`)
//       .then(r => r.json())
//       .then(d => { if (d.error) throw new Error(d.error); setData(d); })
//       .catch(e => setError(e.message))
//       .finally(() => setLoading(false));
//   }, [baseName, arRef]);

//   if (loading) return (
//     <div className="flex items-center justify-center py-10 gap-3 text-[#12a6e0]">
//       <Loader2 size={18} className="animate-spin" /><span className="text-sm">Calcul des prévisions en cours…</span>
//     </div>
//   );
//   if (error) return <div className="py-6 text-center text-sm text-[#b71c1c]">Erreur : {error}</div>;
//   if (!data) return null;

//   // ── Calculs résumé futur ──────────────────────────────────
//   const futurValues  = data.futur.values;
//   const futurDates   = data.futur.dates;
//   const moyenneFutur = futurValues.length > 0 ? futurValues.reduce((a, b) => a + b, 0) / futurValues.length : 0;
//   const totalFutur   = futurValues.reduce((a, b) => a + b, 0);
//   const picFutur     = Math.max(...futurValues, 0);
//   const picIndex     = futurValues.indexOf(picFutur);
//   const picDate      = futurDates[picIndex] || '';

//   // ── Prochains 7 jours ────────────────────────────────────
//   const prochains7   = futurValues.slice(0, 7).map((v, i) => ({ date: futurDates[i], valeur: v }));

//   // ── SVG ──────────────────────────────────────────────────
//   const W = 660, H = 200, PL = 48, PR = 16, PT = 16, PB = 32;
//   const chartW = W - PL - PR, chartH = H - PT - PB;
//   const allValues = [...data.train.values, ...data.test.values_real, ...data.test.values_pred, ...data.futur.values];
//   const maxY = Math.max(...allValues, 1);
//   const nTrain = data.train.dates.length, nTest = data.test.dates.length;
//   const total = nTrain + nTest + data.futur.dates.length;
//   const toX = (i) => PL + (i / (total - 1)) * chartW;
//   const toY = (v) => PT + chartH - (v / maxY) * chartH;
//   const makePath = (values, offset) =>
//     values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(offset + i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');
//   const yTicks = [0, Math.round(maxY * 0.5), Math.round(maxY)];

//   // Zone futur colorée
//   const futurStart = toX(nTrain + nTest);
//   const futurEnd   = toX(total - 1);

//   return (
//     <div className="flex flex-col gap-4">
//       {/* En-tête */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <span className="font-mono text-sm font-semibold text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{arRef}</span>
//           <span className="text-xs text-[#aaa]">Prévision AutoARIMA — 30 prochains jours</span>
//         </div>
//         <button onClick={onClose} className="text-xs text-[#888] hover:text-[#333] px-2 py-1 rounded border border-[#e0e0e0] hover:bg-[#f5f5f5] transition-all cursor-pointer">✕ Fermer</button>
//       </div>

//       {/* KPIs futur */}
//       <div className="grid grid-cols-3 gap-3">
//         <div className="rounded-xl px-4 py-3 border" style={{ background: '#FFF3E0', borderColor: '#FFB74D44' }}>
//           <p className="text-[11px] text-[#854F0B] uppercase tracking-wide m-0 mb-1">Moyenne prévue / jour</p>
//           <p className="text-[1.3rem] font-bold m-0 text-[#854F0B]">{moyenneFutur.toFixed(1)} <span className="text-sm font-normal">unités</span></p>
//           <p className="text-[10px] text-[#aaa] mt-0.5">sur les 30 prochains jours</p>
//         </div>
//         <div className="rounded-xl px-4 py-3 border" style={{ background: '#E8F5E9', borderColor: '#66BB6A44' }}>
//           <p className="text-[11px] text-[#2E7D32] uppercase tracking-wide m-0 mb-1">Total prévu J+30</p>
//           <p className="text-[1.3rem] font-bold m-0 text-[#2E7D32]">{Math.round(totalFutur)} <span className="text-sm font-normal">unités</span></p>
//           <p className="text-[10px] text-[#aaa] mt-0.5">quantité à prévoir en stock</p>
//         </div>
//         <div className="rounded-xl px-4 py-3 border" style={{ background: '#FFEBEE', borderColor: '#EF9A9A44' }}>
//           <p className="text-[11px] text-[#C62828] uppercase tracking-wide m-0 mb-1">Pic prévu</p>
//           <p className="text-[1.3rem] font-bold m-0 text-[#C62828]">{picFutur.toFixed(1)} <span className="text-sm font-normal">unités</span></p>
//           <p className="text-[10px] text-[#aaa] mt-0.5">{picDate ? `le ${fmtDate(picDate)}` : '—'}</p>
//         </div>
//       </div>

//       {/* Graphe SVG */}
//       <div className="bg-[#fafafa] rounded-xl p-3">
//         <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
//           {/* Zone futur colorée */}
//           <rect x={futurStart} y={PT} width={futurEnd - futurStart} height={chartH} fill="#FFF3E0" opacity="0.5" rx="2" />

//           {/* Grille */}
//           {yTicks.map((v, i) => (
//             <g key={i}>
//               <line x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)} stroke="#e8e8e8" strokeWidth="1" />
//               <text x={PL - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#aaa">{v}</text>
//             </g>
//           ))}

//           {/* Séparateurs */}
//           <line x1={toX(nTrain)} y1={PT} x2={toX(nTrain)} y2={H - PB} stroke="#c5c5c5" strokeWidth="1" strokeDasharray="4 3" />
//           <line x1={toX(nTrain + nTest)} y1={PT} x2={toX(nTrain + nTest)} y2={H - PB} stroke="#EF9F27" strokeWidth="1.5" strokeDasharray="4 3" />

//           {/* Labels zones */}
//           <text x={(PL + toX(nTrain)) / 2} y={PT + 12} textAnchor="middle" fontSize="9" fill="#888">HISTORIQUE</text>
//           <text x={(toX(nTrain) + toX(nTrain + nTest)) / 2} y={PT + 12} textAnchor="middle" fontSize="9" fill="#888">TEST</text>
//           <text x={(toX(nTrain + nTest) + (W - PR)) / 2} y={PT + 12} textAnchor="middle" fontSize="9" fill="#EF9F27" fontWeight="600">PRÉVISION J+30</text>

//           {/* Courbes */}
//           <path d={makePath(data.train.values, 0)} fill="none" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           <path d={makePath(data.test.values_real, nTrain)} fill="none" stroke="#3B6D11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           <path d={makePath(data.test.values_pred, nTrain)} fill="none" stroke="#EF9F27" strokeWidth="1.5" strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round" />
//           <path d={makePath(data.futur.values, nTrain + nTest)} fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

//           {/* Ligne moyenne futur */}
//           {moyenneFutur > 0 && (
//             <>
//               <line x1={toX(nTrain + nTest)} y1={toY(moyenneFutur)} x2={W - PR} y2={toY(moyenneFutur)}
//                 stroke="#E24B4A" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
//               <text x={W - PR + 4} y={toY(moyenneFutur) + 4} fontSize="9" fill="#E24B4A">moy.</text>
//             </>
//           )}
//         </svg>
//       </div>

//       {/* Légende */}
//       <div className="flex gap-4 flex-wrap text-xs text-[#555]">
//         {[
//           { color: '#378ADD', label: 'Historique — données passées utilisées pour entraîner le modèle', dash: false },
//           { color: '#3B6D11', label: 'Réel (test) — ce qui s\'est réellement passé', dash: false },
//           { color: '#EF9F27', label: 'Prédit (test) — estimation du modèle sur cette période', dash: true },
//           { color: '#E24B4A', label: 'Prévision J+30 — ce que le modèle anticipe dans le futur', dash: true },
//         ].map(({ color, label, dash }) => (
//           <div key={label} className="flex items-center gap-1.5">
//             <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke={color} strokeWidth="2" strokeDasharray={dash ? '4 2' : undefined} /></svg>
//             <span>{label}</span>
//           </div>
//         ))}
//       </div>

//       {/* Message interprétation */}
//       <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
//         <div className="rounded-lg px-3 py-2.5 text-[12px] text-[#555] leading-relaxed"
//           style={{ background: '#f0f9ff', borderLeft: '3px solid #378ADD' }}>
//           <strong className="text-[#185FA5]">Comment valider le modèle :</strong> Comparez la courbe <span className="font-semibold" style={{ color: '#EF9F27' }}>orange (prédit)</span> avec la courbe <span className="font-semibold" style={{ color: '#3B6D11' }}>verte (réel)</span> sur la zone TEST. Si elles se suivent bien → le modèle est fiable et la prévision J+30 est crédible.
//         </div>
//         <div className="rounded-lg px-3 py-2.5 text-[12px] text-[#555] leading-relaxed"
//           style={{ background: '#fff8f0', borderLeft: '3px solid #E24B4A' }}>
//           <strong className="text-[#C62828]">Comment utiliser la prévision :</strong> La zone <span className="font-semibold" style={{ color: '#E24B4A' }}>rouge (J+30)</span> indique combien d'unités vont sortir chaque jour. Utilisez le <strong>Total prévu = {Math.round(totalFutur)} unités</strong> pour planifier votre prochaine commande fournisseur.
//         </div>
//       </div>

//       {/* Tableau 7 prochains jours */}
//       {prochains7.length > 0 && (
//         <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//           <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
//             <div className="w-2 h-2 rounded-full bg-[#E24B4A]" />
//             <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
//               Prévision détaillée — 7 prochains jours
//             </span>
//             <span className="text-[11px] text-[#aaa]">Quantité estimée à sortir chaque jour</span>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm border-collapse">
//               <thead>
//                 <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
//                   <th className="px-4 py-2 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Date</th>
//                   <th className="px-4 py-2 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Quantité prévue</th>
//                   <th className="px-4 py-2 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Niveau</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {prochains7.map((j, i) => {
//                   const pct = moyenneFutur > 0 ? j.valeur / Math.max(...futurValues, 1) : 0;
//                   const color = j.valeur > moyenneFutur * 1.3 ? '#E24B4A' : j.valeur > moyenneFutur * 0.7 ? '#EF9F27' : '#3B6D11';
//                   return (
//                     <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.02)]">
//                       <td className="px-4 py-2.5 font-mono text-[0.75rem] text-[#555]">{fmtDate(j.date)}</td>
//                       <td className="px-4 py-2.5 text-right">
//                         <span className="font-semibold text-[0.9rem]" style={{ color }}>{j.valeur.toFixed(1)}</span>
//                         <span className="text-[#aaa] text-xs ml-1">unités</span>
//                       </td>
//                       <td className="px-4 py-2.5">
//                         <div className="flex items-center gap-2">
//                           <div className="h-2 rounded-full" style={{ width: `${Math.max(4, pct * 100)}px`, background: color, maxWidth: '120px' }} />
//                           <span className="text-[10px] text-[#aaa]">
//                             {j.valeur > moyenneFutur * 1.3 ? '↑ pic' : j.valeur < moyenneFutur * 0.7 ? '↓ creux' : 'normal'}
//                           </span>
//                         </div>
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

// // ── Graphe barres ruptures ────────────────────────────────────
// function RuptureBarChart({ rows }) {
//   const top15 = [...rows].filter(r => !isNaN(r.jours_estimes)).sort((a, b) => Number(a.jours_estimes) - Number(b.jours_estimes)).slice(0, 15);
//   if (!top15.length) return null;
//   const maxVal = Math.max(...top15.map(r => Number(r.jours_estimes)), 1);
//   const W = 640, barH = 24, gap = 6, PL = 110, PR = 70, PT = 10;
//   const H = PT + top15.length * (barH + gap);
//   const getColor = (v) => v < 7 ? '#E24B4A' : v < 30 ? '#EF9F27' : '#639922';
//   const getLabel = (v) => v < 7 ? '🔴 Urgent' : v < 30 ? '🟡 Alerte' : '🟢 OK';

//   return (
//     <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//       <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
//         <div className="flex items-center gap-2">
//           <div className="w-2 h-2 rounded-full bg-[#e53935]" />
//           <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Jours avant rupture — Top 15 articles les plus urgents</span>
//         </div>
//         <span className="text-[11px] text-[#aaa]">Barre courte = commander en urgence</span>
//       </div>
//       <div className="p-4">
//         <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
//           {top15.map((r, i) => {
//             const v   = Number(r.jours_estimes);
//             const y   = PT + i * (barH + gap);
//             const bw  = Math.max(4, (v / maxVal) * (W - PL - PR));
//             const col = getColor(v);
//             return (
//               <g key={i}>
//                 <text x={PL - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize="11" fill="#555">
//                   {String(r.AR_Ref).length > 12 ? String(r.AR_Ref).slice(0, 12) + '…' : r.AR_Ref}
//                 </text>
//                 <rect x={PL} y={y} width={bw} height={barH} rx="5" fill={col} opacity="0.85" />
//                 <text x={PL + bw + 6} y={y + barH / 2 + 4} fontSize="11" fill={col} fontWeight="600">{v.toFixed(0)} jours</text>
//               </g>
//             );
//           })}
//           <line x1={PL} y1={PT} x2={PL} y2={H} stroke="#e8e8e8" strokeWidth="1" />
//         </svg>
//         <div className="flex gap-5 mt-3 text-xs text-[#555]">
//           {[{ color: '#E24B4A', label: 'Critique — moins de 7 jours → commander maintenant' },
//             { color: '#EF9F27', label: 'Alerte — 7 à 30 jours → planifier une commande' },
//             { color: '#639922', label: 'OK — plus de 30 jours → stock suffisant' }].map(({ color, label }) => (
//             <div key={label} className="flex items-center gap-1.5">
//               <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
//               <span>{label}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Graphe donut segmentation ─────────────────────────────────
// function SegmentDonut({ clusters }) {
//   if (!clusters.length) return null;
//   const COLORS = { 'forte rotation': '#E24B4A', 'rotation moyenne': '#EF9F27', 'faible rotation': '#378ADD', 'quasi-immobile': '#888780' };
//   const total = clusters.reduce((s, c) => s + Number(c.Nb_articles), 0);
//   const CX = 100, CY = 100, R = 80, r = 48;
//   let angle = -Math.PI / 2;
//   const slices = clusters.map(c => {
//     const nb = Number(c.Nb_articles), pct = nb / total, sweep = pct * 2 * Math.PI;
//     const x1 = CX + R * Math.cos(angle), y1 = CY + R * Math.sin(angle);
//     angle += sweep;
//     const x2 = CX + R * Math.cos(angle), y2 = CY + R * Math.sin(angle);
//     const large = sweep > Math.PI ? 1 : 0;
//     const xi1 = CX + r * Math.cos(angle - sweep), yi1 = CY + r * Math.sin(angle - sweep);
//     const xi2 = CX + r * Math.cos(angle), yi2 = CY + r * Math.sin(angle);
//     const color = COLORS[c.Segment] || '#aaa';
//     return { d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${r} ${r} 0 ${large} 0 ${xi1} ${yi1} Z`, color, nb, pct: Math.round(pct * 100), label: c.Segment };
//   });
//   return (
//     <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//       <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
//         <div className="w-2 h-2 rounded-full bg-[#7F77DD]" />
//         <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Répartition des articles par segment</span>
//       </div>
//       <div className="flex items-center gap-6 p-4">
//         <svg width="200" height="200" viewBox="0 0 200 200">
//           {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} opacity="0.85" stroke="white" strokeWidth="2" />)}
//           <text x={CX} y={CY - 6} textAnchor="middle" fontSize="20" fontWeight="600" fill="#0d0c0c">{total}</text>
//           <text x={CX} y={CY + 14} textAnchor="middle" fontSize="11" fill="#aaa">articles</text>
//         </svg>
//         <div className="flex flex-col gap-3 flex-1">
//           {slices.map((s, i) => (
//             <div key={i} className="flex items-center justify-between gap-3">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
//                 <span className="text-xs capitalize text-[#555]">{s.label}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-xs font-semibold text-[#0d0c0c]">{s.nb} articles</span>
//                 <span className="text-[10px] text-[#aaa]">{s.pct}%</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Graphe barres segments ────────────────────────────────────
// function SegmentBarChart({ clusters, segments }) {
//   if (!clusters.length || !segments.length) return null;
//   const COLORS = { 'forte rotation': '#E24B4A', 'rotation moyenne': '#EF9F27', 'faible rotation': '#378ADD', 'quasi-immobile': '#888780' };
//   const DESCRIPTIONS = {
//     'forte rotation'   : 'Articles très demandés — réapprovisionner en priorité',
//     'rotation moyenne' : 'Articles avec activité régulière — surveiller le stock',
//     'faible rotation'  : 'Articles peu demandés — commandes ponctuelles',
//     'quasi-immobile'   : 'Articles presque jamais vendus — envisager liquidation',
//   };

//   const maxNb = Math.max(...clusters.map(c => Number(c.Nb_articles)), 1);
//   const W = 600, barH = 40, gap = 16, PL = 160, PR = 80, PT = 10;
//   const H = PT + clusters.length * (barH + gap);

//   return (
//     <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//       <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
//         <div className="w-2 h-2 rounded-full bg-[#7F77DD]" />
//         <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Nombre d'articles par segment — avec explication</span>
//       </div>
//       <div className="p-4">
//         <svg width="100%" viewBox={`0 0 ${W} ${H + 10}`}>
//           {clusters.map((c, i) => {
//             const nb   = Number(c.Nb_articles);
//             const y    = PT + i * (barH + gap);
//             const bw   = Math.max(8, (nb / maxNb) * (W - PL - PR));
//             const col  = COLORS[c.Segment] || '#aaa';
//             const desc = DESCRIPTIONS[c.Segment] || '';
//             return (
//               <g key={i}>
//                 {/* Nom segment */}
//                 <text x={PL - 8} y={y + 14} textAnchor="end" fontSize="12" fill="#333" fontWeight="500" className="capitalize">{c.Segment}</text>
//                 {/* Description */}
//                 <text x={PL - 8} y={y + 28} textAnchor="end" fontSize="9" fill="#aaa">{desc.slice(0, 35)}</text>
//                 {/* Barre */}
//                 <rect x={PL} y={y} width={bw} height={barH} rx="6" fill={col} opacity="0.8" />
//                 {/* Nb articles dans la barre */}
//                 <text x={PL + bw / 2} y={y + barH / 2 + 5} textAnchor="middle" fontSize="13" fill="white" fontWeight="700">{nb}</text>
//                 <text x={PL + bw + 8} y={y + 14} fontSize="12" fill={col} fontWeight="600">{nb} articles</text>
//                 <text x={PL + bw + 8} y={y + 28} fontSize="10" fill="#aaa">{Math.round(nb / clusters.reduce((s, x) => s + Number(x.Nb_articles), 0) * 100)}% du catalogue</text>
//               </g>
//             );
//           })}
//         </svg>
//       </div>
//     </div>
//   );
// }

// // ── Graphe scatter anomalies ──────────────────────────────────
// function AnomalyScatter({ rows }) {
//   const sample    = rows.slice(0, 2000);
//   const normales  = sample.filter(r => r.is_anomalie === 0);
//   const anomalies = sample.filter(r => r.is_anomalie === 1);
//   const allX = sample.map(r => Number(r.TotalSortie) || 0);
//   const allY = sample.map(r => Number(r.StockFinal)  || 0);
//   const maxX = Math.max(...allX, 1), maxY = Math.max(...allY, 1);
//   const W = 500, H = 260, PL = 55, PR = 20, PT = 20, PB = 45;
//   const cw = W - PL - PR, ch = H - PT - PB;
//   const tx = (v) => PL + (v / maxX) * cw;
//   const ty = (v) => PT + ch - (v / maxY) * ch;
//   const xTicks = [0, Math.round(maxX * 0.5), Math.round(maxX)];
//   const yTicks = [0, Math.round(maxY * 0.5), Math.round(maxY)];

//   return (
//     <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//       <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
//         <div className="flex items-center gap-2">
//           <div className="w-2 h-2 rounded-full bg-[#e53935]" />
//           <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Carte des mouvements — Quantité sortie vs Stock restant</span>
//         </div>
//         <span className="text-[11px] text-[#aaa]">{sample.length} mouvements analysés</span>
//       </div>
//       <div className="p-4">
//         <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
//           {yTicks.map((v, i) => (
//             <g key={i}>
//               <line x1={PL} y1={ty(v)} x2={W - PR} y2={ty(v)} stroke="#f0f0f0" strokeWidth="1" />
//               <text x={PL - 5} y={ty(v) + 4} textAnchor="end" fontSize="9" fill="#aaa">{v}</text>
//             </g>
//           ))}
//           {xTicks.map((v, i) => (
//             <g key={i}>
//               <line x1={tx(v)} y1={PT} x2={tx(v)} y2={H - PB} stroke="#f0f0f0" strokeWidth="1" />
//               <text x={tx(v)} y={H - PB + 14} textAnchor="middle" fontSize="9" fill="#aaa">{v}</text>
//             </g>
//           ))}
//           <text x={W / 2} y={H - 5} textAnchor="middle" fontSize="10" fill="#888">← Quantité sortie →</text>
//           <text x={12} y={H / 2} textAnchor="middle" fontSize="10" fill="#888" transform={`rotate(-90, 12, ${H / 2})`}>← Stock restant →</text>
//           {normales.map((r, i) => (
//             <circle key={i} cx={tx(Number(r.TotalSortie) || 0)} cy={ty(Number(r.StockFinal) || 0)} r="2.5" fill="#378ADD" opacity="0.2" />
//           ))}
//           {anomalies.map((r, i) => (
//             <circle key={i} cx={tx(Number(r.TotalSortie) || 0)} cy={ty(Number(r.StockFinal) || 0)} r="4" fill="#E24B4A" opacity="0.75" stroke="white" strokeWidth="0.5" />
//           ))}
//         </svg>
//         <div className="flex gap-5 mt-2 text-xs text-[#555] flex-wrap">
//           <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#378ADD] opacity-50" />Normal ({normales.length}) — mouvements habituels</div>
//           <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#E24B4A]" />Anomalie ({anomalies.length}) — mouvements suspects à vérifier</div>
//         </div>
//         <div className="rounded-lg px-3 py-2.5 text-[12px] text-[#555] leading-relaxed mt-3"
//           style={{ background: '#fff8f0', borderLeft: '3px solid #E24B4A' }}>
//           <strong className="text-[#C62828]">Comment lire ce graphe :</strong> Chaque point = un mouvement de stock. <span className="font-semibold text-[#E24B4A]">Les points rouges</span> sont des journées où la quantité sortie ou le stock restant était anormalement élevé ou bas par rapport au comportement habituel de cet article. Ces journées méritent une vérification manuelle dans SAGE.
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Onglet 1 : Prévision sorties ─────────────────────────────
// const PAGE_SIZE = 20;

// function TabPrevision({ data, baseName }) {
//   const rows = data?.results?.prophet || [];
//   const [sortKey, setSortKey] = useState('MAPE');
//   const [selectedArt, setSelectedArt] = useState(null);
//   const [page, setPage] = useState(1);
//   useEffect(() => { setPage(1); setSelectedArt(null); }, [data]);

//   if (!rows.length) return (
//     <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
//       <TrendingUp size={36} className="mb-3" /><p className="text-sm">Aucune donnée de prévision disponible</p>
//     </div>
//   );

//   const maeM      = (rows.reduce((s, r) => s + (Number(r.MAE) || 0), 0) / rows.length).toFixed(1);
//   const mapeValid = rows.filter(r => r.MAPE && !isNaN(r.MAPE));
//   const mapeM     = mapeValid.length ? (mapeValid.reduce((s, r) => s + Number(r.MAPE), 0) / mapeValid.length).toFixed(1) : null;
//   const sorted    = [...rows].sort((a, b) => sortKey === 'MAPE' ? (Number(a.MAPE) || 999) - (Number(b.MAPE) || 999) : Number(a.MAE) - Number(b.MAE));
//   const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   return (
//     <div className="flex flex-col gap-4">
//       <ExplainBanner icon={TrendingUp} color="#12a6e0"
//         title="Prévision des sorties — AutoARIMA"
//         description="Ce modèle prédit combien d'unités vont sortir du stock dans les 30 prochains jours pour chaque article important. Il analyse automatiquement les tendances passées, les cycles hebdomadaires et les variations saisonnières pour faire ses prévisions."
//         tip="Cliquez sur « Voir » pour afficher le graphe détaillé d'un article avec le tableau des 7 prochains jours." />

//       <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//         <KpiCard label="Modèle" value="AutoARIMA" color="#185FA5" hint="Modèle statistique de prévision de séries temporelles — détecte automatiquement les tendances et cycles." />
//         <KpiCard label="Articles prédits" value={rows.length} color="#0d0c0c" hint="Nombre d'articles sélectionnés par la règle Pareto 80% — les plus importants en volume de sorties." sub="top 80% des sorties" />
//         <KpiCard label="MAE moyen" value={`${maeM} u/j`} color="#854F0B" hint="Erreur absolue moyenne : en moyenne le modèle se trompe de X unités par jour. Plus c'est bas = plus précis." sub="erreur moyenne / jour" />
//         <KpiCard label="MAPE moyen" value={mapeM ? `${mapeM}%` : 'N/A'} color="#3B6D11" hint="Erreur en % : Vert < 30% = excellent, Orange = acceptable, Rouge = à améliorer. N/A si sorties = 0." sub={mapeM ? (Number(mapeM) < 30 ? '✅ Excellente précision' : Number(mapeM) < 60 ? '⚠️ Précision acceptable' : '❌ À améliorer') : 'Sorties nulles'} />
//       </div>

//       {selectedArt && (
//         <div className="bg-white border border-[#e8e8e8] rounded-xl p-4">
//           <ForecastChart baseName={baseName} arRef={selectedArt} onClose={() => setSelectedArt(null)} />
//         </div>
//       )}

//       <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//         <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 rounded-full bg-[#12a6e0]" />
//             <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Performances par article</span>
//             <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{rows.length} articles</span>
//           </div>
//           <div className="flex items-center gap-2 text-xs text-[#888]">
//             Trier par :
//             {['MAPE', 'MAE'].map(k => (
//               <button key={k} onClick={() => { setSortKey(k); setPage(1); }}
//                 className="px-2 py-1 rounded text-xs transition-all cursor-pointer"
//                 style={{ background: sortKey === k ? '#E6F1FB' : '#f5f5f5', color: sortKey === k ? '#185FA5' : '#666', fontWeight: sortKey === k ? 500 : 400 }}>{k}</button>
//             ))}
//           </div>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm border-collapse">
//             <thead>
//               <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
//                 <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">MAE <Tooltip text="Erreur absolue moyenne en unités/jour. Plus bas = plus précis." /></th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">RMSE <Tooltip text="Erreur quadratique — pénalise les grandes erreurs." /></th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">MAPE <Tooltip text="Erreur en %. Vert < 30% = excellent. Orange = acceptable. Rouge = imprécis." /></th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Train <Tooltip text="Jours utilisés pour entraîner le modèle (80%)." /></th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Test <Tooltip text="Jours utilisés pour valider le modèle (20%)." /></th>
//                 <th className="px-4 py-2.5 text-center text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Prévision J+30</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginated.map((r, i) => (
//                 <tr key={i} className="border-b border-[#f8f8f8] transition-colors"
//                   style={{ background: selectedArt === r.AR_Ref ? 'rgba(18,166,224,0.06)' : undefined }}>
//                   <td className="px-4 py-2.5">
//                     <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{r.AR_Ref}</span>
//                   </td>
//                   <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.MAE)}</td>
//                   <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.RMSE)}</td>
//                   <td className="px-4 py-2.5 text-right"><MAPEBadge value={r.MAPE} /></td>
//                   <td className="px-4 py-2.5 text-right text-[0.75rem] text-[#888]">{fmtNum(r.nb_train)}</td>
//                   <td className="px-4 py-2.5 text-right text-[0.75rem] text-[#888]">{fmtNum(r.nb_test)}</td>
//                   <td className="px-4 py-2.5 text-center">
//                     <button onClick={() => setSelectedArt(selectedArt === r.AR_Ref ? null : r.AR_Ref)}
//                       className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[0.7rem] font-medium transition-all cursor-pointer"
//                       style={{ background: selectedArt === r.AR_Ref ? '#E6F1FB' : '#f0fdf4', color: selectedArt === r.AR_Ref ? '#185FA5' : '#15803d', border: selectedArt === r.AR_Ref ? '1px solid #B5D4F4' : '1px solid rgba(21,128,61,0.25)' }}>
//                       <BarChart2 size={11} />{selectedArt === r.AR_Ref ? 'Fermer' : 'Voir graphe'}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE} onChange={setPage} />
//       </div>
//     </div>
//   );
// }

// // ── Onglet 2 : Ruptures ──────────────────────────────────────
// function TabRuptures({ data }) {
//   const rows        = data?.results?.rf || [];
//   const importances = data?.results?.rf_importance || [];
//   const [page, setPage] = useState(1);
//   useEffect(() => { setPage(1); }, [data]);

//   if (!rows.length) return (
//     <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
//       <AlertTriangle size={36} className="mb-3" /><p className="text-sm">Aucune donnée de rupture disponible</p>
//     </div>
//   );

//   const sorted    = [...rows].sort((a, b) => (Number(a.jours_estimes) || 999) - (Number(b.jours_estimes) || 999));
//   const danger    = sorted.filter(r => Number(r.jours_estimes) < 7).length;
//   const alerte    = sorted.filter(r => Number(r.jours_estimes) >= 7 && Number(r.jours_estimes) < 30).length;
//   const ok        = sorted.filter(r => Number(r.jours_estimes) >= 30).length;
//   const maxImp    = importances.length ? Math.max(...importances.map(i => Number(i.importance) || 0)) : 1;
//   const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   return (
//     <div className="flex flex-col gap-4">
//       <ExplainBanner icon={AlertTriangle} color="#e53935"
//         title="Estimation des ruptures de stock — Random Forest"
//         description="Pour chaque article, ce modèle calcule dans combien de jours le stock va s'épuiser si on continue au même rythme de vente. C'est calculé en divisant le stock actuel par la moyenne des sorties des 7 derniers jours."
//         tip="Rouge = commander maintenant. Orange = planifier une commande cette semaine. Vert = stock suffisant pour le mois." />

//       <div className="grid grid-cols-3 gap-3">
//         <KpiCard label="🔴 Rupture critique (< 7j)" value={danger} color="#A32D2D" hint="Stock qui s'épuise en moins d'une semaine. Commande urgente requise." sub="commander immédiatement" />
//         <KpiCard label="🟡 Alerte (7 à 30j)"         value={alerte} color="#854F0B" hint="Stock suffisant pour 1 à 4 semaines. Planifier une commande prochainement." sub="planifier une commande" />
//         <KpiCard label="🟢 Stock OK (> 30j)"          value={ok}     color="#3B6D11" hint="Stock suffisant pour plus d'un mois au rythme actuel." sub="aucune action requise" />
//       </div>

//       <RuptureBarChart rows={sorted} />

//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//         <div className="lg:col-span-2 bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//           <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
//             <div className="w-2 h-2 rounded-full bg-[#e53935]" />
//             <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Tous les articles — du plus urgent au moins urgent</span>
//             <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{rows.length} articles</span>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm border-collapse">
//               <thead>
//                 <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
//                   <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
//                   <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Jours restants <Tooltip text="Nombre de jours avant que le stock soit épuisé au rythme actuel de vente." /></th>
//                   <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Stock actuel <Tooltip text="Dernière quantité connue en stock pour cet article." /></th>
//                   <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Ventes/jour <Tooltip text="Moyenne des sorties sur les 7 derniers jours — utilisée pour calculer les jours restants." /></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginated.map((r, i) => (
//                   <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors">
//                     <td className="px-4 py-2.5">
//                       <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{r.AR_Ref}</span>
//                     </td>
//                     <td className="px-4 py-2.5 text-right"><RuptureBadge value={r.jours_estimes} /></td>
//                     <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.StockFinal)} unités</td>
//                     <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.rolling_mean_7)} u/j</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE} onChange={setPage} />
//         </div>

//         {importances.length > 0 && (
//           <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//             <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
//               <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Facteurs clés</span>
//               <Tooltip text="Variables qui ont le plus influencé les prédictions du modèle Random Forest." />
//             </div>
//             <div className="px-4 py-3 flex flex-col gap-3">
//               {[...importances].sort((a, b) => Number(b.importance) - Number(a.importance)).map((imp, i) => (
//                 <div key={i}>
//                   <div className="flex justify-between text-xs mb-1">
//                     <span className="text-[#555] font-mono text-[11px]">{imp.feature}</span>
//                     <span className="text-[#888] font-semibold">{(Number(imp.importance) * 100).toFixed(1)}%</span>
//                   </div>
//                   <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
//                     <div className="h-full rounded-full" style={{ width: `${(Number(imp.importance) / maxImp) * 100}%`, background: 'linear-gradient(90deg, #12a6e0, #0d8fc4)' }} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="px-4 pb-3">
//               <div className="rounded-lg px-3 py-2 text-[11px] text-[#555] leading-relaxed" style={{ background: '#f0f9ff', borderLeft: '3px solid #12a6e0' }}>
//                 Le facteur avec le % le plus élevé est ce qui influence le plus la prédiction de rupture.
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Onglet 3 : Anomalies ─────────────────────────────────────
// function TabAnomalies({ data }) {
//   const rows = data?.results?.iforest || [];
//   const [page, setPage] = useState(1);
//   useEffect(() => { setPage(1); }, [data]);

//   if (!rows.length) return (
//     <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
//       <Radar size={36} className="mb-3" /><p className="text-sm">Aucune donnée d'anomalie disponible</p>
//     </div>
//   );

//   const anomalies = rows.filter(r => r.is_anomalie === 1);
//   const pctAno    = ((anomalies.length / rows.length) * 100).toFixed(1);
//   const top100    = [...anomalies].sort((a, b) => Number(a.anomaly_score) - Number(b.anomaly_score)).slice(0, 100);
//   const paginated = top100.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   return (
//     <div className="flex flex-col gap-4">
//       <ExplainBanner icon={Radar} color="#EF9F27"
//         title="Détection d'anomalies — Isolation Forest"
//         description="Ce modèle analyse automatiquement tous les mouvements de stock pour repérer ceux qui sont inhabituels : une sortie anormalement élevée un certain jour, un stock qui baisse trop vite, ou une combinaison de valeurs rare. Ces cas méritent une vérification dans SAGE."
//         tip="Un score très négatif (ex: -0.30) = mouvement très suspect. Un score proche de 0 = à la limite de la normale." />

//       <div className="grid grid-cols-3 gap-3">
//         <KpiCard label="Total mouvements analysés" value={fmtNum(rows.length)} color="#0d0c0c" hint="Nombre total de lignes de stock analysées par le modèle." sub="mouvements journaliers" />
//         <KpiCard label="Anomalies détectées"        value={fmtNum(anomalies.length)} color="#A32D2D" hint="Mouvements jugés anormaux — à vérifier manuellement dans SAGE." sub="mouvements suspects" />
//         <KpiCard label="Taux d'anomalies"           value={`${pctAno}%`} color="#854F0B" hint="Fixé à 5% par défaut. Signifie que 5% des mouvements sont considérés anormaux." sub="5% par paramétrage" />
//       </div>

//       <AnomalyScatter rows={rows} />

//       <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//         <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
//           <div className="w-2 h-2 rounded-full bg-[#e53935]" />
//           <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Anomalies les plus sévères à vérifier</span>
//           <span className="bg-[#FCEBEB] text-[#791F1F] text-[0.6875rem] font-mono px-2 py-0.5 rounded">score négatif bas = plus suspect</span>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm border-collapse">
//             <thead>
//               <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
//                 <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Date</th>
//                 <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Qté sortie <Tooltip text="Quantité sortie ce jour — anormalement élevée ou basse." /></th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Stock restant <Tooltip text="Stock restant à la fin de cette journée." /></th>
//                 <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Score d'anomalie <Tooltip text="Plus négatif = plus suspect. Score calculé par Isolation Forest." /></th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginated.map((r, i) => (
//                 <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(229,57,53,0.02)] transition-colors">
//                   <td className="px-4 py-2.5 font-mono text-[0.72rem] text-[#888]">{r.DateJour ? fmtDate(r.DateJour) : '—'}</td>
//                   <td className="px-4 py-2.5">
//                     <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{r.AR_Ref}</span>
//                   </td>
//                   <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#b71c1c] font-semibold">{fmtNum(r.TotalSortie)} unités</td>
//                   <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.StockFinal)} unités</td>
//                   <td className="px-4 py-2.5 text-right">
//                     <span className="text-[0.72rem] font-mono text-[#854F0B] bg-[#FAEEDA] px-2 py-0.5 rounded">{Number(r.anomaly_score).toFixed(4)}</span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <Pagination page={page} total={top100.length} pageSize={PAGE_SIZE} onChange={setPage} />
//       </div>
//     </div>
//   );
// }

// // ── Onglet 4 : Segmentation ──────────────────────────────────
// function TabSegmentation({ data }) {
//   const clusters = data?.results?.kmeans   || [];
//   const segments = data?.results?.segments || [];
//   const [filtre, setFiltre] = useState('');
//   const [page, setPage] = useState(1);
//   useEffect(() => { setPage(1); }, [data, filtre]);

//   if (!clusters.length) return (
//     <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
//       <Shapes size={36} className="mb-3" /><p className="text-sm">Aucune donnée de segmentation disponible</p>
//     </div>
//   );

//   const COLORS = {
//     'forte rotation'   : { bg: '#FCEBEB', text: '#791F1F', dot: '#E24B4A' },
//     'rotation moyenne' : { bg: '#FAEEDA', text: '#633806', dot: '#EF9F27' },
//     'faible rotation'  : { bg: '#E6F1FB', text: '#0C447C', dot: '#378ADD' },
//     'quasi-immobile'   : { bg: '#F1EFE8', text: '#444441', dot: '#888780' },
//   };
//   const DESCRIPTIONS = {
//     'forte rotation'   : 'Articles très demandés — réapprovisionner en priorité absolue',
//     'rotation moyenne' : 'Articles avec activité régulière — surveiller le stock régulièrement',
//     'faible rotation'  : 'Articles peu demandés — commandes ponctuelles suffisantes',
//     'quasi-immobile'   : 'Articles presque jamais vendus — envisager liquidation ou réduction',
//   };
//   const getColor = (seg) => COLORS[seg] || { bg: '#f0f0f0', text: '#555', dot: '#aaa' };
//   const articlesFiltres = filtre ? segments.filter(s => s.segment === filtre) : segments;
//   const paginated       = articlesFiltres.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   return (
//     <div className="flex flex-col gap-4">
//       <ExplainBanner icon={Shapes} color="#7F77DD"
//         title="Segmentation des articles — K-Means"
//         description="Le modèle K-Means analyse automatiquement les ventes mensuelles de chaque article et les regroupe selon leur profil de consommation. Les articles similaires sont placés dans le même groupe. Cela permet d'adapter la stratégie de stock à chaque type d'article."
//         tip="Forte rotation = commander souvent et en grande quantité. Quasi-immobile = réduire le stock ou arrêter la référence." />

//       {/* Donut + Barres côte à côte */}
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//         <SegmentDonut clusters={clusters} />
//         <SegmentBarChart clusters={clusters} segments={segments} />
//       </div>

//       {/* Descriptions des segments */}
//       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//         {clusters.map((c, i) => {
//           const col  = getColor(c.Segment);
//           const desc = DESCRIPTIONS[c.Segment] || '';
//           return (
//             <div key={i} className="bg-white border rounded-xl px-4 py-3 flex items-start gap-3" style={{ borderColor: col.dot + '44' }}>
//               <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold" style={{ background: col.dot + '18', color: col.dot }}>
//                 {Number(c.Nb_articles)}
//               </div>
//               <div>
//                 <p className="text-[12px] font-semibold capitalize m-0" style={{ color: col.text }}>{c.Segment}</p>
//                 <p className="text-[11px] text-[#777] m-0 mt-0.5">{desc}</p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Tableau articles */}
//       {segments.length > 0 && (
//         <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
//           <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-[#7F77DD]" />
//               <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Liste des articles par segment</span>
//               <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{articlesFiltres.length} articles</span>
//             </div>
//             <div className="flex gap-1 flex-wrap">
//               <button onClick={() => setFiltre('')} className="px-2 py-1 text-xs rounded transition-all cursor-pointer"
//                 style={{ background: !filtre ? '#EEEDFE' : '#f5f5f5', color: !filtre ? '#3C3489' : '#666' }}>Tous</button>
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
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm border-collapse">
//               <thead>
//                 <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
//                   <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
//                   <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Segment <Tooltip text="Groupe attribué automatiquement selon le profil de consommation mensuel." /></th>
//                   <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Signification</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginated.map((s, i) => {
//                   const col  = getColor(s.segment);
//                   const desc = DESCRIPTIONS[s.segment] || '';
//                   return (
//                     <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors">
//                       <td className="px-4 py-2.5">
//                         <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{s.AR_Ref}</span>
//                       </td>
//                       <td className="px-4 py-2.5">
//                         <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: col.bg, color: col.text }}>{s.segment}</span>
//                       </td>
//                       <td className="px-4 py-2.5 text-[11px] text-[#777]">{desc}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//           <Pagination page={page} total={articlesFiltres.length} pageSize={PAGE_SIZE} onChange={setPage} />
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

//   useEffect(() => {
//     fetchBases()
//       .then(data => { setBases(data); if (data.length > 0) setBaseName(data[0].BaseName); })
//       .catch(e => setError(e.message))
//       .finally(() => setLoadingBase(false));
//   }, []);

//   const loadData = useCallback(async (base) => {
//     if (!base) return;
//     setLoading(true); setError(null); setResults(null);
//     try {
//       const st = await fetchPipelineStatus(base);
//       setStatus(st);
//       if (st.status === 'success') { const res = await fetchPredictionResults(base); setResults(res); }
//       else if (st.status === 'running') setPolling(true);
//     } catch (e) { setError(e.message); }
//     finally { setLoading(false); }
//   }, []);

//   useEffect(() => { if (baseName) loadData(baseName); }, [baseName, loadData]);

//   useEffect(() => {
//     if (!polling || !baseName) return;
//     const interval = setInterval(async () => {
//       try {
//         const st = await fetchPipelineStatus(baseName);
//         setStatus(st);
//         if (st.status === 'success') { setPolling(false); const res = await fetchPredictionResults(baseName); setResults(res); }
//         else if (st.status === 'failed') { setPolling(false); setError('Le pipeline a échoué.'); }
//       } catch (e) { setPolling(false); }
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [polling, baseName]);

//   // const handleRunPipeline = async () => {
//   //   if (!baseName) return;
//   //   setError(null); setResults(null); setStatus({ status: 'running' }); setPolling(true);
//   //   try { await runPipeline(baseName); } catch (e) { setError(e.message); setPolling(false); }
//   // };
//   const handleRunPipeline = async () => {
//     if (!baseName) return;

//     // Vérifier d'abord si déjà success → juste recharger
//     try {
//       const st = await fetchPipelineStatus(baseName);
//       if (st.status === 'success') {
//         setStatus(st);
//         setError(null);
//         const res = await fetchPredictionResults(baseName);
//         setResults(res);
//         return;
//       }
//     } catch (e) {}

//     // Sinon lancer le pipeline
//     setError(null);
//     setResults(null);
//     setStatus({ status: 'running' });
//     setPolling(true);
//     try { await runPipeline(baseName); }
//     catch (e) { setError(e.message); setPolling(false); }
//   };

//   const BANNERS = {
//     running    : { bg: '#E6F1FB', border: '#B5D4F4', color: '#0C447C', icon: <Loader2 size={15} className="animate-spin flex-shrink-0" />, msg: <>Calcul des prédictions en cours pour <strong>{baseName}</strong>… Mise à jour automatique toutes les 5 secondes.</> },
//     success    : { bg: '#EAF3DE', border: '#C0DD97', color: '#27500A', icon: <CheckCircle size={15} className="flex-shrink-0" />, msg: <> Prédictions disponibles pour <strong>{baseName}</strong>{status?.duration_s ? ` — calculées en ${status.duration_s} secondes` : ''}</> },
//     failed     : { bg: '#FCEBEB', border: '#F7C1C1', color: '#791F1F', icon: <XCircle size={15} className="flex-shrink-0" />, msg: <> Le calcul a échoué pour <strong>{baseName}</strong>. Cliquez sur "Relancer" pour réessayer.</> },
//     not_started: { bg: '#FAEEDA', border: '#FAC775', color: '#633806', icon: <Clock size={15} className="flex-shrink-0" />, msg: <> Aucune prédiction générée pour <strong>{baseName}</strong>. Cliquez sur "Relancer" pour lancer le calcul.</> },
//   };

//   const StatusBanner = () => {
//     if (!status) return null;
//     const key = (status.status === 'running' || polling) ? 'running' : status.status;
//     const b   = BANNERS[key];
//     if (!b) return null;
//     return (
//       <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
//         style={{ background: b.bg, borderColor: b.border, color: b.color }}>
//         {b.icon}<span>{b.msg}</span>
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-[1.1rem] font-semibold text-[#0d0c0c] m-0">Analyse prédictive</h1>
//           <p className="text-[0.8rem] text-[#aaaaaa] m-0 mt-0.5">
//             AutoARIMA · Random Forest · Isolation Forest · K-Means — basé sur les données historiques SAGE
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <BaseSelector bases={bases} value={baseName} onChange={setBaseName} loading={loadingBase} />
//           <button onClick={handleRunPipeline} disabled={!baseName || polling}
//             className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
//             style={{ background: polling ? '#f5f5f5' : 'white', borderColor: '#e0e0e0', color: polling ? '#aaa' : '#555', cursor: polling ? 'not-allowed' : 'pointer' }}
//             title="Relancer le calcul des prédictions">
//             <RefreshCw size={13} className={polling ? 'animate-spin' : ''} />
//             {polling ? 'Calcul en cours…' : 'Relancer'}
//           </button>
//         </div>
//       </div>

//       <StatusBanner />

//       {error && (
//         <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
//           style={{ background: '#FCEBEB', borderColor: '#F7C1C1', color: '#791F1F' }}>
//           <XCircle size={15} className="flex-shrink-0" /><span>{error}</span>
//         </div>
//       )}

//       <div className="flex gap-1 border-b border-[#e8e8e8]">
//         {TABS.map(({ id, label, icon: Icon }) => (
//           <button key={id} onClick={() => setActiveTab(id)}
//             className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer"
//             style={{ borderBottomColor: activeTab === id ? '#12a6e0' : 'transparent', color: activeTab === id ? '#12a6e0' : '#888888', background: 'transparent' }}>
//             <Icon size={14} />{label}
//           </button>
//         ))}
//       </div>

//       {loading ? (
//         <div className="flex items-center justify-center py-20 gap-3 text-[#12a6e0]">
//           <Loader2 size={20} className="animate-spin" /><span className="text-sm">Chargement des prédictions…</span>
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
  RefreshCw, CheckCircle, XCircle, Clock, BarChart2, Info,
} from 'lucide-react';
import { fetchBases } from '../api/stockApi';
import { fetchPipelineStatus, fetchPredictionResults, runPipeline } from '../api/predictionsApi';

const fmtNum = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '—';
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n));
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ── Tooltip ───────────────────────────────────────────────────
function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1 cursor-help"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info size={12} className="text-[#c5c5c5] hover:text-[#12a6e0] transition-colors" />
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-60 px-3 py-2 rounded-lg text-xs text-white leading-relaxed shadow-xl"
          style={{ background: '#1a1a2e', whiteSpace: 'normal' }}>
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: '#1a1a2e' }} />
        </span>
      )}
    </span>
  );
}

// ── Bandeau explication ───────────────────────────────────────
function ExplainBanner({ icon: Icon, color, title, description, tip }) {
  return (
    <div className="rounded-xl border p-4 flex gap-4" style={{ background: `${color}08`, borderColor: `${color}25` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold m-0 mb-1" style={{ color }}>{title}</p>
        <p className="text-[12px] text-[#555] m-0 leading-relaxed">{description}</p>
        {tip && <p className="text-[11px] text-[#888] m-0 mt-1.5 flex items-center gap-1"><Info size={11} className="flex-shrink-0" style={{ color }} />{tip}</p>}
      </div>
    </div>
  );
}

function MAPEBadge({ value }) {
  if (!value || isNaN(value)) return <span className="text-[#c5c5c5] text-xs">N/A</span>;
  const v = Number(value);
  const c = v < 30 ? { bg: '#EAF3DE', text: '#27500A' } : v < 60 ? { bg: '#FAEEDA', text: '#633806' } : { bg: '#FCEBEB', text: '#791F1F' };
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>{v.toFixed(1)}%</span>;
}

function RuptureBadge({ value }) {
  if (!value || isNaN(value)) return <span className="text-[#c5c5c5] text-xs">—</span>;
  const v = Number(value);
  const c = v < 7 ? { bg: '#FCEBEB', text: '#791F1F' } : v < 30 ? { bg: '#FAEEDA', text: '#633806' } : { bg: '#EAF3DE', text: '#27500A' };
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>{v.toFixed(0)}j</span>;
}

function KpiCard({ label, value, color, hint, sub }) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 border border-[#e8e8e8]">
      <div className="flex items-center gap-1 mb-1">
        <p className="text-[11px] text-[#aaaaaa] uppercase tracking-wide m-0">{label}</p>
        {hint && <Tooltip text={hint} />}
      </div>
      <p className="text-[1.4rem] font-bold m-0" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-[#aaa] mt-0.5 m-0">{sub}</p>}
    </div>
  );
}

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
    Math.max(1, Math.min(totalPages - 4, page - 2)) + i
  ).filter(p => p >= 1 && p <= totalPages);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0]">
      <span className="text-[0.75rem] text-[#c5c5c5]">Page {page} / {totalPages}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] hover:bg-[#eaeaea] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer">← Préc.</button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)} className="w-8 h-8 rounded-lg text-[0.75rem] transition-all cursor-pointer"
            style={{ background: p === page ? '#12a6e0' : '#f5f5f5', color: p === page ? 'white' : '#666', border: p === page ? 'none' : '1px solid #e0e0e0', fontWeight: p === page ? 500 : 400 }}>{p}</button>
        ))}
        <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg text-[0.75rem] bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] hover:bg-[#eaeaea] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer">Suiv. →</button>
      </div>
    </div>
  );
}

function BaseSelector({ bases, value, onChange, loading }) {
  const [open, setOpen] = useState(false);
  const selected = bases.find(b => b.BaseName === value);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer"
        style={{ background: value ? '#E6F1FB' : 'white', borderColor: value ? '#B5D4F4' : '#e0e0e0', color: value ? '#0C447C' : '#888888' }}>
        <Database size={14} />
        {loading ? <Loader2 size={14} className="animate-spin" /> : (selected?.BaseLabel || selected?.BaseName || 'Sélectionner une base')}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-[#e0e0e0] rounded-lg shadow-lg z-50 min-w-[200px]">
          {bases.map(b => (
            <button key={b.BaseName} onClick={() => { onChange(b.BaseName); setOpen(false); }}
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

// ── Graphe prévision article ENRICHI ─────────────────────────
function ForecastChart({ baseName, arRef, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <Loader2 size={18} className="animate-spin" /><span className="text-sm">Calcul des prévisions en cours…</span>
    </div>
  );
  if (error) return <div className="py-6 text-center text-sm text-[#b71c1c]">Erreur : {error}</div>;
  if (!data) return null;

  // ── Calculs résumé futur ──────────────────────────────────
  const futurValues  = data.futur.values;
  const futurDates   = data.futur.dates;
  const moyenneFutur = futurValues.length > 0 ? futurValues.reduce((a, b) => a + b, 0) / futurValues.length : 0;
  const totalFutur   = futurValues.reduce((a, b) => a + b, 0);
  const picFutur     = Math.max(...futurValues, 0);
  const picIndex     = futurValues.indexOf(picFutur);
  const picDate      = futurDates[picIndex] || '';

  // ── Prochains 7 jours ────────────────────────────────────
  const prochains7   = futurValues.slice(0, 7).map((v, i) => ({ date: futurDates[i], valeur: v }));

  // ── SVG ──────────────────────────────────────────────────
  const W = 660, H = 200, PL = 48, PR = 16, PT = 16, PB = 32;
  const chartW = W - PL - PR, chartH = H - PT - PB;
  const allValues = [...data.train.values, ...data.test.values_real, ...data.test.values_pred, ...data.futur.values];
  const maxY = Math.max(...allValues, 1);
  const nTrain = data.train.dates.length, nTest = data.test.dates.length;
  const total = nTrain + nTest + data.futur.dates.length;
  const toX = (i) => PL + (i / (total - 1)) * chartW;
  const toY = (v) => PT + chartH - (v / maxY) * chartH;
  const makePath = (values, offset) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(offset + i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');
  const yTicks = [0, Math.round(maxY * 0.5), Math.round(maxY)];

  // Zone futur colorée
  const futurStart = toX(nTrain + nTest);
  const futurEnd   = toX(total - 1);

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{arRef}</span>
          <span className="text-xs text-[#aaa]">Prévision AutoARIMA — 30 prochains jours</span>
        </div>
        <button onClick={onClose} className="text-xs text-[#888] hover:text-[#333] px-2 py-1 rounded border border-[#e0e0e0] hover:bg-[#f5f5f5] transition-all cursor-pointer">✕ Fermer</button>
      </div>

      {/* KPIs futur */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl px-4 py-3 border" style={{ background: '#FFF3E0', borderColor: '#FFB74D44' }}>
          <p className="text-[11px] text-[#854F0B] uppercase tracking-wide m-0 mb-1">Moyenne prévue / jour</p>
          <p className="text-[1.3rem] font-bold m-0 text-[#854F0B]">{moyenneFutur.toFixed(1)} <span className="text-sm font-normal">unités</span></p>
          <p className="text-[10px] text-[#aaa] mt-0.5">sur les 30 prochains jours</p>
        </div>
        <div className="rounded-xl px-4 py-3 border" style={{ background: '#E8F5E9', borderColor: '#66BB6A44' }}>
          <p className="text-[11px] text-[#2E7D32] uppercase tracking-wide m-0 mb-1">Total prévu J+30</p>
          <p className="text-[1.3rem] font-bold m-0 text-[#2E7D32]">{Math.round(totalFutur)} <span className="text-sm font-normal">unités</span></p>
          <p className="text-[10px] text-[#aaa] mt-0.5">quantité à prévoir en stock</p>
        </div>
        <div className="rounded-xl px-4 py-3 border" style={{ background: '#FFEBEE', borderColor: '#EF9A9A44' }}>
          <p className="text-[11px] text-[#C62828] uppercase tracking-wide m-0 mb-1">Pic prévu</p>
          <p className="text-[1.3rem] font-bold m-0 text-[#C62828]">{picFutur.toFixed(1)} <span className="text-sm font-normal">unités</span></p>
          <p className="text-[10px] text-[#aaa] mt-0.5">{picDate ? `le ${fmtDate(picDate)}` : '—'}</p>
        </div>
      </div>

      {/* Graphe SVG */}
      <div className="bg-[#fafafa] rounded-xl p-3">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          {/* Zone futur colorée */}
          <rect x={futurStart} y={PT} width={futurEnd - futurStart} height={chartH} fill="#FFF3E0" opacity="0.5" rx="2" />

          {/* Grille */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)} stroke="#e8e8e8" strokeWidth="1" />
              <text x={PL - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#aaa">{v}</text>
            </g>
          ))}

          {/* Séparateurs */}
          <line x1={toX(nTrain)} y1={PT} x2={toX(nTrain)} y2={H - PB} stroke="#c5c5c5" strokeWidth="1" strokeDasharray="4 3" />
          <line x1={toX(nTrain + nTest)} y1={PT} x2={toX(nTrain + nTest)} y2={H - PB} stroke="#EF9F27" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Labels zones */}
          <text x={(PL + toX(nTrain)) / 2} y={PT + 12} textAnchor="middle" fontSize="9" fill="#888">HISTORIQUE</text>
          <text x={(toX(nTrain) + toX(nTrain + nTest)) / 2} y={PT + 12} textAnchor="middle" fontSize="9" fill="#888">TEST</text>
          <text x={(toX(nTrain + nTest) + (W - PR)) / 2} y={PT + 12} textAnchor="middle" fontSize="9" fill="#EF9F27" fontWeight="600">PRÉVISION J+30</text>

          {/* Courbes */}
          <path d={makePath(data.train.values, 0)} fill="none" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={makePath(data.test.values_real, nTrain)} fill="none" stroke="#3B6D11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={makePath(data.test.values_pred, nTrain)} fill="none" stroke="#EF9F27" strokeWidth="1.5" strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={makePath(data.futur.values, nTrain + nTest)} fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Ligne moyenne futur */}
          {moyenneFutur > 0 && (
            <>
              <line x1={toX(nTrain + nTest)} y1={toY(moyenneFutur)} x2={W - PR} y2={toY(moyenneFutur)}
                stroke="#E24B4A" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
              <text x={W - PR + 4} y={toY(moyenneFutur) + 4} fontSize="9" fill="#E24B4A">moy.</text>
            </>
          )}
        </svg>
      </div>

      {/* Légende */}
      <div className="flex gap-4 flex-wrap text-xs text-[#555]">
        {[
          { color: '#378ADD', label: 'Historique — données passées utilisées pour entraîner le modèle', dash: false },
          { color: '#3B6D11', label: 'Réel (test) — ce qui s\'est réellement passé', dash: false },
          { color: '#EF9F27', label: 'Prédit (test) — estimation du modèle sur cette période', dash: true },
          { color: '#E24B4A', label: 'Prévision J+30 — ce que le modèle anticipe dans le futur', dash: true },
        ].map(({ color, label, dash }) => (
          <div key={label} className="flex items-center gap-1.5">
            <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke={color} strokeWidth="2" strokeDasharray={dash ? '4 2' : undefined} /></svg>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Message interprétation */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg px-3 py-2.5 text-[12px] text-[#555] leading-relaxed"
          style={{ background: '#f0f9ff', borderLeft: '3px solid #378ADD' }}>
          <strong className="text-[#185FA5]">Comment valider le modèle :</strong> Comparez la courbe <span className="font-semibold" style={{ color: '#EF9F27' }}>orange (prédit)</span> avec la courbe <span className="font-semibold" style={{ color: '#3B6D11' }}>verte (réel)</span> sur la zone TEST. Si elles se suivent bien → le modèle est fiable et la prévision J+30 est crédible.
        </div>
        <div className="rounded-lg px-3 py-2.5 text-[12px] text-[#555] leading-relaxed"
          style={{ background: '#fff8f0', borderLeft: '3px solid #E24B4A' }}>
          <strong className="text-[#C62828]">Comment utiliser la prévision :</strong> La zone <span className="font-semibold" style={{ color: '#E24B4A' }}>rouge (J+30)</span> indique combien d'unités vont sortir chaque jour. Utilisez le <strong>Total prévu = {Math.round(totalFutur)} unités</strong> pour planifier votre prochaine commande fournisseur.
        </div>
      </div>

      {/* Tableau 7 prochains jours */}
      {prochains7.length > 0 && (
        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
            <div className="w-2 h-2 rounded-full bg-[#E24B4A]" />
            <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">
              Prévision détaillée — 7 prochains jours
            </span>
            <span className="text-[11px] text-[#aaa]">Quantité estimée à sortir chaque jour</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
                  <th className="px-4 py-2 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Date</th>
                  <th className="px-4 py-2 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Quantité prévue</th>
                  <th className="px-4 py-2 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Niveau</th>
                </tr>
              </thead>
              <tbody>
                {prochains7.map((j, i) => {
                  const pct = moyenneFutur > 0 ? j.valeur / Math.max(...futurValues, 1) : 0;
                  const color = j.valeur > moyenneFutur * 1.3 ? '#E24B4A' : j.valeur > moyenneFutur * 0.7 ? '#EF9F27' : '#3B6D11';
                  return (
                    <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.02)]">
                      <td className="px-4 py-2.5 font-mono text-[0.75rem] text-[#555]">{fmtDate(j.date)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-semibold text-[0.9rem]" style={{ color }}>{j.valeur.toFixed(1)}</span>
                        <span className="text-[#aaa] text-xs ml-1">unités</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full" style={{ width: `${Math.max(4, pct * 100)}px`, background: color, maxWidth: '120px' }} />
                          <span className="text-[10px] text-[#aaa]">
                            {j.valeur > moyenneFutur * 1.3 ? '↑ pic' : j.valeur < moyenneFutur * 0.7 ? '↓ creux' : 'normal'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Graphe barres ruptures ────────────────────────────────────
function RuptureBarChart({ rows }) {
  const top15 = [...rows].filter(r => !isNaN(r.jours_estimes)).sort((a, b) => Number(a.jours_estimes) - Number(b.jours_estimes)).slice(0, 15);
  if (!top15.length) return null;
  const maxVal = Math.max(...top15.map(r => Number(r.jours_estimes)), 1);
  const W = 640, barH = 24, gap = 6, PL = 110, PR = 70, PT = 10;
  const H = PT + top15.length * (barH + gap);
  const getColor = (v) => v < 7 ? '#E24B4A' : v < 30 ? '#EF9F27' : '#639922';

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#e53935]" />
          <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Jours avant rupture — Top 15 articles les plus urgents</span>
        </div>
        <span className="text-[11px] text-[#aaa]">Barre courte = commander en urgence</span>
      </div>
      <div className="p-4">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          {top15.map((r, i) => {
            const v   = Number(r.jours_estimes);
            const y   = PT + i * (barH + gap);
            const bw  = Math.max(4, (v / maxVal) * (W - PL - PR));
            const col = getColor(v);
            return (
              <g key={i}>
                <text x={PL - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize="11" fill="#555">
                  {String(r.AR_Ref).length > 12 ? String(r.AR_Ref).slice(0, 12) + '…' : r.AR_Ref}
                </text>
                <rect x={PL} y={y} width={bw} height={barH} rx="5" fill={col} opacity="0.85" />
                <text x={PL + bw + 6} y={y + barH / 2 + 4} fontSize="11" fill={col} fontWeight="600">{v.toFixed(0)} jours</text>
              </g>
            );
          })}
          <line x1={PL} y1={PT} x2={PL} y2={H} stroke="#e8e8e8" strokeWidth="1" />
        </svg>
        <div className="flex gap-5 mt-3 text-xs text-[#555]">
          {[{ color: '#E24B4A', label: 'Critique — moins de 7 jours → commander maintenant' },
            { color: '#EF9F27', label: 'Alerte — 7 à 30 jours → planifier une commande' },
            { color: '#639922', label: 'OK — plus de 30 jours → stock suffisant' }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Graphe donut segmentation (UNIQUE source visuelle de répartition) ──
function SegmentDonut({ clusters, segments }) {
  if (!clusters.length) return null;
  const COLORS = { 'forte rotation': '#E24B4A', 'rotation moyenne': '#EF9F27', 'faible rotation': '#378ADD', 'quasi-immobile': '#888780' };
  const DESCRIPTIONS = {
    'forte rotation'   : 'Articles très demandés — réapprovisionner en priorité absolue',
    'rotation moyenne' : 'Articles avec activité régulière — surveiller le stock régulièrement',
    'faible rotation'  : 'Articles peu demandés — commandes ponctuelles suffisantes',
    'quasi-immobile'   : 'Articles presque jamais vendus — envisager liquidation ou réduction',
  };
  const total = clusters.reduce((s, c) => s + Number(c.Nb_articles), 0);
  const CX = 100, CY = 100, R = 80, r = 48;
  let angle = -Math.PI / 2;
  const slices = clusters.map(c => {
    const nb = Number(c.Nb_articles), pct = nb / total, sweep = pct * 2 * Math.PI;
    const x1 = CX + R * Math.cos(angle), y1 = CY + R * Math.sin(angle);
    angle += sweep;
    const x2 = CX + R * Math.cos(angle), y2 = CY + R * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const xi1 = CX + r * Math.cos(angle - sweep), yi1 = CY + r * Math.sin(angle - sweep);
    const xi2 = CX + r * Math.cos(angle), yi2 = CY + r * Math.sin(angle);
    const color = COLORS[c.Segment] || '#aaa';
    return { d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${r} ${r} 0 ${large} 0 ${xi1} ${yi1} Z`, color, nb, pct: Math.round(pct * 100), label: c.Segment };
  });
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
        <div className="w-2 h-2 rounded-full bg-[#7F77DD]" />
        <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Répartition des articles par segment</span>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-6">
          <svg width="180" height="180" viewBox="0 0 200 200" className="flex-shrink-0">
            {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} opacity="0.85" stroke="white" strokeWidth="2" />)}
            <text x={CX} y={CY - 6} textAnchor="middle" fontSize="20" fontWeight="600" fill="#0d0c0c">{total}</text>
            <text x={CX} y={CY + 14} textAnchor="middle" fontSize="11" fill="#aaa">articles</text>
          </svg>
          <div className="flex flex-col gap-3 flex-1">
            {slices.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-xs capitalize text-[#555]">{s.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#0d0c0c]">{s.nb} articles</span>
                  <span className="text-[10px] text-[#aaa]">{s.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Descriptions intégrées sous le donut — remplace les 4 cards redondantes */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-3 border-t border-[#f0f0f0]">
          {clusters.map((c, i) => {
            const color = COLORS[c.Segment] || '#aaa';
            const desc  = DESCRIPTIONS[c.Segment] || '';
            return (
              <div key={i} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: color }} />
                <p className="text-[11px] text-[#777] m-0 leading-relaxed">
                  <span className="font-semibold capitalize" style={{ color }}>{c.Segment}</span> — {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Graphe scatter anomalies (échantillon réduit pour lisibilité) ─────
function AnomalyScatter({ rows }) {
  // Échantillon réduit à 600 points max pour éviter un nuage illisible
  const normalesAll  = rows.filter(r => r.is_anomalie === 0);
  const anomaliesAll = rows.filter(r => r.is_anomalie === 1);
  const normales  = normalesAll.length > 500
    ? normalesAll.filter((_, i) => i % Math.ceil(normalesAll.length / 500) === 0)
    : normalesAll;
  const anomalies = anomaliesAll.slice(0, 150); // toutes les + sévères en priorité (déjà triées en amont si besoin)

  const allX = [...normales, ...anomalies].map(r => Number(r.TotalSortie) || 0);
  const allY = [...normales, ...anomalies].map(r => Number(r.StockFinal)  || 0);
  const maxX = Math.max(...allX, 1), maxY = Math.max(...allY, 1);
  const W = 500, H = 260, PL = 55, PR = 20, PT = 20, PB = 45;
  const cw = W - PL - PR, ch = H - PT - PB;
  const tx = (v) => PL + (v / maxX) * cw;
  const ty = (v) => PT + ch - (v / maxY) * ch;
  const xTicks = [0, Math.round(maxX * 0.5), Math.round(maxX)];
  const yTicks = [0, Math.round(maxY * 0.5), Math.round(maxY)];

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#e53935]" />
          <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Carte des mouvements — Quantité sortie vs Stock restant</span>
        </div>
        <span className="text-[11px] text-[#aaa]">Échantillon de {normales.length + anomalies.length} mouvements (sur {rows.length})</span>
      </div>
      <div className="p-4">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PL} y1={ty(v)} x2={W - PR} y2={ty(v)} stroke="#f0f0f0" strokeWidth="1" />
              <text x={PL - 5} y={ty(v) + 4} textAnchor="end" fontSize="9" fill="#aaa">{v}</text>
            </g>
          ))}
          {xTicks.map((v, i) => (
            <g key={i}>
              <line x1={tx(v)} y1={PT} x2={tx(v)} y2={H - PB} stroke="#f0f0f0" strokeWidth="1" />
              <text x={tx(v)} y={H - PB + 14} textAnchor="middle" fontSize="9" fill="#aaa">{v}</text>
            </g>
          ))}
          <text x={W / 2} y={H - 5} textAnchor="middle" fontSize="10" fill="#888">← Quantité sortie →</text>
          <text x={12} y={H / 2} textAnchor="middle" fontSize="10" fill="#888" transform={`rotate(-90, 12, ${H / 2})`}>← Stock restant →</text>
          {normales.map((r, i) => (
            <circle key={`n${i}`} cx={tx(Number(r.TotalSortie) || 0)} cy={ty(Number(r.StockFinal) || 0)} r="2.5" fill="#378ADD" opacity="0.25" />
          ))}
          {anomalies.map((r, i) => (
            <circle key={`a${i}`} cx={tx(Number(r.TotalSortie) || 0)} cy={ty(Number(r.StockFinal) || 0)} r="4" fill="#E24B4A" opacity="0.8" stroke="white" strokeWidth="0.5" />
          ))}
        </svg>
        <div className="flex gap-5 mt-2 text-xs text-[#555] flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#378ADD] opacity-50" />Normal (échantillon) — mouvements habituels</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#E24B4A]" />Anomalie ({anomaliesAll.length} au total) — mouvements suspects à vérifier</div>
        </div>
        <div className="rounded-lg px-3 py-2.5 text-[12px] text-[#555] leading-relaxed mt-3"
          style={{ background: '#fff8f0', borderLeft: '3px solid #E24B4A' }}>
          <strong className="text-[#C62828]">Comment lire ce graphe :</strong> Chaque point = un mouvement de stock. <span className="font-semibold text-[#E24B4A]">Les points rouges</span> sont des journées où la quantité sortie ou le stock restant était anormalement élevé ou bas par rapport au comportement habituel de cet article. Ces journées méritent une vérification manuelle dans SAGE.
        </div>
      </div>
    </div>
  );
}

// ── Onglet 1 : Prévision sorties ─────────────────────────────
const PAGE_SIZE = 20;

function TabPrevision({ data, baseName }) {
  const rows = data?.results?.prophet || [];
  const [sortKey, setSortKey] = useState('MAPE');
  const [selectedArt, setSelectedArt] = useState(null);
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); setSelectedArt(null); }, [data]);

  if (!rows.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <TrendingUp size={36} className="mb-3" /><p className="text-sm">Aucune donnée de prévision disponible</p>
    </div>
  );

  const maeM      = (rows.reduce((s, r) => s + (Number(r.MAE) || 0), 0) / rows.length).toFixed(1);
  const mapeValid = rows.filter(r => r.MAPE && !isNaN(r.MAPE));
  const mapeM     = mapeValid.length ? (mapeValid.reduce((s, r) => s + Number(r.MAPE), 0) / mapeValid.length).toFixed(1) : null;
  const sorted    = [...rows].sort((a, b) => sortKey === 'MAPE' ? (Number(a.MAPE) || 999) - (Number(b.MAPE) || 999) : Number(a.MAE) - Number(b.MAE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelect = (ref) => {
    setSelectedArt(selectedArt === ref ? null : ref);
    // Scroll auto vers le graphe pour que l'admin ne le rate pas
    setTimeout(() => {
      document.getElementById('forecast-chart-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="flex flex-col gap-4">
      <ExplainBanner icon={TrendingUp} color="#12a6e0"
        title="Prévision des sorties — AutoARIMA"
        description="Ce modèle prédit combien d'unités vont sortir du stock dans les 30 prochains jours pour chaque article important. Il analyse automatiquement les tendances passées, les cycles hebdomadaires et les variations saisonnières pour faire ses prévisions."
        tip="Cliquez sur « Voir » pour afficher le graphe détaillé d'un article avec le tableau des 7 prochains jours." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Modèle" value="AutoARIMA" color="#185FA5" hint="Modèle statistique de prévision de séries temporelles — détecte automatiquement les tendances et cycles." />
        <KpiCard label="Articles prédits" value={rows.length} color="#0d0c0c" hint="Nombre d'articles sélectionnés par la règle Pareto 80% — les plus importants en volume de sorties." sub="top 80% des sorties" />
        <KpiCard label="MAE moyen" value={`${maeM} u/j`} color="#854F0B" hint="Erreur absolue moyenne : en moyenne le modèle se trompe de X unités par jour. Plus c'est bas = plus précis." sub="erreur moyenne / jour" />
        <KpiCard label="MAPE moyen" value={mapeM ? `${mapeM}%` : 'N/A'} color="#3B6D11" hint="Erreur en % : Vert < 30% = excellent, Orange = acceptable, Rouge = à améliorer. N/A si sorties = 0." sub={mapeM ? (Number(mapeM) < 30 ? 'Excellente précision' : Number(mapeM) < 60 ? 'Précision acceptable' : 'À améliorer') : 'Sorties nulles'} />
      </div>

      <div id="forecast-chart-anchor" />
      {selectedArt && (
        <div className="bg-white border-2 border-[#12a6e0] rounded-xl p-4 shadow-[0_2px_12px_rgba(18,166,224,0.12)]">
          <ForecastChart baseName={baseName} arRef={selectedArt} onClose={() => setSelectedArt(null)} />
        </div>
      )}

      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#12a6e0]" />
            <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Performances par article</span>
            <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{rows.length} articles</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#888]">
            Trier par :
            {['MAPE', 'MAE'].map(k => (
              <button key={k} onClick={() => { setSortKey(k); setPage(1); }}
                className="px-2 py-1 rounded text-xs transition-all cursor-pointer"
                style={{ background: sortKey === k ? '#E6F1FB' : '#f5f5f5', color: sortKey === k ? '#185FA5' : '#666', fontWeight: sortKey === k ? 500 : 400 }}>{k}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
                <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">MAE <Tooltip text="Erreur absolue moyenne en unités/jour. Plus bas = plus précis." /></th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">RMSE <Tooltip text="Erreur quadratique — pénalise les grandes erreurs." /></th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">MAPE <Tooltip text="Erreur en %. Vert < 30% = excellent. Orange = acceptable. Rouge = imprécis." /></th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Train <Tooltip text="Jours utilisés pour entraîner le modèle (80%)." /></th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Test <Tooltip text="Jours utilisés pour valider le modèle (20%)." /></th>
                <th className="px-4 py-2.5 text-center text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Prévision J+30</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, i) => (
                <tr key={i} className="border-b border-[#f8f8f8] transition-colors"
                  style={{ background: selectedArt === r.AR_Ref ? 'rgba(18,166,224,0.06)' : undefined }}>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{r.AR_Ref}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.MAE)}</td>
                  <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.RMSE)}</td>
                  <td className="px-4 py-2.5 text-right"><MAPEBadge value={r.MAPE} /></td>
                  <td className="px-4 py-2.5 text-right text-[0.75rem] text-[#888]">{fmtNum(r.nb_train)}</td>
                  <td className="px-4 py-2.5 text-right text-[0.75rem] text-[#888]">{fmtNum(r.nb_test)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => handleSelect(r.AR_Ref)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[0.7rem] font-medium transition-all cursor-pointer"
                      style={{ background: selectedArt === r.AR_Ref ? '#E6F1FB' : '#f0fdf4', color: selectedArt === r.AR_Ref ? '#185FA5' : '#15803d', border: selectedArt === r.AR_Ref ? '1px solid #B5D4F4' : '1px solid rgba(21,128,61,0.25)' }}>
                      <BarChart2 size={11} />{selectedArt === r.AR_Ref ? 'Fermer' : 'Voir graphe'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}

// ── Onglet 2 : Ruptures ──────────────────────────────────────
function TabRuptures({ data }) {
  const rows        = data?.results?.rf || [];
  const importances = data?.results?.rf_importance || [];
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [data]);

  if (!rows.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <AlertTriangle size={36} className="mb-3" /><p className="text-sm">Aucune donnée de rupture disponible</p>
    </div>
  );

  const sorted    = [...rows].sort((a, b) => (Number(a.jours_estimes) || 999) - (Number(b.jours_estimes) || 999));
  const danger    = sorted.filter(r => Number(r.jours_estimes) < 7).length;
  const alerte    = sorted.filter(r => Number(r.jours_estimes) >= 7 && Number(r.jours_estimes) < 30).length;
  const ok        = sorted.filter(r => Number(r.jours_estimes) >= 30).length;
  const maxImp    = importances.length ? Math.max(...importances.map(i => Number(i.importance) || 0)) : 1;
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <ExplainBanner icon={AlertTriangle} color="#e53935"
        title="Estimation des ruptures de stock — Random Forest"
        description="Pour chaque article, ce modèle calcule dans combien de jours le stock va s'épuiser si on continue au même rythme de vente. C'est calculé en divisant le stock actuel par la moyenne des sorties des 7 derniers jours."
        tip="Rouge = commander maintenant. Orange = planifier une commande cette semaine. Vert = stock suffisant pour le mois." />

      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Rupture critique (< 7j)" value={danger} color="#A32D2D" hint="Stock qui s'épuise en moins d'une semaine. Commande urgente requise." sub="commander immédiatement" />
        <KpiCard label="Alerte (7 à 30j)"         value={alerte} color="#854F0B" hint="Stock suffisant pour 1 à 4 semaines. Planifier une commande prochainement." sub="planifier une commande" />
        <KpiCard label="Stock OK (> 30j)"          value={ok}     color="#3B6D11" hint="Stock suffisant pour plus d'un mois au rythme actuel." sub="aucune action requise" />
      </div>

      <RuptureBarChart rows={sorted} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
            <div className="w-2 h-2 rounded-full bg-[#e53935]" />
            <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Tous les articles — du plus urgent au moins urgent</span>
            <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{rows.length} articles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
                  <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
                  <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Jours restants <Tooltip text="Nombre de jours avant que le stock soit épuisé au rythme actuel de vente." /></th>
                  <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Stock actuel <Tooltip text="Dernière quantité connue en stock pour cet article." /></th>
                  <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Ventes/jour <Tooltip text="Moyenne des sorties sur les 7 derniers jours — utilisée pour calculer les jours restants." /></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, i) => (
                  <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{r.AR_Ref}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right"><RuptureBadge value={r.jours_estimes} /></td>
                    <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.StockFinal)} unités</td>
                    <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.rolling_mean_7)} u/j</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>

        {importances.length > 0 ? (
          <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
              <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Facteurs clés</span>
              <Tooltip text="Variables qui ont le plus influencé les prédictions du modèle Random Forest." />
            </div>
            <div className="px-4 py-3 flex flex-col gap-3">
              {[...importances].sort((a, b) => Number(b.importance) - Number(a.importance)).map((imp, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#555] font-mono text-[11px]">{imp.feature}</span>
                    <span className="text-[#888] font-semibold">{(Number(imp.importance) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(Number(imp.importance) / maxImp) * 100}%`, background: 'linear-gradient(90deg, #12a6e0, #0d8fc4)' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-3">
              <div className="rounded-lg px-3 py-2 text-[11px] text-[#555] leading-relaxed" style={{ background: '#f0f9ff', borderLeft: '3px solid #12a6e0' }}>
                Le facteur avec le % le plus élevé est ce qui influence le plus la prédiction de rupture.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
            <Info size={20} className="text-[#c5c5c5]" />
            <p className="text-xs text-[#aaa] m-0">Détail des facteurs non disponible pour cette base.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Onglet 3 : Anomalies ─────────────────────────────────────
function TabAnomalies({ data }) {
  const rows = data?.results?.iforest || [];
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [data]);

  if (!rows.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <Radar size={36} className="mb-3" /><p className="text-sm">Aucune donnée d'anomalie disponible</p>
    </div>
  );

  const anomalies = rows.filter(r => r.is_anomalie === 1);
  const pctAno    = ((anomalies.length / rows.length) * 100).toFixed(1);
  const top100    = [...anomalies].sort((a, b) => Number(a.anomaly_score) - Number(b.anomaly_score)).slice(0, 100);
  const paginated = top100.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <ExplainBanner icon={Radar} color="#EF9F27"
        title="Détection d'anomalies — Isolation Forest"
        description="Ce modèle analyse automatiquement tous les mouvements de stock pour repérer ceux qui sont inhabituels : une sortie anormalement élevée un certain jour, un stock qui baisse trop vite, ou une combinaison de valeurs rare. Ces cas méritent une vérification dans SAGE."
        tip="Un score très négatif (ex: -0.30) = mouvement très suspect. Un score proche de 0 = à la limite de la normale." />

      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total mouvements analysés" value={fmtNum(rows.length)} color="#0d0c0c" hint="Nombre total de lignes de stock analysées par le modèle." sub="mouvements journaliers" />
        <KpiCard label="Anomalies détectées"        value={fmtNum(anomalies.length)} color="#A32D2D" hint="Mouvements jugés anormaux — à vérifier manuellement dans SAGE." sub="mouvements suspects" />
        <KpiCard label="Taux d'anomalies"           value={`${pctAno}%`} color="#854F0B" hint="Fixé à 5% par défaut. Signifie que 5% des mouvements sont considérés anormaux." sub="5% par paramétrage" />
      </div>

      <AnomalyScatter rows={rows} />

      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
          <div className="w-2 h-2 rounded-full bg-[#e53935]" />
          <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Anomalies les plus sévères à vérifier</span>
          <span className="bg-[#FCEBEB] text-[#791F1F] text-[0.6875rem] font-mono px-2 py-0.5 rounded">score négatif bas = plus suspect</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0f0] bg-[#f8f8f8]">
                <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Date</th>
                <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Article</th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Qté sortie <Tooltip text="Quantité sortie ce jour — anormalement élevée ou basse." /></th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Stock restant <Tooltip text="Stock restant à la fin de cette journée." /></th>
                <th className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Score d'anomalie <Tooltip text="Plus négatif = plus suspect. Score calculé par Isolation Forest." /></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, i) => (
                <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(229,57,53,0.02)] transition-colors">
                  <td className="px-4 py-2.5 font-mono text-[0.72rem] text-[#888]">{r.DateJour ? fmtDate(r.DateJour) : '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{r.AR_Ref}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#b71c1c] font-semibold">{fmtNum(r.TotalSortie)} unités</td>
                  <td className="px-4 py-2.5 text-right text-[0.8rem] text-[#444]">{fmtNum(r.StockFinal)} unités</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-[0.72rem] font-mono text-[#854F0B] bg-[#FAEEDA] px-2 py-0.5 rounded">{Number(r.anomaly_score).toFixed(4)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={top100.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}

// ── Onglet 4 : Segmentation (sans doublon visuel) ──────────────
function TabSegmentation({ data }) {
  const clusters = data?.results?.kmeans   || [];
  const segments = data?.results?.segments || [];
  const [filtre, setFiltre] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [data, filtre]);

  if (!clusters.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
      <Shapes size={36} className="mb-3" /><p className="text-sm">Aucune donnée de segmentation disponible</p>
    </div>
  );

  const COLORS = {
    'forte rotation'   : { bg: '#FCEBEB', text: '#791F1F', dot: '#E24B4A' },
    'rotation moyenne' : { bg: '#FAEEDA', text: '#633806', dot: '#EF9F27' },
    'faible rotation'  : { bg: '#E6F1FB', text: '#0C447C', dot: '#378ADD' },
    'quasi-immobile'   : { bg: '#F1EFE8', text: '#444441', dot: '#888780' },
  };
  const DESCRIPTIONS = {
    'forte rotation'   : 'Articles très demandés — réapprovisionner en priorité absolue',
    'rotation moyenne' : 'Articles avec activité régulière — surveiller le stock régulièrement',
    'faible rotation'  : 'Articles peu demandés — commandes ponctuelles suffisantes',
    'quasi-immobile'   : 'Articles presque jamais vendus — envisager liquidation ou réduction',
  };
  const getColor = (seg) => COLORS[seg] || { bg: '#f0f0f0', text: '#555', dot: '#aaa' };
  const articlesFiltres = filtre ? segments.filter(s => s.segment === filtre) : segments;
  const paginated       = articlesFiltres.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <ExplainBanner icon={Shapes} color="#7F77DD"
        title="Segmentation des articles — K-Means"
        description="Le modèle K-Means analyse automatiquement les ventes mensuelles de chaque article et les regroupe selon leur profil de consommation. Les articles similaires sont placés dans le même groupe. Cela permet d'adapter la stratégie de stock à chaque type d'article."
        tip="Forte rotation = commander souvent et en grande quantité. Quasi-immobile = réduire le stock ou arrêter la référence." />

      {/* Un seul bloc visuel : donut + descriptions intégrées (plus de répétition) */}
      <SegmentDonut clusters={clusters} segments={segments} />

      {/* Tableau articles */}
      {segments.length > 0 && (
        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#7F77DD]" />
              <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#0d0c0c]">Liste des articles par segment</span>
              <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{articlesFiltres.length} articles</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setFiltre('')} className="px-2 py-1 text-xs rounded transition-all cursor-pointer"
                style={{ background: !filtre ? '#EEEDFE' : '#f5f5f5', color: !filtre ? '#3C3489' : '#666' }}>Tous</button>
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
                  <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Segment <Tooltip text="Groupe attribué automatiquement selon le profil de consommation mensuel." /></th>
                  <th className="px-4 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[#888]">Signification</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s, i) => {
                  const col  = getColor(s.segment);
                  const desc = DESCRIPTIONS[s.segment] || '';
                  return (
                    <tr key={i} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors">
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">{s.AR_Ref}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: col.bg, color: col.text }}>{s.segment}</span>
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-[#777]">{desc}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={articlesFiltres.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

// ── Onglets config ────────────────────────────────────────────
const TABS = [
  { id: 'prevision',    label: 'Prévision sorties', icon: TrendingUp    },
  { id: 'ruptures',     label: 'Ruptures estimées', icon: AlertTriangle },
  { id: 'anomalies',    label: 'Anomalies',         icon: Radar         },
  { id: 'segmentation', label: 'Segmentation',      icon: Shapes        },
];

// ── Page principale ───────────────────────────────────────────
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
      if (st.status === 'success') { const res = await fetchPredictionResults(base); setResults(res); }
      else if (st.status === 'running') setPolling(true);
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
        if (st.status === 'success') { setPolling(false); const res = await fetchPredictionResults(baseName); setResults(res); }
        else if (st.status === 'failed') { setPolling(false); setError('Le pipeline a échoué.'); }
      } catch (e) { setPolling(false); }
    }, 5000);
    return () => clearInterval(interval);
  }, [polling, baseName]);

  const handleRunPipeline = async () => {
    if (!baseName) return;

    // Vérifier d'abord si déjà success → juste recharger
    try {
      const st = await fetchPipelineStatus(baseName);
      if (st.status === 'success') {
        setStatus(st);
        setError(null);
        const res = await fetchPredictionResults(baseName);
        setResults(res);
        return;
      }
    } catch (e) {}

    // Sinon lancer le pipeline
    setError(null);
    setResults(null);
    setStatus({ status: 'running' });
    setPolling(true);
    try { await runPipeline(baseName); }
    catch (e) { setError(e.message); setPolling(false); }
  };

  const BANNERS = {
    running    : { bg: '#E6F1FB', border: '#B5D4F4', color: '#0C447C', icon: <Loader2 size={15} className="animate-spin flex-shrink-0" />, msg: <>Calcul des prédictions en cours pour <strong>{baseName}</strong>… Mise à jour automatique toutes les 5 secondes.</> },
    success    : { bg: '#EAF3DE', border: '#C0DD97', color: '#27500A', icon: <CheckCircle size={15} className="flex-shrink-0" />, msg: <>Prédictions disponibles pour <strong>{baseName}</strong>{status?.duration_s ? ` — calculées en ${status.duration_s} secondes` : ''}</> },
    failed     : { bg: '#FCEBEB', border: '#F7C1C1', color: '#791F1F', icon: <XCircle size={15} className="flex-shrink-0" />, msg: <>Le calcul a échoué pour <strong>{baseName}</strong>. Cliquez sur "Relancer" pour réessayer.</> },
    not_started: { bg: '#FAEEDA', border: '#FAC775', color: '#633806', icon: <Clock size={15} className="flex-shrink-0" />, msg: <>Aucune prédiction générée pour <strong>{baseName}</strong>. Cliquez sur "Relancer" pour lancer le calcul.</> },
  };

  const StatusBanner = () => {
    if (!status) return null;
    const key = (status.status === 'running' || polling) ? 'running' : status.status;
    const b   = BANNERS[key];
    if (!b) return null;
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
        style={{ background: b.bg, borderColor: b.border, color: b.color }}>
        {b.icon}<span>{b.msg}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.1rem] font-semibold text-[#0d0c0c] m-0">Analyse prédictive</h1>
          <p className="text-[0.8rem] text-[#aaaaaa] m-0 mt-0.5">
            AutoARIMA · Random Forest · Isolation Forest · K-Means — basé sur les données historiques SAGE
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BaseSelector bases={bases} value={baseName} onChange={setBaseName} loading={loadingBase} />
          <button onClick={handleRunPipeline} disabled={!baseName || polling}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
            style={{ background: polling ? '#f5f5f5' : 'white', borderColor: '#e0e0e0', color: polling ? '#aaa' : '#555', cursor: polling ? 'not-allowed' : 'pointer' }}
            title="Relancer le calcul des prédictions">
            <RefreshCw size={13} className={polling ? 'animate-spin' : ''} />
            {polling ? 'Calcul en cours…' : 'Relancer'}
          </button>
        </div>
      </div>

      <StatusBanner />

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
          style={{ background: '#FCEBEB', borderColor: '#F7C1C1', color: '#791F1F' }}>
          <XCircle size={15} className="flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      <div className="flex gap-1 border-b border-[#e8e8e8]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer"
            style={{ borderBottomColor: activeTab === id ? '#12a6e0' : 'transparent', color: activeTab === id ? '#12a6e0' : '#888888', background: 'transparent' }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-[#12a6e0]">
          <Loader2 size={20} className="animate-spin" /><span className="text-sm">Chargement des prédictions…</span>
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

