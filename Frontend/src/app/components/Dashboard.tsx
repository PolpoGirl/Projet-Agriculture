import { type ComponentType, useEffect, useRef } from 'react';
import { AlertTriangle, Activity, Cpu, Droplets, Wind, Thermometer, Sun } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

// ─── Icons ────────────────────────────────────────────────────────────────────

function HumidityIcon({ percentage }: { percentage: number }) {
  const fillY = 65 - (percentage / 100) * 55;
  const waveAmp = 4;
  const animDur = 2.8 - (percentage / 100) * 1.2;
  const dropPath = "M46,60 Q46,30 30,10 Q14,-10 14,30 Q14,60 30,75 Q46,60 46,60Z";
  const wavePath = (xOffset = 0) =>
    `M${xOffset - 32},${fillY} Q${xOffset - 16},${fillY - waveAmp} ${xOffset},${fillY} Q${xOffset + 16},${fillY + waveAmp} ${xOffset + 32},${fillY} L${xOffset + 32},80 L${xOffset - 32},80Z`;
  const color = percentage < 40 ? "#85B7EB" : percentage < 70 ? "#378ADD" : "#185FA5";
  const textColor = percentage < 70 ? "#185FA5" : "#0C447C";

  return (
    <svg width="60" height="90" viewBox="0 0 60 90">
      <defs>
        <clipPath id={`hum-clip-${percentage}`}>
          <path d={dropPath} />
        </clipPath>
        <style>{`
          @keyframes wave-hum-${percentage} { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          @keyframes floatup-hum-${percentage} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
          .drop-hum-${percentage} { animation: floatup-hum-${percentage} 3s ease-in-out infinite; }
          .wave-hum-${percentage} { animation: wave-hum-${percentage} ${animDur}s l
          inear infinite; }
        `}</style>
      </defs>
      <g className={`drop-hum-${percentage}`}>
        <path d={dropPath} fill="none" stroke="#B5D4F4" strokeWidth="1.5" />
        <rect x="14" y="10" width="32" height={fillY - 10} fill="#E6F1FB" opacity="0.5" clipPath={`url(#hum-clip-${percentage})`} />
        <g clipPath={`url(#hum-clip-${percentage})`}>
          <g className={`wave-hum-${percentage}`}>
            <path d={wavePath(0)}  fill={color} opacity="0.9" />
            <path d={wavePath(64)} fill={color} opacity="0.9" />
          </g>
        </g>
        <text x="30" y="85" textAnchor="middle" fontSize="10" fontWeight="600" fill={textColor}>{percentage}%</text>
      </g>
    </svg>
  );
}

function LightIcon({ percentage }: { percentage: number }) {
  const color = percentage < 40 ? "#FAC775" : percentage < 70 ? "#EF9F27" : "#BA7517";
  const textColor = percentage < 70 ? "#854F0B" : "#633806";
  const animDur = 10 - (percentage / 100) * 5;

  return (
    <svg width="60" height="90" viewBox="0 0 60 90">
      <defs>
        <style>{`
          @keyframes rotate-light-${percentage} { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes float-light-${percentage} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
          .rays-${percentage} { animation: rotate-light-${percentage} ${animDur}s linear infinite; transform-origin: 30px 38px; transform-box: fill-box; }
          .core-${percentage} { animation: float-light-${percentage} 3s ease-in-out infinite; transform-origin: 30px 38px; transform-box: fill-box; }
        `}</style>
      </defs>
      <g className={`rays-${percentage}`}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 30 + 16 * Math.cos(rad), y1 = 38 + 16 * Math.sin(rad);
          const len = 8 + (percentage / 100) * 8;
          const x2 = 30 + (16 + len) * Math.cos(rad), y2 = 38 + (16 + len) * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeLinecap="round" />;
        })}
      </g>
      <g className={`core-${percentage}`}>
        <circle cx="30" cy="38" r="14" fill="#FAEEDA" stroke={color} strokeWidth="1.5" />
        <circle cx="30" cy="38" r="9" fill={color} />
      </g>
      <text x="30" y="85" textAnchor="middle" fontSize="10" fontWeight="600" fill={textColor}>{percentage}%</text>
    </svg>
  );
}

function TemperatureIcon({ value, min = 10, max = 40 }: { value: number; min?: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const fillY = 54 - (pct / 100) * 46;
  const color = pct < 33 ? "#85B7EB" : pct < 66 ? "#EF9F27" : "#E24B4A";
  const textColor = pct < 33 ? "#185FA5" : pct < 66 ? "#854F0B" : "#7f1d1d";
  const id = `thermo-clip-${Math.round(value)}`;

  return (
    <svg width="60" height="90" viewBox="0 0 60 90">
      <defs>
        <clipPath id={id}>
          <rect x="24" y="8" width="12" height="46" rx="6" />
        </clipPath>
      </defs>
      <rect x="24" y="8" width="12" height="46" rx="6" fill="#F1EFE8" stroke="#B4B2A9" strokeWidth="1" />
      <g clipPath={`url(#${id})`}>
        <rect x="26" y={fillY} width="8" height={54 - fillY} fill={color} rx="3" />
      </g>
      <circle cx="30" cy="58" r="9" fill={color} />
      <circle cx="30" cy="58" r="5" fill="white" opacity="0.4" />
      {[20, 28, 36, 44].map((y, i) => (
        <line key={i} x1="38" y1={y} x2="42" y2={y} stroke="#B4B2A9" strokeWidth="1" />
      ))}
      <text x="30" y="85" textAnchor="middle" fontSize="10" fontWeight="600" fill={textColor}>{value.toFixed(0)}°C</text>
    </svg>
  );
}

function CO2Icon({ percentage }: { percentage: number }) {
  const fillY = 56 - (percentage / 100) * 44;
  const color = percentage < 40 ? "#888780" : percentage < 70 ? "#5F5E5A" : "#2C2C2A";
  const textColor = percentage < 70 ? "#444441" : "#2C2C2A";
  const animDur = 2.8 - (percentage / 100) * 1;
  const wavePath = (xOffset = 0) =>
    `M${xOffset},${fillY} Q${xOffset + 11},${fillY - 5} ${xOffset + 22},${fillY} Q${xOffset + 33},${fillY + 5} ${xOffset + 44},${fillY} L${xOffset + 44},60 L${xOffset},60Z`;

  return (
    <svg width="60" height="90" viewBox="0 0 60 90">
      <defs>
        <clipPath id={`co2-clip-${percentage}`}>
          <rect x="8" y="12" width="44" height="48" rx="10" />
        </clipPath>
        <style>{`
          @keyframes wave-co2-${percentage} { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          .co2-wave-${percentage} { animation: wave-co2-${percentage} ${animDur}s linear infinite; }
        `}</style>
      </defs>
      <rect x="8" y="12" width="44" height="48" rx="10" fill="#F1EFE8" stroke="#B4B2A9" strokeWidth="1.5" />
      <g clipPath={`url(#co2-clip-${percentage})`}>
        <g className={`co2-wave-${percentage}`}>
          <path d={wavePath(8)}  fill={color} opacity="0.85" />
          <path d={wavePath(52)} fill={color} opacity="0.85" />
        </g>
      </g>
      <text x="30" y={fillY < 36 ? fillY + 14 : 36} textAnchor="middle" fontSize="11" fontWeight="600"
        fill={fillY < 36 ? "white" : "#2C2C2A"}>CO₂</text>
      <text x="30" y="85" textAnchor="middle" fontSize="10" fontWeight="600" fill={textColor}>{percentage}%</text>
    </svg>
  );
}

function WaterLevelIcon({ percentage }: { percentage: number }) {
  const fillY = 70 - (percentage / 100) * 58;
  const animDur = 2.8 - (percentage / 100) * 1.2;
  const color = percentage < 30 ? "#85B7EB" : percentage < 70 ? "#378ADD" : "#185FA5";
  const textColor = percentage < 70 ? "#185FA5" : "#0C447C";
  const wavePath = (xOffset = 0) =>
    `M${xOffset + 15},${fillY} Q${xOffset + 23},${fillY - 4} ${xOffset + 30},${fillY} Q${xOffset + 37},${fillY + 4} ${xOffset + 45},${fillY} L${xOffset + 45},72 L${xOffset + 15},72Z`;

  return (
    <svg width="60" height="90" viewBox="0 0 60 90">
      <defs>
        <clipPath id={`wl-clip-${percentage}`}>
          <rect x="15" y="10" width="30" height="62" rx="6" />
        </clipPath>
        <style>{`
          @keyframes wave-wl-${percentage} { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          .wl-wave-${percentage} { animation: wave-wl-${percentage} ${animDur}s linear infinite; }
        `}</style>
      </defs>
      <rect x="15" y="10" width="30" height="62" rx="6" fill="#E6F1FB" stroke="#85B7EB" strokeWidth="1.5" />
      <g clipPath={`url(#wl-clip-${percentage})`}>
        <g className={`wl-wave-${percentage}`}>
          <path d={wavePath(0)}  fill={color} opacity="0.9" />
          <path d={wavePath(30)} fill={color} opacity="0.9" />
        </g>
      </g>
      {[20, 30, 40, 50, 60].map((y, i) => (
        <line key={i} x1="44" y1={y} x2="47" y2={y} stroke="#85B7EB" strokeWidth="1" />
      ))}
      <text x="30" y="85" textAnchor="middle" fontSize="10" fontWeight="600" fill={textColor}>{percentage}%</text>
    </svg>
  );
}

function SoilMoistureIcon({ percentage }: { percentage: number }) {
  const fillY = 68 - (percentage / 100) * 26;
  const animDur = 2.5 - (percentage / 100) * 0.8;
  const color = percentage < 30 ? "#85B7EB" : percentage < 70 ? "#378ADD" : "#185FA5";
  const wavePath = (xOffset = 0) =>
    `M${xOffset + 12},${fillY} Q${xOffset + 20},${fillY - 3} ${xOffset + 28},${fillY} Q${xOffset + 36},${fillY + 3} ${xOffset + 44},${fillY} L${xOffset + 44},70 L${xOffset + 12},70Z`;

  return (
    <svg width="60" height="90" viewBox="0 0 60 90">
      <defs>
        <clipPath id={`soil-clip-${percentage}`}>
          <rect x="12" y="42" width="36" height="28" rx="4" />
        </clipPath>
        <style>{`
          @keyframes wave-soil-${percentage} { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          @keyframes sway1-${percentage} { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(8deg)} }
          @keyframes sway2-${percentage} { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-8deg)} }
          @keyframes sway3-${percentage} { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(6deg)} }
          .soil-wave-${percentage} { animation: wave-soil-${percentage} ${animDur}s linear infinite; }
          .sway1-${percentage} { animation: sway1-${percentage} 2.2s ease-in-out infinite; transform-origin: 20px 42px; transform-box: fill-box; }
          .sway2-${percentage} { animation: sway2-${percentage} 2.6s ease-in-out infinite .3s; transform-origin: 30px 42px; transform-box: fill-box; }
          .sway3-${percentage} { animation: sway3-${percentage} 2s ease-in-out infinite .6s; transform-origin: 40px 42px; transform-box: fill-box; }
        `}</style>
      </defs>
      <g className={`sway1-${percentage}`}>
        <line x1="20" y1="42" x2="20" y2="26" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="18" cy="22" rx="5" ry="8" fill="#639922" transform="rotate(-20,18,22)" />
      </g>
      <g className={`sway2-${percentage}`}>
        <line x1="30" y1="42" x2="30" y2="22" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="30" cy="17" rx="5" ry="9" fill="#639922" />
      </g>
      <g className={`sway3-${percentage}`}>
        <line x1="40" y1="42" x2="40" y2="27" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="42" cy="23" rx="5" ry="8" fill="#639922" transform="rotate(20,42,23)" />
      </g>
      <rect x="12" y="42" width="36" height="28" rx="4" fill="#B4B2A9" />
      <g clipPath={`url(#soil-clip-${percentage})`}>
        <g className={`soil-wave-${percentage}`}>
          <path d={wavePath(0)}  fill={color} opacity="0.6" />
          <path d={wavePath(32)} fill={color} opacity="0.6" />
        </g>
      </g>
      <text x="30" y="85" textAnchor="middle" fontSize="10" fontWeight="600" fill="#185FA5">{percentage}%</text>
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SensorDef = {
  key: string;
  contextKey: 'soil' | 'temp' | 'hum' | 'light' | 'gas' | 'water';
  unit: string;
  color: 'blue' | 'red' | 'cyan' | 'yellow' | 'gray';
  icon: ComponentType<any>;
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-green-100 rounded-xl shadow-xl p-3 text-xs">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-gray-500">{p.name}:</span>
            <span className="font-semibold text-gray-900">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { t } = useLanguage();
  const { sensors, actuators, loading, error, activeAlerts, thresholds } = useData();

  const historyRef = useRef<typeof sensors[]>([]);
  useEffect(() => {
    historyRef.current = [...historyRef.current.slice(-47), sensors];
  }, [sensors]);
  const historicalData = historyRef.current;

  const sensorDefs: SensorDef[] = [
    { key: 'soilMoisture', contextKey: 'soil',  unit: '%',   color: 'blue',   icon: SoilMoistureIcon },
    { key: 'temperature',  contextKey: 'temp',  unit: '°C',  color: 'red',    icon: TemperatureIcon  },
    { key: 'humidity',     contextKey: 'hum',   unit: '%',   color: 'cyan',   icon: HumidityIcon     },
    { key: 'light',        contextKey: 'light', unit: 'lux', color: 'yellow', icon: LightIcon        },
    { key: 'co2',          contextKey: 'gas',   unit: 'ppm', color: 'gray',   icon: CO2Icon          },
    { key: 'waterLevel',   contextKey: 'water', unit: '%',   color: 'blue',   icon: WaterLevelIcon   },
  ];

  // Configuration des pourcentages d'affichage des capteurs (modifiable)
  const PERCENTAGE_RANGES = {
    temp: { min: 0, max: 50 },
    hum: { min: 0, max: 100 },
    soil: { min: 0, max: 100 },
    light: { min: 0, max: 1000 },
    gas: { min: 0, max: 2000 },
    water: { min: 0, max: 100 },
  };

  const chartData = historicalData.map((snap, i) => ({
    name: i.toString(),
    soilMoisture: snap.soil,
    temperature: snap.temp,
    co2: snap.gas / 10,
  }));

  // ─── Design tokens per sensor color ──────────────────────────────────────

  const colorTokens: Record<string, {
    gradient: string;
    border: string;
    badge: string;
    accent: string;
    glow: string;
    icon: string;
    sensorName: string;
    value: string;
  }> = {
    blue: {
      gradient:    'from-blue-50 to-blue-100/60',
      border:      'border-blue-200',
      badge:       'bg-blue-200 text-blue-900',
      accent:      'bg-blue-500',
      glow:        '0 8px 32px -4px rgba(59,130,246,0.30)',
      icon:        'bg-blue-50 ring-1 ring-blue-200',
      sensorName:  'text-blue-700',
      value:       'text-gray-950',
    },
    red: {
      gradient:    'from-red-50 to-orange-50/60',
      border:      'border-red-200',
      badge:       'bg-red-200 text-red-900',
      accent:      'bg-red-500',
      glow:        '0 8px 32px -4px rgba(239,68,68,0.30)',
      icon:        'bg-red-50 ring-1 ring-red-200',
      sensorName:  'text-red-700',
      value:       'text-gray-950',
    },
    cyan: {
      gradient:    'from-cyan-50 to-sky-50/60',
      border:      'border-cyan-200',
      badge:       'bg-cyan-200 text-cyan-900',
      accent:      'bg-cyan-500',
      glow:        '0 8px 32px -4px rgba(6,182,212,0.30)',
      icon:        'bg-cyan-50 ring-1 ring-cyan-200',
      sensorName:  'text-cyan-700',
      value:       'text-gray-950',
    },
    yellow: {
      gradient:    'from-yellow-50 to-amber-50/60',
      border:      'border-yellow-300',
      badge:       'bg-yellow-200 text-yellow-900',
      accent:      'bg-yellow-400',
      glow:        '0 8px 32px -4px rgba(234,179,8,0.30)',
      icon:        'bg-yellow-50 ring-1 ring-yellow-200',
      sensorName:  'text-yellow-700',
      value:       'text-gray-950',
    },
    gray: {
      gradient:    'from-slate-50 to-gray-100/60',
      border:      'border-slate-200',
      badge:       'bg-slate-200 text-slate-800',
      accent:      'bg-slate-500',
      glow:        '0 8px 32px -4px rgba(100,116,139,0.30)',
      icon:        'bg-slate-50 ring-1 ring-slate-200',
      sensorName:  'text-slate-600',
      value:       'text-gray-950',
    },
  };

  const actuatorIcons: Record<string, React.ReactNode> = {
    pump:   <Droplets size={18} />,
    fan:    <Wind size={18} />,
    heater: <Thermometer size={18} />,
    light:  <Sun size={18} />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/40 to-teal-50/30 font-sans">

     

      {/* ── Main content ── */}
      <main className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 space-y-5 sm:space-y-6">

        {/* ── Error banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="p-1.5 bg-red-100 rounded-lg flex-shrink-0">
              <AlertTriangle size={16} className="text-red-700" />
            </div>
            <p className="text-red-800 text-sm font-semibold">{error}</p>
          </div>
        )}

       

        {/* ── Thresholds ── */}
        <div className="bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-green-50 flex items-center gap-2">
            <Activity size={15} className="text-green-700" />
            <h3 className="text-green-900 font-bold text-sm">Seuils backend</h3>
          </div>
          {/* Scrollable on small screens, grid on large */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 min-w-[360px] divide-x divide-green-50">
              {[
                { label: `${t('soilMoisture')} min`, value: `${thresholds.hum_sol_min}%` },
                { label: `${t('soilMoisture')} max`, value: `${thresholds.hum_sol_max}%` },
                { label: `${t('temperature')} max`,  value: `${thresholds.temp_max}°C`   },
                { label: 'CO₂ max',                  value: `${thresholds.co2_max} ppm`  },
                { label: `${t('light')} min`,         value: `${thresholds.lux_min} lux` },
                { label: `${t('waterLevel')} min`,    value: `${thresholds.niveau_eau_min}%` },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center py-4 px-2 sm:px-3">
                  <span className="text-xs text-gray-1000 text-center leading-tight mb-1 font-medium">{item.label}</span>
                  <span className="text-base sm:text-lg font-semibold text-green-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sensor Cards ── */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {sensorDefs.map((sensor) => {
            const IconComponent = sensor.icon;
            const value = sensors[sensor.contextKey];
            const tokens = colorTokens[sensor.color];
            const range = PERCENTAGE_RANGES[sensor.contextKey];
            const percentage = Math.min(100, Math.max(0, Math.round(((value - range.min) / (range.max - range.min)) * 100)));

            return (
              <div
                key={sensor.key}
                className={`group relative bg-gradient-to-br ${tokens.gradient} border ${tokens.border} rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}
                style={{ boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = tokens.glow; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px -2px rgba(0,0,0,0.06)'; }}
              >
                {/* Accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${tokens.accent} opacity-70 rounded-t-2xl`} />

                <div className="flex items-start justify-between gap-3">
                  {/* Icon */}
                  <div className={`${tokens.icon} rounded-xl p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
                    <IconComponent
                      percentage={percentage}
                      value={sensor.contextKey === 'temp' ? value : undefined}
                    />
                  </div>

                  {/* Value + label */}
                  <div className="flex flex-col items-end justify-between flex-1 min-w-0 pt-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tokens.badge} whitespace-nowrap`}>
                      {sensor.unit}
                    </span>
                    <div className="mt-3 sm:mt-4 text-right w-full">
                      <p className={`text-3xl sm:text-4xl font-medium ${tokens.value} group-hover:scale-105 transition-transform duration-300 origin-right leading-none`}>
                        {loading ? (
                          <span className="inline-block w-14 h-8 bg-gray-200 rounded-lg animate-pulse" />
                        ) : (
                          value.toFixed(1)
                        )}
                      </p>
                      {/* Nom du capteur */}
                      <p className={`text-sm sm:text-base font-semibold mt-1.5 ${tokens.sensorName} truncate`}>
                        {t(sensor.key)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Chart ── */}
        <div className="bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-green-50">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-green-700" />
                <h3 className="text-green-900 font-bold text-sm">
                  {t('evolution')} — {t('last24h')}
                </h3>
              </div>
              {/* Legend — wraps on mobile */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />
                  {t('soilMoisture')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-red-500 inline-block rounded" />
                  {t('temperature')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-500 inline-block rounded" />
                  CO₂ /10
                </span>
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-4 pt-5 sm:pt-6">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="soilMoisture" stroke="#3b82f6" strokeWidth={2} name={t('soilMoisture')} dot={false} />
                <Line type="monotone" dataKey="temperature"  stroke="#ef4444" strokeWidth={2} name={t('temperature')}  dot={false} />
                <Line type="monotone" dataKey="co2"          stroke="#64748b" strokeWidth={2} name={`${t('co2')} /10`} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Actuators ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={15} className="text-green-700" />
            <h3 className="text-green-900 font-bold text-sm">Actionneurs</h3>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {Object.entries(actuators).map(([key, isActive]) => (
              <div
                key={key}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all duration-200 ${
                  isActive
                    ? 'bg-green-50 border-green-200 shadow-sm shadow-green-100'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {actuatorIcons[key] ?? <Cpu size={18} />}
                  </div>
                  <span className={`text-sm font-semibold truncate ${isActive ? 'text-green-900' : 'text-gray-700'}`}>
                    {t(key)}
                  </span>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${
                  isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`} />
                  {t(isActive ? 'active' : 'inactive')}
                </span>
              </div>
            ))}
          </div>
           {/* ── Active alerts ── */}
        {activeAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <AlertTriangle size={15} className="text-orange-700" />
              </div>
              <h3 className="text-orange-900 font-bold text-sm">
                {t('activeAlerts')} ({activeAlerts.length})
              </h3>
            </div>
            <ul className="space-y-1.5">
              {activeAlerts.map((alert) => (
                <li key={alert.type_alerte} className="flex items-start gap-2 text-sm text-orange-800 font-medium">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  {alert.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>

      </main>
    </div>
  );
}