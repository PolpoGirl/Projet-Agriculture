import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Power, Check, Droplet, Fan, Lightbulb, AlertCircle, Waves, Wind, Cpu, Settings } from 'lucide-react';

function ModeToggle({
  isAutomatic,
  disabled,
  onChange,
}: {
  isAutomatic: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isAutomatic}
      onClick={() => onChange(!isAutomatic)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-all duration-200 ${
        isAutomatic ? 'bg-green-500' : 'bg-gray-300'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white text-[9px] font-bold text-slate-600 shadow-sm transition-transform ${
          isAutomatic ? 'translate-x-6' : 'translate-x-1'
        }`}
      >
        {isAutomatic ? 'A' : 'M'}
      </span>
    </button>
  );
}

export default function Actuators() {
  const { t } = useLanguage();
  const { actuators, actuatorModes, setActuatorMode, toggleActuator, loading, error, thresholds, sensors } = useData();
  const { currentUser } = useAuth();

  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleToggle = async (key: 'pump' | 'lamp' | 'ventilation' | 'servo') => {
    await toggleActuator(key, currentUser?.username);
    setConfirmation(key);
    setTimeout(() => setConfirmation(null), 2000);
  };

  const automatableKeys = ['pump', 'ventilation', 'lamp'] as const;
  const automaticCount = automatableKeys.filter((key) => actuatorModes[key]).length;
  const manualCount = automatableKeys.length - automaticCount;

  // ── Color tokens for the 3 main actuators ──────────────────────────────────
  const colorTokens = {
    pump: {
      iconBg: 'bg-blue-50',
      iconText: 'text-blue-500',
      activeIconBg: 'bg-blue-100',
      activeIconText: 'text-blue-600',
      activeBorder: 'border-blue-200',
    },
    ventilation: {
      iconBg: 'bg-teal-50',
      iconText: 'text-teal-500',
      activeIconBg: 'bg-teal-100',
      activeIconText: 'text-teal-600',
      activeBorder: 'border-teal-200',
    },
    lamp: {
      iconBg: 'bg-amber-50',
      iconText: 'text-amber-500',
      activeIconBg: 'bg-amber-100',
      activeIconText: 'text-amber-600',
      activeBorder: 'border-amber-200',
    },
  };

  const mainActuators = [
    { key: 'pump' as const, icon: Droplet },
    { key: 'ventilation' as const, icon: Fan },
    { key: 'lamp' as const, icon: Lightbulb },
  ];

  const automationCards = [
    {
      key: 'pump' as const,
      title: 'Pompe',
      icon: <Waves className="h-5 w-5 text-blue-600" />,
      enabled: thresholds.auto_irrigation,
      lines: [
        `Démarrage: humidité du sol < ${thresholds.hum_sol_min}%`,
        `Arrêt: humidité du sol >= ${thresholds.hum_sol_max}%`,
        `Sécurité eau: réserve > ${thresholds.niveau_eau_min}%`,
      ],
      live: [
        `Sol actuel: ${sensors.soil.toFixed(1)}%`,
        `Eau actuelle: ${sensors.water.toFixed(1)}%`,
      ],
      accent: 'border-blue-100 bg-blue-50/60',
    },
    {
      key: 'ventilation' as const,
      title: 'Ventilation',
      icon: <Wind className="h-5 w-5 text-teal-600" />,
      enabled: thresholds.auto_ventilation,
      lines: [
        `Température max: ${thresholds.temp_max} °C`,
        `CO₂ max: ${thresholds.co2_max} ppm`,
        'Activation si température ou CO₂ dépasse le seuil.',
      ],
      live: [
        `Température actuelle: ${sensors.temp.toFixed(1)} °C`,
        `CO₂ actuel: ${sensors.gas.toFixed(1)} ppm`,
      ],
      accent: 'border-teal-100 bg-teal-50/60',
    },
    {
      key: 'lamp' as const,
      title: 'Éclairage',
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
      enabled: thresholds.auto_lighting,
      lines: [
        `Luminosité min: ${thresholds.lux_min} lux`,
        'Activation quand la luminosité passe sous le seuil.',
        'Extinction dès que la luminosité revient au seuil.',
      ],
      live: [`Luminosité actuelle: ${sensors.light.toFixed(1)} lux`],
      accent: 'border-amber-100 bg-amber-50/60',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/40 to-teal-50/30 p-4 md:p-6 lg:p-8 space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 tracking-tight">{t('actuators')}</h2>
          <p className="text-sm text-green-600/70 mt-0.5">Contrôle des équipements</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 shadow-sm">
            Auto: {automaticCount}/3
          </span>
          <span className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-sm">
            Manuel: {manualCount}/3
          </span>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="p-1.5 bg-red-100 rounded-lg flex-shrink-0">
            <AlertCircle className="text-red-600" size={16} />
          </div>
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── Manual info banner ── */}
      {manualCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Cpu size={14} className="text-blue-500 flex-shrink-0" />
          <p className="text-blue-800 text-xs leading-relaxed">
            Les actionneurs en mode manuel peuvent être commandés directement ici.
          </p>
        </div>
      )}

      {/* ── 3 main actuator cards + 1 servo row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

        {mainActuators.map(({ key, icon: Icon }) => {
          const isActive = actuators[key];
          const isAutomatic = actuatorModes[key];
          const showConfirm = confirmation === key;
          const tokens = colorTokens[key];

          return (
            <div
              key={key}
              className={`bg-white rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300 ${
                isActive ? `${tokens.activeBorder} shadow-sm` : 'border-gray-100'
              }`}
            >
              {/* Top row: icon + status */}
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${isActive ? tokens.activeIconBg : tokens.iconBg}`}>
                  <Icon className={`w-6 h-6 ${isActive ? tokens.activeIconText : 'text-gray-300'}`} />
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                  {isActive ? 'ON' : 'OFF'}
                </span>
              </div>

              {/* Name */}
              <p className="text-sm font-semibold text-gray-800">{t(key)}</p>

              {/* Mode row */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Mode</p>
                  <p className={`text-xs font-bold ${isAutomatic ? 'text-green-700' : 'text-blue-700'}`}>
                    {isAutomatic ? t('automatic') : t('manual')}
                  </p>
                </div>
                <ModeToggle
                  isAutomatic={isAutomatic}
                  disabled={loading}
                  onChange={(value) => void setActuatorMode(key, value)}
                />
              </div>

              {/* Toggle button */}
              <button
                onClick={() => void handleToggle(key)}
                disabled={isAutomatic || loading}
                className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-semibold text-xs transition-all duration-200 ${
                  isAutomatic || loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isActive
                      ? 'bg-red-500 hover:bg-red-600 active:scale-95 text-white'
                      : 'bg-green-600 hover:bg-green-700 active:scale-95 text-white'
                }`}
              >
                <Power size={13} />
                {loading
                  ? 'Envoi...'
                  : isAutomatic
                    ? 'Auto'
                    : isActive
                      ? 'Éteindre'
                      : 'Allumer'}
              </button>

              {/* Confirmation flash */}
              {showConfirm && (
                <div className="flex items-center justify-center gap-1.5 text-green-600 bg-green-50 border border-green-100 rounded-lg px-2 py-1.5 text-xs font-medium">
                  <Check size={12} />
                  Commande envoyée
                </div>
              )}
            </div>
          );
        })}

        {/* ── Servo card — full width, horizontal layout ── */}
        <div
          className={`col-span-2 sm:col-span-3 bg-white rounded-2xl border px-4 py-3.5 flex items-center gap-3 transition-all duration-300 ${
            actuators.servo ? 'border-blue-200 shadow-sm' : 'border-gray-100'
          }`}
        >
          {/* Icon */}
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${actuators.servo ? 'bg-blue-100' : 'bg-blue-50'}`}>
            <Settings className={`w-5 h-5 ${actuators.servo ? 'text-blue-600' : 'text-blue-400'}`} />
          </div>

          {/* Name + label */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{t('servo')}</p>
            <p className="text-[11px] text-gray-400">Commande directe</p>
          </div>

          {/* Status pill */}
          <span className={`flex items-center gap-1.5 text-xs font-semibold flex-shrink-0 ${
            actuators.servo ? 'text-green-600' : 'text-gray-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${actuators.servo ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            {actuators.servo ? 'ON' : 'OFF'}
          </span>

          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={actuators.servo}
            onClick={() => void handleToggle('servo')}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-all duration-200 ${
              actuators.servo ? 'bg-blue-500' : 'bg-gray-300'
            } ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                actuators.servo ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>

          {/* Confirmation */}
          {confirmation === 'servo' && (
            <div className="flex items-center gap-1 text-green-600 text-xs font-medium flex-shrink-0">
              <Check size={12} />
              OK
            </div>
          )}
        </div>
      </div>

      {/* ── Automation detail cards ── */}
      {automaticCount > 0 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0 mt-0.5">
              <Cpu size={14} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-green-800 font-semibold text-sm mb-0.5">{t('autoControl')}</h3>
              <p className="text-green-700 text-xs leading-relaxed">
                Les seuils de la page Paramètres pilotent uniquement les actionneurs actuellement passés en automatique.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            {automationCards.map((card) => {
              const isAutomatic = actuatorModes[card.key];
              return (
                <div key={card.key} className={`rounded-2xl border p-4 ${card.accent}`}>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <div className="mb-1.5 inline-flex rounded-full bg-white p-1.5 shadow-sm">{card.icon}</div>
                      <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold flex-shrink-0 ${
                      isAutomatic ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isAutomatic ? (card.enabled ? 'Auto actif' : 'Auto (règle coupée)') : 'Manuel'}
                    </span>
                  </div>

                  <div className="space-y-1.5 rounded-xl bg-white/90 p-3 text-xs text-gray-700">
                    {card.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>

                  <div className="mt-2 space-y-1 rounded-xl bg-white/70 p-3 text-xs text-gray-500">
                    {card.live.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}