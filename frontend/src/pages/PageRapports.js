// // // Utilisez ce template pour chaque page
// // import React from 'react';
// // import { PackageSearch } from 'lucide-react'; // changez l'icône

// // export default function PageStockJournalier() {
// //   return (
// //     <div className="flex flex-col items-center justify-center py-20 gap-4">
// //       <div className="w-16 h-16 rounded-2xl bg-[rgba(18,166,224,0.08)] flex items-center justify-center">
// //         <PackageSearch size={28} color="#12a6e0" />
// //       </div>
// //       <h2 className="text-[#0d0c0c] text-lg font-semibold m-0">Stock journalier</h2>
// //       <p className="text-[#aaaaaa] text-sm m-0">Cette section est en cours de développement.</p>
// //     </div>
// //   );
// // }

// import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import {
//   Database, ChevronDown, Loader2, RefreshCw, XCircle, Clock,
//   FileText, AlertCircle, CheckCircle2, Radar, TrendingUp,
// } from 'lucide-react';
// import { fetchBases } from '../api/stockApi';
// import { fetchPipelineStatus, fetchPredictionResults } from '../api/predictionsApi';
// import { exportExcelMultiSheet } from '../api/exportExcelAlertes';

// // ── Helpers ───────────────────────────────────────────────────
// const fmtNum = (n) => {
//   if (n === null || n === undefined || isNaN(Number(n))) return '—';
//   return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(Number(n));
// };

// const fmtJoursHeures = (n) => {
//   if (n === null || n === undefined || isNaN(Number(n))) return '—';
//   const v = Number(n);
//   if (v <= 0) return '0 h';
//   const totalHeures = Math.round(v * 24);
//   const jours  = Math.floor(totalHeures / 24);
//   const heures = totalHeures % 24;
//   if (jours === 0) return `${heures} h`;
//   if (heures === 0) return `${jours} j`;
//   return `${jours} j ${heures} h`;
// };

// const fmtDate = (d) => {
//   if (!d) return '—';
//   return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
// };

// const getDesign = (r) => r.AR_Design || r.ar_design || r.Design || '—';

// const JOURS_COUVERTURE = 15;
// const calcQuantiteSuggeree = (stock, rythme) => {
//   const s = Number(stock) || 0;
//   const r = Number(rythme) || 0;
//   const besoin = r * JOURS_COUVERTURE - s;
//   return Math.max(0, Math.ceil(besoin));
// };

// // ── Bouton export ────────────────────────────────────────────
// function ExportButton({ onClick, label = 'Exporter le rapport complet' }) {
//   return (
//     <button
//       onClick={onClick}
//       className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#f0fdf4] text-[#15803d] border border-[rgba(21,128,61,0.25)] cursor-pointer transition-all duration-150 hover:bg-[#dcfce7] hover:shadow-[0_1px_6px_rgba(21,128,61,0.18)] active:scale-[0.97]"
//     >
//       <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
//         <path d="M12 16l-5-5h3V4h4v7h3l-5 5z" fill="#15803d"/>
//         <path d="M5 20h14" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
//       </svg>
//       {label}
//     </button>
//   );
// }

// // ── Sélecteur de base ────────────────────────────────────────
// function BaseSelector({ bases, value, onChange, loading }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     if (!open) return;
//     const handleOutside = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener('mousedown', handleOutside);
//     return () => document.removeEventListener('mousedown', handleOutside);
//   }, [open]);

//   const selected = bases.find(b => b.BaseName === value);
//   return (
//     <div className="relative" ref={ref}>
//       <button onClick={() => setOpen(o => !o)}
//         className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer"
//         style={{ background: value ? '#E6F1FB' : 'white', borderColor: value ? '#B5D4F4' : '#e0e0e0', color: value ? '#0C447C' : '#888' }}>
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

// // ── Gros KPI ─────────────────────────────────────────────────
// function BigKpi({ icon: Icon, label, value, color, bg }) {
//   return (
//     <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 flex items-center gap-3">
//       <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
//         <Icon size={20} style={{ color }} />
//       </div>
//       <div className="min-w-0">
//         <p className="text-[1.5rem] font-bold m-0 leading-none" style={{ color }}>{value}</p>
//         <p className="text-[11px] text-[#888] m-0 mt-1">{label}</p>
//       </div>
//     </div>
//   );
// }

// // ── Petite carte priorité (top 5) ───────────────────────────
// function PrioriteCard({ article, design, jours, quantite, urgence }) {
//   const cfg = urgence === 'critique'
//     ? { bg: '#FFF5F5', border: '#FCA5A5', dot: '#EF4444' }
//     : { bg: '#FFFBEB', border: '#FCD34D', dot: '#F59E0B' };
//   return (
//     <div className="rounded-xl border p-3 flex items-center justify-between gap-3" style={{ background: cfg.bg, borderColor: cfg.border }}>
//       <div className="flex items-center gap-2 min-w-0">
//         <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
//         <div className="min-w-0">
//           <span className="font-mono text-[0.7rem] font-semibold text-[#0b7db0]">{article}</span>
//           <p className="text-[0.75rem] text-[#444] m-0 truncate" title={design}>{design}</p>
//         </div>
//       </div>
//       <div className="text-right flex-shrink-0">
//         <p className="text-[0.65rem] text-[#888] m-0">{fmtJoursHeures(jours)} restant</p>
//         <p className="text-[0.85rem] font-bold m-0" style={{ color: cfg.dot }}>{fmtNum(quantite)} u. à cmd.</p>
//       </div>
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════
// //  Page principale
// // ══════════════════════════════════════════════════════════════
// export default function PageStockJournalier() {
//   const [bases,       setBases]       = useState([]);
//   const [baseName,    setBaseName]    = useState('');
//   const [loadingBase, setLoadingBase] = useState(true);
//   const [loading,     setLoading]     = useState(false);
//   const [error,       setError]       = useState(null);
//   const [status,      setStatus]      = useState(null);
//   const [results,     setResults]     = useState(null);

//   useEffect(() => {
//     fetchBases()
//       .then(data => setBases(data))
//       .catch(e => setError(e.message))
//       .finally(() => setLoadingBase(false));
//   }, []);

//   const loadData = useCallback(async (base) => {
//     if (!base) return;
//     setLoading(true); setError(null); setResults(null); setStatus(null);
//     try {
//       const st = await fetchPipelineStatus(base);
//       setStatus(st);
//       if (st.status === 'success') {
//         const res = await fetchPredictionResults(base);
//         setResults(res);
//       }
//     } catch (e) { setError(e.message); }
//     finally { setLoading(false); }
//   }, []);

//   useEffect(() => { if (baseName) loadData(baseName); }, [baseName, loadData]);

//   const ruptures  = results?.results?.rf       || [];
//   const anomalies = results?.results?.iforest  || [];
//   const kmeans    = results?.results?.kmeans   || [];
//   const segments  = results?.results?.segments || [];

//   // ── Calculs de synthèse ───────────────────────────────────
//   const synth = useMemo(() => {
//     const rupturesSorted = [...ruptures]
//       .filter(r => !isNaN(Number(r.jours_estimes)) && Number(r.jours_estimes) > 0)
//       .sort((a, b) => Number(a.jours_estimes) - Number(b.jours_estimes));

//     const critiques = rupturesSorted.filter(r => Number(r.jours_estimes) < 7);
//     const alertes    = rupturesSorted.filter(r => Number(r.jours_estimes) >= 7 && Number(r.jours_estimes) < 30);
//     const ok         = rupturesSorted.filter(r => Number(r.jours_estimes) >= 30);
//     const suspects    = anomalies.filter(r => r.is_anomalie === 1);
//     // Nombre d'articles distincts concernés par au moins un mouvement suspect
//     // (le nombre de lignes brutes — suspects.length — n'est pas parlant pour un employé,
//     //  c'est juste 5% de toutes les lignes par paramétrage du modèle)
//     const articlesSuspects = new Set(suspects.map(r => r.AR_Ref)).size;
//     const prioritaires = segments.filter(s => String(s.segment ?? '').toLowerCase().includes('forte'));

//     const totalArticles = rupturesSorted.length;
//     const pctSain = totalArticles > 0 ? Math.round(((alertes.length + ok.length) / totalArticles) * 100) : 100;

//     const top5 = [...critiques, ...alertes].slice(0, 5).map(r => ({
//       ...r,
//       urgence: Number(r.jours_estimes) < 7 ? 'critique' : 'alerte',
//       quantite: calcQuantiteSuggeree(r.StockFinal, r.rolling_mean_7),
//     }));

//     const totalQuantiteACommander = [...critiques, ...alertes]
//       .reduce((sum, r) => sum + calcQuantiteSuggeree(r.StockFinal, r.rolling_mean_7), 0);

//     return { critiques, alertes, ok, suspects, articlesSuspects, prioritaires, pctSain, top5, totalQuantiteACommander };
//   }, [ruptures, anomalies, segments]);

//   // ── Phrase de synthèse automatique ────────────────────────
//   const genererPhrase = () => {
//     if (synth.critiques.length === 0 && synth.alertes.length === 0 && synth.articlesSuspects === 0) {
//       return `Tout va bien pour ${baseName}. Le stock est globalement sain, aucune action urgente n'est requise aujourd'hui.`;
//     }
//     const parties = [];
//     if (synth.critiques.length > 0) {
//       parties.push(`${synth.critiques.length} article${synth.critiques.length > 1 ? 's nécessitent' : ' nécessite'} une commande immédiate`);
//     }
//     if (synth.totalQuantiteACommander > 0) {
//       parties.push(`pour un total estimé de ${fmtNum(synth.totalQuantiteACommander)} unités`);
//     }
//     if (synth.articlesSuspects > 0) {
//       parties.push(`${synth.articlesSuspects} article${synth.articlesSuspects > 1 ? 's ont' : ' a'} des mouvements à vérifier`);
//     }
//     return `${parties.join(', ')}. Le stock global est sain à ${synth.pctSain}%.`;
//   };

//   // ── Export complet multi-feuilles ─────────────────────────
//   const handleExport = () => {
//     const resumeRows = [
//       { label: 'Articles critiques (< 7 jours)',        value: synth.critiques.length },
//       { label: 'Articles à surveiller (7-30 jours)',     value: synth.alertes.length },
//       { label: 'Articles avec stock suffisant (> 30 j)', value: synth.ok.length },
//       { label: 'Articles avec mouvements à vérifier',    value: synth.articlesSuspects },
//       { label: 'Articles à forte rotation',               value: synth.prioritaires.length },
//       { label: 'Quantité totale suggérée à commander',    value: synth.totalQuantiteACommander },
//       { label: 'Stock global sain',                       value: `${synth.pctSain}%` },
//     ];

//     const sheets = [
//       {
//         sheetName: 'Résumé',
//         rows: resumeRows,
//         headers: ['Indicateur', 'Valeur'],
//         getRow: r => [r.label, r.value],
//         title: `Rapport de synthèse — ${baseName}`,
//         subtitle: `Généré le ${fmtDate(new Date())} — ${genererPhrase()}`,
//         colWidths: [40, 20],
//       },
//       {
//         sheetName: 'À commander',
//         rows: [...synth.critiques, ...synth.alertes],
//         headers: ['Article', 'Désignation', 'Urgence', 'Temps restant', 'Stock actuel', 'Ventes/jour', 'Quantité suggérée (15j)'],
//         getRow: r => [
//           r.AR_Ref, getDesign(r),
//           Number(r.jours_estimes) < 7 ? 'Critique' : 'Bientôt',
//           fmtJoursHeures(r.jours_estimes), Number(r.StockFinal).toFixed(0), Number(r.rolling_mean_7).toFixed(1),
//           calcQuantiteSuggeree(r.StockFinal, r.rolling_mean_7),
//         ],
//         title: `Articles à commander — ${baseName}`,
//         subtitle: 'Critique (<7j) et à planifier (7-30j), avec quantité suggérée',
//         colWidths: [14, 30, 12, 16, 14, 14, 20],
//       },
//       {
//         sheetName: 'Articles prioritaires',
//         rows: synth.prioritaires,
//         headers: ['Article', 'Désignation', 'Segment'],
//         getRow: r => [r.AR_Ref, getDesign(r), r.segment],
//         title: `Articles prioritaires — ${baseName}`,
//         subtitle: 'Articles à forte rotation',
//         colWidths: [14, 30, 18],
//       },
//       {
//         sheetName: 'Mouvements suspects',
//         rows: synth.suspects,
//         headers: ['Date', 'Article', 'Désignation', 'Qté sortie', 'Stock restant', 'Score'],
//         getRow: r => [fmtDate(r.DateJour), r.AR_Ref, getDesign(r), Number(r.TotalSortie).toFixed(1), Number(r.StockFinal).toFixed(1), Number(r.anomaly_score).toFixed(3)],
//         title: `Mouvements suspects — ${baseName}`,
//         subtitle: 'Sorties inhabituelles détectées automatiquement',
//         colWidths: [14, 14, 30, 14, 16, 12],
//       },
//     ];
//     exportExcelMultiSheet(sheets, `rapport_complet_${baseName}_${fmtDate(new Date()).replace(/\//g, '-')}`);
//   };

//   const urgent = synth.critiques.length > 0;

//   return (
//     <div className="flex flex-col gap-4">
//       {/* En-tête */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-[1.1rem] font-semibold text-[#0d0c0c] m-0">Rapports</h1>
//           <p className="text-[0.8rem] text-[#aaaaaa] m-0 mt-0.5">Vue d'ensemble pour décider rapidement</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <BaseSelector bases={bases} value={baseName} onChange={setBaseName} loading={loadingBase} />
//           <button onClick={() => loadData(baseName)} disabled={loading || !baseName}
//             className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
//             style={{ background: loading || !baseName ? '#f5f5f5' : 'white', borderColor: '#e0e0e0', color: loading || !baseName ? '#aaa' : '#555', cursor: loading || !baseName ? 'not-allowed' : 'pointer' }}>
//             <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
//             {loading ? 'Chargement…' : 'Actualiser'}
//           </button>
//         </div>
//       </div>

//       {/* Banners */}
//       {baseName && status?.status === 'failed' && (
//         <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FCEBEB] border-[#F7C1C1] text-[#791F1F]">
//           <XCircle size={15} /><span>Le calcul a échoué. Allez dans Prédictions puis Relancer.</span>
//         </div>
//       )}
//       {baseName && status?.status === 'not_started' && (
//         <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FAEEDA] border-[#FAC775] text-[#633806]">
//           <Clock size={15} /><span>Aucune analyse pour <strong>{baseName}</strong>. Allez dans Prédictions pour lancer le calcul.</span>
//         </div>
//       )}
//       {error && (
//         <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FCEBEB] border-[#F7C1C1] text-[#791F1F]">
//           <XCircle size={15} /><span>{error}</span>
//         </div>
//       )}

//       {/* Contenu */}
//       {loading ? (
//         <div className="flex items-center justify-center py-20 gap-3 text-[#12a6e0]">
//           <Loader2 size={20} className="animate-spin" /><span className="text-sm">Chargement du rapport…</span>
//         </div>
//       ) : !baseName ? (
//         <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
//           <FileText size={36} className="mb-3" />
//           <p className="text-sm">Sélectionnez une base pour générer le rapport</p>
//         </div>
//       ) : status?.status === 'success' ? (
//         <>
//           {/* Phrase de synthèse */}
//           <div className="rounded-2xl border p-5"
//             style={{ background: urgent ? '#FFF5F5' : '#F0FDF4', borderColor: urgent ? '#FCA5A5' : '#86EFAC' }}>
//             <p className="text-[1rem] font-medium m-0 leading-relaxed" style={{ color: urgent ? '#991B1B' : '#166534' }}>
//               {genererPhrase()}
//             </p>
//           </div>

//           {/* 4 gros KPI */}
//           <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//             <BigKpi icon={AlertCircle} label="Critique" value={synth.critiques.length} color="#EF4444" bg="#FEE2E2" />
//             <BigKpi icon={Clock} label="À surveiller" value={synth.alertes.length} color="#F59E0B" bg="#FEF3C7" />
//             <BigKpi icon={CheckCircle2} label="Stock OK" value={synth.ok.length} color="#22C55E" bg="#DCFCE7" />
//             <BigKpi icon={Radar} label="Articles à vérifier" value={synth.articlesSuspects} color="#8B5CF6" bg="#EDE9FE" />
//           </div>

//           {/* Top 5 priorités */}
//           {synth.top5.length > 0 && (
//             <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
//               <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f0f0f0]">
//                 <TrendingUp size={15} color="#EF4444" />
//                 <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Top 5 priorités du jour</span>
//               </div>
//               <div className="p-4 flex flex-col gap-2">
//                 {synth.top5.map((r, i) => (
//                   <PrioriteCard key={i} article={r.AR_Ref} design={getDesign(r)} jours={r.jours_estimes} quantite={r.quantite} urgence={r.urgence} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Articles prioritaires — résumé court */}
//           {synth.prioritaires.length > 0 && (
//             <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4 flex items-center justify-between gap-3">
//               <div className="flex items-center gap-3">
//                 <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#E0F2FE' }}>
//                   <TrendingUp size={16} color="#0EA5E9" />
//                 </div>
//                 <div>
//                   <p className="text-[0.85rem] font-semibold text-[#0d0c0c] m-0">{synth.prioritaires.length} articles à forte rotation</p>
//                   <p className="text-[0.72rem] text-[#888] m-0">Vos meilleures ventes — ne jamais laisser en rupture</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Export */}
//           <div className="flex justify-end">
//             <ExportButton onClick={handleExport} />
//           </div>
//         </>
//       ) : null}
//     </div>
//   );
// }



import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Database, ChevronDown, Loader2, RefreshCw, XCircle, Clock,
  FileText, AlertCircle, CheckCircle2, Radar, TrendingUp,
} from 'lucide-react';
import { fetchBases } from '../api/stockApi';
import { fetchPipelineStatus, fetchPredictionResults } from '../api/predictionsApi';
import { exportExcelMultiSheet } from '../api/exportExcelAlertes';

// ── Helpers ───────────────────────────────────────────────────
const fmtNum = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '—';
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(Number(n));
};

const fmtJoursHeures = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '—';
  const v = Number(n);
  if (v <= 0) return '0 h';
  const totalHeures = Math.round(v * 24);
  const jours  = Math.floor(totalHeures / 24);
  const heures = totalHeures % 24;
  if (jours === 0) return `${heures} h`;
  if (heures === 0) return `${jours} j`;
  return `${jours} j ${heures} h`;
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getDesign = (r) => r.AR_Design || r.ar_design || r.Design || '—';

const JOURS_COUVERTURE = 15;
const calcQuantiteSuggeree = (stock, rythme) => {
  const s = Number(stock) || 0;
  const r = Number(rythme) || 0;
  const besoin = r * JOURS_COUVERTURE - s;
  return Math.max(0, Math.ceil(besoin));
};

// ── Bouton export ────────────────────────────────────────────
function ExportButton({ onClick, label = 'Exporter le rapport complet' }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#f0fdf4] text-[#15803d] border border-[rgba(21,128,61,0.25)] cursor-pointer transition-all duration-150 hover:bg-[#dcfce7] hover:shadow-[0_1px_6px_rgba(21,128,61,0.18)] active:scale-[0.97]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 16l-5-5h3V4h4v7h3l-5 5z" fill="#15803d"/>
        <path d="M5 20h14" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      {label}
    </button>
  );
}

// ── Sélecteur de base ────────────────────────────────────────
function BaseSelector({ bases, value, onChange, loading }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const selected = bases.find(b => b.BaseName === value);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer"
        style={{ background: value ? '#E6F1FB' : 'white', borderColor: value ? '#B5D4F4' : '#e0e0e0', color: value ? '#0C447C' : '#888' }}>
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

// ── Gros KPI ─────────────────────────────────────────────────
function BigKpi({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[1.5rem] font-bold m-0 leading-none" style={{ color }}>{value}</p>
        <p className="text-[11px] text-[#888] m-0 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Petite carte priorité (top 5) ───────────────────────────
function PrioriteCard({ article, design, jours, quantite, urgence }) {
  const cfg = urgence === 'critique'
    ? { bg: '#FFF5F5', border: '#FCA5A5', dot: '#EF4444' }
    : { bg: '#FFFBEB', border: '#FCD34D', dot: '#F59E0B' };
  return (
    <div className="rounded-xl border p-3 flex items-center justify-between gap-3" style={{ background: cfg.bg, borderColor: cfg.border }}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
        <div className="min-w-0">
          <span className="font-mono text-[0.7rem] font-semibold text-[#0b7db0]">{article}</span>
          <p className="text-[0.75rem] text-[#444] m-0 truncate" title={design}>{design}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[0.65rem] text-[#888] m-0">{fmtJoursHeures(jours)} restant</p>
        <p className="text-[0.85rem] font-bold m-0" style={{ color: cfg.dot }}>{fmtNum(quantite)} u. à cmd.</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Page principale
// ══════════════════════════════════════════════════════════════
export default function PageStockJournalier() {
  const [bases,       setBases]       = useState([]);
  const [baseName,    setBaseName]    = useState('');
  const [loadingBase, setLoadingBase] = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [status,      setStatus]      = useState(null);
  const [results,     setResults]     = useState(null);

  useEffect(() => {
    fetchBases()
      .then(data => setBases(data))
      .catch(e => setError(e.message))
      .finally(() => setLoadingBase(false));
  }, []);

  const loadData = useCallback(async (base) => {
    if (!base) return;
    setLoading(true); setError(null); setResults(null); setStatus(null);
    try {
      const st = await fetchPipelineStatus(base);
      setStatus(st);
      if (st.status === 'success') {
        const res = await fetchPredictionResults(base);
        setResults(res);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (baseName) loadData(baseName); }, [baseName, loadData]);

  const ruptures  = results?.results?.rf       || [];
  const anomalies = results?.results?.iforest  || [];
  const kmeans    = results?.results?.kmeans   || [];
  const segments  = results?.results?.segments || [];

  // ── Calculs de synthèse ───────────────────────────────────
  const synth = useMemo(() => {
    const rupturesSorted = [...ruptures]
      .filter(r => !isNaN(Number(r.jours_estimes)) && Number(r.jours_estimes) > 0)
      .sort((a, b) => Number(a.jours_estimes) - Number(b.jours_estimes));

    const critiques = rupturesSorted.filter(r => Number(r.jours_estimes) < 7);
    const alertes    = rupturesSorted.filter(r => Number(r.jours_estimes) >= 7 && Number(r.jours_estimes) < 30);
    const ok         = rupturesSorted.filter(r => Number(r.jours_estimes) >= 30);
    const suspects    = anomalies.filter(r => r.is_anomalie === 1);
    // Nombre d'articles distincts concernés par au moins un mouvement suspect
    // (le nombre de lignes brutes — suspects.length — n'est pas parlant pour un employé,
    //  c'est juste 5% de toutes les lignes par paramétrage du modèle)
    const articlesSuspects = new Set(suspects.map(r => r.AR_Ref)).size;
    const prioritaires = segments.filter(s => String(s.segment ?? '').toLowerCase().includes('forte'));

    const totalArticles = rupturesSorted.length;
    const pctSain = totalArticles > 0 ? Math.round(((alertes.length + ok.length) / totalArticles) * 100) : 100;

    const top5 = [...critiques, ...alertes].slice(0, 5).map(r => ({
      ...r,
      urgence: Number(r.jours_estimes) < 7 ? 'critique' : 'alerte',
      quantite: calcQuantiteSuggeree(r.StockFinal, r.rolling_mean_7),
    }));

    const totalQuantiteACommander = [...critiques, ...alertes]
      .reduce((sum, r) => sum + calcQuantiteSuggeree(r.StockFinal, r.rolling_mean_7), 0);

    return { critiques, alertes, ok, suspects, articlesSuspects, prioritaires, pctSain, top5, totalQuantiteACommander };
  }, [ruptures, anomalies, segments]);

  // ── Phrase de synthèse automatique ────────────────────────
  const genererPhrase = () => {
    if (synth.critiques.length === 0 && synth.alertes.length === 0 && synth.articlesSuspects === 0) {
      return `Tout va bien pour ${baseName}. Le stock est globalement sain, aucune action urgente n'est requise aujourd'hui.`;
    }
    const parties = [];
    if (synth.critiques.length > 0) {
      parties.push(`${synth.critiques.length} article${synth.critiques.length > 1 ? 's nécessitent' : ' nécessite'} une commande immédiate`);
    }
    if (synth.totalQuantiteACommander > 0) {
      parties.push(`pour un total estimé de ${fmtNum(synth.totalQuantiteACommander)} unités`);
    }
    if (synth.articlesSuspects > 0) {
      parties.push(`${synth.articlesSuspects} article${synth.articlesSuspects > 1 ? 's ont' : ' a'} des mouvements à vérifier`);
    }
    return `${parties.join(', ')}. Le stock global est sain à ${synth.pctSain}%.`;
  };

  // ── Export complet multi-feuilles ─────────────────────────
  const handleExport = () => {
    // ── Feuille 1 : Résumé + Top priorités (ce que l'employé doit voir en premier) ──
    const resumeLignes = [
      { article: '', design: 'ARTICLES CRITIQUES (< 7 JOURS)', qte: synth.critiques.length, note: '' },
      { article: '', design: 'ARTICLES À SURVEILLER (7-30 JOURS)', qte: synth.alertes.length, note: '' },
      { article: '', design: 'ARTICLES AVEC STOCK SUFFISANT (> 30 J)', qte: synth.ok.length, note: '' },
      { article: '', design: 'ARTICLES AVEC MOUVEMENTS À VÉRIFIER', qte: synth.articlesSuspects, note: '' },
      { article: '', design: 'ARTICLES À FORTE ROTATION', qte: synth.prioritaires.length, note: '' },
      { article: '', design: 'QUANTITÉ TOTALE À COMMANDER', qte: synth.totalQuantiteACommander, note: '' },
      { article: '', design: 'STOCK GLOBAL SAIN', qte: `${synth.pctSain}%`, note: '' },
      { article: '', design: '', qte: '', note: '' }, // ligne vide de séparation
      { article: '', design: '── TOP PRIORITÉS DU JOUR — À COMMANDER EN PREMIER ──', qte: '', note: '' },
    ];

    // Ajoute le détail nominatif des priorités (article + nom + quantité) — pas juste des chiffres
    const topPourExport = [...synth.critiques, ...synth.alertes].map(r => ({
      article: r.AR_Ref,
      design: getDesign(r),
      qte: calcQuantiteSuggeree(r.StockFinal, r.rolling_mean_7),
      note: Number(r.jours_estimes) < 7
        ? `Urgent — ${fmtJoursHeures(r.jours_estimes)} restant`
        : `À planifier — ${fmtJoursHeures(r.jours_estimes)} restant`,
    }));

    const sheets = [
      {
        sheetName: 'Résumé',
        rows: [...resumeLignes, ...topPourExport],
        headers: ['Article', 'Désignation', 'Quantité', 'Note'],
        getRow: r => [r.article, r.design, r.qte, r.note],
        title: `Rapport de synthèse — ${baseName}`,
        subtitle: genererPhrase(),
        colWidths: [14, 42, 14, 28],
      },
      {
        sheetName: 'Détail à commander',
        rows: [...synth.critiques, ...synth.alertes],
        headers: ['Article', 'Désignation', 'Urgence', 'Temps restant', 'Stock actuel', 'Ventes/jour', 'Quantité suggérée (15j)'],
        getRow: r => [
          r.AR_Ref, getDesign(r),
          Number(r.jours_estimes) < 7 ? 'Critique' : 'Bientôt',
          fmtJoursHeures(r.jours_estimes), Number(r.StockFinal).toFixed(0), Number(r.rolling_mean_7).toFixed(1),
          calcQuantiteSuggeree(r.StockFinal, r.rolling_mean_7),
        ],
        title: `Articles à commander — ${baseName}`,
        subtitle: 'Critique (<7j) et à planifier (7-30j), avec quantité suggérée',
        colWidths: [14, 30, 12, 16, 14, 14, 20],
      },
      {
        sheetName: 'Articles prioritaires',
        rows: synth.prioritaires,
        headers: ['Article', 'Désignation', 'Segment'],
        getRow: r => [r.AR_Ref, getDesign(r), r.segment],
        title: `Articles prioritaires — ${baseName}`,
        subtitle: 'Articles à forte rotation',
        colWidths: [14, 30, 18],
      },
      {
        sheetName: 'Mouvements suspects',
        rows: synth.suspects,
        headers: ['Date', 'Article', 'Désignation', 'Qté sortie', 'Stock restant', 'Score'],
        getRow: r => [fmtDate(r.DateJour), r.AR_Ref, getDesign(r), Number(r.TotalSortie).toFixed(1), Number(r.StockFinal).toFixed(1), Number(r.anomaly_score).toFixed(3)],
        title: `Mouvements suspects — ${baseName}`,
        subtitle: 'Sorties inhabituelles détectées automatiquement',
        colWidths: [14, 14, 30, 14, 16, 12],
      },
    ];
    exportExcelMultiSheet(sheets, `rapport_complet_${baseName}_${fmtDate(new Date()).replace(/\//g, '-')}`);
  };

  const urgent = synth.critiques.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.1rem] font-semibold text-[#0d0c0c] m-0">Rapports</h1>
          <p className="text-[0.8rem] text-[#aaaaaa] m-0 mt-0.5">Vue d'ensemble pour décider rapidement</p>
        </div>
        <div className="flex items-center gap-2">
          <BaseSelector bases={bases} value={baseName} onChange={setBaseName} loading={loadingBase} />
          <button onClick={() => loadData(baseName)} disabled={loading || !baseName}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
            style={{ background: loading || !baseName ? '#f5f5f5' : 'white', borderColor: '#e0e0e0', color: loading || !baseName ? '#aaa' : '#555', cursor: loading || !baseName ? 'not-allowed' : 'pointer' }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Chargement…' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Banners */}
      {baseName && status?.status === 'failed' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FCEBEB] border-[#F7C1C1] text-[#791F1F]">
          <XCircle size={15} /><span>Le calcul a échoué. Allez dans Prédictions puis Relancer.</span>
        </div>
      )}
      {baseName && status?.status === 'not_started' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FAEEDA] border-[#FAC775] text-[#633806]">
          <Clock size={15} /><span>Aucune analyse pour <strong>{baseName}</strong>. Allez dans Prédictions pour lancer le calcul.</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm bg-[#FCEBEB] border-[#F7C1C1] text-[#791F1F]">
          <XCircle size={15} /><span>{error}</span>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-[#12a6e0]">
          <Loader2 size={20} className="animate-spin" /><span className="text-sm">Chargement du rapport…</span>
        </div>
      ) : !baseName ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#c5c5c5]">
          <FileText size={36} className="mb-3" />
          <p className="text-sm">Sélectionnez une base pour générer le rapport</p>
        </div>
      ) : status?.status === 'success' ? (
        <>
          {/* Phrase de synthèse */}
          <div className="rounded-2xl border p-5"
            style={{ background: urgent ? '#FFF5F5' : '#F0FDF4', borderColor: urgent ? '#FCA5A5' : '#86EFAC' }}>
            <p className="text-[1rem] font-medium m-0 leading-relaxed" style={{ color: urgent ? '#991B1B' : '#166534' }}>
              {genererPhrase()}
            </p>
          </div>

          {/* 4 gros KPI */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <BigKpi icon={AlertCircle} label="Critique" value={synth.critiques.length} color="#EF4444" bg="#FEE2E2" />
            <BigKpi icon={Clock} label="À surveiller" value={synth.alertes.length} color="#F59E0B" bg="#FEF3C7" />
            <BigKpi icon={CheckCircle2} label="Stock OK" value={synth.ok.length} color="#22C55E" bg="#DCFCE7" />
            <BigKpi icon={Radar} label="Articles à vérifier" value={synth.articlesSuspects} color="#8B5CF6" bg="#EDE9FE" />
          </div>

          {/* Top 5 priorités */}
          {synth.top5.length > 0 && (
            <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f0f0f0]">
                <TrendingUp size={15} color="#EF4444" />
                <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Top 5 priorités du jour</span>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {synth.top5.map((r, i) => (
                  <PrioriteCard key={i} article={r.AR_Ref} design={getDesign(r)} jours={r.jours_estimes} quantite={r.quantite} urgence={r.urgence} />
                ))}
              </div>
            </div>
          )}

          {/* Articles prioritaires — résumé court */}
          {synth.prioritaires.length > 0 && (
            <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#E0F2FE' }}>
                  <TrendingUp size={16} color="#0EA5E9" />
                </div>
                <div>
                  <p className="text-[0.85rem] font-semibold text-[#0d0c0c] m-0">{synth.prioritaires.length} articles à forte rotation</p>
                  <p className="text-[0.72rem] text-[#888] m-0">Vos meilleures ventes — ne jamais laisser en rupture</p>
                </div>
              </div>
            </div>
          )}

          {/* Export */}
          <div className="flex justify-end">
            <ExportButton onClick={handleExport} />
          </div>
        </>
      ) : null}
    </div>
  );
}