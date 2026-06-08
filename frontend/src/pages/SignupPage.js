import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserPlus,
  Database,
  Building2,
  User,
  Check,
  X,
  TrendingUp,
  PackageSearch,
  BrainCircuit,
  MessageCircle,
  Shield,
} from 'lucide-react';

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup attempt:', formData);
  };

  // Validation en temps réel
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = formData.password.length >= 8;
  const doPasswordsMatch = formData.password === formData.confirmPassword;
  const isFormValid = 
    formData.firstName &&
    formData.lastName &&
    isEmailValid &&
    formData.company &&
    isPasswordValid &&
    doPasswordsMatch &&
    agreeTerms;

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4">
      
      {/* ─── ARRIÈRE-PLAN UNIFORME SUR TOUTE LA PAGE ─── */}
      
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-[#e0f2fe] via-[#f0f9ff] to-[#eef2ff]" />
      
      {/* Vagues animées */}
      <div className="fixed top-0 left-0 right-0 w-full h-48 opacity-20 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path fill="#12a6e0" fillOpacity="0.4" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z">
            <animate attributeName="d" dur="8s" repeatCount="indefinite" values="
              M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z;
              M0,160L48,165.3C96,171,192,181,288,186.7C384,192,480,192,576,186.7C672,181,768,171,864,165.3C960,160,1056,160,1152,165.3C1248,171,1344,181,1392,186.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z;
              M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z
            " />
          </path>
        </svg>
      </div>

      <div className="fixed bottom-0 left-0 right-0 w-full h-48 opacity-20 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path fill="#01d63a" fillOpacity="0.4" d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="
              M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
              M0,224L48,218.7C96,213,192,203,288,208C384,213,480,235,576,245.3C672,256,768,256,864,245.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
              M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
            " />
          </path>
        </svg>
      </div>

      {/* Cercles flottants */}
      <div className="fixed top-10 left-10 w-80 h-80 bg-[#12a6e0]/10 rounded-full blur-3xl animate-float-slow" />
      <div className="fixed bottom-10 right-10 w-80 h-80 bg-[#01d63a]/10 rounded-full blur-3xl animate-float-reverse" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7c4dff]/5 rounded-full blur-3xl animate-pulse-slow" />
      
      {/* Grille de points */}
      <div className="fixed inset-0 w-full h-full pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(18,166,224,0.12) 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
      }} />

      {/* Carte blanche centrée */}
      <div className="relative w-full max-w-[1100px] my-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-white/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden z-10">
        
        <div className="flex flex-col md:flex-row">
          
          {/* ─── COLONNE GAUCHE : IMAGE 3D + FEATURES (AGRANDIE COMME LOGIN) ─── */}
          <div className="flex-1 bg-gradient-to-br from-[#ffffff] to-[#fafcff] p-6 md:p-10 flex flex-col justify-center items-center border-t md:border-t-0 md:border-r border-[#e8e8e8]">
            
            {/* Image 3D - plus grande */}
            <div className="relative w-full max-w-[200px] md:max-w-[240px] mb-6 group">
              <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-[#12a6e0]/10 to-[#01d63a]/10 flex items-center justify-center overflow-hidden shadow-lg transition-all duration-500 group-hover:scale-105">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] rotate-12 opacity-30 animate-spin-slow" />
                  <div className="absolute w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-tr from-[#01d63a] to-[#01a82e] -rotate-6 opacity-30 animate-spin-reverse-slow" />
                  <div className="absolute w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white shadow-lg flex items-center justify-center z-10">
                    <Building2 size={24} className="text-[#12a6e0]" />
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-[#12a6e0]/10 to-[#01d63a]/10 rounded-full blur-2xl -z-10 animate-pulse-slow" />
            </div>

            {/* Features grid - agrandi */}
            <div className="w-full">
              <p className="text-[#0d0c0c] text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-center mb-3">
                Fonctionnalités
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { icon: TrendingUp, label: 'Analyse temps réel', color: '#12a6e0' },
                  { icon: PackageSearch, label: 'Suivi des mouvements', color: '#01a82e' },
                  { icon: Database, label: 'Multi-bases SAGE', color: '#12a6e0' },
                  { icon: BrainCircuit, label: 'Prévisions IA (7j/14j/30j)', color: '#7c4dff' },
                  { icon: MessageCircle, label: 'Assistant IA chatbot', color: '#e53935' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white border border-[#e8e8e8] transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                    <feature.icon size={12} style={{ color: feature.color }} />
                    <span className="text-[0.65rem] text-[#555555]">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role hint */}
            <div className="mt-5 text-center">
              <p className="text-[0.54rem] text-[#aaaaaa]">
                <Shield size={12} className="inline mr-1" />
                Inscription réservée aux sociétés
              </p>
            </div>
          </div>

          {/* ─── COLONNE DROITE : FORMULAIRE D'INSCRIPTION (GARDÉ TEL QUEL) ─── */}
          <div className="flex-1 p-6 md:p-8">
            {/* Logo / Brand - réduit */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] shadow-lg shadow-[rgba(18,166,224,0.25)] mb-3">
                <Database size={24} className="text-white" />
              </div>
              <h1 className="text-[#0d0c0c] text-[1.3rem] font-bold tracking-tight">
                Stock<span className="text-[#12a6e0]">Analytics</span>
              </h1>
              <p className="text-[#888888] text-[0.7rem] mt-0.5">
                Créez votre espace d'analyse
              </p>
            </div>

            {/* Header - réduit */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-0.5">
                <UserPlus size={14} className="text-[#12a6e0]" />
                <span className="text-[#0d0c0c] text-[0.65rem] font-semibold uppercase tracking-[0.08em]">
                  Inscription Société
                </span>
              </div>
              <p className="text-[#aaaaaa] text-[0.65rem]">
                Remplissez le formulaire pour créer votre compte
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
                    <User size={9} />
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jean"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#e0e0e0] bg-white text-[0.7rem] text-[#0d0c0c] outline-none transition-all duration-200 focus:border-[#12a6e0] focus:shadow-[0_0_0_3px_rgba(18,166,224,0.1)] placeholder:text-[#c5c5c5]"
                    required
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
                    <User size={9} />
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Dupont"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#e0e0e0] bg-white text-[0.7rem] text-[#0d0c0c] outline-none transition-all duration-200 focus:border-[#12a6e0] focus:shadow-[0_0_0_3px_rgba(18,166,224,0.1)] placeholder:text-[#c5c5c5]"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-0.5">
                <label className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
                  <Mail size={9} />
                  Email professionnel
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c5c5]">
                    <Mail size={13} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jean.dupont@entreprise.com"
                    className={`w-full pl-9 pr-8 py-1.5 rounded-xl border bg-white text-[0.7rem] text-[#0d0c0c] outline-none transition-all duration-200 placeholder:text-[#c5c5c5] ${
                      formData.email && !isEmailValid
                        ? 'border-[#e53935] focus:border-[#e53935]'
                        : formData.email && isEmailValid
                        ? 'border-[#01a82e] focus:border-[#01a82e]'
                        : 'border-[#e0e0e0] focus:border-[#12a6e0]'
                    }`}
                    required
                  />
                  {formData.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isEmailValid ? (
                        <Check size={13} className="text-[#01a82e]" />
                      ) : (
                        <X size={13} className="text-[#e53935]" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Company */}
              <div className="space-y-0.5">
                <label className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
                  <Building2 size={9} />
                  Nom de la société
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c5c5]">
                    <Building2 size={13} />
                  </div>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Ma Société SAS"
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#e0e0e0] bg-white text-[0.7rem] text-[#0d0c0c] outline-none transition-all duration-200 focus:border-[#12a6e0] focus:shadow-[0_0_0_3px_rgba(18,166,224,0.1)] placeholder:text-[#c5c5c5]"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-0.5">
                <label className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
                  <Lock size={9} />
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c5c5]">
                    <Lock size={13} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-9 py-1.5 rounded-xl border bg-white text-[0.7rem] text-[#0d0c0c] outline-none transition-all duration-200 placeholder:text-[#c5c5c5] ${
                      formData.password && !isPasswordValid
                        ? 'border-[#e53935] focus:border-[#e53935]'
                        : formData.password && isPasswordValid
                        ? 'border-[#01a82e] focus:border-[#01a82e]'
                        : 'border-[#e0e0e0] focus:border-[#12a6e0]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c5c5c5] hover:text-[#888888] transition-colors"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <p className="text-[0.55rem] text-[#aaaaaa] mt-0.5">
                  {formData.password ? (
                    isPasswordValid ? (
                      <span className="text-[#01a82e]">✓ Mot de passe valide (8+ caractères)</span>
                    ) : (
                      <span className="text-[#e53935]">✗ Minimum 8 caractères</span>
                    )
                  ) : (
                    'Minimum 8 caractères'
                  )}
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-0.5">
                <label className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
                  <Lock size={9} />
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c5c5]">
                    <Lock size={13} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-9 py-1.5 rounded-xl border bg-white text-[0.7rem] text-[#0d0c0c] outline-none transition-all duration-200 placeholder:text-[#c5c5c5] ${
                      formData.confirmPassword && !doPasswordsMatch
                        ? 'border-[#e53935] focus:border-[#e53935]'
                        : formData.confirmPassword && doPasswordsMatch
                        ? 'border-[#01a82e] focus:border-[#01a82e]'
                        : 'border-[#e0e0e0] focus:border-[#12a6e0]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c5c5c5] hover:text-[#888888] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {formData.confirmPassword && !doPasswordsMatch && (
                  <p className="text-[0.55rem] text-[#e53935] mt-0.5">✗ Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-center gap-2 cursor-pointer group pt-0.5">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-3.5 h-3.5 rounded border border-[#c5c5c5] bg-white transition-all duration-150 peer-checked:bg-[#12a6e0] peer-checked:border-[#12a6e0] peer-focus:ring-2 peer-focus:ring-[rgba(18,166,224,0.2)]">
                    {agreeTerms && (
                      <svg className="w-2.5 h-2.5 text-white m-[2px]" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[0.6rem] text-[#888888] group-hover:text-[#0d0c0c] transition-colors">
                  J'accepte les{' '}
                  <button type="button" className="text-[#12a6e0] hover:text-[#0d8fc4] font-medium">
                    conditions
                  </button>
                  {' '}et la{' '}
                  <button type="button" className="text-[#12a6e0] hover:text-[#0d8fc4] font-medium">
                    politique
                  </button>
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-xl text-[0.7rem] font-semibold transition-all duration-200 ${
                  isFormValid
                    ? 'bg-gradient-to-r from-[#12a6e0] to-[#0d8fc4] text-white shadow-md shadow-[rgba(18,166,224,0.25)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-[#e8f6fd] text-[#92cfe8] cursor-not-allowed'
                }`}
              >
                <UserPlus size={13} />
                Créer mon compte société
              </button>

              {/* Login link */}
              <p className="text-center text-[0.6rem] text-[#aaaaaa] pt-0.5">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-[#12a6e0] font-semibold hover:text-[#0d8fc4] transition-colors">
                  Se connecter
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(25px, -15px) scale(1.05); }
          66% { transform: translate(-15px, 10px) scale(0.95); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-20px, 15px) scale(1.05); }
          66% { transform: translate(15px, -10px) scale(0.95); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 25s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 25s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default SignupPage;