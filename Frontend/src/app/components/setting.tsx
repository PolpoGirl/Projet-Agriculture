import React, { useCallback, useEffect, useState } from 'react';
import {
  Bell, Cloud, Database, Droplets, Eye, EyeOff,
  HardDrive, Lightbulb, Lock, Save, Settings,
  Shield, Thermometer, Wind, Wifi, CheckCircle, AlertCircle, X,
} from 'lucide-react';

import {
  changePassword, getAutomationConfig, getSecuritySettings,
  updateAutomationConfig, updateSecuritySettings,
} from '../../api/axios';
import { useAuth } from '../contexts/AuthContext';
import InstallButton from './InstallButton';

// ─── Types ── INCHANGÉS ───────────────────────────────────────────────────────

interface AutomationThresholds {
  hum_sol_min: number; hum_sol_max: number; temp_max: number;
  co2_max: number; lux_min: number; niveau_eau_min: number;
  auto_irrigation: boolean; auto_ventilation: boolean; auto_lighting: boolean;
  date_modification?: string;
}
interface SecuritySettings { receive_notifications: boolean; }
interface PasswordFormState { old_password: string; new_password: string; confirm_password: string; }

const defaultAutomationThresholds: AutomationThresholds = {
  hum_sol_min: 20, hum_sol_max: 80, temp_max: 35, co2_max: 1000,
  lux_min: 100, niveau_eau_min: 10,
  auto_irrigation: true, auto_ventilation: true, auto_lighting: true,
};
const defaultSecuritySettings: SecuritySettings = { receive_notifications: true };
const defaultPasswordForm: PasswordFormState = { old_password: '', new_password: '', confirm_password: '' };

// ─── Toggle ── INCHANGÉ ───────────────────────────────────────────────────────

function Toggle({ value, onChange, disabled = false }: { value: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button" onClick={onChange} disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        value ? 'bg-green-500' : 'bg-gray-200'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
        value ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

// ─── SensorThresholdsTab ── LOGIQUE INCHANGÉE ─────────────────────────────────

function SensorThresholdsTab({
  thresholds, setThresholds, onSave, isLoading,
}: {
  thresholds: AutomationThresholds;
  setThresholds: React.Dispatch<React.SetStateAction<AutomationThresholds>>;
  onSave: (draft: AutomationThresholds) => Promise<void>;
  isLoading: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AutomationThresholds>(thresholds);

  useEffect(() => { if (!editing) setDraft(thresholds); }, [editing, thresholds]);

  const cards = [
    {
      key: 'pump', title: 'Pompe', subtitle: 'Irrigation automatique',
      icon: <Droplets className="h-5 w-5 text-blue-600" />,
      enabledKey: 'auto_irrigation' as const,
      accent: 'border-blue-200', headerBg: 'bg-blue-50', iconRing: 'ring-blue-100',
      fields: [
        { key: 'hum_sol_min' as const, label: 'Humidite sol: demarrage', unit: '%', helper: 'La pompe s allume si le sol descend sous ce seuil.' },
        { key: 'hum_sol_max' as const, label: 'Humidite sol: arret', unit: '%', helper: 'La pompe s arrete quand ce seuil est atteint.' },
        { key: 'niveau_eau_min' as const, label: 'Reserve d eau minimale', unit: '%', helper: 'Protection: la pompe reste arretee si l eau est trop basse.' },
      ],
    },
    {
      key: 'ventilation', title: 'Ventilation', subtitle: 'Refroidissement et renouvellement d air',
      icon: <Wind className="h-5 w-5 text-cyan-600" />,
      enabledKey: 'auto_ventilation' as const,
      accent: 'border-cyan-200', headerBg: 'bg-cyan-50', iconRing: 'ring-cyan-100',
      fields: [
        { key: 'temp_max' as const, label: 'Temperature maximale', unit: '°C', helper: 'Le ventilateur s allume au-dessus de cette temperature.' },
        { key: 'co2_max' as const, label: 'CO₂ maximal', unit: 'ppm', helper: 'Le ventilateur s allume aussi si le CO2 depasse ce seuil.' },
      ],
    },
    {
      key: 'lamp', title: 'Eclairage', subtitle: 'Lumiere automatique',
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
      enabledKey: 'auto_lighting' as const,
      accent: 'border-amber-200', headerBg: 'bg-amber-50', iconRing: 'ring-amber-100',
      fields: [
        { key: 'lux_min' as const, label: 'Luminosite minimale', unit: 'lux', helper: 'La lampe s allume sous ce niveau de lumiere.' },
      ],
    },
  ];

  const handleSave = async () => { await onSave(draft); setEditing(false); };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Seuils du mode automatique</h3>
            <p className="text-sm text-gray-500 mt-0.5">Les seuils définis ici pilotent directement les 3 actionneurs en mode automatique.</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-green-200 transition-all hover:shadow-md w-fit"
            >
              <Settings className="h-4 w-4" />
              Modifier les seuils
            </button>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setDraft(thresholds); setEditing(false); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => void handleSave()} disabled={isLoading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-green-200 transition-all disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          En mode automatique, ce sont uniquement ces seuils enregistrés qui décident d'allumer ou d'éteindre la pompe, la ventilation et l'éclairage.
        </div>
      </div>

      {/* Threshold cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.key} className={`bg-white border ${card.accent} rounded-2xl shadow-sm overflow-hidden`}>
            {/* Card header */}
            <div className={`${card.headerBg} px-5 pt-5 pb-4 border-b ${card.accent}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`bg-white p-2 rounded-xl shadow-sm ring-1 ${card.iconRing}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{card.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{card.subtitle}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Auto</span>
                  <Toggle
                    value={draft[card.enabledKey]}
                    disabled={!editing}
                    onChange={() => editing && setDraft((prev) => ({ ...prev, [card.enabledKey]: !prev[card.enabledKey] }))}
                  />
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="p-4 space-y-3">
              {card.fields.map((field) => (
                <div key={field.key} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{field.label}</p>
                    <span className="text-xs font-mono text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{field.unit}</span>
                  </div>
                  {editing ? (
                    <input
                      type="number"
                      value={draft[field.key]}
                      onChange={(e) => setDraft((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                      className="w-full bg-white border-2 border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-xl px-3 py-2 text-xl font-bold text-gray-900 focus:outline-none transition-all"
                    />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{draft[field.key]}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">{field.helper}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rules summary */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Résumé des règles actives</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            {
              label: 'Règle pompe', color: 'bg-blue-50 border-blue-100',
              text: `ON si humidité sol < ${thresholds.hum_sol_min}% et eau > ${thresholds.niveau_eau_min}%. OFF si humidité sol ≥ ${thresholds.hum_sol_max}%.`,
            },
            {
              label: 'Règle ventilation', color: 'bg-cyan-50 border-cyan-100',
              text: `ON si température > ${thresholds.temp_max}°C ou CO₂ > ${thresholds.co2_max} ppm.`,
            },
            {
              label: 'Règle éclairage', color: 'bg-amber-50 border-amber-100',
              text: `ON si luminosité < ${thresholds.lux_min} lux. OFF à partir de ${thresholds.lux_min} lux.`,
            },
          ].map((rule, i) => (
            <div key={i} className={`rounded-xl border ${rule.color} p-4`}>
              <p className="text-xs font-bold text-gray-700 mb-1">{rule.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{rule.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SettingsPage ── LOGIQUE INCHANGÉE ────────────────────────────────────────

const SettingsPage: React.FC = () => {
  const { user, setUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'sensors' | 'security' | 'system'>('sensors');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sensorThresholds, setSensorThresholds] = useState<AutomationThresholds>(defaultAutomationThresholds);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(defaultPasswordForm);
  const [showAllPasswords, setShowAllPasswords] = useState(false);

  // ── Feedback ──
  const showFeedback = (message: string, isError = false) => {
    if (isError) { setError(message); setSaveSuccess(null); }
    else { setSaveSuccess(message); setError(null); }
    window.setTimeout(() => { setSaveSuccess(null); setError(null); }, 3000);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm(defaultPasswordForm);
    setShowAllPasswords(false);
  };

  const fetchSettings = useCallback(async () => {
    try {
      const [automationData, securityData] = await Promise.all([getAutomationConfig(), getSecuritySettings()]);
      if (automationData?.settings) setSensorThresholds({ ...defaultAutomationThresholds, ...automationData.settings });
      setSecuritySettings({ ...defaultSecuritySettings, ...securityData });
    } catch { /* keep defaults */ }
  }, []);

  useEffect(() => { void fetchSettings(); }, [fetchSettings]);

  useEffect(() => {
    if (typeof user?.receive_notifications === 'boolean') {
      setSecuritySettings((prev) => ({ ...prev, receive_notifications: user.receive_notifications }));
    }
  }, [user]);

  const handleSaveSensorThresholds = async (draft: AutomationThresholds) => {
    setIsLoading(true);
    try {
      const response = await updateAutomationConfig(draft);
      setSensorThresholds({ ...defaultAutomationThresholds, ...(response.settings ?? draft) });
      showFeedback('Seuils automatiques enregistrés avec succès.');
    } catch (err: any) {
      const message = err?.response?.data?.hum_sol_max?.[0] || err?.response?.data?.detail || 'Erreur lors de la sauvegarde des seuils.';
      showFeedback(message, true);
      throw err;
    } finally { setIsLoading(false); }
  };

  const handleToggleNotifications = async () => {
    const nextValue = !securitySettings.receive_notifications;
    setSecuritySettings((prev) => ({ ...prev, receive_notifications: nextValue }));
    setIsLoading(true);
    try {
      const data = await updateSecuritySettings({ receive_notifications: nextValue });
      setSecuritySettings({ ...defaultSecuritySettings, ...data });
      if (typeof setUser === 'function') setUser((prev: any) => prev ? { ...prev, receive_notifications: data.receive_notifications } : prev);
      if (typeof refreshUser === 'function') void refreshUser();
      showFeedback(data.receive_notifications ? 'Notifications de sécurité activées.' : 'Notifications de sécurité désactivées.');
    } catch (err: any) {
      setSecuritySettings((prev) => ({ ...prev, receive_notifications: !nextValue }));
      showFeedback(err?.response?.data?.detail || 'Impossible de mettre à jour les notifications.', true);
    } finally { setIsLoading(false); }
  };

  const handlePasswordFieldChange = (field: keyof PasswordFormState, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password.length < 8) {
      showFeedback('Le nouveau mot de passe doit contenir au moins 8 caractères.', true);
      return;
    }
    setIsLoading(true);
    try {
      const response = await changePassword(passwordForm);
      closePasswordModal();
      showFeedback(response?.detail || 'Mot de passe modifié avec succès.');
    } catch (err: any) {
      const data = err?.response?.data;
      const message = data?.old_password?.[0] || data?.new_password?.[0] || data?.confirm_password?.[0] || data?.non_field_errors?.[0] || data?.detail || 'Impossible de modifier le mot de passe.';
      showFeedback(message, true);
    } finally { setIsLoading(false); }
  };

  const tabs = [
    { id: 'sensors',  label: 'Capteurs', icon: Thermometer },
    { id: 'security', label: 'Système',  icon: Shield },
  ];

  const systemCards = [
    { icon: <Database className="h-5 w-5 text-gray-400" />, label: 'Rétention des données', value: '30 jours' },
    { icon: <HardDrive className="h-5 w-5 text-gray-400" />, label: 'Espace utilisé', value: '2.3 GB / 10 GB' },
    { icon: <Wifi className="h-5 w-5 text-gray-400" />, label: 'Connexion', value: 'Active' },
    { icon: <Cloud className="h-5 w-5 text-gray-400" />, label: 'Sauvegarde cloud', value: 'Activée' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/40 to-teal-50/30 p-4 md:p-6 lg:p-8 space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-green-900 tracking-tight">Paramètres</h1>
        <p className="text-sm text-green-600/70 mt-0.5">Configuration du système AgroLink</p>
      </div>

      {/* ── Feedback banners ── */}
      {saveSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm">
          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
          <p className="text-green-800 text-sm font-medium">{saveSuccess}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-sm">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-white border border-green-100 rounded-xl p-1 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Capteurs tab ── */}
      {activeTab === 'sensors' && (
        <SensorThresholdsTab
          thresholds={sensorThresholds}
          setThresholds={setSensorThresholds}
          onSave={handleSaveSensorThresholds}
          isLoading={isLoading}
        />
      )}

      {/* ── Sécurité tab ── */}
      {activeTab === 'security' && (
        <div className="space-y-5">

          <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Sécurité du compte</h3>
              <p className="text-sm text-gray-500 mt-0.5">Gérez les alertes de sécurité et les informations sensibles.</p>
            </div>

            {/* Notifications toggle */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-emerald-100 flex-shrink-0">
                    <Bell className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Recevoir les notifications</p>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                      Quand cette option est activée, votre compte reste connecté au système de notifications de toute l'application, côté front et back.
                    </p>
                  </div>
                </div>
                <Toggle value={securitySettings.receive_notifications} disabled={isLoading} onChange={() => void handleToggleNotifications()} />
              </div>
            </div>

            {/* Password */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-3">
                  <div className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-gray-200 flex-shrink-0">
                    <Lock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Mot de passe</p>
                    <p className="mt-1 text-xs text-gray-500">Ouvrez la fenêtre sécurisée pour vérifier votre ancien mot de passe et enregistrer le nouveau.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-green-200 transition-all w-fit"
                >
                  <Shield className="h-4 w-4" />
                  Modifier le mot de passe
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-green-200 bg-green-50/60 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-3">
                  <div className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-green-100 flex-shrink-0">
                    <Cloud className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Installation de l'application</p>
                    <p className="mt-1 text-xs text-gray-500">Installez AgroLink sur votre appareil pour l'ouvrir plus vite depuis le bureau ou l'ecran d'accueil.</p>
                  </div>
                </div>
                <InstallButton />
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Informations du compte</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">Utilisateur connecté</p>
                <p className="font-bold text-gray-900">{user?.username || 'Utilisateur'}</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">Notifications</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${securitySettings.receive_notifications ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                  <p className="font-bold text-gray-900">{securitySettings.receive_notifications ? 'Activées' : 'Désactivées'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Password Modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-green-700 to-emerald-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/15 p-2 rounded-xl">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Changer le mot de passe</h3>
                  <p className="text-xs text-green-200">Entrez votre mot de passe actuel puis confirmez le nouveau.</p>
                </div>
              </div>
              <button onClick={closePasswordModal} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-green-200 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Show/hide toggle */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowAllPasswords((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showAllPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showAllPasswords ? 'Masquer' : 'Afficher'} les mots de passe
                </button>
              </div>

              {[
                ['old_password', 'Ancien mot de passe'],
                ['new_password', 'Nouveau mot de passe'],
                ['confirm_password', 'Confirmer le mot de passe'],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input
                    type={showAllPasswords ? 'text' : 'password'}
                    value={passwordForm[field as keyof PasswordFormState]}
                    onChange={(e) => handlePasswordFieldChange(field as keyof PasswordFormState, e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all"
                  />
                </div>
              ))}

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">Le nouveau mot de passe doit contenir au moins 8 caractères.</p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={closePasswordModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => void handleChangePassword()} disabled={isLoading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-green-200 transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );};

export default SettingsPage;
