import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ServerCrash,
  Server,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

const API = window.location.port === '3000' 
  ? 'http://localhost:5000' 
  : '';

// ── Boîte de confirmation custom ─────────────────────────────
function ConfirmDialog({ baseName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.08)] w-full max-w-[380px] mx-4 overflow-hidden"
        style={{ animation: 'dialogIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Header rouge */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#fff5f5] to-[#fff0f0] border-b border-[#fde0e0]">
          <div className="w-8 h-8 rounded-[0.6rem] bg-gradient-to-br from-[#ef5350] to-[#c62828] flex items-center justify-center shadow shadow-[rgba(229,57,53,0.35)]">
            <AlertTriangle size={14} className="text-white" />
          </div>
          <span className="text-[#b71c1c] text-[13px] font-semibold tracking-wide">
            Confirmation requise
          </span>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-[#0d0c0c] text-[14px] leading-relaxed">
            Voulez-vous désactiver la base{' '}
            <span className="font-mono text-[0.8rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded px-1.5 py-0.5">
              {baseName}
            </span>{' '}
            ?
          </p>
          <p className="mt-2 text-[12px] text-[#999999]">
            La base restera dans le registre mais ne sera plus visible dans le dashboard.
          </p>
        </div>

        {/* Actions */}
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
            Désactiver
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────
export default function GestionBases() {
  const [bases, setBases]                       = useState([]);
  const [basesDisponibles, setBasesDisponibles] = useState([]);
  const [baseName, setBaseName]                 = useState('');
  const [loading, setLoading]                   = useState(false);
  const [fetching, setFetching]                 = useState(true);
  const [loadingDisp, setLoadingDisp]           = useState(false);
  const [showDropdown, setShowDropdown]         = useState(false);
  const [message, setMessage]                   = useState(null);
  const [confirmBase, setConfirmBase]           = useState(null);

  const fetchBases = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API}/api/bases?force=1`);
      setBases(res.data);
    } catch { /* silently ignore */ }
    finally { setFetching(false); }
  };

  const fetchBasesDisponibles = async () => {
    setLoadingDisp(true);
    try {
      const res = await axios.get(`${API}/api/bases/disponibles`);
      setBasesDisponibles(res.data);
    } catch { /* silently ignore */ }
    finally { setLoadingDisp(false); }
  };

  useEffect(() => {
    fetchBases();
    fetchBasesDisponibles();
  }, []);

  const handleAdd = async () => {
    if (!baseName) {
      return setMessage({ type: 'error', text: 'Veuillez entrer le nom de la base.' });
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`${API}/api/bases`, {
        baseName,
        baseLabel: baseName,
      });
      setMessage({ type: 'success', text: res.data?.Message || 'Base ajoutée avec succès.' });
      setBaseName('');
      setTimeout(() => { fetchBases(); fetchBasesDisponibles(); }, 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConfirmed = async () => {
    const name = confirmBase;
    setConfirmBase(null);
    setLoading(true);
    try {
      const res = await axios.delete(`${API}/api/bases/${name}`);
      setMessage({ type: 'success', text: res.data?.Message || 'Base désactivée.' });
      setTimeout(() => { fetchBases(); fetchBasesDisponibles(); }, 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur serveur.' });
    } finally {
      setLoading(false);
    }
  };

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

      {/* ── Boîte de confirmation ── */}
      {confirmBase && (
        <ConfirmDialog
          baseName={confirmBase}
          onConfirm={handleRemoveConfirmed}
          onCancel={() => setConfirmBase(null)}
        />
      )}

      <div className="flex flex-col gap-5 fade-in">

        {/* ── FORMULAIRE AJOUT ── */}
        <div className="bg-white border border-[#e4e4e4] rounded-[1.1rem] shadow-[0_2px_12px_rgba(18,166,224,0.07),0_1px_3px_rgba(0,0,0,0.05)] overflow-visible">

          <div className="flex items-center gap-[0.55rem] px-5 py-4 bg-gradient-to-r from-[#f8fcff] to-[#f0f9ff] border-b border-[#e8f4fb] rounded-[1.1rem] rounded-b-none">
            <div className="w-7 h-7 rounded-[0.55rem] bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] flex items-center justify-center shadow-md shadow-[rgba(18,166,224,0.30)]">
              <Database size={13} className="text-white" />
            </div>
            <span className="text-[#0d0c0c] text-[13px] font-semibold tracking-wide">
              Ajouter une base SAGE
            </span>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">

              <div className="flex flex-col gap-[6px]">
                <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#12a6e0]">
                  <Server size={11} />
                  Nom de la base SQL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ex : PHARMA"
                    value={baseName}
                    onChange={e => { setBaseName(e.target.value.toUpperCase()); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#c5c5c5] bg-white text-sm text-[#0d0c0c] placeholder-[#aaaaaa] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#12a6e0] focus:shadow-[0_0_0_3px_rgba(18,166,224,0.12)] hover:border-[#12a6e0] font-mono"
                  />
                  {showDropdown && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[#cce8f6] rounded-[0.65rem] shadow-[0_8px_28px_rgba(18,166,224,0.2),0_4px_12px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
                      {loadingDisp ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-[#aaaaaa]">
                          <Loader2 size={12} className="animate-spin text-[#12a6e0]" /> Chargement...
                        </div>
                      ) : basesDisponibles.filter(b => b.BaseName.toLowerCase().includes(baseName.toLowerCase())).length === 0 ? (
                        <div className="px-4 py-3 text-[13px] text-[#c5c5c5] italic">Aucune base disponible</div>
                      ) : (
                        <div className="max-h-[200px] overflow-y-auto">
                          {basesDisponibles
                            .filter(b => b.BaseName.toLowerCase().includes(baseName.toLowerCase()))
                            .map(b => (
                              <div
                                key={b.BaseName}
                                onMouseDown={() => { setBaseName(b.BaseName); setShowDropdown(false); }}
                                className="px-4 py-2.5 text-[13px] font-mono text-[#0b7db0] cursor-pointer transition-colors border-b border-[#f5f9fc] hover:bg-[rgba(18,166,224,0.07)]"
                              >
                                {b.BaseName}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-transparent select-none">&nbsp;</label>
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className={`flex items-center justify-center gap-[0.45rem] px-[1.35rem] py-[0.6rem] rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    loading
                      ? 'bg-[#e8f6fd] text-[#92cfe8] cursor-not-allowed'
                      : 'bg-gradient-to-br from-[#12a6e0] to-[#0d8fc4] text-white shadow-md shadow-[rgba(18,166,224,0.35)] hover:shadow-lg cursor-pointer active:scale-[0.97]'
                  }`}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {loading ? 'En cours…' : 'Ajouter'}
                </button>
              </div>
            </div>

            {message && (
              <div className={`mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium border ${
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

        {/* ── TABLEAU DES BASES ── */}
        <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.06)]">

          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#01d63a]" />
              <span className="text-[#0d0c0c] text-[0.75rem] font-semibold uppercase tracking-[0.06em]">Bases enregistrées</span>
              {!fetching && (
                <span className="bg-[#f0f0f0] text-[#666666] text-[0.6875rem] font-mono px-2 py-0.5 rounded">
                  {bases.length} base{bases.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={() => { fetchBases(); fetchBasesDisponibles(); }}
              disabled={fetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#f5f5f5] text-[#666666] border border-[#e0e0e0] cursor-pointer transition-all hover:bg-[#ebebeb] hover:text-[#0d0c0c] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>

          {fetching && (
            <div className="p-5 flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-[#f8f8f8] rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          )}

          {!fetching && bases.length === 0 && (
            <div className="p-16 text-center">
              <ServerCrash size={36} className="text-[#e0e0e0] mx-auto mb-3" />
              <p className="text-[#c5c5c5] text-sm">Aucune base enregistrée.</p>
            </div>
          )}

          {!fetching && bases.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {['Nom de la base ', 'Statut', 'Action'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 bg-[#f8f8f8] text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[#888888] ${i === 2 ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bases.map((b) => (
                    <tr key={b.BaseName} className="border-b border-[#f8f8f8] transition-colors duration-100 hover:bg-[rgba(18,166,224,0.03)]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block font-mono text-[0.72rem] text-[#0b7db0] bg-[rgba(18,166,224,0.07)] border border-[rgba(18,166,224,0.15)] rounded-md px-2 py-0.5">
                          {b.BaseName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {b.IsActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[#01773d] text-[0.7rem] font-semibold bg-[rgba(1,168,46,0.07)] border border-[rgba(1,168,46,0.18)] rounded-full px-2.5 py-1">
                            <CheckCircle2 size={11} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[#b71c1c] text-[0.7rem] font-semibold bg-[rgba(229,57,53,0.07)] border border-[rgba(229,57,53,0.18)] rounded-full px-2.5 py-1">
                            <XCircle size={11} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setConfirmBase(b.BaseName)}
                          disabled={loading || !b.IsActive}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold bg-[rgba(229,57,53,0.06)] text-[#c62828] border border-[rgba(229,57,53,0.18)] cursor-pointer transition-all duration-150 hover:bg-[rgba(229,57,53,0.12)] hover:shadow-[0_1px_6px_rgba(229,57,53,0.18)] active:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-[rgba(229,57,53,0.06)] disabled:hover:shadow-none"
                        >
                          <Trash2 size={11} />
                          Désactiver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}