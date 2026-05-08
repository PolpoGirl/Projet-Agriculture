// Mock API complet - Frontend autonome sans backend

// ==================== STORE INTERNE ====================
type SensorKey = 'temp' | 'hum' | 'soil' | 'light' | 'water' | 'gas';

const defaultSensors: Record<SensorKey, number> = {
  temp: 22,
  hum: 65,
  soil: 45,
  light: 300,
  water: 80,
  gas: 400,
};

let sensorsState = { ...defaultSensors };

const defaultActuators = [
  { type: 'pompe', etat_actuel: false, mode_automatique: true },
  { type: 'led', etat_actuel: false, mode_automatique: true },
  { type: 'ventilateur', etat_actuel: false, mode_automatique: true },
  { type: 'servo', etat_actuel: false, mode_automatique: false },
];

let actuatorsState = JSON.parse(JSON.stringify(defaultActuators));

const defaultThresholds = {
  hum_sol_min: 20,
  hum_sol_max: 80,
  temp_max: 35,
  co2_max: 1000,
  lux_min: 100,
  niveau_eau_min: 10,
  auto_irrigation: true,
  auto_ventilation: true,
  auto_lighting: true,
  date_modification: new Date().toISOString(),
};

let thresholdsState = { ...defaultThresholds };

let alertsState = [
  {
    id: 1,
    type_alerte: 'temperature',
    message: 'Température élevée',
    niveau: 'warning',
    capteur_type: 'temperature',
    valeur: 36,
    seuil_valeur: 35,
    unite: '°C',
    date_creation: new Date().toISOString(),
  },
];

let notificationsState = [
  {
    id: 1,
    titre: 'Bienvenue',
    message: 'Vous êtes connecté au système AgriSmart',
    lue: false,
    date_creation: new Date().toISOString(),
  },
];

// Simulation utilisateurs
let usersState = [
  { id: 1, username: 'admin', role: 'admin', email: 'admin@agrismart.com', first_name: 'Admin', last_name: 'System', date_creation: new Date().toISOString(), receive_notifications: true },
  { id: 2, username: 'user', role: 'user', email: 'user@agrismart.com', first_name: 'Jean', last_name: 'Dupont', date_creation: new Date(Date.now() - 86400000).toISOString(), receive_notifications: false },
];

// ==================== UTILITAIRES ====================
const randomVar = (base: number, variance: number) => Math.round((base + (Math.random() * variance * 2 - variance)) * 10) / 10;

// ==================== FONCTIONS MÉTIER (exportées nommément) ====================
export const getDernieresMesures = () => {
  sensorsState = {
    temp: randomVar(defaultSensors.temp, 2),
    hum: randomVar(defaultSensors.hum, 5),
    soil: randomVar(defaultSensors.soil, 3),
    light: randomVar(defaultSensors.light, 50),
    water: randomVar(defaultSensors.water, 2),
    gas: randomVar(defaultSensors.gas, 30),
  };
  const data = Object.entries(sensorsState).map(([type, valeur]) => ({ type, valeur }));
  return Promise.resolve(data);
};

export const getHistoriqueMesures = (_capteurId: number, _heures = 24) => {
  const historiques = [];
  for (let i = 0; i < 24; i++) {
    historiques.push({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      valeur: randomVar(25, 5),
    });
  }
  return Promise.resolve(historiques);
};

export const getActionneurs = () => {
  return Promise.resolve(actuatorsState.map(a => ({ ...a })));
};

export const controlerActionneur = (actionneur: 'pump' | 'lamp' | 'ventilation' | 'servo', etat: boolean) => {
  const typeMap: Record<string, string> = { pump: 'pompe', lamp: 'led', ventilation: 'ventilateur', servo: 'servo' };
  const type = typeMap[actionneur];
  const idx = actuatorsState.findIndex(a => a.type === type);
  if (idx !== -1) {
    actuatorsState[idx].etat_actuel = etat;
  }
  return Promise.resolve({ success: true, actionneur, etat });
};

export const getAutomationConfig = () => {
  return Promise.resolve({
    settings: { ...thresholdsState },
    actuator_modes: {
      pump: actuatorsState.find(a => a.type === 'pompe')?.mode_automatique ?? true,
      lamp: actuatorsState.find(a => a.type === 'led')?.mode_automatique ?? true,
      ventilation: actuatorsState.find(a => a.type === 'ventilateur')?.mode_automatique ?? true,
    },
  });
};

export const updateAutomationConfig = (payload: Record<string, unknown>) => {
  thresholdsState = { ...thresholdsState, ...payload };
  return Promise.resolve({ success: true });
};

export const setAutomationMode = (mode: 'auto' | 'manual', actionneur?: 'pump' | 'lamp' | 'ventilation') => {
  const typeMap: Record<string, string> = { pump: 'pompe', lamp: 'led', ventilation: 'ventilateur' };
  if (actionneur) {
    const type = typeMap[actionneur];
    const idx = actuatorsState.findIndex(a => a.type === type);
    if (idx !== -1) actuatorsState[idx].mode_automatique = mode === 'auto';
  } else {
    ['pompe', 'led', 'ventilateur'].forEach(type => {
      const idx = actuatorsState.findIndex(a => a.type === type);
      if (idx !== -1) actuatorsState[idx].mode_automatique = mode === 'auto';
    });
  }
  return Promise.resolve({ success: true, mode, actionneur });
};

export const getAlertes = (limit = 50) => Promise.resolve(alertsState.slice(0, limit));
export const getAlertesActives = () => Promise.resolve(alertsState);
export const getNotifications = (limit = 50) => Promise.resolve(notificationsState.slice(0, limit));
export const markNotificationAsRead = (notificationId: number) => {
  const notif = notificationsState.find(n => n.id === notificationId);
  if (notif) notif.lue = true;
  return Promise.resolve({ success: true });
};
export const markAllNotificationsAsRead = () => {
  notificationsState.forEach(n => n.lue = true);
  return Promise.resolve({ success: true });
};

export const getUsers = () => Promise.resolve(usersState.map(u => ({ ...u })));
export const createUser = (payload: any) => {
  const newUser = { id: Date.now(), date_creation: new Date().toISOString(), ...payload };
  usersState.push(newUser);
  return Promise.resolve(newUser);
};
export const updateUser = (id: number, payload: any) => {
  const idx = usersState.findIndex(u => u.id === id);
  if (idx !== -1) usersState[idx] = { ...usersState[idx], ...payload };
  return Promise.resolve({ success: true });
};
export const deleteUser = (id: number) => {
  usersState = usersState.filter(u => u.id !== id);
  return Promise.resolve({ success: true });
};

export const getSecuritySettings = () => Promise.resolve({ receive_notifications: true });
export const updateSecuritySettings = (payload: { receive_notifications: boolean }) => Promise.resolve({ success: true });
export const changePassword = (_payload: any) => Promise.resolve({ success: true });

// ==================== INSTANCE API (pour compatibilité composants utilisant api.get/post/etc.) ====================
const simulateDelay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

const router: Record<string, (params?: any, body?: any) => Promise<any>> = {
  // Capteurs
  'GET|/iot/mesures/dernieres/': () => getDernieresMesures(),
  'GET|/iot/mesures/historique/': (params) => getHistoriqueMesures(Number(params.get('capteur_id')) || 0, Number(params.get('heures')) || 24),
  'GET|/iot/actionneurs/': () => getActionneurs(),
  'POST|/iot/actionneurs/controle/': (body) => controlerActionneur(body.actionneur, body.etat),
  // Automation
  'GET|/iot/automation/config/': () => getAutomationConfig(),
  'PATCH|/iot/automation/config/': (body) => updateAutomationConfig(body),
  'POST|/iot/automation/mode/': (body) => setAutomationMode(body.mode, body.actionneur),
  // Alertes
  'GET|/alertes/': (params) => getAlertes(Number(params.get('limit')) || 50),
  'GET|/alertes/actives/': () => getAlertesActives(),
  'GET|/alertes/notifications/': (params) => getNotifications(Number(params.get('limit')) || 50),
  'POST|/alertes/notifications/read-all/': () => markAllNotificationsAsRead(),
  // Utilisateurs
  'GET|/users/users/': () => getUsers(),
  'POST|/users/users/': (body) => createUser(body),
  'PATCH|/users/users/': (body, url) => {
    const match = url.match(/\/users\/(\d+)\//);
    const id = match ? Number(match[1]) : 0;
    return updateUser(id, body);
  },
  'DELETE|/users/users/': (body, url) => {
    const match = url.match(/\/users\/(\d+)\//);
    const id = match ? Number(match[1]) : 0;
    return deleteUser(id);
  },
  'GET|/users/security/': () => getSecuritySettings(),
  'PATCH|/users/security/': (body) => updateSecuritySettings(body),
  'POST|/users/change-password/': (body) => changePassword(body),
  // Auth (non utilisés maisprésents pour compatibilité)
  'POST|/auth/refresh/': () => Promise.resolve({ access: 'mock-access-token' }),
  'POST|/users/login/': () => Promise.reject({ response: { data: { detail: 'Use AuthContext' } } }),
  'GET|/users/me/': () => Promise.reject({ response: { data: { detail: 'Use AuthContext' } } }),
  'POST|/alertes/notifications/read/': (body) => markNotificationAsRead(body.notificationId || body.id),
};

const api = {
  get: async (url: string, _config?: any) => {
    await simulateDelay();
    const key = `GET|${url.split('?')[0]}`;
    const handler = router[key];
    if (handler) {
      const params = new URL(url, 'http://dummy').searchParams;
      const data = await handler(params);
      return { data };
    }
    return Promise.reject({ response: { status: 404, data: { detail: 'Not found' } } });
  },
  post: async (url: string, body?: any) => {
    await simulateDelay();
    const key = `POST|${url.split('?')[0]}`;
    const handler = router[key];
    if (handler) {
      const data = await handler(body, url);
      return { data };
    }
    return Promise.reject({ response: { status: 404, data: { detail: 'Not found' } } });
  },
  patch: async (url: string, body?: any) => {
    await simulateDelay();
    const key = `PATCH|${url.split('?')[0]}`;
    const handler = router[key];
    if (handler) {
      const data = await handler(body, url);
      return { data };
    }
    return Promise.reject({ response: { status: 404, data: { detail: 'Not found' } } });
  },
  delete: async (url: string, _config?: any) => {
    await simulateDelay();
    const key = `DELETE|${url.split('?')[0]}`;
    const handler = router[key];
    if (handler) {
      const data = await handler(null, url);
      return { data };
    }
    return Promise.reject({ response: { status: 404, data: { detail: 'Not found' } } });
  },
};

export default api;
