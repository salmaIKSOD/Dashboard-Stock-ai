import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, LogIn, Database,
  TrendingUp, PackageSearch, BrainCircuit,
  FileSpreadsheet, AlertCircle, Loader2,
} from 'lucide-react';
import logo from '../images/logo.png';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  // Toujours rediriger vers le dashboard après connexion
  // (pas vers la dernière page visitée avant déconnexion)

  const [showPassword, setShowPassword] = useState(false);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [rememberMe,   setRememberMe]   = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      // navigate('/', { replace: true });
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4">

      {/* ── Arrière-plan ── */}
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-[#e0f2fe] via-[#f0f9ff] to-[#eef2ff]" />

      <div className="fixed top-0 left-0 right-0 w-full h-48 opacity-20 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path fill="#12a6e0" fillOpacity="0.4" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z">
            <animate attributeName="d" dur="8s" repeatCount="indefinite" values="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z;M0,160L48,165.3C96,171,192,181,288,186.7C384,192,480,192,576,186.7C672,181,768,171,864,165.3C960,160,1056,160,1152,165.3C1248,171,1344,181,1392,186.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z;M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
          </path>
        </svg>
      </div>

      <div className="fixed bottom-0 left-0 right-0 w-full h-48 opacity-20 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path fill="#01d63a" fillOpacity="0.4" d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,224L48,218.7C96,213,192,203,288,208C384,213,480,235,576,245.3C672,256,768,256,864,245.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </path>
        </svg>
      </div>

      <div className="fixed top-10 left-10 w-80 h-80 bg-[#12a6e0]/10 rounded-full blur-3xl animate-float-slow" />
      <div className="fixed bottom-10 right-10 w-80 h-80 bg-[#01d63a]/10 rounded-full blur-3xl animate-float-reverse" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7c4dff]/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(18,166,224,0.12) 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />

      {/* ── Carte ── */}
      <div className="relative w-full max-w-[1100px] my-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-white/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden z-10">
        <div className="flex flex-col md:flex-row">

          {/* ── Colonne gauche : formulaire ── */}
          <div className="flex-1 p-6 md:p-10">

            {/* Brand */}
            <div className="text-center mb-6">
              <h1 className="text-[#0d0c0c] text-[1.5rem] font-bold tracking-tight">
                Stock<span className="text-[#12a6e0]">Analytics</span>
              </h1>
              <p className="text-[#888888] text-[0.75rem] mt-1">Plateforme d'analyse de mouvements de stock</p>
            </div>

            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <LogIn size={16} className="text-[#12a6e0]" />
                <span className="text-[#0d0c0c] text-[0.7rem] font-semibold uppercase tracking-[0.08em]">Connexion</span>
              </div>
              <p className="text-[#aaaaaa] text-[0.7rem]">Accédez à votre tableau de bord</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
                  <Mail size={10} /> Email professionnel
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c5c5]"><Mail size={14} /></div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@sage.local"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e0e0e0] bg-white text-[0.75rem] text-[#0d0c0c] outline-none transition-all duration-200 focus:border-[#12a6e0] focus:shadow-[0_0_0_3px_rgba(18,166,224,0.1)] placeholder:text-[#c5c5c5]"
                    required />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
                  <Lock size={10} /> Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c5c5]"><Lock size={14} /></div>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#e0e0e0] bg-white text-[0.75rem] text-[#0d0c0c] outline-none transition-all duration-200 focus:border-[#12a6e0] focus:shadow-[0_0_0_3px_rgba(18,166,224,0.1)] placeholder:text-[#c5c5c5]"
                    required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c5c5c5] hover:text-[#888888] transition-colors">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="peer sr-only" />
                    <div className="w-3.5 h-3.5 rounded border border-[#c5c5c5] bg-white transition-all duration-150 peer-checked:bg-[#12a6e0] peer-checked:border-[#12a6e0]">
                      {rememberMe && (
                        <svg className="w-2.5 h-2.5 text-white m-[2px]" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[0.65rem] text-[#888888] group-hover:text-[#0d0c0c] transition-colors cursor-pointer">Se souvenir de moi</span>
                </label>
                <button type="button" className="text-[0.65rem] text-[#12a6e0] hover:text-[#0d8fc4] transition-colors font-medium">
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] bg-[rgba(229,57,53,0.05)] border border-[rgba(229,57,53,0.2)] text-[#c62828]">
                  <AlertCircle size={14} className="shrink-0" /> {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-[#12a6e0] to-[#0d8fc4] text-white text-[0.75rem] font-semibold shadow-md shadow-[rgba(18,166,224,0.25)] transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                {submitting ? 'Connexion…' : 'Se connecter'}
              </button>

              {/* Lien inscription */}
              <p className="text-center text-[0.65rem] text-[#aaaaaa] pt-1">
                Pas encore de compte ?{' '}
                <Link to="/signup" className="text-[#12a6e0] font-semibold hover:text-[#0d8fc4] transition-colors">
                  Créer un compte
                </Link>
              </p>
            </form>
          </div>

          {/* ── Colonne droite : features ── */}
          <div className="flex-1 bg-gradient-to-br from-[#ffffff] to-[#fafcff] p-6 md:p-10 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-[#e8e8e8]">
            <div className="relative w-full max-w-[280px] mb-6 flex items-center justify-center">
              <img src={logo} alt="Imrasoft - Intégrateur des Solutions SAGE" className="w-full object-contain drop-shadow-md" />
            </div>
            <div className="w-full">
              <p className="text-[#0d0c0c] text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-center mb-3">Fonctionnalités</p>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { icon: TrendingUp,    label: 'Analyse des mouvements de stock', color: '#12a6e0' },
                  { icon: PackageSearch, label: 'Suivi des mouvements',            color: '#01a82e' },
                  { icon: Database,      label: 'Multi-bases SAGE',                color: '#12a6e0' },
                  { icon: BrainCircuit,  label: 'Prévisions IA (7j/14j/30j)',      color: '#7c4dff' },
                  { icon: FileSpreadsheet, label: 'Export rapports & Excel',       color: '#e53935' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white border border-[#e8e8e8] transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                    <f.icon size={12} style={{ color: f.color }} />
                    <span className="text-[0.65rem] text-[#555555]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(25px,-15px) scale(1.05);} 66%{transform:translate(-15px,10px) scale(0.95);} }
        @keyframes float-reverse { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-20px,15px) scale(1.05);} 66%{transform:translate(15px,-10px) scale(0.95);} }
        @keyframes pulse-slow { 0%,100%{opacity:0.3;transform:scale(1);} 50%{opacity:0.5;transform:scale(1.05);} }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 25s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default LoginPage;
// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import {
//   Eye, EyeOff, Mail, Lock, LogIn, Database,
//   TrendingUp, PackageSearch, BrainCircuit,
//   FileSpreadsheet, AlertCircle, Loader2,
// } from 'lucide-react';
// import logo from '../images/logo.png';
// import { useAuth } from '../context/AuthContext';

// function LoginPage() {
//   const { login } = useAuth();
//   const navigate  = useNavigate();
//   const location  = useLocation();
//   const from      = location.state?.from?.pathname || '/';

//   const [showPassword, setShowPassword] = useState(false);
//   const [email,        setEmail]        = useState('');
//   const [password,     setPassword]     = useState('');
//   const [rememberMe,   setRememberMe]   = useState(false);
//   const [submitting,   setSubmitting]   = useState(false);
//   const [error,        setError]        = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError(null);
//     try {
//       await login(email, password);
//       navigate(from, { replace: true });
//     } catch (err) {
//       setError(err.response?.data?.error || 'Email ou mot de passe incorrect.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full relative flex items-center justify-center p-4">

//       {/* ── Arrière-plan ── */}
//       <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-[#e0f2fe] via-[#f0f9ff] to-[#eef2ff]" />

//       <div className="fixed top-0 left-0 right-0 w-full h-48 opacity-20 pointer-events-none">
//         <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
//           <path fill="#12a6e0" fillOpacity="0.4" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z">
//             <animate attributeName="d" dur="8s" repeatCount="indefinite" values="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z;M0,160L48,165.3C96,171,192,181,288,186.7C384,192,480,192,576,186.7C672,181,768,171,864,165.3C960,160,1056,160,1152,165.3C1248,171,1344,181,1392,186.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z;M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
//           </path>
//         </svg>
//       </div>

//       <div className="fixed bottom-0 left-0 right-0 w-full h-48 opacity-20 pointer-events-none">
//         <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
//           <path fill="#01d63a" fillOpacity="0.4" d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
//             <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,224L48,218.7C96,213,192,203,288,208C384,213,480,235,576,245.3C672,256,768,256,864,245.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
//           </path>
//         </svg>
//       </div>

//       <div className="fixed top-10 left-10 w-80 h-80 bg-[#12a6e0]/10 rounded-full blur-3xl animate-float-slow" />
//       <div className="fixed bottom-10 right-10 w-80 h-80 bg-[#01d63a]/10 rounded-full blur-3xl animate-float-reverse" />
//       <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7c4dff]/5 rounded-full blur-3xl animate-pulse-slow" />
//       <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(18,166,224,0.12) 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />

//       {/* ── Carte ── */}
//       <div className="relative w-full max-w-[1100px] my-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-white/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden z-10">
//         <div className="flex flex-col md:flex-row">

//           {/* ── Colonne gauche : formulaire ── */}
//           <div className="flex-1 p-6 md:p-10">

//             {/* Brand */}
//             <div className="text-center mb-6">
//               <h1 className="text-[#0d0c0c] text-[1.5rem] font-bold tracking-tight">
//                 Stock<span className="text-[#12a6e0]">Analytics</span>
//               </h1>
//               <p className="text-[#888888] text-[0.75rem] mt-1">Plateforme d'analyse de mouvements de stock</p>
//             </div>

//             {/* Header */}
//             <div className="mb-5">
//               <div className="flex items-center gap-2 mb-1">
//                 <LogIn size={16} className="text-[#12a6e0]" />
//                 <span className="text-[#0d0c0c] text-[0.7rem] font-semibold uppercase tracking-[0.08em]">Connexion</span>
//               </div>
//               <p className="text-[#aaaaaa] text-[0.7rem]">Accédez à votre tableau de bord</p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">

//               {/* Email */}
//               <div className="space-y-1">
//                 <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
//                   <Mail size={10} /> Email professionnel
//                 </label>
//                 <div className="relative">
//                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c5c5]"><Mail size={14} /></div>
//                   <input type="email" value={email} onChange={e => setEmail(e.target.value)}
//                     placeholder="admin@sage.local"
//                     className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e0e0e0] bg-white text-[0.75rem] text-[#0d0c0c] outline-none transition-all duration-200 focus:border-[#12a6e0] focus:shadow-[0_0_0_3px_rgba(18,166,224,0.1)] placeholder:text-[#c5c5c5]"
//                     required />
//                 </div>
//               </div>

//               {/* Mot de passe */}
//               <div className="space-y-1">
//                 <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
//                   <Lock size={10} /> Mot de passe
//                 </label>
//                 <div className="relative">
//                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c5c5]"><Lock size={14} /></div>
//                   <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
//                     placeholder="••••••••"
//                     className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#e0e0e0] bg-white text-[0.75rem] text-[#0d0c0c] outline-none transition-all duration-200 focus:border-[#12a6e0] focus:shadow-[0_0_0_3px_rgba(18,166,224,0.1)] placeholder:text-[#c5c5c5]"
//                     required />
//                   <button type="button" onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c5c5c5] hover:text-[#888888] transition-colors">
//                     {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
//                   </button>
//                 </div>
//               </div>

//               {/* Remember me */}
//               <div className="flex flex-wrap items-center justify-between gap-2">
//                 <label className="flex items-center gap-2 cursor-pointer group">
//                   <div className="relative">
//                     <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="peer sr-only" />
//                     <div className="w-3.5 h-3.5 rounded border border-[#c5c5c5] bg-white transition-all duration-150 peer-checked:bg-[#12a6e0] peer-checked:border-[#12a6e0]">
//                       {rememberMe && (
//                         <svg className="w-2.5 h-2.5 text-white m-[2px]" viewBox="0 0 12 12" fill="none">
//                           <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                         </svg>
//                       )}
//                     </div>
//                   </div>
//                   <span className="text-[0.65rem] text-[#888888] group-hover:text-[#0d0c0c] transition-colors cursor-pointer">Se souvenir de moi</span>
//                 </label>
//                 <button type="button" className="text-[0.65rem] text-[#12a6e0] hover:text-[#0d8fc4] transition-colors font-medium">
//                   Mot de passe oublié ?
//                 </button>
//               </div>

//               {/* Erreur */}
//               {error && (
//                 <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] bg-[rgba(229,57,53,0.05)] border border-[rgba(229,57,53,0.2)] text-[#c62828]">
//                   <AlertCircle size={14} className="shrink-0" /> {error}
//                 </div>
//               )}

//               {/* Submit */}
//               <button type="submit" disabled={submitting}
//                 className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-[#12a6e0] to-[#0d8fc4] text-white text-[0.75rem] font-semibold shadow-md shadow-[rgba(18,166,224,0.25)] transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100">
//                 {submitting ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
//                 {submitting ? 'Connexion…' : 'Se connecter'}
//               </button>

//               {/* Lien inscription */}
//               <p className="text-center text-[0.65rem] text-[#aaaaaa] pt-1">
//                 Pas encore de compte ?{' '}
//                 <Link to="/signup" className="text-[#12a6e0] font-semibold hover:text-[#0d8fc4] transition-colors">
//                   Créer un compte
//                 </Link>
//               </p>
//             </form>
//           </div>

//           {/* ── Colonne droite : features ── */}
//           <div className="flex-1 bg-gradient-to-br from-[#ffffff] to-[#fafcff] p-6 md:p-10 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-[#e8e8e8]">
//             <div className="relative w-full max-w-[280px] mb-6 flex items-center justify-center">
//               <img src={logo} alt="Imrasoft - Intégrateur des Solutions SAGE" className="w-full object-contain drop-shadow-md" />
//             </div>
//             <div className="w-full">
//               <p className="text-[#0d0c0c] text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-center mb-3">Fonctionnalités</p>
//               <div className="grid grid-cols-1 gap-1.5">
//                 {[
//                   { icon: TrendingUp,    label: 'Analyse des mouvements de stock', color: '#12a6e0' },
//                   { icon: PackageSearch, label: 'Suivi des mouvements',            color: '#01a82e' },
//                   { icon: Database,      label: 'Multi-bases SAGE',                color: '#12a6e0' },
//                   { icon: BrainCircuit,  label: 'Prévisions IA (7j/14j/30j)',      color: '#7c4dff' },
//                   { icon: FileSpreadsheet, label: 'Export rapports & Excel',       color: '#e53935' },
//                 ].map((f, i) => (
//                   <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white border border-[#e8e8e8] transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
//                     <f.icon size={12} style={{ color: f.color }} />
//                     <span className="text-[0.65rem] text-[#555555]">{f.label}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes float-slow { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(25px,-15px) scale(1.05);} 66%{transform:translate(-15px,10px) scale(0.95);} }
//         @keyframes float-reverse { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-20px,15px) scale(1.05);} 66%{transform:translate(15px,-10px) scale(0.95);} }
//         @keyframes pulse-slow { 0%,100%{opacity:0.3;transform:scale(1);} 50%{opacity:0.5;transform:scale(1.05);} }
//         .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
//         .animate-float-reverse { animation: float-reverse 25s ease-in-out infinite; }
//         .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
//       `}</style>
//     </div>
//   );
// }

// export default LoginPage;