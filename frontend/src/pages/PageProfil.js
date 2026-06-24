import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Camera, Save, Lock, User, Mail, Phone,
  Briefcase, Building2, Shield, CheckCircle2,
  AlertCircle, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

// ── Sous-composants ───────────────────────────────────────────
function Field({ label, name, value, onChange, type = 'text', placeholder, disabled, icon: Icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#12a6e0' }}>
        {Icon && <Icon size={9} style={{ marginRight: 4, display: 'inline' }} />}
        {label}
      </label>
      <input
        type={type} name={name} value={value ?? ''} onChange={onChange}
        placeholder={placeholder} disabled={disabled}
        style={{
          padding: '8px 12px', fontSize: 13.5,
          border: `1px solid ${disabled ? '#f0f0f0' : '#e8e8e8'}`,
          borderRadius: 8,
          background: disabled ? '#f8f8f8' : '#fff',
          color: disabled ? '#aaa' : '#0d0c0c',
          outline: 'none',
        }}
      />
    </div>
  );
}

function PasswordField({ label, name, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#12a6e0' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'} name={name} value={value}
          onChange={onChange} placeholder={placeholder}
          style={{ width: '100%', padding: '8px 36px 8px 12px', fontSize: 13.5, border: '1px solid #e8e8e8', borderRadius: 8, background: '#fff', color: '#0d0c0c', outline: 'none', boxSizing: 'border-box' }}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function BtnPrimary({ children, onClick, loading, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 8, border: 'none', background: disabled || loading ? '#e8f6fd' : 'linear-gradient(135deg,#12a6e0,#0d8fc4)', color: disabled || loading ? '#92cfe8' : '#fff', fontSize: 13, fontWeight: 500, cursor: disabled || loading ? 'not-allowed' : 'pointer' }}>
      {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : children}
      {loading ? 'En cours…' : null}
    </button>
  );
}

function BtnGhost({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '9px 22px', borderRadius: 8, border: '1px solid #e8e8e8', background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer' }}>
      {children}
    </button>
  );
}

function Toast({ message }) {
  if (!message) return null;
  const ok = message.type === 'success';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: ok ? 'rgba(1,214,58,0.05)' : 'rgba(229,57,53,0.05)', border: `1px solid ${ok ? 'rgba(1,168,46,0.20)' : 'rgba(229,57,53,0.20)'}`, color: ok ? '#01773d' : '#c62828' }}>
      {ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {message.text}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function PageProfil() {
  const { user, checkSession } = useAuth();
  const fileInputRef = useRef(null);

  const [profil,       setProfil]       = useState(null);
  const [loadingProfil,setLoadingProfil]= useState(true);
  const [form,         setForm]         = useState({});
  const [msgProfil,    setMsgProfil]    = useState(null);
  const [savingProfil, setSavingProfil] = useState(false);

  const [pwd,          setPwd]          = useState({ actuel: '', nouveau: '', confirm: '' });
  const [msgPwd,       setMsgPwd]       = useState(null);
  const [savingPwd,    setSavingPwd]    = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview,   setPhotoPreview]   = useState(null);

  const isAdmin   = user?.Role === 'admin';
  const isEmploye = user?.Role === 'employe';

  // ── Charger le profil ─────────────────────────────────────
  useEffect(() => {
    axios.get(`${API}/api/profil`, { withCredentials: true })
      .then(res => {
        setProfil(res.data);
        setForm({
          prenom:    res.data.Prenom    || '',
          nom:       res.data.Nom       || '',
          email:     res.data.Email     || '',
          telephone: res.data.Telephone || '',
          poste:     res.data.Poste     || '',
          societe:   res.data.Societe   || '',
        });
        if (res.data.PhotoUrl) setPhotoPreview(`${API}${res.data.PhotoUrl}`);
      })
      .catch(() => {})
      .finally(() => setLoadingProfil(false));
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePwd    = (e) => setPwd(p  => ({ ...p,  [e.target.name]: e.target.value }));

  // ── Sauvegarder infos ─────────────────────────────────────
  const handleSaveProfil = async () => {
    if (!form.nom || !form.prenom) return setMsgProfil({ type: 'error', text: 'Nom et prénom sont obligatoires.' });
    setSavingProfil(true); setMsgProfil(null);
    try {
      await axios.put(`${API}/api/profil`, {
        nom:       form.nom,
        prenom:    form.prenom,
        email:     form.email,
        telephone: form.telephone || null,
        poste:     form.poste     || null,
        societe:   form.societe   || null,
      }, { withCredentials: true });
      setMsgProfil({ type: 'success', text: 'Profil mis à jour avec succès.' });
      await checkSession(); // ← met à jour partout (sidebar, header…)
      setTimeout(() => setMsgProfil(null), 3000);
    } catch (err) {
      setMsgProfil({ type: 'error', text: err.response?.data?.error || 'Erreur serveur.' });
    } finally { setSavingProfil(false); }
  };

  // ── Changer mot de passe ──────────────────────────────────
  const handleSavePwd = async () => {
    if (!pwd.actuel || !pwd.nouveau || !pwd.confirm) return setMsgPwd({ type: 'error', text: 'Tous les champs sont requis.' });
    if (pwd.nouveau.length < 6) return setMsgPwd({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
    if (pwd.nouveau !== pwd.confirm) return setMsgPwd({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
    setSavingPwd(true); setMsgPwd(null);
    try {
      await axios.put(`${API}/api/profil/password`, {
        actuel:  pwd.actuel,
        nouveau: pwd.nouveau,
      }, { withCredentials: true });
      setMsgPwd({ type: 'success', text: 'Mot de passe changé avec succès.' });
      setPwd({ actuel: '', nouveau: '', confirm: '' });
      setTimeout(() => setMsgPwd(null), 3000);
    } catch (err) {
      setMsgPwd({ type: 'error', text: err.response?.data?.error || 'Mot de passe actuel incorrect.' });
    } finally { setSavingPwd(false); }
  };

  // ── Upload photo ──────────────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await axios.post(`${API}/api/profil/photo`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotoPreview(`${API}${res.data.photoUrl}`);
      await checkSession(); // ← met à jour l'avatar partout
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur upload photo.');
    } finally { setUploadingPhoto(false); }
  };

  // ── Initiales ─────────────────────────────────────────────
  const initials = profil
    ? `${(profil.Prenom?.[0] || '').toUpperCase()}${(profil.Nom?.[0] || '').toUpperCase()}`
    : '??';

  const roleLabel = isAdmin ? 'Administrateur' : 'Employé';
  const roleColor = isAdmin ? '#0d8fc4' : '#01773d';
  const roleBg    = isAdmin ? 'rgba(18,166,224,0.10)' : 'rgba(1,168,46,0.08)';

  if (loadingProfil) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#aaa', gap: 10 }}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Chargement du profil…
      </div>
    );
  }

  return (
    <>
      <style>{`@keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }`}</style>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* ── Bannière profil ── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

          {/* Avatar + upload */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {photoPreview ? (
              <img src={photoPreview} alt="profil"
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8f4fb' }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#12a6e0,#01d63a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, color: '#fff' }}>
                {initials}
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
              style={{ position: 'absolute', bottom: 0, right: -4, width: 24, height: 24, borderRadius: '50%', background: '#12a6e0', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {uploadingPhoto ? <Loader2 size={11} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={11} color="#fff" />}
            </button>
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>

          {/* Infos */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0d0c0c' }}>{form.prenom} {form.nom}</p>
              <span style={{ background: roleBg, color: roleColor, fontSize: 11.5, fontWeight: 500, padding: '2px 10px', borderRadius: 20 }}>{roleLabel}</span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#888' }}>{profil?.Email}</p>
            {isEmploye && profil?.Societe && (
              <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#bbb' }}>{profil.Societe}</p>
            )}
          </div>
        </div>

        {/* ── Informations personnelles ── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0' }}>
          <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#c5c5c5' }}>
            Informations personnelles
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Field label="Prénom *" name="prenom" value={form.prenom} onChange={handleChange} icon={User} />
            <Field label="Nom *"    name="nom"    value={form.nom}    onChange={handleChange} icon={User} />
          </div>

          <div style={{ marginBottom: 12 }}>
            {/* <Field label="Adresse e-mail" name="email" type="email" value={profil?.Email} disabled icon={Mail} /> */}
            <Field label="Adresse e-mail" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@domaine.com" icon={Mail} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Field label="Téléphone"      name="telephone" type="tel" value={form.telephone} onChange={handleChange} placeholder="+212 6 00 00 00 00" icon={Phone} />
            <Field label="Poste / Fonction" name="poste"  value={form.poste}  onChange={handleChange} placeholder="ex : Magasinier" icon={Briefcase} />
          </div>

          {/* Société — employé seulement */}
          {isEmploye && (
            <div style={{ marginBottom: 12 }}>
              <Field label="Société" name="societe" value={form.societe} onChange={handleChange} placeholder="ex : IMRASOFT SARL" icon={Building2} />
            </div>
          )}

          {msgProfil && <div style={{ marginBottom: 12 }}><Toast message={msgProfil} /></div>}

          <hr style={{ border: 'none', borderTop: '1px solid #f5f5f5', margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <BtnGhost onClick={() => setForm({ prenom: profil?.Prenom || '', nom: profil?.Nom || '', telephone: profil?.Telephone || '', poste: profil?.Poste || '', societe: profil?.Societe || '' })}>Annuler</BtnGhost>
            <BtnPrimary onClick={handleSaveProfil} loading={savingProfil}>
              <Save size={13} /> Enregistrer
            </BtnPrimary>
          </div>
        </div>

        {/* ── Sécurité ── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0' }}>
          <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#c5c5c5' }}>
            Sécurité
          </p>
          <div style={{ marginBottom: 12 }}>
            <PasswordField label="Mot de passe actuel"  name="actuel"  value={pwd.actuel}  onChange={handlePwd} placeholder="••••••••" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <PasswordField label="Nouveau mot de passe" name="nouveau" value={pwd.nouveau} onChange={handlePwd} placeholder="••••••••" />
            <PasswordField label="Confirmer"            name="confirm" value={pwd.confirm} onChange={handlePwd} placeholder="••••••••" />
          </div>

          {msgPwd && <div style={{ marginTop: 12 }}><Toast message={msgPwd} /></div>}

          <hr style={{ border: 'none', borderTop: '1px solid #f5f5f5', margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <BtnPrimary onClick={handleSavePwd} loading={savingPwd}>
              <Lock size={13} /> Changer le mot de passe
            </BtnPrimary>
          </div>
        </div>

        {/* ── Rôle ── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0' }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#c5c5c5' }}>
            Rôle
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <div>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#0d0c0c' }}>Rôle</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>
                {isAdmin ? 'Accès complet à toutes les fonctionnalités' : 'Accès aux pages Dashboard, Mouvements et Actions à faire'}
              </p>
            </div>
            <span style={{ background: roleBg, color: roleColor, fontSize: 11.5, fontWeight: 500, padding: '3px 12px', borderRadius: 20 }}>
              {roleLabel}
            </span>
          </div>

          {/* Bases — employé seulement */}
          {isEmploye && profil?.bases && profil.bases.length > 0 && (
            <>
              <hr style={{ border: 'none', borderTop: '1px solid #f5f5f5', margin: '12px 0' }} />
              <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#c5c5c5' }}>Mes bases</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profil.bases.map(b => (
                  <span key={b.BaseName} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#0b7db0', background: 'rgba(18,166,224,0.07)', border: '1px solid rgba(18,166,224,0.18)', borderRadius: 8, padding: '4px 10px' }}>
                    {b.BaseName}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </>
  );
}