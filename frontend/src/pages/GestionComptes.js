import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {
  Users, Shield, Plus, Trash2, CheckCircle2,
  AlertCircle, Loader2, RefreshCw, Search,
  ShieldCheck, Wifi, WifiOff, AlertTriangle, X,
  Clock, Database, Phone, Briefcase, Mail, UserCheck,
  UserX, Eye,
} from 'lucide-react';

const API = 'http://localhost:5000';

function getInitials(nom = '', prenom = '') {
  return `${(prenom[0] || '')}${(nom[0] || '')}`.toUpperCase();
}

const AVATAR_COLORS = [
  { bg: 'rgba(18,166,224,0.12)',  color: '#0b7db0' },
  { bg: 'rgba(127,119,221,0.12)', color: '#533ab7' },
  { bg: 'rgba(29,158,117,0.12)',  color: '#0f6e56' },
  { bg: 'rgba(239,159,39,0.12)',  color: '#854f0b' },
  { bg: 'rgba(212,83,126,0.12)',  color: '#993556' },
];

function avatarColor(nom = '') {
  return AVATAR_COLORS[(nom.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ── ConfirmDialog ─────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = 'Confirmer', danger = true, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} onClick={onCancel} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: '1rem', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', width: '100%', maxWidth: '380px', margin: '0 auto', overflow: 'hidden', animation: 'dialogIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0', background: danger ? '#fff5f5' : '#f0fdf4' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: danger ? 'linear-gradient(135deg,#ef5350,#c62828)' : 'linear-gradient(135deg,#22c55e,#15803d)' }}>
            {danger ? <AlertTriangle size={14} color="#fff" /> : <UserCheck size={14} color="#fff" />}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: danger ? '#b71c1c' : '#15803d' }}>{title}</span>
        </div>
        <div style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '14px', color: '#0d0c0c', lineHeight: 1.6, margin: 0 }}>{message}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '0 1.25rem 1.25rem' }}>
          <button onClick={onCancel} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '13px', fontWeight: 500, color: '#666', background: '#f5f5f5', border: '1px solid #e0e0e0', cursor: 'pointer' }}>Annuler</button>
          <button onClick={onConfirm} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '13px', fontWeight: 600, color: '#fff', background: danger ? 'linear-gradient(135deg,#ef5350,#c62828)' : 'linear-gradient(135deg,#22c55e,#15803d)', border: 'none', cursor: 'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Créer Admin ─────────────────────────────────────────

// ── Modal Créer Admin ─────────────────────────────────────────
// ── Modal Créer Admin ─────────────────────────────────────────
function AddAdminModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', telephone: '', poste: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    // Validation des champs obligatoires
    if (!form.nom || !form.prenom || !form.email || !form.password)
      return setError('Veuillez remplir les champs obligatoires.');

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email))
      return setError('Veuillez entrer une adresse email valide (ex: nom@domaine.com).');

    // Validation du téléphone (si fourni)
    if (form.telephone) {
      // Supprimer les espaces, tirets, points
      const cleanPhone = form.telephone.replace(/[\s\-.]/g, '');
      if (!/^\d{10}$/.test(cleanPhone))
        return setError('Le numéro de téléphone doit contenir exactement 10 chiffres.');
    }

    setLoading(true); 
    setError(null);
    try {
      await axios.post(`${API}/api/admin/creer-admin`, form, { withCredentials: true });
      onSaved(); 
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur serveur.');
    } finally { 
      setLoading(false); 
    }
  };

  // Fonction pour formater le téléphone en temps réel (optionnel)
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Supprimer tout ce qui n'est pas un chiffre
    value = value.replace(/\D/g, '');
    // Limiter à 10 chiffres
    if (value.length > 10) value = value.slice(0, 10);
    // Formatage optionnel: XX XX XX XX XX
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 2 === 0 && i < 10) formatted += ' ';
      formatted += value[i];
    }
    setForm(f => ({ ...f, telephone: formatted }));
  };

  const fields = [
    { label: 'Nom *',            key: 'nom',       placeholder: 'Entrer son nom',            half: true  },
    { label: 'Prénom *',         key: 'prenom',     placeholder: 'Entrer son prénom',              half: true  },
    { label: 'Email *',          key: 'email',      placeholder: 'p.nom@domaine.com', type: 'email', half: false },
    { label: 'Mot de passe *',   key: 'password',   placeholder: '••••••••',          type: 'password', half: false },
    { label: 'Téléphone (10 chiffres)', key: 'telephone',  placeholder: '06 00 00 00 00',    half: true  },
    { label: 'Poste / Fonction', key: 'poste',      placeholder: 'Responsable...', half: true  },
  ];

  // Centrage absolu — ignore complètement la sidebar
  const modalStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    pointerEvents: 'none',
  };

  const cardStyle = {
    pointerEvents: 'all',
    background: '#fff',
    borderRadius: '1rem',
    boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
    width: '480px',
    maxWidth: 'calc(100vw - 2rem)',
    overflow: 'hidden',
    animation: 'dialogIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  };

  return ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 99999 }} onClick={onClose} />
      {/* Conteneur centré — flex sur tout l'écran, pointerEvents none pour que l'overlay fonctionne */}
      <div style={modalStyle}>
        <div style={cardStyle}>

          {/* Header sticky */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #e8f4fb', background: '#f8fcff', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg,#12a6e0,#0d8fc4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={14} color="#fff" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0d0c0c' }}>Créer un compte administrateur</span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={16} /></button>
          </div>

          {/* Corps scrollable */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {fields.map(({ label, key, placeholder, type = 'text', half }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: half ? 'span 1' : 'span 2' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#12a6e0' }}>{label}</label>
                  {key === 'telephone' ? (
                    <input 
                      type="text" 
                      placeholder={placeholder} 
                      value={form.telephone}
                      onChange={handlePhoneChange}
                      maxLength="14" // 10 chiffres + 4 espaces
                      style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #c5c5c5', fontSize: '14px', outline: 'none', fontFamily: 'monospace' }} 
                    />
                  ) : (
                    <input 
                      type={type} 
                      placeholder={placeholder} 
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #c5c5c5', fontSize: '14px', outline: 'none' }} 
                    />
                  )}
                  {/* Petit message d'aide pour le téléphone */}
                  {key === 'telephone' && form.telephone && (
                    <span style={{ fontSize: '10px', color: '#888' }}>
                      {form.telephone.replace(/\s/g, '').length}/10 chiffres
                    </span>
                  )}
                </div>
              ))}
            </div>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(229,57,53,0.05)', border: '1px solid rgba(229,57,53,0.2)', color: '#c62828', fontSize: '13px' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '0.75rem 1.25rem', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
            <button onClick={onClose} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '13px', fontWeight: 500, color: '#666', background: '#f5f5f5', border: '1px solid #e0e0e0', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#12a6e0,#0d8fc4)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={13} /> : <Plus size={13} />}
              {loading ? 'En cours…' : 'Créer le compte'}
            </button>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}

// ── Modal Détail Employé ──────────────────────────────────────
function EmployeDetailModal({ employe, onClose }) {
  const [bases, setBases]               = useState([]);
  const [loadingBases, setLoadingBases] = useState(true);

  useEffect(() => {
    setLoadingBases(true);
    axios.get(`${API}/api/admin/utilisateurs/${employe.UtilisateurId}/bases`, { withCredentials: true })
      .then(res => {
        const data = res.data;
        if (Array.isArray(data))            setBases(data);
        else if (Array.isArray(data.bases)) setBases(data.bases);
        else                                setBases([]);
      })
      .catch(() => setBases([]))
      .finally(() => setLoadingBases(false));
  }, [employe.UtilisateurId]);

  const av = avatarColor(employe.Nom);

  // Centrage absolu — ignore complètement la sidebar
  const modalStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    pointerEvents: 'none',
  };

  const cardStyle = {
    pointerEvents: 'all',
    background: '#fff',
    borderRadius: '1rem',
    boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
    width: '440px',
    maxWidth: 'calc(100vw - 2rem)',
    overflow: 'hidden',
    animation: 'dialogIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  };

  return ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 99999 }} onClick={onClose} />
      {/* Conteneur centré — flex sur tout l'écran, pointerEvents none pour que l'overlay fonctionne */}
      <div style={modalStyle}>
        <div style={cardStyle}>

        {/* Header sticky */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #e8f4fb', background: '#f8fcff', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg,#12a6e0,#0d8fc4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={13} color="#fff" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0d0c0c' }}>Détails de l'employé</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={16} /></button>
        </div>

        {/* Corps scrollable */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>

          {/* Avatar + nom + statut */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {employe.PhotoUrl ? (
              <img src={`${API}${employe.PhotoUrl}`} alt="photo"
                style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8f4fb', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 600, flexShrink: 0, background: av.bg, color: av.color }}>
                {getInitials(employe.Nom, employe.Prenom)}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 600, fontSize: '15px', color: '#0d0c0c', margin: '0 0 4px' }}>{employe.Prenom} {employe.Nom}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 600, borderRadius: '9999px', padding: '0.2rem 0.6rem', background: employe.EstConnecte ? 'rgba(1,168,46,0.07)' : '#f5f5f5', color: employe.EstConnecte ? '#01773d' : '#888', border: `1px solid ${employe.EstConnecte ? 'rgba(1,168,46,0.18)' : '#e0e0e0'}` }}>
                {employe.EstConnecte ? <Wifi size={10} /> : <WifiOff size={10} />}
                {employe.EstConnecte ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
          </div>

          {/* Infos */}
          <div style={{ background: '#f8f8f8', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: <Mail size={13} />,      label: 'Email',              value: employe.Email },
              { icon: <Phone size={13} />,     label: 'Téléphone',          value: employe.Telephone || '—' },
              { icon: <Briefcase size={13} />, label: 'Poste / Fonction',   value: employe.Poste || '—' },
              { icon: <Clock size={13} />,     label: 'Inscrit le',         value: fmtDate(employe.DateCreation) },
              { icon: <Clock size={13} />,     label: 'Dernière connexion', value: fmtDate(employe.DerniereConnexion) },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', background: '#fff', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#12a6e0' }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: '13px', color: '#0d0c0c', fontWeight: 500, margin: 0 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bases */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', margin: '0 0 0.5rem' }}>Bases ajoutées</p>
            {loadingBases ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa', fontSize: '12px' }}>
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Chargement…
              </div>
            ) : bases.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {bases.map(b => (
                  <div key={b.BaseName} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(18,166,224,0.07)', border: '1px solid rgba(18,166,224,0.18)', borderRadius: '0.5rem', padding: '0.375rem 0.625rem' }}>
                    <Database size={11} color="#0b7db0" />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 600, color: '#0b7db0' }}>{b.BaseName}</span>
                    {b.BaseLabel && b.BaseLabel !== b.BaseName && <span style={{ fontSize: '11px', color: '#888' }}>— {b.BaseLabel}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic', margin: 0 }}>Aucune base ajoutée pour le moment.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1.25rem', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '13px', fontWeight: 500, color: '#666', background: '#f5f5f5', border: '1px solid #e0e0e0', cursor: 'pointer' }}>Fermer</button>
        </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ icon, label, value, color }) {
  const styles = {
    blue:   { bg: 'rgba(18,166,224,0.06)',  border: 'rgba(18,166,224,0.18)',  text: '#0b7db0',  iconBg: 'rgba(18,166,224,0.1)'  },
    green:  { bg: 'rgba(1,168,46,0.05)',    border: 'rgba(1,168,46,0.18)',    text: '#01773d',  iconBg: 'rgba(1,168,46,0.1)'    },
    orange: { bg: 'rgba(245,158,11,0.05)',  border: 'rgba(245,158,11,0.18)',  text: '#854f0b',  iconBg: 'rgba(245,158,11,0.1)'  },
    gray:   { bg: '#f8f8f8',                border: '#ebebeb',                text: '#555',     iconBg: '#efefef'               },
  };
  const s = styles[color] || styles.gray;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: `1px solid ${s.border}`, background: s.bg }}>
      <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: s.iconBg }}>
        {React.cloneElement(icon, { size: 16, style: { color: s.text } })}
      </div>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: s.text, margin: 0 }}>{label}</p>
        <p style={{ fontSize: '22px', fontWeight: 600, color: s.text, margin: 0, lineHeight: 1.2 }}>{value}</p>
      </div>
    </div>
  );
}

const thStyle = { padding: '0.75rem 1rem', background: '#f8f8f8', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle = { padding: '0.75rem 1rem', borderBottom: '1px solid #f8f8f8', verticalAlign: 'middle' };

// ── Message toast ─────────────────────────────────────────────
function Msg({ message }) {
  if (!message) return null;
  const ok = message.type === 'success';
  return (
    <div style={{ margin: '0 1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '13px', fontWeight: 500, background: ok ? 'rgba(1,214,58,0.05)' : 'rgba(229,57,53,0.05)', border: `1px solid ${ok ? 'rgba(1,168,46,0.20)' : 'rgba(229,57,53,0.20)'}`, color: ok ? '#01773d' : '#c62828' }}>
      {ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {message.text}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Onglet 1 : Comptes Admin
// ══════════════════════════════════════════════════════════════
function TabAdmin() {
  const [comptes, setComptes]       = useState([]);
  const [fetching, setFetching]     = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [message, setMessage]       = useState(null);

  const fetchComptes = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API}/api/admin/utilisateurs?role=admin`, { withCredentials: true });
      setComptes(res.data);
    } catch { }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchComptes(); }, []);

  const handleDelete = async () => {
    const id = confirmDel; setConfirmDel(null); setLoading(true);
    try {
      await axios.delete(`${API}/api/admin/utilisateurs/${id}`, { withCredentials: true });
      setMessage({ type: 'success', text: 'Compte supprimé avec succès.' });
      fetchComptes();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur serveur.' });
    } finally { setLoading(false); }
  };

  const connectes = comptes.filter(c => c.EstConnecte);

  return (
    <>
      {showAdd    && <AddAdminModal onClose={() => setShowAdd(false)} onSaved={fetchComptes} />}
      {confirmDel && <ConfirmDialog title="Supprimer le compte" danger message="Voulez-vous vraiment supprimer ce compte administrateur ? Cette action est irréversible." confirmLabel="Supprimer" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <KpiCard icon={<Shield />}  label="Total admins" value={comptes.length}                    color="blue"  />
          <KpiCard icon={<Wifi />}    label="Connectés"    value={connectes.length}                   color="green" />
          <KpiCard icon={<WifiOff />} label="Déconnectés"  value={comptes.length - connectes.length} color="gray"  />
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#12a6e0' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0d0c0c' }}>Administrateurs</span>
              {!fetching && <span style={{ background: '#f0f0f0', color: '#666', fontSize: '0.6875rem', fontFamily: 'monospace', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{comptes.length}</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={fetchComptes} disabled={fetching} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '12px', fontWeight: 500, background: '#f5f5f5', color: '#666', border: '1px solid #e0e0e0', cursor: 'pointer' }}>
                <RefreshCw size={12} style={{ animation: fetching ? 'spin 1s linear infinite' : 'none' }} /> Actualiser
              </button>
              <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '12px', fontWeight: 600, background: 'linear-gradient(135deg,#12a6e0,#0d8fc4)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                <Plus size={12} /> Créer un admin
              </button>
            </div>
          </div>

          {fetching ? (
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[1,2,3].map(i => <div key={i} style={{ height: '3.5rem', background: '#f8f8f8', borderRadius: '0.5rem' }} />)}
            </div>
          ) : comptes.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#c5c5c5' }}>
              <Shield size={36} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
              <p>Aucun administrateur enregistré.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    {['Administrateur', 'Contact', 'Poste', 'Statut', 'Dernière connexion', 'Actions'].map((h, i) => (
                      <th key={h} style={{ ...thStyle, textAlign: i === 5 ? 'center' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comptes.map(c => {
                    const av = avatarColor(c.Nom);
                    return (
                      <tr key={c.UtilisateurId} style={{ borderBottom: '1px solid #f8f8f8' }}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, flexShrink: 0, background: av.bg, color: av.color }}>
                              {getInitials(c.Nom, c.Prenom)}
                            </div>
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: 500, color: '#0d0c0c', margin: 0 }}>{c.Prenom} {c.Nom}</p>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0b7db0', background: 'rgba(18,166,224,0.07)', border: '1px solid rgba(18,166,224,0.18)', borderRadius: '9999px', padding: '0.1rem 0.5rem' }}>Admin</span>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{c.Email}</p>
                          {c.Telephone && <p style={{ fontSize: '11px', color: '#aaa', margin: '2px 0 0' }}>{c.Telephone}</p>}
                        </td>
                        <td style={tdStyle}><p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{c.Poste || '—'}</p></td>
                        <td style={tdStyle}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', fontWeight: 600, borderRadius: '9999px', padding: '0.25rem 0.625rem', background: c.EstConnecte ? 'rgba(1,168,46,0.07)' : '#f5f5f5', color: c.EstConnecte ? '#01773d' : '#888', border: `1px solid ${c.EstConnecte ? 'rgba(1,168,46,0.18)' : '#e0e0e0'}` }}>
                            {c.EstConnecte ? <Wifi size={10} /> : <WifiOff size={10} />}
                            {c.EstConnecte ? 'Connecté' : 'Déconnecté'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{fmtDate(c.DerniereConnexion)}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <button onClick={() => setConfirmDel(c.UtilisateurId)} disabled={loading}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(229,57,53,0.06)', color: '#c62828', border: '1px solid rgba(229,57,53,0.18)', cursor: 'pointer' }}>
                            <Trash2 size={11} /> Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Msg message={message} />
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  Onglet 2 : Inscriptions en attente
// ══════════════════════════════════════════════════════════════
function TabInscriptions() {
  const [inscrits, setInscrits] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [confirm, setConfirm]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState(null);

  const fetchInscrits = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API}/api/admin/utilisateurs?statut=en_attente`, { withCredentials: true });
      setInscrits(res.data);
    } catch { }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchInscrits(); }, []);

  const handleAction = async () => {
    const { id, action } = confirm; setConfirm(null); setLoading(true);
    try {
      await axios.post(`${API}/api/admin/utilisateurs/${id}/${action === 'valider' ? 'valider' : 'refuser'}`, {}, { withCredentials: true });
      setMessage({ type: 'success', text: action === 'valider' ? 'Compte validé.' : 'Inscription refusée.' });
      fetchInscrits();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur serveur.' });
    } finally { setLoading(false); }
  };

  return (
    <>
      {confirm && (
        <ConfirmDialog
          title={confirm.action === 'valider' ? "Valider l'inscription" : "Refuser l'inscription"}
          danger={confirm.action === 'refuser'}
          message={confirm.action === 'valider' ? `Valider le compte de ${confirm.nom} ?` : `Refuser l'inscription de ${confirm.nom} ?`}
          confirmLabel={confirm.action === 'valider' ? 'Valider' : 'Refuser'}
          onConfirm={handleAction} onCancel={() => setConfirm(null)}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0d0c0c' }}>Inscriptions en attente</span>
              {!fetching && <span style={{ background: 'rgba(245,158,11,0.1)', color: '#854f0b', fontSize: '0.6875rem', fontFamily: 'monospace', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.25)' }}>{inscrits.length}</span>}
            </div>
            <button onClick={fetchInscrits} disabled={fetching} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '12px', fontWeight: 500, background: '#f5f5f5', color: '#666', border: '1px solid #e0e0e0', cursor: 'pointer' }}>
              <RefreshCw size={12} style={{ animation: fetching ? 'spin 1s linear infinite' : 'none' }} /> Actualiser
            </button>
          </div>

          {fetching ? (
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[1,2].map(i => <div key={i} style={{ height: '4rem', background: '#f8f8f8', borderRadius: '0.5rem' }} />)}
            </div>
          ) : inscrits.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 0.75rem', display: 'block', color: '#86efac' }} />
              <p style={{ color: '#c5c5c5', fontSize: '14px' }}>Aucune inscription en attente.</p>
            </div>
          ) : (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {inscrits.map(c => {
                const av = avatarColor(c.Nom);
                return (
                  <div key={c.UtilisateurId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, flexShrink: 0, background: av.bg, color: av.color }}>
                        {getInitials(c.Nom, c.Prenom)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '13px', color: '#0d0c0c', margin: 0 }}>{c.Prenom} {c.Nom}</p>
                        <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0' }}>{c.Email}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2px' }}>
                          {c.Telephone && <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>{c.Telephone}</p>}
                          {c.Poste     && <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>{c.Poste}</p>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button onClick={() => setConfirm({ id: c.UtilisateurId, action: 'valider', nom: `${c.Prenom} ${c.Nom}` })} disabled={loading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(1,168,46,0.08)', color: '#01773d', border: '1px solid rgba(1,168,46,0.22)', cursor: 'pointer' }}>
                        <UserCheck size={12} /> Valider
                      </button>
                      <button onClick={() => setConfirm({ id: c.UtilisateurId, action: 'refuser', nom: `${c.Prenom} ${c.Nom}` })} disabled={loading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(229,57,53,0.06)', color: '#c62828', border: '1px solid rgba(229,57,53,0.18)', cursor: 'pointer' }}>
                        <UserX size={12} /> Refuser
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Msg message={message} />
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  Onglet 3 : Employés
// ══════════════════════════════════════════════════════════════
function TabEmployes() {
  const [employes, setEmployes]     = useState([]);
  const [fetching, setFetching]     = useState(true);
  const [search, setSearch]         = useState('');
  const [detail, setDetail]         = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [message, setMessage]       = useState(null);

  const fetchEmployes = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API}/api/admin/utilisateurs?role=employe&statut=valide`, { withCredentials: true });
      // Charger les bases de chaque employé en parallèle
      const liste = await Promise.all(
        res.data.map(async (e) => {
          try {
            const r = await axios.get(`${API}/api/admin/utilisateurs/${e.UtilisateurId}/bases`, { withCredentials: true });
            const data = r.data;
            return { ...e, bases: Array.isArray(data) ? data : (Array.isArray(data.bases) ? data.bases : []) };
          } catch {
            return { ...e, bases: [] };
          }
        })
      );
      setEmployes(liste);
    } catch { }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchEmployes(); }, []);

  const handleDelete = async () => {
    const id = confirmDel; setConfirmDel(null); setLoading(true);
    try {
      await axios.delete(`${API}/api/admin/utilisateurs/${id}`, { withCredentials: true });
      setMessage({ type: 'success', text: 'Compte employé supprimé.' });
      fetchEmployes();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur serveur.' });
    } finally { setLoading(false); }
  };

  const connectes  = employes.filter(e => e.EstConnecte);
  const filtered   = employes.filter(e =>
    `${e.Nom} ${e.Prenom} ${e.Email}`.toLowerCase().includes(search.toLowerCase())
  );
  const totalBases = [...new Set(employes.flatMap(e => (e.bases || []).map(b => b.BaseName)))].length;

  return (
    <>
      {detail     && <EmployeDetailModal employe={detail} onClose={() => setDetail(null)} />}
      {confirmDel && <ConfirmDialog title="Supprimer l'employé" danger message="Voulez-vous vraiment supprimer ce compte employé ? Cette action est irréversible." confirmLabel="Supprimer" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          <KpiCard icon={<Users />}    label="Total employés"  value={employes.length}                    color="blue"   />
          <KpiCard icon={<Wifi />}     label="Connectés"       value={connectes.length}                   color="green"  />
          <KpiCard icon={<WifiOff />}  label="Déconnectés"     value={employes.length - connectes.length} color="gray"   />
          <KpiCard icon={<Database />} label="Bases utilisées" value={totalBases}                         color="orange" />
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0d0c0c' }}>Employés actifs</span>
              {!fetching && <span style={{ background: '#f0f0f0', color: '#666', fontSize: '0.6875rem', fontFamily: 'monospace', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{filtered.length} / {employes.length}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={12} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: '2rem', paddingRight: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', borderRadius: '0.5rem', border: '1px solid #e0e0e0', fontSize: '12px', outline: 'none', width: '160px' }} />
              </div>
              <button onClick={fetchEmployes} disabled={fetching} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '12px', fontWeight: 500, background: '#f5f5f5', color: '#666', border: '1px solid #e0e0e0', cursor: 'pointer' }}>
                <RefreshCw size={12} style={{ animation: fetching ? 'spin 1s linear infinite' : 'none' }} /> Actualiser
              </button>
            </div>
          </div>

          {fetching ? (
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[1,2,3].map(i => <div key={i} style={{ height: '3.5rem', background: '#f8f8f8', borderRadius: '0.5rem' }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#c5c5c5' }}>
              <Users size={36} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
              <p>Aucun employé actif trouvé.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    {['Employé', 'Contact', 'Poste', 'Statut', 'Bases ajoutées', 'Actions'].map((h, i) => (
                      <th key={h} style={{ ...thStyle, textAlign: i === 5 ? 'center' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => {
                    const av = avatarColor(e.Nom);
                    return (
                      <tr key={e.UtilisateurId} style={{ borderBottom: '1px solid #f8f8f8' }}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, flexShrink: 0, background: av.bg, color: av.color }}>
                              {getInitials(e.Nom, e.Prenom)}
                            </div>
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: 500, color: '#0d0c0c', margin: 0 }}>{e.Prenom} {e.Nom}</p>
                              <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>Inscrit le {fmtDate(e.DateCreation)}</p>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{e.Email}</p>
                          {e.Telephone && <p style={{ fontSize: '11px', color: '#aaa', margin: '2px 0 0' }}>{e.Telephone}</p>}
                        </td>
                        <td style={tdStyle}><p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{e.Poste || '—'}</p></td>
                        <td style={tdStyle}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', fontWeight: 600, borderRadius: '9999px', padding: '0.25rem 0.625rem', background: e.EstConnecte ? 'rgba(1,168,46,0.07)' : '#f5f5f5', color: e.EstConnecte ? '#01773d' : '#888', border: `1px solid ${e.EstConnecte ? 'rgba(1,168,46,0.18)' : '#e0e0e0'}` }}>
                            {e.EstConnecte ? <Wifi size={10} /> : <WifiOff size={10} />}
                            {e.EstConnecte ? 'Connecté' : 'Déconnecté'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {(e.bases || []).length === 0 ? (
                              <span style={{ fontSize: '11px', color: '#aaa', fontStyle: 'italic' }}>Aucune base</span>
                            ) : (e.bases || []).map(b => (
                              <span key={b.BaseName} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 600, color: '#0b7db0', background: 'rgba(18,166,224,0.07)', border: '1px solid rgba(18,166,224,0.18)', borderRadius: '9999px', padding: '0.1rem 0.5rem' }}>
                                <Database size={9} />{b.BaseName}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                            <button onClick={() => setDetail(e)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(18,166,224,0.06)', color: '#0b7db0', border: '1px solid rgba(18,166,224,0.18)', cursor: 'pointer' }}>
                              <Eye size={11} /> Voir
                            </button>
                            <button onClick={() => setConfirmDel(e.UtilisateurId)} disabled={loading}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(229,57,53,0.06)', color: '#c62828', border: '1px solid rgba(229,57,53,0.18)', cursor: 'pointer' }}>
                              <Trash2 size={11} /> Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Msg message={message} />
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  Composant principal
// ══════════════════════════════════════════════════════════════
export default function GestionComptes() {
  const [activeTab, setActiveTab] = useState('admin');

  const TABS = [
    { key: 'admin',        label: 'Comptes admin', icon: <Shield size={14} /> },
    { key: 'inscriptions', label: 'Inscriptions',  icon: <Clock size={14} />  },
    { key: 'employes',     label: 'Employés',      icon: <Users size={14} />  },
  ];

  return (
    <>
      <style>{`
        @keyframes dialogIn { from{opacity:0;transform:scale(0.92) translateY(8px);} to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeSlideIn 0.3s ease both' }}>
        <div style={{ background: '#fff', border: '1px solid #e4e4e4', borderRadius: '1.1rem', boxShadow: '0 2px 12px rgba(18,166,224,0.07)' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '1rem 1.25rem', background: 'linear-gradient(to right, #f8fcff, #f0f9ff)', borderBottom: '1px solid #e8f4fb', borderRadius: '1.1rem 1.1rem 0 0' }}>
            <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.55rem', background: 'linear-gradient(135deg,#12a6e0,#0d8fc4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={13} color="#fff" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0d0c0c' }}>Gestion des comptes</span>
          </div>

          {/* Onglets */}
          <div style={{ display: 'flex', padding: '0 1rem', borderBottom: '1px solid #f0f0f0' }}>
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', fontSize: '13px', fontWeight: 600, border: 'none', borderBottom: `2px solid ${activeTab === tab.key ? '#12a6e0' : 'transparent'}`, color: activeTab === tab.key ? '#12a6e0' : '#aaa', background: 'none', cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.15s' }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div style={{ padding: '1.25rem' }}>
            {activeTab === 'admin'        && <TabAdmin />}
            {activeTab === 'inscriptions' && <TabInscriptions />}
            {activeTab === 'employes'     && <TabEmployes />}
          </div>
        </div>
      </div>
    </>
  );
}