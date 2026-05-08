import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  fr: {
    login: 'Connexion',
    username: 'Identifiant',
    password: 'Mot de passe',
    loginButton: 'Se connecter',
    dashboard: 'Tableau de bord',
    actuators: 'Actionneurs',
    history: 'Historique',
    logout: 'Déconnexion',
    soilMoisture: 'Humidité du sol',
    temperature: 'Température',
    humidity: 'Humidité ambiante',
    light: 'Luminosité',
    co2: 'CO₂',
    waterLevel: 'Niveau d\'eau',
    pump: 'Pompe irrigation',
    ventilation: 'Ventilation',
    lighting: 'Éclairage',
    activeAlerts: 'Alertes actives',
    manualControl: 'Contrôle manuel',
    autoControl: 'Contrôle automatique',
    on: 'Activé',
    off: 'Désactivé',
    active: 'Actif',
    inactive: 'Inactif',
    sensorReadings: 'Mesures capteurs',
    actions: 'Actions',
    date: 'Date',
    time: 'Heure',
    type: 'Type',
    value: 'Valeur',
    filter: 'Filtrer',
    export: 'Exporter CSV',
    alert: 'Alerte',
    alerts: 'Alertes',
    automatic: 'Automatique',
    manual: 'Manuel',
    emptyTank: 'Réservoir vide',
    highCO2: 'CO₂ élevé',
    lowMoisture: 'Humidité sol basse',
    evolution: 'Évolution',
    last24h: 'Dernières 24h',
    actionConfirmed: 'Action confirmée',
    trigger: 'Déclencheur',
  },
  en: {
    login: 'Login',
    username: 'Username',
    password: 'Password',
    loginButton: 'Sign in',
    dashboard: 'Dashboard',
    actuators: 'Actuators',
    history: 'History',
    logout: 'Logout',
    soilMoisture: 'Soil Moisture',
    temperature: 'Temperature',
    humidity: 'Ambient Humidity',
    light: 'Light',
    co2: 'CO₂',
    waterLevel: 'Water Level',
    pump: 'Irrigation Pump',
    ventilation: 'Ventilation',
    lighting: 'Lighting',
    activeAlerts: 'Active Alerts',
    manualControl: 'Manual Control',
    autoControl: 'Automatic Control',
    on: 'On',
    off: 'Off',
    active: 'Active',
    inactive: 'Inactive',
    sensorReadings: 'Sensor Readings',
    actions: 'Actions',
    date: 'Date',
    time: 'Time',
    type: 'Type',
    value: 'Value',
    filter: 'Filter',
    export: 'Export CSV',
    alert: 'Alert',
    alerts: 'Alerts',
    automatic: 'Automatic',
    manual: 'Manual',
    emptyTank: 'Empty tank',
    highCO2: 'High CO₂',
    lowMoisture: 'Low soil moisture',
    evolution: 'Evolution',
    last24h: 'Last 24h',
    actionConfirmed: 'Action confirmed',
    trigger: 'Trigger',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('fr');

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
