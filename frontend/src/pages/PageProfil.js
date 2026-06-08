import React, { useState } from 'react';

export default function PageProfil() {
  const [form, setForm] = useState({
    prenom: 'Admin',
    nom: 'Système',
    email: 'admin@sage.local',
    telephone: '',
    poste: 'Administrateur système',
    base: 'BIJOU',
  });
  const [pwd, setPwd] = useState({ actuel: '', nouveau: '', confirm: '' });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePwd    = (e) => setPwd(p  => ({ ...p,  [e.target.name]: e.target.value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = `${form.prenom[0] ?? ''}${form.nom[0] ?? ''}`.toUpperCase();

  return (
    // <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Bannière profil ── */}
      <div className="bg-white rounded-2xl p-6 flex items-center gap-5"
        style={{ border: '1px solid #f0f0f0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg,#12a6e0,#01d63a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 600, color: '#fff', flexShrink: 0,
        }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0d0c0c' }}>
              {form.prenom} {form.nom}
            </p>
            <span style={{
              background: 'rgba(18,166,224,0.10)', color: '#0d8fc4',
              fontSize: 11.5, fontWeight: 500, padding: '2px 10px', borderRadius: 20,
            }}>Administrateur</span>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#888' }}>{form.email}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#bbb' }}>Membre depuis janvier 2024</p>
        </div>
        <button
          style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid #e8e8e8',
            background: 'transparent', color: '#888', fontSize: 12, cursor: 'pointer',
          }}>
          Changer la photo
        </button>
      </div>

      {/* ── Informations personnelles ── */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0' }}>
        <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#c5c5c5' }}>
          Informations personnelles
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <Field label="Prénom"  name="prenom"  value={form.prenom}    onChange={handleChange} />
          <Field label="Nom"     name="nom"     value={form.nom}       onChange={handleChange} />
        </div>
        <Field label="Adresse e-mail" name="email"     type="email" value={form.email}     onChange={handleChange} mb />
        <Field label="Téléphone"      name="telephone" type="tel"   value={form.telephone} onChange={handleChange} placeholder="+212 6 00 00 00 00" mb />
        <Field label="Poste / Fonction" name="poste"   value={form.poste}   onChange={handleChange} />
        <hr style={{ border: 'none', borderTop: '1px solid #f5f5f5', margin: '16px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <BtnGhost>Annuler</BtnGhost>
          <BtnPrimary onClick={handleSave}>{saved ? '✓ Enregistré' : 'Enregistrer'}</BtnPrimary>
        </div>
      </div>

      {/* ── Sécurité ── */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0' }}>
        <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#c5c5c5' }}>
          Sécurité
        </p>
        <Field label="Mot de passe actuel"  name="actuel"  type="password" value={pwd.actuel}  onChange={handlePwd} placeholder="••••••••" mb />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Nouveau mot de passe" name="nouveau" type="password" value={pwd.nouveau} onChange={handlePwd} placeholder="••••••••" />
          <Field label="Confirmer"             name="confirm" type="password" value={pwd.confirm} onChange={handlePwd} placeholder="••••••••" />
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #f5f5f5', margin: '16px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <BtnPrimary>Changer le mot de passe</BtnPrimary>
        </div>
      </div>

      {/* ── Accès & rôle ── */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0' }}>
        <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#c5c5c5' }}>
          Accès & rôle
        </p>
        <Row label="Rôle" sub="Accès complet à toutes les fonctionnalités">
          <span style={{ background: 'rgba(18,166,224,0.10)', color: '#0d8fc4', fontSize: 11.5, fontWeight: 500, padding: '3px 12px', borderRadius: 20 }}>
            Administrateur
          </span>
        </Row>
        <hr style={{ border: 'none', borderTop: '1px solid #f5f5f5', margin: '8px 0' }} />
        <Row label="Base par défaut" sub="Base de données utilisée au démarrage">
          <input
            name="base" value={form.base} onChange={handleChange}
            style={{ width: 110, padding: '6px 10px', fontSize: 13, border: '1px solid #e8e8e8', borderRadius: 8, background: '#fafafa', color: '#0d0c0c', outline: 'none' }}
          />
        </Row>
      </div>

    </div>
  );
}

// ── Sous-composants ────────────────────────────────────────────
function Field({ label, name, value, onChange, type = 'text', placeholder, mb }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: mb ? 14 : 0 }}>
      <label style={{ fontSize: 12, color: '#888' }}>{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: '8px 12px', fontSize: 13.5, border: '1px solid #e8e8e8',
          borderRadius: 8, background: '#fafafa', color: '#0d0c0c', outline: 'none',
        }}
      />
    </div>
  );
}

function Row({ label, sub, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <div>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#0d0c0c' }}>{label}</p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function BtnPrimary({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 22px', borderRadius: 8, border: 'none',
      background: 'linear-gradient(135deg,#12a6e0,#0d8fc4)',
      color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    }}>{children}</button>
  );
}

function BtnGhost({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 22px', borderRadius: 8,
      border: '1px solid #e8e8e8', background: 'transparent',
      color: '#888', fontSize: 13, cursor: 'pointer',
    }}>{children}</button>
  );
}