import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  controlerActionneur,
  getActionneurs,
  getAlertesActives,
  getAutomationConfig,
  getDernieresMesures,
  setAutomationMode,
} from '../../api/axios';

interface SensorData {
  temp: number;
  hum: number;
  soil: number;
  light: number;
  water: number;
  gas: number;
}

interface ActuatorState {
  pump: boolean;
  lamp: boolean;
  ventilation: boolean;
  servo: boolean;
}

type ActuatorKey = 'pump' | 'lamp' | 'ventilation' | 'servo';
type AutomatableActuatorKey = Exclude<ActuatorKey, 'servo'>;
type ActuatorModes = Record<AutomatableActuatorKey, boolean>;

interface ThresholdSettings {
  hum_sol_min: number;
  hum_sol_max: number;
  temp_max: number;
  co2_max: number;
  lux_min: number;
  niveau_eau_min: number;
  auto_irrigation: boolean;
  auto_ventilation: boolean;
  auto_lighting: boolean;
  date_modification?: string;
}

interface ActiveAlert {
  type_alerte: string;
  message: string;
  niveau: 'info' | 'warning' | 'danger';
  capteur_type: string;
  valeur: number;
  seuil_valeur: number;
  unite: string;
}

interface ActuatorLogEntry {
  id: string;
  actuator: ActuatorKey;
  action: 'ON' | 'OFF';
  username: string;
  date: string;
  time: string;
  timestamp: string;
}

interface DataContextType {
  sensors: SensorData;
  actuators: ActuatorState;
  actuatorModes: ActuatorModes;
  actuatorLogs: ActuatorLogEntry[];
  thresholds: ThresholdSettings;
  activeAlerts: ActiveAlert[];
  autoMode: boolean;
  loading: boolean;
  error: string | null;
  setActuatorMode: (key: AutomatableActuatorKey, value: boolean) => Promise<void>;
  toggleActuator: (key: ActuatorKey, user?: string) => Promise<void>;
  exportLogsJSON: () => void;
  refreshSensors: () => Promise<void>;
  refreshActuators: () => Promise<void>;
}

const defaultSensors: SensorData = { temp: 0, hum: 0, soil: 0, light: 0, water: 0, gas: 0 };
const defaultActuators: ActuatorState = { pump: false, lamp: false, ventilation: false, servo: false };
const defaultActuatorModes: ActuatorModes = { pump: false, lamp: false, ventilation: false };
const defaultThresholds: ThresholdSettings = {
  hum_sol_min: 20,
  hum_sol_max: 80,
  temp_max: 35,
  co2_max: 1000,
  lux_min: 100,
  niveau_eau_min: 10,
  auto_irrigation: true,
  auto_ventilation: true,
  auto_lighting: true,
};
const ACTUATOR_LOGS_STORAGE_KEY = 'actuator_logs';
const getStoredToken = () =>
  localStorage.getItem('token') || localStorage.getItem('access_token');

const getStoredActuatorLogs = (): ActuatorLogEntry[] => {
  try {
    const raw = localStorage.getItem(ACTUATOR_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const DataContext = createContext<DataContextType>({} as DataContextType);

export function DataProvider({ children }: { children: ReactNode }) {
  const [sensors, setSensors] = useState<SensorData>(defaultSensors);
  const [actuators, setActuators] = useState<ActuatorState>(defaultActuators);
  const [actuatorModes, setActuatorModes] = useState<ActuatorModes>(defaultActuatorModes);
  const [actuatorLogs, setActuatorLogs] = useState<ActuatorLogEntry[]>(getStoredActuatorLogs);
  const [thresholds, setThresholds] = useState<ThresholdSettings>(defaultThresholds);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(ACTUATOR_LOGS_STORAGE_KEY, JSON.stringify(actuatorLogs));
  }, [actuatorLogs]);

  const refreshActuators = useCallback(async () => {
    if (!getStoredToken()) {
      return;
    }

    try {
      const [actuatorData, automationData] = await Promise.all([
        getActionneurs(),
        getAutomationConfig(),
      ]);

      const nextActuators: ActuatorState = { ...defaultActuators };
      const nextModes: ActuatorModes = { ...defaultActuatorModes };

      actuatorData.forEach((item: { type: string; etat_actuel?: boolean; mode_automatique?: boolean }) => {
        if (item.type === 'pompe') nextActuators.pump = Boolean(item.etat_actuel);
        if (item.type === 'pompe') nextModes.pump = Boolean(item.mode_automatique);
        if (item.type === 'led') nextActuators.lamp = Boolean(item.etat_actuel);
        if (item.type === 'led') nextModes.lamp = Boolean(item.mode_automatique);
        if (item.type === 'ventilateur') nextActuators.ventilation = Boolean(item.etat_actuel);
        if (item.type === 'ventilateur') nextModes.ventilation = Boolean(item.mode_automatique);
        if (item.type === 'servo') nextActuators.servo = Boolean(item.etat_actuel);
      });

      const apiModes = automationData?.actuator_modes ?? {};
      nextModes.pump = Boolean(apiModes.pump ?? nextModes.pump);
      nextModes.lamp = Boolean(apiModes.lamp ?? nextModes.lamp);
      nextModes.ventilation = Boolean(apiModes.ventilation ?? nextModes.ventilation);

      setActuators(nextActuators);
      setActuatorModes(nextModes);
      setThresholds({
        ...defaultThresholds,
        ...(automationData.settings ?? {}),
      });
      setError(null);
    } catch {
      setError("Impossible de charger l'etat des actionneurs");
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    if (!getStoredToken()) {
      return;
    }

    try {
      const data = await getAlertesActives();
      setActiveAlerts(Array.isArray(data) ? data : []);
    } catch {
      setError("Impossible de charger les alertes");
    }
  }, []);

  const refreshSensors = useCallback(async () => {
    if (!getStoredToken()) {
      return;
    }

    try {
      const data = await getDernieresMesures();
      const map: Record<string, number> = {};
      const typeToKey: Record<string, keyof SensorData> = {
        temperature: 'temp',
        humidite_air: 'hum',
        humidite_sol: 'soil',
        luminosite: 'light',
        niveau_eau: 'water',
        co2: 'gas',
      };
      data.forEach((item: { type: string; valeur: number }) => {
        const key = typeToKey[item.type];
        if (key) map[key] = item.valeur;
      });
      setSensors(prev => ({ ...prev, ...map }));
      await refreshActuators();
      await refreshAlerts();
      setError(null);
    } catch {
      setError("Impossible de charger les donnees capteurs");
    }
  }, [refreshActuators, refreshAlerts]);

  // WebSocket supprimé - données via polling uniquement

  useEffect(() => {
    if (!getStoredToken()) return;

    void refreshSensors();
    const interval = setInterval(() => {
      if (!getStoredToken()) {
        clearInterval(interval);
        return;
      }

      void refreshSensors();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshSensors]);

  const exportLogsJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(actuatorLogs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `actuator_logs_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [actuatorLogs]);

  const setActuatorMode = useCallback(async (key: AutomatableActuatorKey, value: boolean) => {
    setLoading(true);
    try {
      setActuatorModes(prev => ({ ...prev, [key]: value }));
      await setAutomationMode(value ? 'auto' : 'manual', key);
      await refreshActuators();
      await refreshAlerts();
      setError(null);
    } catch {
      setError(`Impossible de changer le mode de ${key}`);
      await refreshActuators();
    } finally {
      setLoading(false);
    }
  }, [refreshActuators, refreshAlerts]);

  const toggleActuator = useCallback(async (
    key: ActuatorKey,
    user?: string
  ) => {
    if (key !== 'servo' && actuatorModes[key]) return;

    const nouvelEtat = !actuators[key];
    setActuators(prev => ({ ...prev, [key]: nouvelEtat }));
    setLoading(true);

    try {
      await controlerActionneur(key, nouvelEtat);

      const now = new Date();
      setActuatorLogs(prev => [
        {
          id: `${now.getTime()}-${key}`,
          actuator: key,
          action: nouvelEtat ? 'ON' : 'OFF',
          username: user || 'inconnu',
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
          timestamp: now.toISOString(),
        },
        ...prev,
      ]);

      await refreshActuators();
      await refreshAlerts();
      setError(null);
    } catch {
      setActuators(prev => ({ ...prev, [key]: !nouvelEtat }));
      setError(`Erreur : impossible de controler ${key}`);
    } finally {
      setLoading(false);
    }
  }, [actuators, actuatorModes, refreshActuators, refreshAlerts]);

  const autoMode = actuatorModes.pump && actuatorModes.lamp && actuatorModes.ventilation;

  return (
    <DataContext.Provider value={{
      sensors,
      actuators,
      actuatorModes,
      actuatorLogs,
      thresholds,
      activeAlerts,
      autoMode,
      loading,
      error,
      setActuatorMode,
      toggleActuator,
      exportLogsJSON,
      refreshSensors,
      refreshActuators,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
