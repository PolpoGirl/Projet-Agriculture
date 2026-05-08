import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Download, RefreshCw, Clock, Activity, Zap, Bell, ChevronDown, ChevronUp } from 'lucide-react';

import { getActionneurs, getAlertes, getHistoriqueMesures } from '../../api/axios';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Types & Adapters ── INCHANGÉS ────────────────────────────────────────────

interface HistoryEntry {
  id: number | string;
  timestamp: string;
  type: 'sensor' | 'action' | 'alert';
  sensorData?: {
    soilMoisture: number;
    temperature: number;
    humidity: number;
    light: number;
    co2: number;
    waterLevel: number;
  };
  action?: string;
  trigger?: string;
  severity?: string;
  message?: string;
  threshold?: number | null;
  value?: number | null;
}

function adaptMesures(data: any[]): HistoryEntry[] {
  return data.map((m) => ({
    id: m.id,
    timestamp: m.timestamp ?? m.created_at,
    type: 'sensor',
    sensorData: {
      soilMoisture: m.humidite_sol ?? m.soil_moisture ?? 0,
      temperature: m.temperature ?? 0,
      humidity: m.humidite_air ?? m.humidity ?? 0,
      light: m.luminosite ?? m.light ?? 0,
      co2: m.co2 ?? 0,
      waterLevel: m.niveau_eau ?? m.water_level ?? 0,
    },
  }));
}

function adaptActionneurs(data: any[]): HistoryEntry[] {
  return data
    .filter((a) => a.dernier_changement ?? a.updated_at)
    .map((a) => ({
      id: a.id,
      timestamp: a.dernier_changement ?? a.updated_at ?? new Date().toISOString(),
      type: 'action',
      action: `${a.nom ?? a.name} -> ${(a.etat_actuel ?? a.etat ?? a.state) ? 'ON' : 'OFF'}`,
      trigger: a.mode_automatique ? 'automatic' : 'manual',
    }));
}

function adaptAlertes(data: any[]): HistoryEntry[] {
  return data.map((a) => ({
    id: `alert-${a.id}`,
    timestamp: a.timestamp,
    type: 'alert',
    severity: a.niveau,
    message: a.message,
    threshold: a.seuil_valeur,
    value: a.valeur,
  }));
}

function exportToCSV(entries: HistoryEntry[]) {
  const headers = ['Timestamp', 'Type', 'Action', 'Trigger', 'Alert', 'Severity', 'Value', 'Threshold'];
  const rows = entries.map((e) => [
    new Date(e.timestamp).toLocaleString(), e.type,
    e.sensorData?.soilMoisture.toFixed(1) ?? '',
    e.sensorData?.temperature.toFixed(1) ?? '',
    e.sensorData?.humidity.toFixed(1) ?? '',
    e.sensorData?.light.toFixed(0) ?? '',
    e.sensorData?.co2.toFixed(0) ?? '',
    e.sensorData?.waterLevel.toFixed(1) ?? '',
    e.action ?? '', e.trigger ?? '', e.message ?? '',
    e.severity ?? '', e.value ?? '', e.threshold ?? '',
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `historique_${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

function MobileCard({ entry, t }: { entry: HistoryEntry; t: (k: string) => string }) {
  const [expanded, setExpanded] = useState(false);

  const typeConfig = {
    sensor: { bg: 'bg-blue-50 border-blue-200',   badge: 'bg-blue-100 text-blue-700 border-blue-200',   icon: <Activity size={13} />, label: 'Capteur'  },
    action: { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Zap size={13} />,      label: 'Action'   },
    alert:  { bg: 'bg-red-50 border-red-200',      badge: 'bg-red-100 text-red-700 border-red-200',      icon: <Bell size={13} />,     label: 'Alerte'   },
  }[entry.type];

  const date = new Date(entry.timestamp);
  const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${entry.type === 'alert' ? 'border-red-200' : 'border-gray-100'}`}>
      {/* Row principale */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icône type */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${typeConfig.bg}`}>
          <span className={`text-xs ${typeConfig.badge.split(' ').slice(1).join(' ')}`}>{typeConfig.icon}</span>
        </div>

        {/* Infos principales */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${typeConfig.badge}`}>
              {typeConfig.icon} {typeConfig.label}
            </span>
            {entry.type === 'alert' && entry.severity && (
              <span className="text-xs font-bold text-red-600 uppercase">{entry.severity}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">{dateStr} · {timeStr}</p>
        </div>

        {/* Expand toggle si infos supplémentaires */}
        {(entry.action || entry.message || entry.trigger) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Détails dépliables */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50/60">
          {entry.action && (
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">Action</span>
              <span className="text-xs font-medium text-orange-700 bg-orange-50 border border-orange-100 px-2 py-1 rounded-lg">
                {entry.action}
              </span>
            </div>
          )}
          {entry.trigger && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16 flex-shrink-0">Déclench.</span>
              <span className="text-xs text-gray-600">{t(entry.trigger)}</span>
            </div>
          )}
          {entry.message && (
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">Message</span>
              <span className="text-xs text-red-700">{entry.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Component principal ──────────────────────────────────────────────────────

export default function History() {
  const { t } = useLanguage();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'sensor' | 'action' | 'alert'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capteurId] = useState<number>(1);
  const [heures] = useState<number>(24);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mesures, actionneurs, alertes] = await Promise.all([
        getHistoriqueMesures(capteurId, heures),
        getActionneurs(),
        getAlertes(100),
      ]);
      const entries: HistoryEntry[] = [
        ...adaptMesures(Array.isArray(mesures) ? mesures : []),
        ...adaptActionneurs(Array.isArray(actionneurs) ? actionneurs : []),
        ...adaptAlertes(Array.isArray(alertes) ? alertes : []),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistory(entries);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? 'Erreur reseau');
    } finally {
      setLoading(false);
    }
  }, [capteurId, heures]);

  useEffect(() => { void fetchHistory(); }, [fetchHistory]);

  const filteredHistory = history
    .filter((entry) => filterType === 'all' || entry.type === filterType)
    .slice(0, 100);

  const counts = {
    sensor: history.filter(e => e.type === 'sensor').length,
    action: history.filter(e => e.type === 'action').length,
    alert:  history.filter(e => e.type === 'alert').length,
  };

  const typeBadge = {
    sensor: { bg: 'bg-blue-100 text-blue-700 border border-blue-200',        icon: <Activity size={11} /> },
    action: { bg: 'bg-orange-100 text-orange-700 border border-orange-200',  icon: <Zap size={11} />      },
    alert:  { bg: 'bg-red-100 text-red-700 border border-red-200',           icon: <Bell size={11} />     },
  };

  const filterTabs: { value: 'all' | 'action' | 'alert'; label: string; count: number }[] = [
    { value: 'all',    label: 'Tous',          count: history.length  },
    { value: 'action', label: t('actions'),    count: counts.action   },
    { value: 'alert',  label: t('alerts'),     count: counts.alert    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/40 to-teal-50/30 p-4 md:p-6 lg:p-8 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-green-900 tracking-tight">{t('history')}</h2>
          <p className="text-xs text-green-600/70 mt-0.5">Dernières {heures}h · capteur #{capteurId}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => void fetchHistory()}
            disabled={loading}
            className="flex items-center gap-1.5 bg-white border border-green-200 hover:border-green-400 text-green-700 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{loading ? 'Chargement...' : 'Rafraîchir'}</span>
          </button>
          <button
            onClick={() => exportToCSV(filteredHistory)}
            disabled={filteredHistory.length === 0}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Download size={14} />
            <span className="hidden sm:inline">{t('export')}</span>
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {[
          { label: 'Total',   value: history.length, icon: <Clock size={15} />,    bg: 'bg-white',     text: 'text-gray-700',   border: 'border-gray-200'   },
          { label: 'Actions', value: counts.action,  icon: <Zap size={15} />,      bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
          { label: 'Alertes', value: counts.alert,   icon: <Bell size={15} />,     bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border ${s.border} rounded-xl px-3 py-3 flex items-center justify-between shadow-sm`}>
            <div>
              <p className="text-[10px] text-gray-400 mb-0.5 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
            </div>
            <div className={`${s.text} opacity-50`}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1 bg-white border border-green-100 rounded-xl p-1 shadow-sm w-full sm:w-fit overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none justify-center ${
              filterType === tab.value
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              filterType === tab.value ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════ MOBILE : cards ══════════════ */}
      <div className="md:hidden space-y-2">
        {loading && history.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <RefreshCw size={28} className="animate-spin text-green-400" />
            <span className="text-sm">Chargement des données...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <Clock size={28} />
            <span className="text-sm">Aucune donnée disponible</span>
          </div>
        ) : (
          filteredHistory.map((entry, index) => (
            <MobileCard key={entry.id ?? index} entry={entry} t={t} />
          ))
        )}
      </div>

      {/* ══════════════ DESKTOP : table ══════════════ */}
      <div className="hidden md:block bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-green-700 to-emerald-700 text-white">
                {[t('time'), t('type'), t('actions'), t('trigger'), t('alert')].map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <RefreshCw size={24} className="animate-spin text-green-400" />
                      <span className="text-sm">Chargement des données...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Clock size={24} />
                      <span className="text-sm">Aucune donnée disponible</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((entry, index) => (
                  <tr
                    key={entry.id ?? index}
                    className={`transition-colors duration-150 hover:bg-green-50/50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${typeBadge[entry.type].bg}`}>
                        {typeBadge[entry.type].icon} {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {entry.action
                        ? <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-lg text-xs font-medium border border-orange-100">{entry.action}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {entry.trigger
                        ? <span className="text-xs text-gray-600">{t(entry.trigger)}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-sm max-w-[180px]">
                      {entry.type === 'alert'
                        ? <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">
                            <Bell size={10} /> {entry.severity}: {entry.message}
                          </span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {filteredHistory.length} / {history.length} entrées affichées
          </p>
          {filteredHistory.length > 0 && (
            <button
              onClick={() => exportToCSV(filteredHistory)}
              className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 font-medium transition-colors"
            >
              <Download size={12} /> Exporter la sélection
            </button>
          )}
        </div>
      </div>

      {/* Footer mobile */}
      <div className="md:hidden flex items-center justify-between pt-1">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-700">{filteredHistory.length}</span> / {history.length} entrées
        </p>
        {filteredHistory.length > 0 && (
          <button
            onClick={() => exportToCSV(filteredHistory)}
            className="flex items-center gap-1.5 text-xs text-green-700 font-medium"
          >
            <Download size={12} /> Exporter
          </button>
        )}
      </div>

    </div>
  );
}