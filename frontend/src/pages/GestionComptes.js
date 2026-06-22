// // import React from 'react';

// // export default function GestionComptes() {
// //   return (
// //     <div style={{ padding: 32 }}>
// //       <h2>Gestion des comptes</h2>
// //       <p style={{ color: '#888' }}>Page en construction.</p>
// //     </div>
// //   );
// // }


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Shield, Plus, Trash2, CheckCircle2, XCircle,
  AlertCircle, Loader2, RefreshCw, Edit2, Search,
  ShieldCheck, Wifi, WifiOff, AlertTriangle, X,
  Clock, Database, Phone, Briefcase, Mail, UserCheck,
  UserX, Eye,
} from 'lucide-react';

const API = 'http://localhost:5000';

// ── Utilitaires ───────────────────────────────────────────────
function getInitials(nom = '', prenom = '') {
  return `${nom[0] || ''}${prenom[0] || ''}`.toUpperCase();
}

const AVATAR_COLORS = [
  { bg: 'rgba(18,166,224,0.12)',  color: '#0b7db0' },
  { bg: 'rgba(127,119,221,0.12)', color: '#533ab7' },
  { bg: 'rgba(29,158,117,0.12)',  color: '#0f6e56' },
  { bg: 'rgba(239,159,39,0.12)',  color: '#854f0b' },
  { bg: 'rgba(212,83,126,0.12)',  color: '#993556' },
];

function avatarColor(nom = '') {
  const idx = (nom.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ── ConfirmDialog ─────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = 'Confirmer', danger = true, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-[380px] mx-4 overflow-hidden"
        style={{ animation: 'dialogIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${danger ? 'bg-gradient-to-r from-[#fff5f5] to-[#fff0f0] border-[#fde0e0]' : 'bg-gradient-to-r from-[#f0fdf4] to-[#f0fff4] border-[#b6f0c8]'}`}>
          <div className={`w-8 h-8 rounded-[0.6rem] flex items-center justify-center shadow ${danger ? 'bg-gradient-to-br from-[#ef5350] to-[#c62828] shadow-[rgba(229,57,53,0.35)]' : 'bg-gradient-to-br from-[#22c55e] to-[#15803d] shadow-[rgba(34,197,94,0.35)]'}`}>
            {danger ? <AlertTriangle size={14} className="text-white" /> : <UserCheck size={14} className="text-white" />}
          </div>
          <span className={`text-[13px] font-semibold tracking-wide ${danger ? 'text-[#b71c1c]' : 'text-[#15803d]'}`}>{title}</span>
        </div>
        <div className="px-5 py-5">
          <p className="text-[#0d0c0c] text-[14px] leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 pb-4">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#666666] bg-[#f5f5f5] border border-[#e0e0e0] hover:bg-[#ebebeb] transition-all cursor-pointer">
            Annuler
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-[13px] font-semibold text-white shadow transition-all cursor-pointer active:scale-[0.97] ${danger ? 'bg-gradient-to-br from-[#ef5350] to-[#c62828] shadow-[rgba(229,57,53,0.35)]' : 'bg-gradient-to-br from-[#22c55e] to-[#15803d] shadow-[rgba(34,197,94,0.35)]'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes dialogIn { from{opacity:0;transform:scale(0.92) translateY(8px);} to{opacity:1;transform:scale(1) translateY(0);} }`}</style>
    </div>
  );
}

// ── Modal Créer Admin ─────────────────────────────────────────
function AddAdminModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', telephone: '', poste: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.password) {
      return setError('Veuillez remplir les champs obligatoires (Nom, Prénom, Email, Mot de passe).');
    }
    setLoading(true); setError(null);
    try {
      await axios.post(`${API}/api/admin/creer-admin`, form, { withCredentials: true });
      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur serveur.');
    } finally { setLoading(false); }
  };

  const fields = [
    { label: 'Nom *',          key: 'nom',       placeholder: 'ex : Dupont',          half: true },
    { label: 'Prénom *',       key: 'prenom',     placeholder: 'ex : Jean',            half: true },
    { label: 'Email *',        key: 'email',      placeholder: 'ex : j.dupont@...',    type: 'email', half: false },
    { label: 'Mot de passe *', key: 'password',   placeholder: '••••••••',             type: 'password', half: false },
    { label: 'Téléphone',      key: 'telephone',  placeholder: 'ex : 06 00 00 00 00',  half: true },
    { label: 'Poste / Fonction', key: 'poste',    placeholder: 'ex : Responsable stock', half: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-[480px] mx-4 overflow-hidden"
        style={{ animation: 'dialogIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-[#f8fcff] to-[#f0f9ff] border-b border-[#e8f4fb]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[0.6rem] bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow shadow-[rgba(18,166,224,0.35)]">
              <Plus size={14} className="text-white" />
            </div>
            <span className="text-[#0d0c0c] text-[13px] font-semibold">Créer un compte administrateur</span>
          </div>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#666] cursor-pointer"><X size={16} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ label, key, placeholder, type = 'text', half }) => (
              <div key={key} className={`flex flex-col gap-[6px] ${half ? '' : 'col-span-2'}`}>
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">{label}</label>
                <input type={type} placeholder={placeholder} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#c5c5c5] bg-white text-sm text-[#0d0c0c] placeholder-[#aaa] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#12a6e0] focus:shadow-[0_0_0_3px_rgba(18,166,224,0.12)]"
                />
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[rgba(18,166,224,0.05)] border border-[rgba(18,166,224,0.18)]">
            <ShieldCheck size={14} className="text-[#0b7db0] mt-0.5 shrink-0" />
            <p className="text-[12px] text-[#555] leading-relaxed">
              Ce compte sera créé avec le statut <span className="font-semibold text-[#0d0c0c]">validé</span> et aura accès à toutes les pages, y compris la gestion des comptes.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] bg-[rgba(229,57,53,0.05)] border border-[rgba(229,57,53,0.2)] text-[#c62828]">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#666] bg-[#f5f5f5] border border-[#e0e0e0] hover:bg-[#ebebeb] cursor-pointer transition-all">Annuler</button>
          <button onClick={handleSubmit} disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${loading ? 'bg-[#e8f6fd] text-[#92cfe8] cursor-not-allowed' : 'bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] text-white shadow-md shadow-[rgba(18,166,224,0.3)] hover:shadow-lg cursor-pointer active:scale-[0.97]'}`}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            {loading ? 'En cours…' : 'Créer le compte'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Détail Employé ──────────────────────────────────────
function EmployeDetailModal({ employe, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-[440px] mx-4 overflow-hidden"
        style={{ animation: 'dialogIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-[#f8fcff] to-[#f0f9ff] border-b border-[#e8f4fb]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[0.6rem] bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow shadow-[rgba(18,166,224,0.35)]">
              <Eye size={13} className="text-white" />
            </div>
            <span className="text-[#0d0c0c] text-[13px] font-semibold">Détails de l'employé</span>
          </div>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#666] cursor-pointer"><X size={16} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Avatar + nom */}
          <div className="flex items-center gap-4">
            {employe.PhotoUrl ? (
              <img src={`${API}${employe.PhotoUrl}`} alt="photo"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#e8f4fb]" />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-semibold flex-shrink-0"
                style={{ background: avatarColor(employe.Nom).bg, color: avatarColor(employe.Nom).color }}>
                {getInitials(employe.Nom, employe.Prenom)}
              </div>
            )}
            <div>
              <p className="font-semibold text-[15px] text-[#0d0c0c]">{employe.Prenom} {employe.Nom}</p>
              <span className={`inline-flex items-center gap-1.5 text-[0.7rem] font-semibold rounded-full px-2.5 py-1 ${employe.EstConnecte ? 'text-[#01773d] bg-[rgba(1,168,46,0.07)] border border-[rgba(1,168,46,0.18)]' : 'text-[#888] bg-[#f5f5f5] border border-[#e0e0e0]'}`}>
                {employe.EstConnecte ? <Wifi size={10} /> : <WifiOff size={10} />}
                {employe.EstConnecte ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
          </div>

          {/* Infos */}
          <div className="bg-[#f8f8f8] rounded-xl p-4 flex flex-col gap-3">
            {[
              { icon: <Mail size={13} />,     label: 'Email',           value: employe.Email },
              { icon: <Phone size={13} />,    label: 'Téléphone',       value: employe.Telephone || '—' },
              { icon: <Briefcase size={13} />,label: 'Poste / Fonction',value: employe.Poste || '—' },
              { icon: <Clock size={13} />,    label: 'Inscrit le',      value: fmtDate(employe.DateCreation) },
              { icon: <Clock size={13} />,    label: 'Dernière connexion', value: fmtDate(employe.DerniereConnexion) },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-[#e8e8e8] flex items-center justify-center flex-shrink-0 text-[#12a6e0]">
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#aaa] uppercase tracking-wide">{label}</p>
                  <p className="text-[13px] text-[#0d0c0c] font-medium truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bases ajoutées */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#aaa] mb-2">Bases ajoutées</p>
            {employe.bases && employe.bases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {employe.bases.map(b => (
                  <div key={b.BaseName} className="flex items-center gap-1.5 bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.18)] rounded-lg px-2.5 py-1.5">
                    <Database size={11} className="text-[#0b7db0]" />
                    <span className="font-mono text-[0.72rem] font-semibold text-[#0b7db0]">{b.BaseName}</span>
                    {b.BaseLabel && <span className="text-[11px] text-[#888]">— {b.BaseLabel}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#aaa] italic">Aucune base ajoutée pour le moment.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#666] bg-[#f5f5f5] border border-[#e0e0e0] hover:bg-[#ebebeb] cursor-pointer transition-all">Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ icon, label, value, color }) {
  const styles = {
    blue:   { bg: 'rgba(18,166,224,0.06)',  border: 'rgba(18,166,224,0.18)',  text: '#0b7db0',  iconBg: 'rgba(18,166,224,0.1)'  },
    green:  { bg: 'rgba(1,168,46,0.05)',    border: 'rgba(1,168,46,0.18)',    text: '#01773d',  iconBg: 'rgba(1,168,46,0.1)'    },
    red:    { bg: 'rgba(229,57,53,0.04)',   border: 'rgba(229,57,53,0.18)',   text: '#c62828',  iconBg: 'rgba(229,57,53,0.1)'   },
    orange: { bg: 'rgba(245,158,11,0.05)',  border: 'rgba(245,158,11,0.18)',  text: '#854f0b',  iconBg: 'rgba(245,158,11,0.1)'  },
    gray:   { bg: '#f8f8f8',                border: '#ebebeb',                text: '#555',     iconBg: '#efefef'               },
  };
  const s = styles[color] || styles.gray;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: s.bg, borderColor: s.border }}>
      <div className="w-9 h-9 rounded-[0.6rem] flex items-center justify-center flex-shrink-0" style={{ background: s.iconBg }}>
        {React.cloneElement(icon, { size: 16, style: { color: s.text } })}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: s.text }}>{label}</p>
        <p className="text-[22px] font-semibold leading-tight" style={{ color: s.text }}>{value}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Onglet 1 : Comptes Admin
// ══════════════════════════════════════════════════════════════
function TabAdmin() {
  const [comptes, setComptes] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchComptes = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API}/api/admin/utilisateurs?role=admin`, { withCredentials: true });
      setComptes(res.data);
    } catch { /* silently ignore */ }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchComptes(); }, []);

  const handleDelete = async () => {
    const id = confirmDel;
    setConfirmDel(null); setLoading(true);
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
      {showAdd && <AddAdminModal onClose={() => setShowAdd(false)} onSaved={fetchComptes} />}
      {confirmDel && (
        <ConfirmDialog title="Supprimer le compte" danger
          message="Voulez-vous vraiment supprimer ce compte administrateur ? Cette action est irréversible."
          confirmLabel="Supprimer" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <KpiCard icon={<Shield />}       label="Total admins" value={comptes.length}   color="blue"  />
          <KpiCard icon={<Wifi />}         label="Connectés"    value={connectes.length} color="green" />
          <KpiCard icon={<WifiOff />}      label="Déconnectés"  value={comptes.length - connectes.length} color="gray" />
        </div>

        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[rgba(18,166,224,0.05)] border border-[rgba(18,166,224,0.18)]">
          <ShieldCheck size={15} className="text-[#0b7db0] mt-0.5 shrink-0" />
          <p className="text-[12px] text-[#555] leading-relaxed">
            Les <span className="font-semibold text-[#0d0c0c]">administrateurs</span> ont accès à toutes les pages (Dashboard, Mouvements, Prédictions, Actions à faire) ainsi qu'à cette page de gestion des comptes. Ils peuvent créer d'autres comptes admin, valider les inscriptions employés et consulter les données de chaque employé.
          </p>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#12a6e0]" />
              <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Administrateurs enregistrés</span>
              {!fetching && <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{comptes.length} compte{comptes.length !== 1 ? 's' : ''}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchComptes} disabled={fetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] cursor-pointer transition-all hover:bg-[#ebebeb] disabled:opacity-40">
                <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} /> Actualiser
              </button>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] text-white shadow-md shadow-[rgba(18,166,224,0.3)] cursor-pointer transition-all hover:shadow-lg active:scale-[0.97]">
                <Plus size={12} /> Créer un admin
              </button>
            </div>
          </div>

          {fetching ? (
            <div className="p-5 flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-[#f8f8f8] rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />)}</div>
          ) : comptes.length === 0 ? (
            <div className="p-16 text-center"><Shield size={36} className="text-[#e0e0e0] mx-auto mb-3" /><p className="text-[#c5c5c5] text-sm">Aucun administrateur enregistré.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {['Administrateur', 'Contact', 'Poste', 'Statut connexion', 'Dernière connexion', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 bg-[#f8f8f8] text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888] ${i === 5 ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comptes.map(c => {
                    const av = avatarColor(c.Nom);
                    return (
                      <tr key={c.UtilisateurId} className="border-b border-[#f8f8f8] transition-colors duration-100 hover:bg-[rgba(18,166,224,0.025)]">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {c.PhotoUrl ? (
                              <img src={`${API}${c.PhotoUrl}`} alt="photo" className="w-8 h-8 rounded-full object-cover border border-[#e0e0e0]" />
                            ) : (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0" style={{ background: av.bg, color: av.color }}>
                                {getInitials(c.Nom, c.Prenom)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[13px] text-[#0d0c0c]">{c.Prenom} {c.Nom}</p>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.18)] rounded-full px-2 py-0.5">
                                <Shield size={9} /> Admin
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] text-[#555] flex items-center gap-1.5"><Mail size={11} className="text-[#aaa]" />{c.Email}</p>
                          {c.Telephone && <p className="text-[11px] text-[#aaa] flex items-center gap-1.5 mt-0.5"><Phone size={10} />{c.Telephone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] text-[#555]">{c.Poste || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          {c.EstConnecte ? (
                            <span className="inline-flex items-center gap-1.5 text-[#01773d] text-[0.7rem] font-semibold bg-[rgba(1,168,46,0.07)] border border-[rgba(1,168,46,0.18)] rounded-full px-2.5 py-1">
                              <Wifi size={10} /> Connecté
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[#888] text-[0.7rem] font-semibold bg-[#f5f5f5] border border-[#e0e0e0] rounded-full px-2.5 py-1">
                              <WifiOff size={10} /> Déconnecté
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#888] font-mono">{fmtDate(c.DerniereConnexion)}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setConfirmDel(c.UtilisateurId)} disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold bg-[rgba(229,57,53,0.06)] text-[#c62828] border border-[rgba(229,57,53,0.18)] cursor-pointer transition-all hover:bg-[rgba(229,57,53,0.12)] active:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed">
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

          {message && (
            <div className={`mx-5 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium border ${message.type === 'success' ? 'bg-[rgba(1,214,58,0.05)] border-[rgba(1,168,46,0.20)] text-[#01773d]' : 'bg-[rgba(229,57,53,0.05)] border-[rgba(229,57,53,0.20)] text-[#c62828]'}`}>
              {message.type === 'success' ? <CheckCircle2 size={15} className="shrink-0 text-[#01a82e]" /> : <AlertCircle size={15} className="shrink-0 text-[#e53935]" />}
              {message.text}
            </div>
          )}
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
  const [confirm, setConfirm] = useState(null); // { id, action: 'valider'|'refuser', nom }
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchInscrits = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API}/api/admin/utilisateurs?statut=en_attente`, { withCredentials: true });
      setInscrits(res.data);
    } catch { /* silently ignore */ }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchInscrits(); }, []);

  const handleAction = async () => {
    const { id, action } = confirm;
    setConfirm(null); setLoading(true);
    try {
      const route = action === 'valider' ? 'valider' : 'refuser';
      await axios.post(`${API}/api/admin/utilisateurs/${id}/${route}`, {}, { withCredentials: true });
      setMessage({ type: 'success', text: action === 'valider' ? 'Compte validé — l\'employé peut maintenant se connecter.' : 'Inscription refusée.' });
      fetchInscrits();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur serveur.' });
    } finally { setLoading(false); }
  };

  return (
    <>
      {confirm && (
        <ConfirmDialog
          title={confirm.action === 'valider' ? 'Valider l\'inscription' : 'Refuser l\'inscription'}
          danger={confirm.action === 'refuser'}
          message={confirm.action === 'valider'
            ? `Voulez-vous valider le compte de ${confirm.nom} ? Il pourra se connecter dès maintenant.`
            : `Voulez-vous refuser l'inscription de ${confirm.nom} ? Le compte restera inactif.`}
          confirmLabel={confirm.action === 'valider' ? 'Valider' : 'Refuser'}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="flex flex-col gap-5">
        {inscrits.length > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.25)]">
            <Clock size={15} className="text-[#854f0b] mt-0.5 shrink-0" />
            <p className="text-[12px] text-[#555] leading-relaxed">
              <span className="font-semibold text-[#0d0c0c]">{inscrits.length} inscription{inscrits.length > 1 ? 's' : ''}</span> en attente de validation. Les employés ne peuvent pas se connecter tant que leur compte n'est pas validé.
            </p>
          </div>
        )}

        <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Inscriptions en attente</span>
              {!fetching && (
                <span className="bg-[rgba(245,158,11,0.1)] text-[#854f0b] text-[0.6875rem] font-mono px-2 py-0.5 rounded border border-[rgba(245,158,11,0.25)]">
                  {inscrits.length} en attente
                </span>
              )}
            </div>
            <button onClick={fetchInscrits} disabled={fetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] cursor-pointer transition-all hover:bg-[#ebebeb] disabled:opacity-40">
              <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} /> Actualiser
            </button>
          </div>

          {fetching ? (
            <div className="p-5 flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#f8f8f8] rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />)}</div>
          ) : inscrits.length === 0 ? (
            <div className="p-16 text-center">
              <CheckCircle2 size={36} className="text-[#86efac] mx-auto mb-3" />
              <p className="text-[#c5c5c5] text-sm">Aucune inscription en attente.</p>
              <p className="text-[#d0d0d0] text-xs mt-1">Toutes les demandes ont été traitées.</p>
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              {inscrits.map(c => {
                const av = avatarColor(c.Nom);
                return (
                  <div key={c.UtilisateurId} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.03)]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0" style={{ background: av.bg, color: av.color }}>
                        {getInitials(c.Nom, c.Prenom)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[13px] text-[#0d0c0c]">{c.Prenom} {c.Nom}</p>
                        <p className="text-[11px] text-[#888] flex items-center gap-1.5 truncate"><Mail size={10} />{c.Email}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {c.Telephone && <p className="text-[11px] text-[#aaa] flex items-center gap-1"><Phone size={10} />{c.Telephone}</p>}
                          {c.Poste && <p className="text-[11px] text-[#aaa] flex items-center gap-1"><Briefcase size={10} />{c.Poste}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-[10px] text-[#aaa] hidden sm:block">{fmtDate(c.DateCreation)}</p>
                      <button
                        onClick={() => setConfirm({ id: c.UtilisateurId, action: 'valider', nom: `${c.Prenom} ${c.Nom}` })}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold bg-[rgba(1,168,46,0.08)] text-[#01773d] border border-[rgba(1,168,46,0.22)] cursor-pointer transition-all hover:bg-[rgba(1,168,46,0.15)] active:scale-[0.97] disabled:opacity-40">
                        <UserCheck size={12} /> Valider
                      </button>
                      <button
                        onClick={() => setConfirm({ id: c.UtilisateurId, action: 'refuser', nom: `${c.Prenom} ${c.Nom}` })}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold bg-[rgba(229,57,53,0.06)] text-[#c62828] border border-[rgba(229,57,53,0.18)] cursor-pointer transition-all hover:bg-[rgba(229,57,53,0.12)] active:scale-[0.97] disabled:opacity-40">
                        <UserX size={12} /> Refuser
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {message && (
            <div className={`mx-5 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium border ${message.type === 'success' ? 'bg-[rgba(1,214,58,0.05)] border-[rgba(1,168,46,0.20)] text-[#01773d]' : 'bg-[rgba(229,57,53,0.05)] border-[rgba(229,57,53,0.20)] text-[#c62828]'}`}>
              {message.type === 'success' ? <CheckCircle2 size={15} className="shrink-0 text-[#01a82e]" /> : <AlertCircle size={15} className="shrink-0 text-[#e53935]" />}
              {message.text}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  Onglet 3 : Employés
// ══════════════════════════════════════════════════════════════
function TabEmployes() {
  const [employes, setEmployes] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  const fetchEmployes = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API}/api/admin/utilisateurs?role=employe&statut=valide`, { withCredentials: true });
      setEmployes(res.data);
    } catch { /* silently ignore */ }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchEmployes(); }, []);

  const connectes   = employes.filter(e => e.EstConnecte);
  const filtered    = employes.filter(e =>
    `${e.Nom} ${e.Prenom} ${e.Email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {detail && <EmployeDetailModal employe={detail} onClose={() => setDetail(null)} />}

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={<Users />}   label="Total employés" value={employes.length}                    color="blue"  />
          <KpiCard icon={<Wifi />}    label="Connectés"      value={connectes.length}                   color="green" />
          <KpiCard icon={<WifiOff />} label="Déconnectés"    value={employes.length - connectes.length} color="gray"  />
          <KpiCard icon={<Database />}label="Bases utilisées" value={[...new Set(employes.flatMap(e => (e.bases || []).map(b => b.BaseName)))].length} color="orange" />
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0] flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Employés actifs</span>
              {!fetching && <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">{filtered.length} / {employes.length}</span>}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-[#e0e0e0] text-[12px] bg-white text-[#0d0c0c] placeholder-[#aaa] outline-none transition focus:border-[#12a6e0] focus:shadow-[0_0_0_2px_rgba(18,166,224,0.12)] w-[160px]"
                />
              </div>
              <button onClick={fetchEmployes} disabled={fetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] cursor-pointer transition-all hover:bg-[#ebebeb] disabled:opacity-40">
                <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} /> Actualiser
              </button>
            </div>
          </div>

          {fetching ? (
            <div className="p-5 flex flex-col gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-[#f8f8f8] rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center"><Users size={36} className="text-[#e0e0e0] mx-auto mb-3" /><p className="text-[#c5c5c5] text-sm">Aucun employé actif trouvé.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {['Employé', 'Contact', 'Poste', 'Statut', 'Bases ajoutées', 'Détails'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 bg-[#f8f8f8] text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888] ${i === 5 ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => {
                    const av = avatarColor(e.Nom);
                    return (
                      <tr key={e.UtilisateurId} className="border-b border-[#f8f8f8] transition-colors duration-100 hover:bg-[rgba(18,166,224,0.025)]">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {e.PhotoUrl ? (
                              <img src={`${API}${e.PhotoUrl}`} alt="photo" className="w-8 h-8 rounded-full object-cover border border-[#e0e0e0]" />
                            ) : (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0" style={{ background: av.bg, color: av.color }}>
                                {getInitials(e.Nom, e.Prenom)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[13px] text-[#0d0c0c]">{e.Prenom} {e.Nom}</p>
                              <p className="text-[10px] text-[#aaa]">Inscrit le {fmtDate(e.DateCreation)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] text-[#555] flex items-center gap-1.5"><Mail size={11} className="text-[#aaa]" />{e.Email}</p>
                          {e.Telephone && <p className="text-[11px] text-[#aaa] flex items-center gap-1.5 mt-0.5"><Phone size={10} />{e.Telephone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] text-[#555]">{e.Poste || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          {e.EstConnecte ? (
                            <span className="inline-flex items-center gap-1.5 text-[#01773d] text-[0.7rem] font-semibold bg-[rgba(1,168,46,0.07)] border border-[rgba(1,168,46,0.18)] rounded-full px-2.5 py-1">
                              <Wifi size={10} /> Connecté
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[#888] text-[0.7rem] font-semibold bg-[#f5f5f5] border border-[#e0e0e0] rounded-full px-2.5 py-1">
                              <WifiOff size={10} /> Déconnecté
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(e.bases || []).length === 0 ? (
                              <span className="text-[11px] text-[#aaa] italic">Aucune base</span>
                            ) : (
                              (e.bases || []).map(b => (
                                <span key={b.BaseName} className="inline-flex items-center gap-1 font-mono text-[0.65rem] font-semibold text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.18)] rounded-full px-2 py-0.5">
                                  <Database size={9} />{b.BaseName}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setDetail(e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold bg-[rgba(18,166,224,0.06)] text-[#0b7db0] border border-[rgba(18,166,224,0.18)] cursor-pointer transition-all hover:bg-[rgba(18,166,224,0.12)] hover:shadow-[0_1px_6px_rgba(18,166,224,0.18)] active:scale-[0.97]">
                            <Eye size={11} /> Voir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
    { key: 'admin',        label: 'Comptes admin',       icon: <Shield size={14} /> },
    { key: 'inscriptions', label: 'Inscriptions',         icon: <Clock size={14} /> },
    { key: 'employes',     label: 'Employés',             icon: <Users size={14} /> },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
        @keyframes dialogIn { from{opacity:0;transform:scale(0.92) translateY(8px);} to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .animate-spin { animation: spin 1s linear infinite; }
        .fade-in { animation: fadeSlideIn 0.3s ease both; }
      `}</style>

      <div className="flex flex-col gap-5 fade-in">
        <div className="bg-white border border-[#e4e4e4] rounded-[1.1rem] shadow-[0_2px_12px_rgba(18,166,224,0.07),0_1px_3px_rgba(0,0,0,0.05)] overflow-visible">

          {/* Header */}
          <div className="flex items-center gap-[0.55rem] px-5 py-4 bg-gradient-to-r from-[#f8fcff] to-[#f0f9ff] border-b border-[#e8f4fb] rounded-[1.1rem] rounded-b-none">
            <div className="w-7 h-7 rounded-[0.55rem] bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow-md shadow-[rgba(18,166,224,0.30)]">
              <Users size={13} className="text-white" />
            </div>
            <span className="text-[#0d0c0c] text-[13px] font-semibold tracking-wide">Gestion des comptes</span>
          </div>

          {/* Onglets */}
          <div className="flex gap-0 px-4 border-b border-[#f0f0f0]">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 transition-all cursor-pointer"
                style={activeTab === tab.key
                  ? { color: '#12a6e0', borderColor: '#12a6e0', marginBottom: '-1px' }
                  : { color: '#aaa', borderColor: 'transparent', marginBottom: '-1px' }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div className="p-5">
            {activeTab === 'admin'        && <TabAdmin />}
            {activeTab === 'inscriptions' && <TabInscriptions />}
            {activeTab === 'employes'     && <TabEmployes />}
          </div>
        </div>
      </div>
    </>
  );
}