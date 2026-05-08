import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Download, Filter, FileJson, Zap, User, Power } from 'lucide-react';

// ─── Logique INCHANGÉE ────────────────────────────────────────────────────────

export default function ActuatorLogs() {
  const { actuatorLogs, exportLogsJSON } = useData();
  const logs = Array.isArray(actuatorLogs) ? actuatorLogs : [];
  const [filterActuator, setFilterActuator] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const actuatorMatch = filterActuator === 'all' || log.actuator === filterActuator;
    const userMatch = filterUser === 'all' || log.username === filterUser;
    return actuatorMatch && userMatch;
  }).reverse();

  const uniqueActuators = Array.from(new Set(logs.map(log => log.actuator)));
  const uniqueUsers = Array.from(new Set(logs.map(log => log.username)));

  // ── Stats rapides ──
  const onCount  = logs.filter(l => l.action === 'ON').length;
  const offCount = logs.filter(l => l.action === 'OFF').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/40 to-teal-50/30 p-4 md:p-6 lg:p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 tracking-tight">Logs des Actionneurs</h2>
          <p className="text-sm text-green-600/70 mt-0.5">Historique des commandes manuelles</p>
        </div>
        <button
          onClick={exportLogsJSON}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-green-200 transition-all duration-200 hover:shadow-md w-fit"
        >
          <Download size={15} />
          Exporter JSON
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total logs',   value: logs.length,          icon: <Zap size={16} />,   bg: 'bg-white',       text: 'text-gray-700',   border: 'border-gray-200'   },
          { label: 'Affichés',     value: filteredLogs.length,  icon: <Filter size={16} />, bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200'   },
          { label: 'ON',           value: onCount,              icon: <Power size={16} />, bg: 'bg-green-50',    text: 'text-green-700',  border: 'border-green-200'  },
          { label: 'OFF',          value: offCount,             icon: <Power size={16} />, bg: 'bg-red-50',      text: 'text-red-700',    border: 'border-red-200'    },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border ${s.border} rounded-xl px-4 py-3 flex items-center justify-between shadow-sm`}>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            </div>
            <div className={`${s.text} opacity-50`}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* ── Info banner JSON ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
          <FileJson className="text-blue-600" size={16} />
        </div>
        <div>
          <p className="text-blue-800 font-semibold text-sm">Format d'export JSON</p>
          <p className="text-blue-600 text-xs mt-0.5">
            Les logs sont exportés avec les champs : <span className="font-mono bg-blue-100 px-1 rounded">actuator</span>, <span className="font-mono bg-blue-100 px-1 rounded">action</span>, <span className="font-mono bg-blue-100 px-1 rounded">username</span>, <span className="font-mono bg-blue-100 px-1 rounded">date</span>, <span className="font-mono bg-blue-100 px-1 rounded">time</span>
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        {/* Filtre actionneur */}
        <div className="flex items-center gap-2 bg-white border border-green-200 rounded-xl px-3 py-2 shadow-sm">
          <Zap size={14} className="text-green-500 flex-shrink-0" />
          <select
            value={filterActuator}
            onChange={(e) => setFilterActuator(e.target.value)}
            className="bg-transparent focus:outline-none text-sm text-gray-700 pr-1"
          >
            <option value="all">Tous les actionneurs</option>
            {uniqueActuators.map(actuator => (
              <option key={actuator} value={actuator}>{actuator}</option>
            ))}
          </select>
        </div>

        {/* Filtre utilisateur */}
        <div className="flex items-center gap-2 bg-white border border-green-200 rounded-xl px-3 py-2 shadow-sm">
          <User size={14} className="text-green-500 flex-shrink-0" />
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="bg-transparent focus:outline-none text-sm text-gray-700 pr-1"
          >
            <option value="all">Tous les utilisateurs</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-green-700 to-emerald-700 text-white">
                {['#', 'Actionneur', 'Action', 'Utilisateur', 'Date', 'Heure'].map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Zap size={24} />
                      <span className="text-sm">Aucun log d'actionneur manuel disponible</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr
                    key={log.id}
                    className={`transition-colors duration-150 hover:bg-green-50/50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    {/* # */}
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                      {filteredLogs.length - index}
                    </td>

                    {/* Actionneur */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 capitalize">
                        <Zap size={10} />
                        {log.actuator}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        log.action === 'ON'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${log.action === 'ON' ? 'bg-green-500' : 'bg-red-400'}`} />
                        {log.action}
                      </span>
                    </td>

                    {/* Utilisateur */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                        <User size={13} className="text-gray-400" />
                        {log.username}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                      {log.date}
                    </td>

                    {/* Heure */}
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                      {log.time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {filteredLogs.length} / {logs.length} logs affichés
          </p>
          {filteredLogs.length > 0 && (
            <button
              onClick={exportLogsJSON}
              className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 font-medium transition-colors"
            >
              <Download size={12} />
              Exporter la sélection
            </button>
          )}
        </div>
      </div>

    </div>
  );
}