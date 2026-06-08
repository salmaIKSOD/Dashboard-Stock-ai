// import React from 'react';

// export default function GestionComptes() {
//   return (
//     <div style={{ padding: 32 }}>
//       <h2>Gestion des comptes</h2>
//       <p style={{ color: '#888' }}>Page en construction.</p>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Shield,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Key,
  Edit2,
  Search,
  Crown,
  ShieldCheck,
  Wifi,
  WifiOff,
  AlertTriangle,
  X,
} from 'lucide-react';

const API = 'http://localhost:5000';

// ── Utilitaire initiales ───────────────────────────────────────
function getInitials(name = '') {
  return name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  { bg: 'rgba(18,166,224,0.12)',  color: '#0b7db0' },
  { bg: 'rgba(127,119,221,0.12)', color: '#533ab7' },
  { bg: 'rgba(29,158,117,0.12)',  color: '#0f6e56' },
  { bg: 'rgba(239,159,39,0.12)',  color: '#854f0b' },
  { bg: 'rgba(212,83,126,0.12)',  color: '#993556' },
];

function avatarColor(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ── ConfirmDialog ─────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = 'Confirmer', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div
        className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-[380px] mx-4 overflow-hidden"
        style={{ animation: 'dialogIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#fff5f5] to-[#fff0f0] border-b border-[#fde0e0]">
          <div className="w-8 h-8 rounded-[0.6rem] bg-gradient-to-br from-[#ef5350] to-[#c62828] flex items-center justify-center shadow shadow-[rgba(229,57,53,0.35)]">
            <AlertTriangle size={14} className="text-white" />
          </div>
          <span className="text-[#b71c1c] text-[13px] font-semibold tracking-wide">{title}</span>
        </div>
        <div className="px-5 py-5">
          <p className="text-[#0d0c0c] text-[14px] leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 pb-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#666666] bg-[#f5f5f5] border border-[#e0e0e0] hover:bg-[#ebebeb] transition-all cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-gradient-to-br from-[#ef5350] to-[#c62828] shadow shadow-[rgba(229,57,53,0.35)] hover:shadow-md transition-all cursor-pointer active:scale-[0.97]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes dialogIn { from{opacity:0;transform:scale(0.92) translateY(8px);} to{opacity:1;transform:scale(1) translateY(0);} }`}</style>
    </div>
  );
}

// ── Modal Ajout Admin ─────────────────────────────────────────
function AddAdminModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password) {
      return setError('Veuillez remplir tous les champs.');
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API}/api/admin/comptes`, form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-[420px] mx-4 overflow-hidden"
        style={{ animation: 'dialogIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-[#f8fcff] to-[#f0f9ff] border-b border-[#e8f4fb]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[0.6rem] bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow shadow-[rgba(18,166,224,0.35)]">
              <Plus size={14} className="text-white" />
            </div>
            <span className="text-[#0d0c0c] text-[13px] font-semibold">Ajouter un administrateur</span>
          </div>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#666] cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {[
            { label: 'Nom d\'utilisateur', key: 'username', placeholder: 'ex : jdupont' },
            { label: 'Adresse e-mail', key: 'email', placeholder: 'ex : j.dupont@exemple.com', type: 'email' },
            { label: 'Mot de passe', key: 'password', placeholder: '••••••••', type: 'password' },
          ].map(({ label, key, placeholder, type = 'text' }) => (
            <div key={key} className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-[#c5c5c5] bg-white text-sm text-[#0d0c0c] placeholder-[#aaa] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#12a6e0] focus:shadow-[0_0_0_3px_rgba(18,166,224,0.12)]"
              />
            </div>
          ))}

          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">Rôle</label>
            <div className="flex gap-3">
              {[
                { value: 'superadmin', label: 'Super admin', icon: <Crown size={12} />, desc: 'Gestion complète + comptes' },
                { value: 'admin',      label: 'Admin',       icon: <Shield size={12} />, desc: 'Gestion des bases uniquement' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, role: opt.value }))}
                  className={`flex-1 flex flex-col items-start gap-1 px-3 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                    form.role === opt.value
                      ? 'border-[#12a6e0] bg-[rgba(18,166,224,0.06)] shadow-[0_0_0_2px_rgba(18,166,224,0.15)]'
                      : 'border-[#e0e0e0] bg-white hover:border-[#12a6e0]'
                  }`}
                >
                  <span className={`flex items-center gap-1.5 text-[12px] font-semibold ${form.role === opt.value ? 'text-[#0b7db0]' : 'text-[#444]'}`}>
                    {opt.icon}{opt.label}
                  </span>
                  <span className="text-[11px] text-[#999]">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] bg-[rgba(229,57,53,0.05)] border border-[rgba(229,57,53,0.2)] text-[#c62828]">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#666] bg-[#f5f5f5] border border-[#e0e0e0] hover:bg-[#ebebeb] cursor-pointer transition-all">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              loading
                ? 'bg-[#e8f6fd] text-[#92cfe8] cursor-not-allowed'
                : 'bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] text-white shadow-md shadow-[rgba(18,166,224,0.3)] hover:shadow-lg cursor-pointer active:scale-[0.97]'
            }`}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            {loading ? 'En cours…' : 'Créer le compte'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Accès Bases ─────────────────────────────────────────
function AccessModal({ user, allBases, onClose, onSaved }) {
  const [selected, setSelected] = useState(new Set(user.bases || []));
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const toggle = (base) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(base) ? next.delete(base) : next.add(base);
      return next;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`${API}/api/societe/comptes/${user.id}/bases`, {
        bases: Array.from(selected),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-[440px] mx-4 overflow-hidden"
        style={{ animation: 'dialogIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-[#f8fcff] to-[#f0f9ff] border-b border-[#e8f4fb]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[0.6rem] bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow shadow-[rgba(18,166,224,0.35)]">
              <Key size={13} className="text-white" />
            </div>
            <div>
              <span className="text-[#0d0c0c] text-[13px] font-semibold block">Accès aux bases</span>
              <span className="text-[#aaa] text-[11px]">{user.username} — {user.societe}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#666] cursor-pointer"><X size={16} /></button>
        </div>

        <div className="p-5">
          <p className="text-[12px] text-[#999] mb-4">
            Sélectionnez les bases auxquelles <span className="font-semibold text-[#0d0c0c]">{user.username}</span> doit avoir accès.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {allBases.map(base => {
              const on = selected.has(base.BaseName);
              return (
                <button
                  key={base.BaseName}
                  onClick={() => toggle(base.BaseName)}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                    on
                      ? 'border-[#01a82e] bg-[rgba(1,168,46,0.06)]'
                      : 'border-[#e0e0e0] bg-white hover:border-[#12a6e0]'
                  }`}
                >
                  <span className={`font-mono text-[0.78rem] font-semibold ${on ? 'text-[#01773d]' : 'text-[#888]'}`}>
                    {base.BaseName}
                  </span>
                  {on
                    ? <CheckCircle2 size={14} className="text-[#01a82e] shrink-0" />
                    : <div className="w-[14px] h-[14px] rounded-full border border-[#ccc]" />
                  }
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] bg-[rgba(229,57,53,0.05)] border border-[rgba(229,57,53,0.2)] text-[#c62828]">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-5 pb-5">
          <span className="text-[11px] text-[#aaa]">{selected.size} base{selected.size !== 1 ? 's' : ''} sélectionnée{selected.size !== 1 ? 's' : ''}</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#666] bg-[#f5f5f5] border border-[#e0e0e0] hover:bg-[#ebebeb] cursor-pointer transition-all">
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                loading
                  ? 'bg-[#e8f6fd] text-[#92cfe8] cursor-not-allowed'
                  : 'bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] text-white shadow-md shadow-[rgba(18,166,224,0.3)] cursor-pointer active:scale-[0.97]'
              }`}
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
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
    purple: { bg: 'rgba(127,119,221,0.06)', border: 'rgba(127,119,221,0.18)', text: '#533ab7',  iconBg: 'rgba(127,119,221,0.1)' },
    gray:   { bg: '#f8f8f8',                border: '#ebebeb',                text: '#555',     iconBg: '#efefef'               },
  };
  const s = styles[color] || styles.gray;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{ background: s.bg, borderColor: s.border }}>
      <div className="w-9 h-9 rounded-[0.6rem] flex items-center justify-center flex-shrink-0"
        style={{ background: s.iconBg }}>
        {React.cloneElement(icon, { size: 16, style: { color: s.text } })}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: s.text }}>{label}</p>
        <p className="text-[22px] font-semibold leading-tight" style={{ color: s.text }}>{value}</p>
      </div>
    </div>
  );
}

// ── Onglet Comptes Admin ──────────────────────────────────────
function TabAdmin() {
  const [comptes, setComptes]     = useState([]);
  const [fetching, setFetching]   = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState(null);

  const fetchComptes = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API}/api/admin/comptes`);
      setComptes(res.data);
    } catch { /* silently ignore */ }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchComptes(); }, []);

  const handleDelete = async () => {
    const id = confirmDel;
    setConfirmDel(null);
    setLoading(true);
    try {
      await axios.delete(`${API}/api/admin/comptes/${id}`);
      setMessage({ type: 'success', text: 'Compte supprimé avec succès.' });
      setTimeout(fetchComptes, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const superAdmins = comptes.filter(c => c.role === 'superadmin');
  const admins      = comptes.filter(c => c.role === 'admin');
  const actifs      = comptes.filter(c => c.isActive);

  return (
    <>
      {showAdd && (
        <AddAdminModal onClose={() => setShowAdd(false)} onSaved={fetchComptes} />
      )}
      {confirmDel && (
        <ConfirmDialog
          title="Supprimer le compte"
          message="Voulez-vous vraiment supprimer ce compte administrateur ? Cette action est irréversible."
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      <div className="flex flex-col gap-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={<Users />}      label="Total admins"   value={comptes.length}     color="blue"   />
          <KpiCard icon={<Crown />}      label="Super admins"   value={superAdmins.length} color="purple" />
          <KpiCard icon={<Shield />}     label="Admins"         value={admins.length}      color="blue"   />
          <KpiCard icon={<CheckCircle2/>}label="Actifs"         value={actifs.length}      color="green"  />
        </div>

        {/* Bannière info rôles */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[rgba(127,119,221,0.06)] border border-[rgba(127,119,221,0.18)]">
          <ShieldCheck size={15} className="text-[#533ab7] mt-0.5 shrink-0" />
          <p className="text-[12px] text-[#555] leading-relaxed">
            <span className="font-semibold text-[#0d0c0c]">Super admin</span> — gère toutes les bases SAGE et peut créer / supprimer des comptes administrateurs.&nbsp;&nbsp;
            <span className="font-semibold text-[#0d0c0c]">Admin</span> — gère toutes les bases SAGE, sans accès à la gestion des comptes.
          </p>
        </div>

        {/* Tableau */}
        <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#12a6e0]" />
              <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Administrateurs enregistrés</span>
              {!fetching && (
                <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
                  {comptes.length} compte{comptes.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchComptes}
                disabled={fetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] cursor-pointer transition-all hover:bg-[#ebebeb] disabled:opacity-40"
              >
                <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} />
                Actualiser
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] text-white border-none shadow-md shadow-[rgba(18,166,224,0.3)] cursor-pointer transition-all hover:shadow-lg active:scale-[0.97]"
              >
                <Plus size={12} /> Ajouter
              </button>
            </div>
          </div>

          {fetching ? (
            <div className="p-5 flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-[#f8f8f8] rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : comptes.length === 0 ? (
            <div className="p-16 text-center">
              <Users size={36} className="text-[#e0e0e0] mx-auto mb-3" />
              <p className="text-[#c5c5c5] text-sm">Aucun administrateur enregistré.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {['Utilisateur', 'Rôle', 'Statut', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 bg-[#f8f8f8] text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888] ${i === 3 ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comptes.map(c => {
                    const av = avatarColor(c.username);
                    return (
                      <tr key={c.id} className="border-b border-[#f8f8f8] transition-colors duration-100 hover:bg-[rgba(18,166,224,0.025)]">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0"
                              style={{ background: av.bg, color: av.color }}>
                              {getInitials(c.username)}
                            </div>
                            <div>
                              <p className="font-medium text-[13px] text-[#0d0c0c]">{c.username}</p>
                              <p className="text-[11px] text-[#aaa]">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {c.role === 'superadmin' ? (
                            <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-[#533ab7] bg-[rgba(127,119,221,0.08)] border border-[rgba(127,119,221,0.2)] rounded-full px-2.5 py-1">
                              <Crown size={10} /> Super admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.18)] rounded-full px-2.5 py-1">
                              <Shield size={10} /> Admin
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.isActive ? (
                            <span className="inline-flex items-center gap-1.5 text-[#01773d] text-[0.7rem] font-semibold bg-[rgba(1,168,46,0.07)] border border-[rgba(1,168,46,0.18)] rounded-full px-2.5 py-1">
                              <CheckCircle2 size={11} /> Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[#b71c1c] text-[0.7rem] font-semibold bg-[rgba(229,57,53,0.07)] border border-[rgba(229,57,53,0.18)] rounded-full px-2.5 py-1">
                              <XCircle size={11} /> Inactif
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold bg-[rgba(18,166,224,0.06)] text-[#0b7db0] border border-[rgba(18,166,224,0.18)] cursor-pointer transition-all hover:bg-[rgba(18,166,224,0.12)] active:scale-[0.97]">
                              <Edit2 size={11} /> Modifier
                            </button>
                            <button
                              onClick={() => setConfirmDel(c.id)}
                              disabled={loading}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold bg-[rgba(229,57,53,0.06)] text-[#c62828] border border-[rgba(229,57,53,0.18)] cursor-pointer transition-all hover:bg-[rgba(229,57,53,0.12)] active:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed"
                            >
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

          {message && (
            <div className={`mx-5 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium border ${
              message.type === 'success'
                ? 'bg-[rgba(1,214,58,0.05)] border-[rgba(1,168,46,0.20)] text-[#01773d]'
                : 'bg-[rgba(229,57,53,0.05)] border-[rgba(229,57,53,0.20)] text-[#c62828]'
            }`}>
              {message.type === 'success'
                ? <CheckCircle2 size={15} className="shrink-0 text-[#01a82e]" />
                : <AlertCircle  size={15} className="shrink-0 text-[#e53935]" />}
              {message.text}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Onglet Comptes Société ────────────────────────────────────
function TabSociete() {
  const [comptes, setComptes]         = useState([]);
  const [allBases, setAllBases]       = useState([]);
  const [fetching, setFetching]       = useState(true);
  const [search, setSearch]           = useState('');
  const [filterSoc, setFilterSoc]     = useState('');
  const [accessUser, setAccessUser]   = useState(null);

  const fetchAll = async () => {
    setFetching(true);
    try {
      const [resComptes, resBases] = await Promise.all([
        axios.get(`${API}/api/societe/comptes`),
        axios.get(`${API}/api/bases?force=1`),
      ]);
      setComptes(resComptes.data);
      setAllBases(resBases.data.filter(b => b.IsActive));
    } catch { /* silently ignore */ }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const societes    = [...new Set(comptes.map(c => c.societe))].sort();
  const connectes   = comptes.filter(c => c.isConnected);
  const deconnectes = comptes.filter(c => !c.isConnected);

  const filtered = comptes.filter(c => {
    const matchSearch = c.username.toLowerCase().includes(search.toLowerCase())
                     || c.email.toLowerCase().includes(search.toLowerCase());
    const matchSoc    = !filterSoc || c.societe === filterSoc;
    return matchSearch && matchSoc;
  });

  return (
    <>
      {accessUser && (
        <AccessModal
          user={accessUser}
          allBases={allBases}
          onClose={() => setAccessUser(null)}
          onSaved={fetchAll}
        />
      )}

      <div className="flex flex-col gap-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={<Users />}     label="Total utilisateurs" value={comptes.length}     color="blue"   />
          <KpiCard icon={<Building2 />} label="Total sociétés"     value={societes.length}    color="purple" />
          <KpiCard icon={<Wifi />}      label="Connectés"          value={connectes.length}   color="green"  />
          <KpiCard icon={<WifiOff />}   label="Déconnectés"        value={deconnectes.length} color="red"    />
        </div>

        {/* Tableau */}
        <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0] flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#01d63a]" />
              <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Utilisateurs & accès</span>
              {!fetching && (
                <span className="bg-[#f0f0f0] text-[#666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
                  {filtered.length} / {comptes.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input
                  type="text"
                  placeholder="Rechercher…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-[#e0e0e0] text-[12px] bg-white text-[#0d0c0c] placeholder-[#aaa] outline-none transition focus:border-[#12a6e0] focus:shadow-[0_0_0_2px_rgba(18,166,224,0.12)] w-[160px]"
                />
              </div>
              <select
                value={filterSoc}
                onChange={e => setFilterSoc(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#e0e0e0] text-[12px] bg-white text-[#555] outline-none transition focus:border-[#12a6e0]"
              >
                <option value="">Toutes sociétés</option>
                {societes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                onClick={fetchAll}
                disabled={fetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] cursor-pointer transition-all hover:bg-[#ebebeb] disabled:opacity-40"
              >
                <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} /> Actualiser
              </button>
            </div>
          </div>

          {fetching ? (
            <div className="p-5 flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-[#f8f8f8] rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Users size={36} className="text-[#e0e0e0] mx-auto mb-3" />
              <p className="text-[#c5c5c5] text-sm">Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {['Utilisateur', 'Société', 'Statut', 'Accès aux bases', 'Gérer'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 bg-[#f8f8f8] text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888] ${i === 4 ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const av = avatarColor(c.username);
                    return (
                      <tr key={c.id} className="border-b border-[#f8f8f8] transition-colors duration-100 hover:bg-[rgba(18,166,224,0.025)]">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0"
                              style={{ background: av.bg, color: av.color }}>
                              {getInitials(c.username)}
                            </div>
                            <div>
                              <p className="font-medium text-[13px] text-[#0d0c0c]">{c.username}</p>
                              <p className="text-[11px] text-[#aaa]">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#555]">
                            <Building2 size={11} className="text-[#aaa]" /> {c.societe}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {c.isConnected ? (
                            <span className="inline-flex items-center gap-1.5 text-[#01773d] text-[0.7rem] font-semibold bg-[rgba(1,168,46,0.07)] border border-[rgba(1,168,46,0.18)] rounded-full px-2.5 py-1">
                              <Wifi size={10} /> Connecté
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[#b71c1c] text-[0.7rem] font-semibold bg-[rgba(229,57,53,0.07)] border border-[rgba(229,57,53,0.18)] rounded-full px-2.5 py-1">
                              <WifiOff size={10} /> Déconnecté
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {allBases.map(b => {
                              const hasAccess = (c.bases || []).includes(b.BaseName);
                              return (
                                <span
                                  key={b.BaseName}
                                  className="inline-block font-mono text-[0.65rem] font-semibold rounded-full px-2 py-0.5 border"
                                  style={hasAccess
                                    ? { color: '#01773d', background: 'rgba(1,168,46,0.07)', borderColor: 'rgba(1,168,46,0.22)' }
                                    : { color: '#bbb',    background: 'rgba(0,0,0,0.02)',    borderColor: '#e8e8e8' }
                                  }
                                >
                                  {b.BaseName}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setAccessUser(c)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold bg-[rgba(18,166,224,0.06)] text-[#0b7db0] border border-[rgba(18,166,224,0.18)] cursor-pointer transition-all hover:bg-[rgba(18,166,224,0.12)] hover:shadow-[0_1px_6px_rgba(18,166,224,0.18)] active:scale-[0.97]"
                          >
                            <Key size={11} /> Accès
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

        <p className="text-[11px] text-[#bbb] flex items-center gap-1.5">
          <CheckCircle2 size={11} className="text-[#01a82e]" />
          Bases en <span className="font-semibold text-[#01773d]">vert</span> = accès accordé.
          Cliquez sur <span className="font-semibold text-[#0b7db0]">Accès</span> pour modifier les permissions d'un utilisateur.
        </p>
      </div>
    </>
  );
}

// ── Composant principal ───────────────────────────────────────
export default function GestionComptes() {
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        .fade-in      { animation: fadeSlideIn 0.3s ease both; }
      `}</style>

      <div className="flex flex-col gap-5 fade-in">

        {/* ── Card principale avec onglets ── */}
        <div className="bg-white border border-[#e4e4e4] rounded-[1.1rem] shadow-[0_2px_12px_rgba(18,166,224,0.07),0_1px_3px_rgba(0,0,0,0.05)] overflow-visible">

          {/* Header */}
          <div className="flex items-center gap-[0.55rem] px-5 py-4 bg-gradient-to-r from-[#f8fcff] to-[#f0f9ff] border-b border-[#e8f4fb] rounded-[1.1rem] rounded-b-none">
            <div className="w-7 h-7 rounded-[0.55rem] bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow-md shadow-[rgba(18,166,224,0.30)]">
              <Users size={13} className="text-white" />
            </div>
            <span className="text-[#0d0c0c] text-[13px] font-semibold tracking-wide">
              Gestion des comptes
            </span>
          </div>

          {/* Onglets */}
          <div className="flex gap-0 px-4 pt-0 border-b border-[#f0f0f0]">
            {[
              { key: 'admin',   label: 'Comptes admin',   icon: <ShieldCheck size={14} /> },
              { key: 'societe', label: 'Comptes société',  icon: <Building2 size={14} />  },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'color-[#12a6e0] border-[#12a6e0] text-[#12a6e0]'
                    : 'text-[#aaa] border-transparent hover:text-[#666]'
                }`}
                style={activeTab === tab.key ? { color: '#12a6e0', borderColor: '#12a6e0', marginBottom: '-1px' } : { color: '#aaa', borderColor: 'transparent', marginBottom: '-1px' }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div className="p-5">
            {activeTab === 'admin'   && <TabAdmin   />}
            {activeTab === 'societe' && <TabSociete />}
          </div>
        </div>
      </div>
    </>
  );
}