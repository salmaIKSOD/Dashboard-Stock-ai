// import React, { useMemo, useState } from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, Cell, ReferenceLine,
//   RadialBarChart, RadialBar,
// } from 'recharts';
// import {
//   TrendingUp, TrendingDown, Minus,
//   ArrowLeftRight, CalendarDays, Database,
//   Tag, Layers, AlertTriangle, Clock,
//   PackageX, ChevronDown, ChevronUp,
//   Activity,
// } from 'lucide-react';
// import { useDashboard } from '../context/DashboardContext';

// // ── Palette identique au projet ───────────────────────────────
// const C = {
//   blue:       '#12a6e0',
//   blueLight:  'rgba(18,166,224,0.08)',
//   green:      '#01a82e',
//   greenLight: 'rgba(1,168,46,0.08)',
//   red:        '#e53935',
//   redLight:   'rgba(229,57,53,0.08)',
//   amber:      '#e08a00',
//   amberLight: 'rgba(224,138,0,0.08)',
//   purple:     '#7c4dff',
//   purpleLight:'rgba(124,77,255,0.08)',
//   border:     '#f0f0f0',
//   text:       '#0d0c0c',
//   muted:      '#888888',
//   light:      '#c5c5c5',
// };

// // ── Helpers ───────────────────────────────────────────────────
// const fmtNum = (n) =>
//   new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n ?? 0);

// const fmtPct = (n) => `${Number(n ?? 0).toFixed(1)}%`;

// const fmtShort = (d) => {
//   if (!d) return '';
//   const [y, m, dd] = d.split('-');
//   return `${dd}/${m}/${y}`;
// };

// // Détecteur de colonnes — même logique que StockTable / PageMovements
// function useCols(data) {
//   return useMemo(() => {
//     if (!data || !data.length) return {};
//     const keys = Object.keys(data[0]);
//     const find = (...variants) =>
//       keys.find(k =>
//         variants.some(v =>
//           k.toLowerCase().replace(/[\s_()]/g, '') === v.toLowerCase().replace(/[\s_()]/g, '')
//         )
//       ) || null;
//     return {
//       date:    find('Date', 'DateJour'),
//       article: find('Article', 'AR_Ref'),
//       design:  find('Designation', 'AR_Design', 'Désignation'),
//       depot:   find('Depot', 'DE_No'),
//       nomDep:  find('Nom Depot', 'NomDepot', 'DE_Intitule'),
//       entrees: find('TotalEntrees', 'Total Entrees', 'TotalEntree'),
//       sorties: find('TotalSorties', 'Total Sorties', 'TotalSortie'),
//       stock:   find('StockFinal', 'Stock Final', 'stockfinal'),
//       valeur:  find('ValeurFinalePermanente', 'Valeur Finale (Permanente)', 'ValeurFinale', 'valeurfinale', 'Solde'),
//       catN1:   find('CatN1', 'Cat N1', 'CL_Intitule1'),
//       famille: find('Intitule Famille', 'FA_Intitule', 'faintitule'),
//     };
//   }, [data]);
// }

// // ── Card ──────────────────────────────────────────────────────
// function TrendCard({ icon: Icon, iconColor, iconBg, title, subtitle, children, badge }) {
//   return (
//     <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.05)] flex flex-col">
//       <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f4f4f4]">
//         <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
//           style={{ background: iconBg, color: iconColor }}>
//           <Icon size={17} />
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2">
//             <p className="text-[#0d0c0c] text-[13px] font-semibold m-0 leading-tight">{title}</p>
//             {badge && (
//               <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
//                 style={{ background: iconBg, color: iconColor }}>
//                 {badge}
//               </span>
//             )}
//           </div>
//           {subtitle && <p className="text-[#aaaaaa] text-[11px] m-0 mt-0.5">{subtitle}</p>}
//         </div>
//       </div>
//       <div className="flex-1 p-5">{children}</div>
//     </div>
//   );
// }

// // ── Empty ─────────────────────────────────────────────────────
// function Empty({ msg }) {
//   return (
//     <div className="flex flex-col items-center justify-center py-12 gap-3">
//       <PackageX size={28} className="text-[#e0e0e0]" />
//       <p className="text-[#c5c5c5] text-[12px] text-center max-w-[220px] leading-relaxed">{msg ?? 'Aucune donnée disponible'}</p>
//     </div>
//   );
// }

// // ── Bandeau contexte ──────────────────────────────────────────
// function ContextBanner({ filters }) {
//   return (
//     <div className="bg-white border border-[#e4e4e4] rounded-[1.1rem] shadow-[0_2px_12px_rgba(18,166,224,0.07)] overflow-hidden">
//       <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-[#f8fcff] to-[#f0f9ff] border-b border-[#e8f4fb]">
//         <div className="w-6 h-6 rounded-[0.45rem] bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow-sm">
//           <TrendingUp size={12} className="text-white" />
//         </div>
//         <span className="text-[#0d0c0c] text-[13px] font-semibold tracking-wide">Tendances</span>
//         <span className="text-[#c5c5c5] text-[11px] ml-1">— Contexte du tableau de bord</span>
//       </div>
//       <div className="px-5 py-3.5">
//         <div className="flex flex-wrap items-center gap-2">
//           {filters?.base && (
//             <div className="flex items-center gap-1.5 bg-[rgba(1,214,58,0.07)] border border-[rgba(1,214,58,0.22)] rounded-full px-3 py-1.5">
//               <Database size={11} className="text-[#01a82e]" />
//               <span className="text-[#01a82e] text-[11px] font-bold uppercase tracking-wide">{filters.base}</span>
//             </div>
//           )}
//           {filters?.dateDebut && filters?.dateFin && (
//             <div className="flex items-center gap-1.5 bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.22)] rounded-full px-3 py-1.5">
//               <CalendarDays size={11} className="text-[#12a6e0]" />
//               <span className="text-[#0b7db0] text-[11px] font-semibold">
//                 {fmtShort(filters.dateDebut)} → {fmtShort(filters.dateFin)}
//               </span>
//             </div>
//           )}
//           {filters?.fa_codefamille && (
//             <div className="flex items-center gap-1.5 bg-[rgba(124,77,255,0.07)] border border-[rgba(124,77,255,0.22)] rounded-full px-3 py-1.5">
//               <Tag size={11} className="text-[#7c4dff]" />
//               <span className="text-[#7c4dff] text-[11px] font-semibold">{filters.fa_codefamille}</span>
//             </div>
//           )}
//           {filters?.cl_no1 && (
//             <div className="flex items-center gap-1.5 bg-[rgba(224,138,0,0.07)] border border-[rgba(224,138,0,0.22)] rounded-full px-3 py-1.5">
//               <Layers size={11} className="text-[#e08a00]" />
//               <span className="text-[#e08a00] text-[11px] font-semibold">Cat N1 : {filters.cl_no1}</span>
//             </div>
//           )}
//           {!filters?.base && (
//             <span className="text-[#c5c5c5] text-[12px] italic">
//               Filtrez depuis le tableau de bord pour afficher les tendances.
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════════
// //  TENDANCE 1 — Taux de rotation par article
// //  = Sorties totales / Stock moyen de la période
// //  Plus le taux est élevé, plus l'article "tourne" vite.
// // ════════════════════════════════════════════════════════════════
// function TauxRotation({ data, cols }) {
//   const [sortBy, setSortBy] = useState('taux'); // 'taux' | 'sorties' | 'stock'
//   const [showAll, setShowAll] = useState(false);

//   const rows = useMemo(() => {
//     if (!data?.length || !cols.article) return [];

//     const byArticle = {};
//     for (const r of data) {
//       const code = r[cols.article] ?? '?';
//       if (!byArticle[code]) byArticle[code] = {
//         code,
//         name:    r[cols.design] ?? code,
//         catN1:   r[cols.catN1]  ?? '—',
//         sorties: 0,
//         stocks:  [],
//       };
//       byArticle[code].sorties += Number(r[cols.sorties] ?? 0);
//       const sf = Number(r[cols.stock] ?? 0);
//       if (sf > 0) byArticle[code].stocks.push(sf);
//     }

//     return Object.values(byArticle)
//       .map(a => {
//         const stockMoyen = a.stocks.length
//           ? a.stocks.reduce((s, v) => s + v, 0) / a.stocks.length
//           : 0;
//         const taux = stockMoyen > 0 ? (a.sorties / stockMoyen) * 100 : 0;
//         return { ...a, stockMoyen, taux };
//       })
//       .filter(a => a.sorties > 0 || a.stockMoyen > 0)
//       .sort((a, b) => b[sortBy] - a[sortBy]);
//   }, [data, cols, sortBy]);

//   if (!rows.length) return <Empty msg="Aucun article avec mouvements trouvé" />;

//   const displayed = showAll ? rows : rows.slice(0, 15);

//   // Seuils visuels pour le taux
//   const tauxMax = Math.max(...rows.map(r => r.taux), 1);

//   const rotBadge = (taux) => {
//     if (taux >= 100) return { label: 'Rapide',  color: C.green,  bg: C.greenLight };
//     if (taux >= 30)  return { label: 'Moyen',   color: C.amber,  bg: C.amberLight };
//     if (taux >= 5)   return { label: 'Lent',    color: C.red,    bg: C.redLight   };
//     return              { label: 'Très lent', color: '#888888', bg: '#f5f5f5'   };
//   };

//   const SortBtn = ({ id, label }) => (
//     <button
//       onClick={() => setSortBy(id)}
//       className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 ${
//         sortBy === id ? 'bg-[#12a6e0] text-white shadow-sm' : 'text-[#888888] hover:bg-[#f0f0f0]'
//       }`}
//     >
//       {label}
//     </button>
//   );

//   return (
//     <div className="flex flex-col gap-4">
//       {/* Tabs + légende */}
//       <div className="flex flex-wrap items-center gap-3">
//         <div className="flex items-center gap-1 bg-[#f8f8f8] border border-[#eeeeee] rounded-xl p-1">
//           <SortBtn id="taux"    label="Par taux %" />
//           <SortBtn id="sorties" label="Par sorties" />
//           <SortBtn id="stockMoyen" label="Par stock" />
//         </div>
//         <div className="flex items-center gap-3 ml-auto">
//           {[
//             { label: 'Rapide ≥100%', color: C.green },
//             { label: 'Moyen ≥30%',  color: C.amber },
//             { label: 'Lent ≥5%',    color: C.red   },
//           ].map(l => (
//             <div key={l.label} className="flex items-center gap-1.5">
//               <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
//               <span className="text-[10px] text-[#888888]">{l.label}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Tableau */}
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse text-[12px]">
//           <thead>
//             <tr className="border-b border-[#f0f0f0]">
//               {['Article', 'Désignation', 'Sorties', 'Stock moyen', 'Taux rotation', ''].map((h, i) => (
//                 <th key={i} className={`px-3 py-2 bg-[#f8f8f8] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888888] ${i >= 2 ? 'text-right' : 'text-left'}`}>
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {displayed.map((row, idx) => {
//               const badge = rotBadge(row.taux);
//               const pct   = tauxMax > 0 ? (row.taux / tauxMax) * 100 : 0;
//               return (
//                 <tr key={row.code} className={`border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors`}>
//                   <td className="px-3 py-2.5 whitespace-nowrap">
//                     <span className="inline-block font-mono text-[0.7rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
//                       {row.code}
//                     </span>
//                   </td>
//                   <td className="px-3 py-2.5 text-[#444444] max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.name}>
//                     {row.name}
//                   </td>
//                   <td className="px-3 py-2.5 text-right">
//                     <span className="text-[#e53935] font-semibold">{fmtNum(row.sorties)}</span>
//                   </td>
//                   <td className="px-3 py-2.5 text-right text-[#555555]">
//                     {fmtNum(row.stockMoyen)}
//                   </td>
//                   <td className="px-3 py-2.5 text-right">
//                     <div className="flex items-center justify-end gap-2">
//                       {/* Mini barre */}
//                       <div className="w-16 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
//                         <div
//                           className="h-full rounded-full transition-all duration-300"
//                           style={{ width: `${Math.min(pct, 100)}%`, background: badge.color }}
//                         />
//                       </div>
//                       <span className="font-bold w-14 text-right" style={{ color: badge.color }}>
//                         {fmtPct(row.taux)}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-3 py-2.5">
//                     <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
//                       style={{ background: badge.bg, color: badge.color }}>
//                       {badge.label}
//                     </span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {rows.length > 15 && (
//         <button
//           onClick={() => setShowAll(s => !s)}
//           className="flex items-center gap-1.5 mx-auto text-[12px] text-[#12a6e0] font-semibold hover:underline"
//         >
//           {showAll ? <><ChevronUp size={13} /> Réduire</> : <><ChevronDown size={13} /> Voir les {rows.length - 15} autres</>}
//         </button>
//       )}
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════════
// //  TENDANCE 2 — Comparaison mois par mois (N vs N-1)
// //  Regroupe par mois, compare chaque mois à celui de l'année précédente
// // ════════════════════════════════════════════════════════════════
// function ComparaisonMois({ data, cols }) {
//   const [metric, setMetric] = useState('entrees');

//   const { chartData, hasPrevYear } = useMemo(() => {
//     if (!data?.length || !cols.date) return { chartData: [], hasPrevYear: false };

//     const byMonth = {};
//     for (const r of data) {
//       const raw = r[cols.date];
//       if (!raw) continue;
//       const iso = typeof raw === 'string' ? raw.slice(0, 10) : new Date(raw).toISOString().slice(0, 10);
//       const [y, m] = iso.split('-');
//       const key = `${y}-${m}`;
//       if (!byMonth[key]) byMonth[key] = { year: y, month: m, key, entrées: 0, sorties: 0, stock: 0, valeur: 0, n: 0 };
//       byMonth[key].entrées += Number(r[cols.entrees] ?? 0);
//       byMonth[key].sorties += Number(r[cols.sorties] ?? 0);
//       byMonth[key].stock   += Number(r[cols.stock]   ?? 0);
//       byMonth[key].valeur  += Number(r[cols.valeur]  ?? 0);
//       byMonth[key].n       += 1;
//     }

//     const months = Object.values(byMonth).sort((a, b) => a.key.localeCompare(b.key));
//     const monthNames = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

//     // Regrouper par (mois, année) pour comparaison
//     const byYearMonth = {};
//     for (const m of months) {
//       const mk = m.month; // '01'..'12'
//       if (!byYearMonth[mk]) byYearMonth[mk] = {};
//       byYearMonth[mk][m.year] = m;
//     }

//     const years = [...new Set(months.map(m => m.year))].sort();
//     const hasPrev = years.length >= 2;

//     const chartRows = Object.entries(byYearMonth).map(([mk, byY]) => {
//       const row = { mois: monthNames[parseInt(mk) - 1] };
//       for (const y of years) {
//         row[`${y}`] = byY[y]?.[metric === 'entrees' ? 'entrées' : metric === 'sorties' ? 'sorties' : metric === 'stock' ? 'stock' : 'valeur'] ?? 0;
//       }
//       if (hasPrev && years.length === 2) {
//         const vN   = row[years[1]] ?? 0;
//         const vN1  = row[years[0]] ?? 0;
//         row.variation = vN1 > 0 ? ((vN - vN1) / vN1) * 100 : null;
//       }
//       return row;
//     });

//     return { chartData: chartRows, years, hasPrevYear: hasPrev };
//   }, [data, cols, metric]);

//   // Re-extract years from chart data
//   const years = useMemo(() => {
//     if (!data?.length || !cols.date) return [];
//     const ys = new Set();
//     for (const r of data) {
//       const raw = r[cols.date];
//       if (!raw) continue;
//       const iso = typeof raw === 'string' ? raw.slice(0, 10) : new Date(raw).toISOString().slice(0, 10);
//       ys.add(iso.slice(0, 4));
//     }
//     return [...ys].sort();
//   }, [data, cols]);

//   if (!chartData.length) return <Empty msg="Données insuffisantes pour la comparaison" />;

//   const YEAR_COLORS = [C.blue, C.green, C.amber, C.purple];

//   const MetBtn = ({ id, label }) => (
//     <button
//       onClick={() => setMetric(id)}
//       className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 ${
//         metric === id ? 'bg-[#12a6e0] text-white shadow-sm' : 'text-[#888888] hover:bg-[#f0f0f0]'
//       }`}
//     >
//       {label}
//     </button>
//   );

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="flex items-center justify-between flex-wrap gap-2">
//         <div className="flex items-center gap-1 bg-[#f8f8f8] border border-[#eeeeee] rounded-xl p-1">
//           <MetBtn id="entrees" label="Entrées" />
//           <MetBtn id="sorties" label="Sorties" />
//           <MetBtn id="stock"   label="Stock final" />
//           <MetBtn id="valeur"  label="Valeur" />
//         </div>
//         {!hasPrevYear && (
//           <span className="text-[11px] text-[#aaaaaa] italic">Une seule année dans la période — étendez la plage pour comparer</span>
//         )}
//       </div>

//       <ResponsiveContainer width="100%" height={240}>
//         <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barGap={4}>
//           <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
//           <XAxis dataKey="mois" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={{ stroke: C.border }} />
//           <YAxis tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false}
//             tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
//           <Tooltip
//             cursor={{ fill: 'rgba(18,166,224,0.04)' }}
//             content={({ active, payload, label }) => {
//               if (!active || !payload?.length) return null;
//               return (
//                 <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-lg px-4 py-3 text-[12px]">
//                   <p className="text-[#888888] mb-1.5 font-medium">{label}</p>
//                   {payload.map((p, i) => (
//                     <div key={i} className="flex items-center gap-2 mb-0.5">
//                       <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
//                       <span className="text-[#555555]">{p.dataKey} :</span>
//                       <span className="font-semibold text-[#0d0c0c]">{fmtNum(p.value)}</span>
//                     </div>
//                   ))}
//                 </div>
//               );
//             }}
//           />
//           {years.map((y, i) => (
//             <Bar key={y} dataKey={y} name={y} fill={YEAR_COLORS[i % YEAR_COLORS.length]}
//               radius={[3, 3, 0, 0]} fillOpacity={0.85} />
//           ))}
//         </BarChart>
//       </ResponsiveContainer>

//       {/* Variation N vs N-1 si 2 années */}
//       {hasPrevYear && years.length === 2 && (
//         <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
//           {chartData.filter(r => r.variation !== null && r.variation !== undefined).slice(0, 4).map(r => (
//             <div key={r.mois} className="bg-[#f8f8f8] rounded-xl px-3 py-2.5 border border-[#eeeeee]">
//               <p className="text-[#aaaaaa] text-[10px] m-0 mb-0.5">{r.mois}</p>
//               <p className={`font-bold text-[0.95rem] m-0 flex items-center gap-1 ${
//                 r.variation > 0 ? 'text-[#01a82e]' : r.variation < 0 ? 'text-[#e53935]' : 'text-[#888888]'
//               }`}>
//                 {r.variation > 0 ? <TrendingUp size={12} /> : r.variation < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
//                 {r.variation !== null ? `${r.variation > 0 ? '+' : ''}${r.variation.toFixed(1)}%` : '—'}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════════
// //  TENDANCE 3 — Jours de stock restants
// //  = Stock final ÷ (total sorties / nb jours de la période)
// // ════════════════════════════════════════════════════════════════
// function JoursDeStock({ data, cols, filters }) {
//   const [showAll, setShowAll] = useState(false);

//   const { rows, nbJours } = useMemo(() => {
//     if (!data?.length || !cols.article) return { rows: [], nbJours: 1 };

//     // Nombre de jours de la période
//     let nj = 30;
//     if (filters?.dateDebut && filters?.dateFin) {
//       const d1 = new Date(filters.dateDebut);
//       const d2 = new Date(filters.dateFin);
//       nj = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
//     }

//     const byArtDepot = {};
//     for (const r of data) {
//       const key = `${r[cols.article]}__${r[cols.depot]}`;
//       if (!byArtDepot[key]) byArtDepot[key] = {
//         article: r[cols.article] ?? '?',
//         name:    r[cols.design]  ?? '',
//         depot:   r[cols.depot]   ?? '?',
//         nomDep:  r[cols.nomDep]  ?? '',
//         catN1:   r[cols.catN1]   ?? '—',
//         sorties: 0,
//         stockFinal: 0,
//       };
//       byArtDepot[key].sorties    += Number(r[cols.sorties] ?? 0);
//       byArtDepot[key].stockFinal  = Number(r[cols.stock]   ?? 0); // dernier lu = dernier jour
//     }

//     // Pour avoir le vrai stock final du dernier jour, on prend le max de la date
//     // (approche simplifiée : stocker la valeur de la dernière ligne triée par date)
//     const lastByKey = {};
//     const sortedData = [...data].sort((a, b) => {
//       const da = (a[cols.date] ?? '').slice(0, 10);
//       const db = (b[cols.date] ?? '').slice(0, 10);
//       return da.localeCompare(db);
//     });
//     for (const r of sortedData) {
//       const key = `${r[cols.article]}__${r[cols.depot]}`;
//       const sf = Number(r[cols.stock] ?? 0);
//       if (sf >= 0) lastByKey[key] = sf;
//     }
//     for (const key of Object.keys(byArtDepot)) {
//       if (lastByKey[key] !== undefined) byArtDepot[key].stockFinal = lastByKey[key];
//     }

//     const result = Object.values(byArtDepot)
//       .filter(a => a.stockFinal > 0 || a.sorties > 0)
//       .map(a => {
//         const sortieJour = nj > 0 ? a.sorties / nj : 0;
//         const joursRestants = sortieJour > 0 ? Math.round(a.stockFinal / sortieJour) : Infinity;
//         return { ...a, sortieJour, joursRestants };
//       })
//       .filter(a => a.sorties > 0) // garder uniquement les articles qui ont bougé
//       .sort((a, b) => a.joursRestants - b.joursRestants); // les plus critiques en premier

//     return { rows: result, nbJours: nj };
//   }, [data, cols, filters]);

//   if (!rows.length) return <Empty msg="Aucun article avec sorties sur la période" />;

//   const displayed = showAll ? rows : rows.slice(0, 20);

//   const urgenceBadge = (j) => {
//     if (j === Infinity || j > 90) return { label: '> 90 j',   color: C.green, bg: C.greenLight };
//     if (j > 30)                   return { label: `${j} j`,   color: C.blue,  bg: C.blueLight  };
//     if (j > 15)                   return { label: `${j} j`,   color: C.amber, bg: C.amberLight };
//     if (j > 7)                    return { label: `${j} j`,   color: C.red,   bg: C.redLight   };
//     return                               { label: `${j} j`,   color: '#ffffff', bg: C.red       };
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       {/* Légende */}
//       <div className="flex flex-wrap items-center gap-3">
//         <span className="text-[11px] text-[#888888]">Basé sur {nbJours} jour(s) de période ·</span>
//         {[
//           { label: '> 90 j (OK)',     color: C.green },
//           { label: '31–90 j',         color: C.blue  },
//           { label: '16–30 j (Alerte)',color: C.amber },
//           { label: '≤ 15 j (Urgent)', color: C.red   },
//         ].map(l => (
//           <div key={l.label} className="flex items-center gap-1.5">
//             <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
//             <span className="text-[10px] text-[#888888]">{l.label}</span>
//           </div>
//         ))}
//       </div>

//       {/* Compteurs urgence */}
//       <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
//         {[
//           { label: 'Rupture ≤ 7 j', count: rows.filter(r => r.joursRestants !== Infinity && r.joursRestants <= 7).length,  color: C.red,   bg: C.redLight   },
//           { label: 'Urgent ≤ 15 j', count: rows.filter(r => r.joursRestants !== Infinity && r.joursRestants <= 15).length, color: C.amber, bg: C.amberLight },
//           { label: 'Alerte ≤ 30 j', count: rows.filter(r => r.joursRestants !== Infinity && r.joursRestants <= 30).length, color: C.blue,  bg: C.blueLight  },
//           { label: 'OK > 30 j',     count: rows.filter(r => r.joursRestants === Infinity || r.joursRestants > 30).length,  color: C.green, bg: C.greenLight },
//         ].map(k => (
//           <div key={k.label} className="rounded-xl px-3 py-2.5 border" style={{ background: k.bg, borderColor: `${k.color}33` }}>
//             <p className="text-[10px] font-medium m-0 mb-0.5" style={{ color: k.color }}>{k.label}</p>
//             <p className="text-[1.3rem] font-bold m-0" style={{ color: k.color }}>{k.count}</p>
//           </div>
//         ))}
//       </div>

//       {/* Tableau */}
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse text-[12px]">
//           <thead>
//             <tr className="border-b border-[#f0f0f0]">
//               {['Article','Désignation','Dépôt','Stock final','Sortie/jour','Jours restants'].map((h, i) => (
//                 <th key={i} className={`px-3 py-2 bg-[#f8f8f8] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888888] ${i >= 3 ? 'text-right' : 'text-left'}`}>
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {displayed.map((row, idx) => {
//               const urg = urgenceBadge(row.joursRestants === Infinity ? Infinity : row.joursRestants);
//               const isUrgent = row.joursRestants !== Infinity && row.joursRestants <= 15;
//               return (
//                 <tr key={idx} className={`border-b border-[#f8f8f8] transition-colors ${isUrgent ? 'bg-[rgba(229,57,53,0.02)]' : 'hover:bg-[rgba(18,166,224,0.02)]'}`}>
//                   <td className="px-3 py-2.5">
//                     <span className="inline-block font-mono text-[0.7rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
//                       {row.article}
//                     </span>
//                   </td>
//                   <td className="px-3 py-2.5 text-[#444444] max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.name}>
//                     {row.name || '—'}
//                   </td>
//                   <td className="px-3 py-2.5">
//                     <span className="inline-block font-mono text-[0.7rem] text-[#666666] bg-[#f4f4f4] border border-[#e8e8e8] rounded-md px-2 py-0.5">
//                       {row.depot}
//                     </span>
//                   </td>
//                   <td className="px-3 py-2.5 text-right font-semibold text-[#0d0c0c]">{fmtNum(row.stockFinal)}</td>
//                   <td className="px-3 py-2.5 text-right text-[#888888]">{row.sortieJour.toFixed(1)}/j</td>
//                   <td className="px-3 py-2.5 text-right">
//                     <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
//                       style={{ background: urg.bg, color: urg.color }}>
//                       {row.joursRestants === Infinity ? '∞' : urg.label}
//                     </span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {rows.length > 20 && (
//         <button
//           onClick={() => setShowAll(s => !s)}
//           className="flex items-center gap-1.5 mx-auto text-[12px] text-[#12a6e0] font-semibold hover:underline"
//         >
//           {showAll ? <><ChevronUp size={13} /> Réduire</> : <><ChevronDown size={13} /> Voir les {rows.length - 20} autres</>}
//         </button>
//       )}
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════════
// //  TENDANCE 4 — Articles sans mouvement (stock dormant)
// //  Articles présents en stock mais 0 entrée ET 0 sortie sur la période
// // ════════════════════════════════════════════════════════════════
// function ArticlesSansMouvement({ data, cols }) {
//   const [showAll, setShowAll] = useState(false);

//   const rows = useMemo(() => {
//     if (!data?.length || !cols.article) return [];

//     const byArt = {};
//     for (const r of data) {
//       const key = `${r[cols.article]}__${r[cols.depot] ?? ''}`;
//       if (!byArt[key]) byArt[key] = {
//         article: r[cols.article] ?? '?',
//         name:    r[cols.design]  ?? '',
//         depot:   r[cols.depot]   ?? '?',
//         nomDep:  r[cols.nomDep]  ?? '',
//         catN1:   r[cols.catN1]   ?? '—',
//         famille: r[cols.famille] ?? '—',
//         totalEntrees: 0,
//         totalSorties: 0,
//         stockFinal:   0,
//         valeur:       0,
//       };
//       byArt[key].totalEntrees += Number(r[cols.entrees] ?? 0);
//       byArt[key].totalSorties += Number(r[cols.sorties] ?? 0);
//       byArt[key].valeur        = Number(r[cols.valeur]  ?? 0);
//     }

//     // Stock final du dernier jour
//     const sorted = [...data].sort((a, b) => ((a[cols.date] ?? '').slice(0,10)).localeCompare((b[cols.date] ?? '').slice(0,10)));
//     for (const r of sorted) {
//       const key = `${r[cols.article]}__${r[cols.depot] ?? ''}`;
//       if (byArt[key]) byArt[key].stockFinal = Number(r[cols.stock] ?? 0);
//     }

//     return Object.values(byArt)
//       .filter(a => a.totalEntrees === 0 && a.totalSorties === 0 && a.stockFinal > 0)
//       .sort((a, b) => b.valeur - a.valeur);
//   }, [data, cols]);

//   const totalValeurDormant = rows.reduce((s, r) => s + r.valeur, 0);
//   const totalStockDormant  = rows.reduce((s, r) => s + r.stockFinal, 0);

//   if (!rows.length) return (
//     <div className="flex flex-col items-center justify-center py-12 gap-3">
//       <div className="w-14 h-14 rounded-full bg-[rgba(1,168,46,0.08)] flex items-center justify-center">
//         <Activity size={24} className="text-[#01a82e]" />
//       </div>
//       <p className="text-[#01a82e] text-[13px] font-semibold">Tous les articles ont bougé !</p>
//       <p className="text-[#c5c5c5] text-[11px]">Aucun article sans mouvement sur la période.</p>
//     </div>
//   );

//   const displayed = showAll ? rows : rows.slice(0, 15);

//   return (
//     <div className="flex flex-col gap-4">
//       {/* Résumé */}
//       <div className="grid grid-cols-3 gap-3">
//         <div className="bg-[rgba(229,57,53,0.05)] border border-[rgba(229,57,53,0.15)] rounded-xl px-4 py-3">
//           <p className="text-[#aaaaaa] text-[10px] uppercase tracking-wide m-0 mb-0.5">Articles dormants</p>
//           <p className="text-[#e53935] text-[1.3rem] font-bold m-0">{rows.length}</p>
//         </div>
//         <div className="bg-[rgba(224,138,0,0.05)] border border-[rgba(224,138,0,0.15)] rounded-xl px-4 py-3">
//           <p className="text-[#aaaaaa] text-[10px] uppercase tracking-wide m-0 mb-0.5">Stock immobilisé</p>
//           <p className="text-[#e08a00] text-[1.3rem] font-bold m-0">{fmtNum(totalStockDormant)}</p>
//         </div>
//         <div className="bg-[rgba(18,166,224,0.05)] border border-[rgba(18,166,224,0.15)] rounded-xl px-4 py-3">
//           <p className="text-[#aaaaaa] text-[10px] uppercase tracking-wide m-0 mb-0.5">Valeur dormante</p>
//           <p className="text-[#12a6e0] text-[1.3rem] font-bold m-0">
//             {totalValeurDormant >= 1000 ? `${(totalValeurDormant / 1000).toFixed(0)}k` : fmtNum(totalValeurDormant)}
//           </p>
//         </div>
//       </div>

//       {/* Tableau */}
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse text-[12px]">
//           <thead>
//             <tr className="border-b border-[#f0f0f0]">
//               {['Article','Désignation','Catalogue N1','Dépôt','Stock final','Valeur (MAD)'].map((h, i) => (
//                 <th key={i} className={`px-3 py-2 bg-[#f8f8f8] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888888] ${i >= 4 ? 'text-right' : 'text-left'}`}>
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {displayed.map((row, idx) => (
//               <tr key={idx} className="border-b border-[#f8f8f8] hover:bg-[rgba(229,57,53,0.02)] transition-colors">
//                 <td className="px-3 py-2.5">
//                   <span className="inline-block font-mono text-[0.7rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
//                     {row.article}
//                   </span>
//                 </td>
//                 <td className="px-3 py-2.5 text-[#444444] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.name}>
//                   {row.name || '—'}
//                 </td>
//                 <td className="px-3 py-2.5">
//                   {row.catN1 !== '—'
//                     ? <span className="inline-block bg-[rgba(18,166,224,0.08)] text-[#0b7db0] text-[0.65rem] px-2 py-0.5 rounded border border-[rgba(18,166,224,0.18)]">{row.catN1}</span>
//                     : <span className="text-[#e0e0e0]">—</span>
//                   }
//                 </td>
//                 <td className="px-3 py-2.5">
//                   <span className="inline-block font-mono text-[0.7rem] text-[#666666] bg-[#f4f4f4] border border-[#e8e8e8] rounded-md px-2 py-0.5">
//                     {row.depot}
//                   </span>
//                 </td>
//                 <td className="px-3 py-2.5 text-right">
//                   <span className="text-[#e08a00] font-semibold">{fmtNum(row.stockFinal)}</span>
//                 </td>
//                 <td className="px-3 py-2.5 text-right">
//                   {row.valeur > 0
//                     ? <span className="text-[#0b7db0] font-semibold">{fmtNum(row.valeur)}</span>
//                     : <span className="text-[#c5c5c5]">—</span>
//                   }
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {rows.length > 15 && (
//         <button
//           onClick={() => setShowAll(s => !s)}
//           className="flex items-center gap-1.5 mx-auto text-[12px] text-[#12a6e0] font-semibold hover:underline"
//         >
//           {showAll ? <><ChevronUp size={13} /> Réduire</> : <><ChevronDown size={13} /> Voir les {rows.length - 15} autres</>}
//         </button>
//       )}
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════════
// //  PAGE PRINCIPALE
// // ════════════════════════════════════════════════════════════════
// export default function PageTrends() {
//   const { tableData, currentFilters, hasFiltered } = useDashboard();

//   const cols = useCols(tableData);
//   const hasData = hasFiltered && tableData && tableData.length > 0;

//   // Compteurs pour les badges
//   const badges = useMemo(() => {
//     if (!hasData || !cols.article) return {};

//     const byArt = {};
//     for (const r of tableData) {
//       const key = `${r[cols.article]}__${r[cols.depot] ?? ''}`;
//       if (!byArt[key]) byArt[key] = { e: 0, s: 0, sf: 0 };
//       byArt[key].e  += Number(r[cols.entrees] ?? 0);
//       byArt[key].s  += Number(r[cols.sorties] ?? 0);
//       byArt[key].sf  = Number(r[cols.stock]   ?? 0);
//     }
//     const dormants = Object.values(byArt).filter(a => a.e === 0 && a.s === 0 && a.sf > 0).length;

//     // Jours de stock critiques (≤ 15 j)
//     const filters = currentFilters;
//     let nj = 30;
//     if (filters?.dateDebut && filters?.dateFin) {
//       const d1 = new Date(filters.dateDebut);
//       const d2 = new Date(filters.dateFin);
//       nj = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
//     }
//     const critiques = Object.values(byArt).filter(a => {
//       const sjour = nj > 0 ? a.s / nj : 0;
//       const jr = sjour > 0 ? a.sf / sjour : Infinity;
//       return jr !== Infinity && jr <= 15;
//     }).length;

//     return { dormants, critiques };
//   }, [hasData, tableData, cols, currentFilters]);

//   return (
//     <div className="flex flex-col gap-5">
//       {/* Bandeau contexte */}
//       <ContextBanner filters={currentFilters} />

//       {/* Message si pas de données */}
//       {!hasData && (
//         <div className="bg-[rgba(18,166,224,0.04)] border border-[rgba(18,166,224,0.15)] rounded-xl px-5 py-4 text-[#0b7db0] text-sm flex items-center gap-3">
//           <div className="w-2 h-2 rounded-full bg-[#12a6e0] shrink-0 animate-pulse" />
//           <span>
//             Rendez-vous sur le <strong>Tableau de bord</strong> pour sélectionner une base et une
//             période, puis cliquez sur <strong>Filtrer</strong> pour afficher les tendances.
//           </span>
//         </div>
//       )}

//       {hasData && (
//         <>
//           {/* ── Ligne 1 : Taux de rotation (pleine largeur) ── */}
//           <TrendCard
//             icon={ArrowLeftRight}
//             iconColor={C.blue}
//             iconBg={C.blueLight}
//             title="Taux de rotation des articles"
//             subtitle="Sorties ÷ stock moyen sur la période — identifie les articles lents et rapides"
//           >
//             <TauxRotation data={tableData} cols={cols} />
//           </TrendCard>

//           {/* ── Ligne 2 : Comparaison N vs N-1 (pleine largeur) ── */}
//           <TrendCard
//             icon={CalendarDays}
//             iconColor={C.purple}
//             iconBg={C.purpleLight}
//             title="Comparaison mois par mois"
//             subtitle="Entrées, sorties et stock par mois — comparaison N vs N-1 si la période couvre 2 années"
//           >
//             <ComparaisonMois data={tableData} cols={cols} />
//           </TrendCard>

//           {/* ── Ligne 3 : Deux cartes côte à côte ── */}
//           <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
//             <TrendCard
//               icon={Clock}
//               iconColor={C.amber}
//               iconBg={C.amberLight}
//               title="Jours de stock restants"
//               subtitle="Stock final ÷ (sorties / nb jours) — articles les plus critiques en premier"
//               badge={badges.critiques > 0 ? `${badges.critiques} urgent${badges.critiques > 1 ? 's' : ''}` : undefined}
//             >
//               <JoursDeStock data={tableData} cols={cols} filters={currentFilters} />
//             </TrendCard>

//             <TrendCard
//               icon={AlertTriangle}
//               iconColor={C.red}
//               iconBg={C.redLight}
//               title="Articles sans mouvement"
//               subtitle="Stock présent mais 0 entrée et 0 sortie sur la période — stock dormant"
//               badge={badges.dormants > 0 ? `${badges.dormants} article${badges.dormants > 1 ? 's' : ''}` : undefined}
//             >
//               <ArticlesSansMouvement data={tableData} cols={cols} />
//             </TrendCard>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
  RadialBarChart, RadialBar,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus,
  ArrowLeftRight, CalendarDays, Database,
  Tag, Layers, AlertTriangle, Clock,
  PackageX, ChevronDown, ChevronUp,
  Activity,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

// ── Palette identique au projet ───────────────────────────────
const C = {
  blue:        '#12a6e0',
  blueLight:   'rgba(18,166,224,0.08)',
  green:       '#01a82e',
  greenLight:  'rgba(1,168,46,0.08)',
  red:         '#e53935',
  redLight:    'rgba(229,57,53,0.08)',
  amber:       '#e08a00',
  amberLight:  'rgba(224,138,0,0.08)',
  purple:      '#7c4dff',
  purpleLight: 'rgba(124,77,255,0.08)',
  border:      '#f0f0f0',
  text:        '#0d0c0c',
  muted:       '#888888',
  light:       '#c5c5c5',
};

// ── Helpers ───────────────────────────────────────────────────
const fmtNum = (n) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n ?? 0);

const fmtPct = (n) => `${Number(n ?? 0).toFixed(1)}%`;

const fmtShort = (d) => {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
};

const fmtRatio = (r) => {
  if (r === Infinity) return '∞';
  if (r === 0)        return '0';
  return r.toFixed(2);
};

// Détecteur de colonnes — même logique que StockTable / PageMovements
function useCols(data) {
  return useMemo(() => {
    if (!data || !data.length) return {};
    const keys = Object.keys(data[0]);
    const find = (...variants) =>
      keys.find(k =>
        variants.some(v =>
          k.toLowerCase().replace(/[\s_()]/g, '') === v.toLowerCase().replace(/[\s_()]/g, '')
        )
      ) || null;
    return {
      date:    find('Date', 'DateJour'),
      article: find('Article', 'AR_Ref'),
      design:  find('Designation', 'AR_Design', 'Désignation'),
      depot:   find('Depot', 'DE_No'),
      nomDep:  find('Nom Depot', 'NomDepot', 'DE_Intitule'),
      entrees: find('TotalEntrees', 'Total Entrees', 'TotalEntree'),
      sorties: find('TotalSorties', 'Total Sorties', 'TotalSortie'),
      stock:   find('StockFinal', 'Stock Final', 'stockfinal'),
      valeur:  find('ValeurFinalePermanente', 'Valeur Finale (Permanente)', 'ValeurFinale', 'valeurfinale', 'Solde'),
      catN1:   find('CatN1', 'Cat N1', 'CL_Intitule1'),
      famille: find('Intitule Famille', 'FA_Intitule', 'faintitule'),
    };
  }, [data]);
}

// ── Card ──────────────────────────────────────────────────────
function TrendCard({ icon: Icon, iconColor, iconBg, title, subtitle, children, badge }) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.05)] flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f4f4f4]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg, color: iconColor }}>
          <Icon size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[#0d0c0c] text-[13px] font-semibold m-0 leading-tight">{title}</p>
            {badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: iconBg, color: iconColor }}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[#aaaaaa] text-[11px] m-0 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}

// ── Empty ─────────────────────────────────────────────────────
function Empty({ msg }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <PackageX size={28} className="text-[#e0e0e0]" />
      <p className="text-[#c5c5c5] text-[12px] text-center max-w-[220px] leading-relaxed">{msg ?? 'Aucune donnée disponible'}</p>
    </div>
  );
}

// ── Bandeau contexte ──────────────────────────────────────────
function ContextBanner({ filters }) {
  return (
    <div className="bg-white border border-[#e4e4e4] rounded-[1.1rem] shadow-[0_2px_12px_rgba(18,166,224,0.07)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-[#f8fcff] to-[#f0f9ff] border-b border-[#e8f4fb]">
        <div className="w-6 h-6 rounded-[0.45rem] bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow-sm">
          <TrendingUp size={12} className="text-white" />
        </div>
        <span className="text-[#0d0c0c] text-[13px] font-semibold tracking-wide">Tendances</span>
        <span className="text-[#c5c5c5] text-[11px] ml-1">— Contexte du tableau de bord</span>
      </div>
      <div className="px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {filters?.base && (
            <div className="flex items-center gap-1.5 bg-[rgba(1,214,58,0.07)] border border-[rgba(1,214,58,0.22)] rounded-full px-3 py-1.5">
              <Database size={11} className="text-[#01a82e]" />
              <span className="text-[#01a82e] text-[11px] font-bold uppercase tracking-wide">{filters.base}</span>
            </div>
          )}
          {filters?.dateDebut && filters?.dateFin && (
            <div className="flex items-center gap-1.5 bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.22)] rounded-full px-3 py-1.5">
              <CalendarDays size={11} className="text-[#12a6e0]" />
              <span className="text-[#0b7db0] text-[11px] font-semibold">
                {fmtShort(filters.dateDebut)} → {fmtShort(filters.dateFin)}
              </span>
            </div>
          )}
          {filters?.fa_codefamille && (
            <div className="flex items-center gap-1.5 bg-[rgba(124,77,255,0.07)] border border-[rgba(124,77,255,0.22)] rounded-full px-3 py-1.5">
              <Tag size={11} className="text-[#7c4dff]" />
              <span className="text-[#7c4dff] text-[11px] font-semibold">{filters.fa_codefamille}</span>
            </div>
          )}
          {filters?.cl_no1 && (
            <div className="flex items-center gap-1.5 bg-[rgba(224,138,0,0.07)] border border-[rgba(224,138,0,0.22)] rounded-full px-3 py-1.5">
              <Layers size={11} className="text-[#e08a00]" />
              <span className="text-[#e08a00] text-[11px] font-semibold">Cat N1 : {filters.cl_no1}</span>
            </div>
          )}
          {!filters?.base && (
            <span className="text-[#c5c5c5] text-[12px] italic">
              Filtrez depuis le tableau de bord pour afficher les tendances.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  TENDANCE 1 — Taux de rotation par article
// ════════════════════════════════════════════════════════════════
function TauxRotation({ data, cols }) {
  const [sortBy, setSortBy] = useState('taux');
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    if (!data?.length || !cols.article) return [];

    const byArticle = {};
    for (const r of data) {
      const code = r[cols.article] ?? '?';
      if (!byArticle[code]) byArticle[code] = {
        code,
        name:    r[cols.design] ?? code,
        catN1:   r[cols.catN1]  ?? '—',
        sorties: 0,
        stocks:  [],
      };
      byArticle[code].sorties += Number(r[cols.sorties] ?? 0);
      const sf = Number(r[cols.stock] ?? 0);
      if (sf > 0) byArticle[code].stocks.push(sf);
    }

    return Object.values(byArticle)
      .map(a => {
        const stockMoyen = a.stocks.length
          ? a.stocks.reduce((s, v) => s + v, 0) / a.stocks.length
          : 0;
        const taux = stockMoyen > 0 ? (a.sorties / stockMoyen) * 100 : 0;
        return { ...a, stockMoyen, taux };
      })
      .filter(a => a.sorties > 0 || a.stockMoyen > 0)
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, cols, sortBy]);

  if (!rows.length) return <Empty msg="Aucun article avec mouvements trouvé" />;

  const displayed = showAll ? rows : rows.slice(0, 15);
  const tauxMax = Math.max(...rows.map(r => r.taux), 1);

  const rotBadge = (taux) => {
    if (taux >= 100) return { label: 'Rapide',   color: C.green,  bg: C.greenLight };
    if (taux >= 30)  return { label: 'Moyen',    color: C.amber,  bg: C.amberLight };
    if (taux >= 5)   return { label: 'Lent',     color: C.red,    bg: C.redLight   };
    return                  { label: 'Très lent',color: '#888888',bg: '#f5f5f5'    };
  };

  const SortBtn = ({ id, label }) => (
    <button
      onClick={() => setSortBy(id)}
      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 ${
        sortBy === id ? 'bg-[#12a6e0] text-white shadow-sm' : 'text-[#888888] hover:bg-[#f0f0f0]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-[#f8f8f8] border border-[#eeeeee] rounded-xl p-1">
          <SortBtn id="taux"       label="Par taux %" />
          <SortBtn id="sorties"    label="Par sorties" />
          <SortBtn id="stockMoyen" label="Par stock" />
        </div>
        <div className="flex items-center gap-3 ml-auto">
          {[
            { label: 'Rapide ≥100%', color: C.green },
            { label: 'Moyen ≥30%',  color: C.amber },
            { label: 'Lent ≥5%',    color: C.red   },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] text-[#888888]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {['Article','Désignation','Sorties','Stock moyen','Taux rotation',''].map((h, i) => (
                <th key={i} className={`px-3 py-2 bg-[#f8f8f8] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888888] ${i >= 2 ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row) => {
              const badge = rotBadge(row.taux);
              const pct   = tauxMax > 0 ? (row.taux / tauxMax) * 100 : 0;
              return (
                <tr key={row.code} className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.03)] transition-colors">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="inline-block font-mono text-[0.7rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
                      {row.code}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[#444444] max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.name}>
                    {row.name}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-[#e53935] font-semibold">{fmtNum(row.sorties)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#555555]">
                    {fmtNum(row.stockMoyen)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(pct, 100)}%`, background: badge.color }}
                        />
                      </div>
                      <span className="font-bold w-14 text-right" style={{ color: badge.color }}>
                        {fmtPct(row.taux)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length > 15 && (
        <button onClick={() => setShowAll(s => !s)}
          className="flex items-center gap-1.5 mx-auto text-[12px] text-[#12a6e0] font-semibold hover:underline">
          {showAll ? <><ChevronUp size={13} /> Réduire</> : <><ChevronDown size={13} /> Voir les {rows.length - 15} autres</>}
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  TENDANCE 2 — Comparaison mois par mois (N vs N-1)
// ════════════════════════════════════════════════════════════════
function ComparaisonMois({ data, cols }) {
  const [metric, setMetric] = useState('entrees');

  const { chartData, hasPrevYear } = useMemo(() => {
    if (!data?.length || !cols.date) return { chartData: [], hasPrevYear: false };

    const byMonth = {};
    for (const r of data) {
      const raw = r[cols.date];
      if (!raw) continue;
      const iso = typeof raw === 'string' ? raw.slice(0, 10) : new Date(raw).toISOString().slice(0, 10);
      const [y, m] = iso.split('-');
      const key = `${y}-${m}`;
      if (!byMonth[key]) byMonth[key] = { year: y, month: m, key, entrées: 0, sorties: 0, stock: 0, valeur: 0, n: 0 };
      byMonth[key].entrées += Number(r[cols.entrees] ?? 0);
      byMonth[key].sorties += Number(r[cols.sorties] ?? 0);
      byMonth[key].stock   += Number(r[cols.stock]   ?? 0);
      byMonth[key].valeur  += Number(r[cols.valeur]  ?? 0);
      byMonth[key].n       += 1;
    }

    const months = Object.values(byMonth).sort((a, b) => a.key.localeCompare(b.key));
    const monthNames = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

    const byYearMonth = {};
    for (const m of months) {
      const mk = m.month;
      if (!byYearMonth[mk]) byYearMonth[mk] = {};
      byYearMonth[mk][m.year] = m;
    }

    const years = [...new Set(months.map(m => m.year))].sort();
    const hasPrev = years.length >= 2;

    const chartRows = Object.entries(byYearMonth).map(([mk, byY]) => {
      const row = { mois: monthNames[parseInt(mk) - 1] };
      for (const y of years) {
        row[`${y}`] = byY[y]?.[metric === 'entrees' ? 'entrées' : metric === 'sorties' ? 'sorties' : metric === 'stock' ? 'stock' : 'valeur'] ?? 0;
      }
      if (hasPrev && years.length === 2) {
        const vN  = row[years[1]] ?? 0;
        const vN1 = row[years[0]] ?? 0;
        row.variation = vN1 > 0 ? ((vN - vN1) / vN1) * 100 : null;
      }
      return row;
    });

    return { chartData: chartRows, years, hasPrevYear: hasPrev };
  }, [data, cols, metric]);

  const years = useMemo(() => {
    if (!data?.length || !cols.date) return [];
    const ys = new Set();
    for (const r of data) {
      const raw = r[cols.date];
      if (!raw) continue;
      const iso = typeof raw === 'string' ? raw.slice(0, 10) : new Date(raw).toISOString().slice(0, 10);
      ys.add(iso.slice(0, 4));
    }
    return [...ys].sort();
  }, [data, cols]);

  if (!chartData.length) return <Empty msg="Données insuffisantes pour la comparaison" />;

  const YEAR_COLORS = [C.blue, C.green, C.amber, C.purple];

  const MetBtn = ({ id, label }) => (
    <button
      onClick={() => setMetric(id)}
      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 ${
        metric === id ? 'bg-[#12a6e0] text-white shadow-sm' : 'text-[#888888] hover:bg-[#f0f0f0]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-[#f8f8f8] border border-[#eeeeee] rounded-xl p-1">
          <MetBtn id="entrees" label="Entrées" />
          <MetBtn id="sorties" label="Sorties" />
          <MetBtn id="stock"   label="Stock final" />
          <MetBtn id="valeur"  label="Valeur" />
        </div>
        {!hasPrevYear && (
          <span className="text-[11px] text-[#aaaaaa] italic">Une seule année dans la période — étendez la plage pour comparer</span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
          <XAxis dataKey="mois" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={{ stroke: C.border }} />
          <YAxis tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
          <Tooltip
            cursor={{ fill: 'rgba(18,166,224,0.04)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-lg px-4 py-3 text-[12px]">
                  <p className="text-[#888888] mb-1.5 font-medium">{label}</p>
                  {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 mb-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
                      <span className="text-[#555555]">{p.dataKey} :</span>
                      <span className="font-semibold text-[#0d0c0c]">{fmtNum(p.value)}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          {years.map((y, i) => (
            <Bar key={y} dataKey={y} name={y} fill={YEAR_COLORS[i % YEAR_COLORS.length]}
              radius={[3, 3, 0, 0]} fillOpacity={0.85} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {hasPrevYear && years.length === 2 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {chartData.filter(r => r.variation !== null && r.variation !== undefined).slice(0, 4).map(r => (
            <div key={r.mois} className="bg-[#f8f8f8] rounded-xl px-3 py-2.5 border border-[#eeeeee]">
              <p className="text-[#aaaaaa] text-[10px] m-0 mb-0.5">{r.mois}</p>
              <p className={`font-bold text-[0.95rem] m-0 flex items-center gap-1 ${
                r.variation > 0 ? 'text-[#01a82e]' : r.variation < 0 ? 'text-[#e53935]' : 'text-[#888888]'
              }`}>
                {r.variation > 0 ? <TrendingUp size={12} /> : r.variation < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                {r.variation !== null ? `${r.variation > 0 ? '+' : ''}${r.variation.toFixed(1)}%` : '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  TENDANCE 3 — Jours de stock restants
// ════════════════════════════════════════════════════════════════
function JoursDeStock({ data, cols, filters }) {
  const [showAll, setShowAll] = useState(false);

  const { rows, nbJours } = useMemo(() => {
    if (!data?.length || !cols.article) return { rows: [], nbJours: 1 };

    let nj = 30;
    if (filters?.dateDebut && filters?.dateFin) {
      const d1 = new Date(filters.dateDebut);
      const d2 = new Date(filters.dateFin);
      nj = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
    }

    const byArtDepot = {};
    for (const r of data) {
      const key = `${r[cols.article]}__${r[cols.depot]}`;
      if (!byArtDepot[key]) byArtDepot[key] = {
        article: r[cols.article] ?? '?',
        name:    r[cols.design]  ?? '',
        depot:   r[cols.depot]   ?? '?',
        nomDep:  r[cols.nomDep]  ?? '',
        catN1:   r[cols.catN1]   ?? '—',
        sorties: 0,
        stockFinal: 0,
      };
      byArtDepot[key].sorties    += Number(r[cols.sorties] ?? 0);
      byArtDepot[key].stockFinal  = Number(r[cols.stock]   ?? 0);
    }

    const lastByKey = {};
    const sortedData = [...data].sort((a, b) => {
      const da = (a[cols.date] ?? '').slice(0, 10);
      const db = (b[cols.date] ?? '').slice(0, 10);
      return da.localeCompare(db);
    });
    for (const r of sortedData) {
      const key = `${r[cols.article]}__${r[cols.depot]}`;
      const sf = Number(r[cols.stock] ?? 0);
      if (sf >= 0) lastByKey[key] = sf;
    }
    for (const key of Object.keys(byArtDepot)) {
      if (lastByKey[key] !== undefined) byArtDepot[key].stockFinal = lastByKey[key];
    }

    const result = Object.values(byArtDepot)
      .filter(a => a.stockFinal > 0 || a.sorties > 0)
      .map(a => {
        const sortieJour    = nj > 0 ? a.sorties / nj : 0;
        const joursRestants = sortieJour > 0 ? Math.round(a.stockFinal / sortieJour) : Infinity;
        return { ...a, sortieJour, joursRestants };
      })
      .filter(a => a.sorties > 0)
      .sort((a, b) => a.joursRestants - b.joursRestants);

    return { rows: result, nbJours: nj };
  }, [data, cols, filters]);

  if (!rows.length) return <Empty msg="Aucun article avec sorties sur la période" />;

  const displayed = showAll ? rows : rows.slice(0, 20);

  const urgenceBadge = (j) => {
    if (j === Infinity || j > 90) return { label: '> 90 j', color: C.green, bg: C.greenLight };
    if (j > 30)                   return { label: `${j} j`, color: C.blue,  bg: C.blueLight  };
    if (j > 15)                   return { label: `${j} j`, color: C.amber, bg: C.amberLight };
    if (j > 7)                    return { label: `${j} j`, color: C.red,   bg: C.redLight   };
    return                               { label: `${j} j`, color: '#ffffff',bg: C.red        };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] text-[#888888]">Basé sur {nbJours} jour(s) de période ·</span>
        {[
          { label: '> 90 j (OK)',      color: C.green },
          { label: '31–90 j',          color: C.blue  },
          { label: '16–30 j (Alerte)', color: C.amber },
          { label: '≤ 15 j (Urgent)',  color: C.red   },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-[10px] text-[#888888]">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Rupture ≤ 7 j', count: rows.filter(r => r.joursRestants !== Infinity && r.joursRestants <= 7).length,  color: C.red,   bg: C.redLight   },
          { label: 'Urgent ≤ 15 j', count: rows.filter(r => r.joursRestants !== Infinity && r.joursRestants <= 15).length, color: C.amber, bg: C.amberLight },
          { label: 'Alerte ≤ 30 j', count: rows.filter(r => r.joursRestants !== Infinity && r.joursRestants <= 30).length, color: C.blue,  bg: C.blueLight  },
          { label: 'OK > 30 j',     count: rows.filter(r => r.joursRestants === Infinity || r.joursRestants > 30).length,  color: C.green, bg: C.greenLight },
        ].map(k => (
          <div key={k.label} className="rounded-xl px-3 py-2.5 border" style={{ background: k.bg, borderColor: `${k.color}33` }}>
            <p className="text-[10px] font-medium m-0 mb-0.5" style={{ color: k.color }}>{k.label}</p>
            <p className="text-[1.3rem] font-bold m-0" style={{ color: k.color }}>{k.count}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {['Article','Désignation','Dépôt','Stock final','Sortie/jour','Jours restants'].map((h, i) => (
                <th key={i} className={`px-3 py-2 bg-[#f8f8f8] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888888] ${i >= 3 ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, idx) => {
              const urg      = urgenceBadge(row.joursRestants === Infinity ? Infinity : row.joursRestants);
              const isUrgent = row.joursRestants !== Infinity && row.joursRestants <= 15;
              return (
                <tr key={idx} className={`border-b border-[#f8f8f8] transition-colors ${isUrgent ? 'bg-[rgba(229,57,53,0.02)]' : 'hover:bg-[rgba(18,166,224,0.02)]'}`}>
                  <td className="px-3 py-2.5">
                    <span className="inline-block font-mono text-[0.7rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
                      {row.article}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[#444444] max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.name}>
                    {row.name || '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-block font-mono text-[0.7rem] text-[#666666] bg-[#f4f4f4] border border-[#e8e8e8] rounded-md px-2 py-0.5">
                      {row.depot}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-[#0d0c0c]">{fmtNum(row.stockFinal)}</td>
                  <td className="px-3 py-2.5 text-right text-[#888888]">{row.sortieJour.toFixed(1)}/j</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: urg.bg, color: urg.color }}>
                      {row.joursRestants === Infinity ? '∞' : urg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length > 20 && (
        <button onClick={() => setShowAll(s => !s)}
          className="flex items-center gap-1.5 mx-auto text-[12px] text-[#12a6e0] font-semibold hover:underline">
          {showAll ? <><ChevronUp size={13} /> Réduire</> : <><ChevronDown size={13} /> Voir les {rows.length - 20} autres</>}
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  TENDANCE 4 — Articles en déséquilibre entrées / sorties
//
//  Remplace ArticlesSansMouvement (non-actionnable en lecture seule)
//
//  LOGIQUE :
//    ratio = entrées / sorties
//    > 2.0   → Sur-appro  : on rentre beaucoup plus qu'on ne sort
//    1.5–2   → Léger excès entrées
//    0.5–1.5 → Équilibré
//    0.2–0.5 → Léger excès sorties
//    < 0.2   → Déstockage rapide
//    sorties = 0, entrées > 0 → Accumulation pure (ratio = ∞)
//    entrées = 0, sorties > 0 → Déstockage pur  (ratio = 0)
// ════════════════════════════════════════════════════════════════

// ── Catégorie de déséquilibre ─────────────────────────────────
function getDesequilibreCat(ratio, entrees, sorties) {
  if (sorties === 0 && entrees > 0) return { label: 'Accumulation',   color: C.purple, bg: C.purpleLight, dir: 'in'  };
  if (entrees === 0 && sorties > 0) return { label: 'Déstockage pur', color: C.red,    bg: C.redLight,    dir: 'out' };
  if (ratio >= 2)                   return { label: 'Sur-appro',      color: C.amber,  bg: C.amberLight,  dir: 'in'  };
  if (ratio >= 1.5)                 return { label: 'Excès entrées',  color: '#b36a00', bg: 'rgba(224,138,0,0.05)', dir: 'in' };
  if (ratio <= 0.2)                 return { label: 'Déstockage',     color: C.red,    bg: C.redLight,    dir: 'out' };
  if (ratio <= 0.5)                 return { label: 'Excès sorties',  color: '#b71c1c', bg: 'rgba(229,57,53,0.05)', dir: 'out' };
  return                                   { label: 'Équilibré',      color: C.green,  bg: C.greenLight,  dir: 'ok'  };
}

function DesequilibreEntreesSorties({ data, cols }) {
  const [showAll, setShowAll] = useState(false);
  const [sortDir, setSortDir] = useState('all'); // 'all' | 'in' | 'out'
  const [sortCol, setSortCol] = useState('ratio');

  // ── Calcul par article ────────────────────────────────────────
  const rows = useMemo(() => {
    if (!data?.length || !cols.article) return [];

    const byArt = {};
    for (const r of data) {
      const key = r[cols.article] ?? '?';
      if (!byArt[key]) byArt[key] = {
        article: key,
        name:    r[cols.design] ?? key,
        catN1:   r[cols.catN1]  ?? '—',
        entrees: 0,
        sorties: 0,
      };
      byArt[key].entrees += Number(r[cols.entrees] ?? 0);
      byArt[key].sorties += Number(r[cols.sorties] ?? 0);
    }

    return Object.values(byArt)
      .filter(a => a.entrees > 0 || a.sorties > 0)
      .map(a => {
        const ratio = a.sorties > 0
          ? a.entrees / a.sorties
          : a.entrees > 0 ? Infinity : 1;
        const cat   = getDesequilibreCat(ratio, a.entrees, a.sorties);
        const score = ratio === Infinity ? 999 : Math.abs(Math.log(ratio === 0 ? 0.001 : ratio));
        return { ...a, ratio, cat, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [data, cols]);

  // ── Compteurs résumé ──────────────────────────────────────────
  const counts = useMemo(() => ({
    surAppro:   rows.filter(r => r.cat.dir === 'in').length,
    equilibre:  rows.filter(r => r.cat.dir === 'ok').length,
    destockage: rows.filter(r => r.cat.dir === 'out').length,
  }), [rows]);

  // ── Top articles pour le graphique (5 in + 5 out) ────────────
  const chartRows = useMemo(() => {
    const top5in  = rows
      .filter(r => r.cat.dir === 'in')
      .slice(0, 5)
      .map(r => ({
        label:  r.article,
        valeur: r.ratio === Infinity ? r.entrees : r.entrees - r.sorties,
        color:  r.cat.color,
        ratio:  r.ratio,
        dir:    'in',
      }));
    const top5out = rows
      .filter(r => r.cat.dir === 'out')
      .slice(0, 5)
      .map(r => ({
        label:  r.article,
        valeur: -(r.sorties - r.entrees),
        color:  r.cat.color,
        ratio:  r.ratio,
        dir:    'out',
      }));
    return [...top5in.reverse(), ...top5out].reverse();
  }, [rows]);

  // ── Filtre + tri pour le tableau ──────────────────────────────
  const tableRows = useMemo(() => {
    let list = sortDir === 'in'
      ? rows.filter(r => r.cat.dir === 'in')
      : sortDir === 'out'
        ? rows.filter(r => r.cat.dir === 'out')
        : rows;
    if (sortCol === 'entrees') list = [...list].sort((a, b) => b.entrees - a.entrees);
    if (sortCol === 'sorties') list = [...list].sort((a, b) => b.sorties - a.sorties);
    return list;
  }, [rows, sortDir, sortCol]);

  const displayed = showAll ? tableRows : tableRows.slice(0, 15);

  if (!rows.length) return <Empty msg="Aucun article avec entrées ou sorties sur la période" />;

  const DirBtn = ({ id, label, color }) => (
    <button
      onClick={() => setSortDir(id)}
      className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 border"
      style={{
        background:  sortDir === id ? color  : 'transparent',
        color:       sortDir === id ? '#fff'  : C.muted,
        borderColor: sortDir === id ? color  : C.border,
      }}
    >
      {label}
    </button>
  );

  const SortBtn = ({ id, label }) => (
    <button
      onClick={() => setSortCol(id)}
      className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
      style={{
        background: sortCol === id ? C.blue : 'transparent',
        color:      sortCol === id ? '#fff'  : C.muted,
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">

      {/* ── 3 compteurs résumé ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sur-appro / Accumulation', count: counts.surAppro,   color: C.amber, bg: C.amberLight,  icon: TrendingUp     },
          { label: 'Équilibrés',               count: counts.equilibre,  color: C.green, bg: C.greenLight,  icon: ArrowLeftRight },
          { label: 'Déstockage',               count: counts.destockage, color: C.red,   bg: C.redLight,    icon: TrendingDown   },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label}
            className="rounded-xl px-4 py-3 border flex flex-col gap-1"
            style={{ background: bg, borderColor: `${color}33` }}
          >
            <div className="flex items-center gap-1.5">
              <Icon size={12} style={{ color }} />
              <p className="text-[10px] font-medium m-0 uppercase tracking-wide" style={{ color: C.muted }}>{label}</p>
            </div>
            <p className="text-[1.35rem] font-bold m-0" style={{ color }}>{count}</p>
          </div>
        ))}
      </div>

      {/* ── BarChart divergent — Top déséquilibrés ── */}
      {chartRows.length > 0 && (
        <div className="bg-[#f9f9f9] border border-[#eeeeee] rounded-xl p-4">
          <p className="text-[11px] font-semibold text-[#888888] mb-3 uppercase tracking-wide">
            Top articles déséquilibrés — excédent entrées (+) ou sorties (−)
          </p>
          <ResponsiveContainer width="100%" height={Math.max(160, chartRows.length * 32)}>
            <BarChart
              data={chartRows}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 8, bottom: 0 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 9, fill: C.muted }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k`
                  : v <= -1000 ? `-${(Math.abs(v) / 1000).toFixed(0)}k`
                  : v
                }
              />
              <YAxis
                type="category"
                dataKey="label"
                width={72}
                tick={{ fontSize: 9, fill: C.blue, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
              />
              <ReferenceLine x={0} stroke={C.border} strokeWidth={2} />
              <Tooltip
                cursor={{ fill: 'rgba(18,166,224,0.04)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = chartRows.find(r => r.label === label);
                  return (
                    <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-lg px-4 py-3 text-[12px]">
                      <p className="font-semibold text-[#0d0c0c] mb-1">{label}</p>
                      <p className="text-[#888888] m-0">
                        Ratio E/S : <b style={{ color: row?.color }}>{fmtRatio(row?.ratio)}</b>
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="valeur" radius={[0, 4, 4, 0]}>
                {chartRows.map((r, i) => (
                  <Cell key={i} fill={r.color} fillOpacity={0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Filtres direction + tri ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <DirBtn id="all"  label="Tous"         color={C.blue}  />
          <DirBtn id="in"   label="Sur-appro ↑"  color={C.amber} />
          <DirBtn id="out"  label="Déstockage ↓" color={C.red}   />
        </div>
        <div className="flex items-center gap-1 bg-[#f8f8f8] border border-[#eeeeee] rounded-xl p-1 ml-auto">
          <SortBtn id="ratio"   label="Par déséquilibre" />
          <SortBtn id="entrees" label="Par entrées"      />
          <SortBtn id="sorties" label="Par sorties"      />
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {['Article','Désignation','Catalogue N1','Entrées','Sorties','Ratio E/S','Statut'].map((h, i) => (
                <th key={i} className={`px-3 py-2 bg-[#f8f8f8] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#888888] ${i >= 3 && i <= 5 ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, idx) => (
              <tr key={row.article + idx}
                className="border-b border-[#f8f8f8] hover:bg-[rgba(18,166,224,0.02)] transition-colors">
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="inline-block font-mono text-[0.7rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
                    {row.article}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[#444444] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.name}>
                  {row.name !== row.article ? row.name : '—'}
                </td>
                <td className="px-3 py-2.5">
                  {row.catN1 !== '—'
                    ? <span className="inline-block bg-[rgba(18,166,224,0.08)] text-[#0b7db0] text-[0.65rem] px-2 py-0.5 rounded border border-[rgba(18,166,224,0.18)]">{row.catN1}</span>
                    : <span className="text-[#e0e0e0]">—</span>
                  }
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className="text-[#01a82e] font-semibold">{fmtNum(row.entrees)}</span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className="text-[#e53935] font-semibold">{fmtNum(row.sorties)}</span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-12 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width:      `${Math.min(100, row.score * 25)}%`,
                          background: row.cat.color,
                        }}
                      />
                    </div>
                    <span className="font-bold w-10 text-right" style={{ color: row.cat.color }}>
                      {fmtRatio(row.ratio)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{ background: row.cat.bg, color: row.cat.color }}>
                    {row.cat.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tableRows.length > 15 && (
        <button onClick={() => setShowAll(s => !s)}
          className="flex items-center gap-1.5 mx-auto text-[12px] text-[#12a6e0] font-semibold hover:underline">
          {showAll
            ? <><ChevronUp size={13} /> Réduire</>
            : <><ChevronDown size={13} /> Voir les {tableRows.length - 15} autres</>
          }
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════
export default function PageTrends() {
  const { tableData, currentFilters, hasFiltered } = useDashboard();

  const cols    = useCols(tableData);
  const hasData = hasFiltered && tableData && tableData.length > 0;

  // Compteurs pour les badges
  const badges = useMemo(() => {
    if (!hasData || !cols.article) return {};

    const byArt = {};
    for (const r of tableData) {
      const key = `${r[cols.article]}__${r[cols.depot] ?? ''}`;
      if (!byArt[key]) byArt[key] = { e: 0, s: 0, sf: 0 };
      byArt[key].e  += Number(r[cols.entrees] ?? 0);
      byArt[key].s  += Number(r[cols.sorties] ?? 0);
      byArt[key].sf  = Number(r[cols.stock]   ?? 0);
    }

    // Jours de stock critiques (≤ 15 j)
    let nj = 30;
    if (currentFilters?.dateDebut && currentFilters?.dateFin) {
      const d1 = new Date(currentFilters.dateDebut);
      const d2 = new Date(currentFilters.dateFin);
      nj = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
    }
    const critiques = Object.values(byArt).filter(a => {
      const sjour = nj > 0 ? a.s / nj : 0;
      const jr    = sjour > 0 ? a.sf / sjour : Infinity;
      return jr !== Infinity && jr <= 15;
    }).length;

    // Déséquilibres (sur-appro + déstockage)
    const desequilibres = Object.values(byArt).filter(a => {
      if (a.e === 0 && a.s === 0) return false;
      const ratio = a.s > 0 ? a.e / a.s : a.e > 0 ? Infinity : 1;
      return ratio >= 2 || ratio <= 0.5 || ratio === Infinity || (a.s > 0 && a.e === 0);
    }).length;

    return { critiques, desequilibres };
  }, [hasData, tableData, cols, currentFilters]);

  return (
    <div className="flex flex-col gap-5">

      {/* Bandeau contexte */}
      <ContextBanner filters={currentFilters} />

      {/* Message si pas de données */}
      {!hasData && (
        <div className="bg-[rgba(18,166,224,0.04)] border border-[rgba(18,166,224,0.15)] rounded-xl px-5 py-4 text-[#0b7db0] text-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#12a6e0] shrink-0 animate-pulse" />
          <span>
            Rendez-vous sur le <strong>Tableau de bord</strong> pour sélectionner une base et une
            période, puis cliquez sur <strong>Filtrer</strong> pour afficher les tendances.
          </span>
        </div>
      )}

      {hasData && (
        <>
          {/* ── Tendance 1 : Taux de rotation ── */}
          <TrendCard
            icon={ArrowLeftRight}
            iconColor={C.blue}
            iconBg={C.blueLight}
            title="Taux de rotation des articles"
            subtitle="Sorties ÷ stock moyen sur la période — identifie les articles lents et rapides"
          >
            <TauxRotation data={tableData} cols={cols} />
          </TrendCard>

          {/* ── Tendance 2 : Comparaison N vs N-1 ── */}
          <TrendCard
            icon={CalendarDays}
            iconColor={C.purple}
            iconBg={C.purpleLight}
            title="Comparaison mois par mois"
            subtitle="Entrées, sorties et stock par mois — comparaison N vs N-1 si la période couvre 2 années"
          >
            <ComparaisonMois data={tableData} cols={cols} />
          </TrendCard>

          {/* ── Tendances 3 + 4 côte à côte ── */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* Tendance 3 : Jours de stock restants */}
            <TrendCard
              icon={Clock}
              iconColor={C.amber}
              iconBg={C.amberLight}
              title="Jours de stock restants"
              subtitle="Stock final ÷ (sorties / nb jours) — articles les plus critiques en premier"
              badge={badges.critiques > 0 ? `${badges.critiques} urgent${badges.critiques > 1 ? 's' : ''}` : undefined}
            >
              <JoursDeStock data={tableData} cols={cols} filters={currentFilters} />
            </TrendCard>

            {/* Tendance 4 : Déséquilibre entrées / sorties */}
            <TrendCard
              icon={ArrowLeftRight}
              iconColor={C.red}
              iconBg={C.redLight}
              title="Déséquilibre entrées / sorties"
              subtitle="Ratio E÷S — identifie les sur-approvisionnements et déstockages rapides"
              badge={badges.desequilibres > 0 ? `${badges.desequilibres} déséquilibré${badges.desequilibres > 1 ? 's' : ''}` : undefined}
            >
              <DesequilibreEntreesSorties data={tableData} cols={cols} />
            </TrendCard>

          </div>
        </>
      )}
    </div>
  );
}