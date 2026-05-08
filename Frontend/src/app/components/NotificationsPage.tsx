import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, Clock3, RefreshCw, TriangleAlert } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import {
  formatNotificationType,
  type NotificationItem,
  useNotifications,
} from '../hooks/useNotifications';

const severityStyles: Record<string, { badge: string; dot: string; card: string }> = {
  info: {
    badge: 'border-sky-200 bg-sky-50 text-sky-700',
    dot: 'bg-sky-400',
    card: 'border-l-sky-400',
  },
  warning: {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-400',
    card: 'border-l-amber-400',
  },
  danger: {
    badge: 'border-red-200 bg-red-50 text-red-700',
    dot: 'bg-red-500',
    card: 'border-l-red-500',
  },
};

function NotificationRow({
  notification,
  isSelected,
  onSelect,
}: {
  notification: NotificationItem;
  isSelected: boolean;
  onSelect: (notification: NotificationItem) => void;
}) {
  const severity = severityStyles[notification.niveau] ?? severityStyles.warning;

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={`w-full rounded-2xl border border-l-4 p-3 text-left transition-all ${
        isSelected
          ? 'border-green-200 bg-green-50 shadow-sm'
          : 'border-gray-100 bg-white hover:border-green-200 hover:bg-green-50/50'
      } ${severity.card}`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-900">
              {formatNotificationType(notification.type_alerte)}
            </p>
            {!notification.est_lue && (
              <span className={`h-2 w-2 rounded-full ${severity.dot}`} />
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
            {notification.message}
          </p>
          <p className="mt-2 text-[11px] text-gray-400">
            {new Date(notification.timestamp).toLocaleString('fr-FR')}
          </p>
        </div>
      </div>
    </button>
  );
}

function Column({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{title}</p>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${accent}`}>
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">{children}</div>
    </div>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    error,
    loading,
    notifications,
    readNotifications,
    receiveNotifications,
    refresh,
    submitting,
    unreadCount,
    unreadNotifications,
    markAllAsRead,
    markAsRead,
  } = useNotifications(120);

  const notificationIdFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const rawValue = params.get('notification');
    return rawValue ? Number(rawValue) : null;
  }, [location.search]);

  const [selectedId, setSelectedId] = useState<number | null>(notificationIdFromQuery);

  useEffect(() => {
    setSelectedId(notificationIdFromQuery);
  }, [notificationIdFromQuery]);

  useEffect(() => {
    if (notifications.length === 0) {
      setSelectedId(null);
      return;
    }

    if (selectedId && notifications.some((notification) => notification.id === selectedId)) {
      return;
    }

    setSelectedId(notifications[0].id);
  }, [notifications, selectedId]);

  const selectedNotification =
    notifications.find((notification) => notification.id === selectedId) ?? null;

  const handleSelect = async (notification: NotificationItem) => {
    setSelectedId(notification.id);
    navigate(`${location.pathname}?notification=${notification.id}`, { replace: true });

    try {
      await markAsRead(notification);
    } catch (err: any) {
      // error state is already handled by the hook caller
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-green-50 via-emerald-50/40 to-teal-50/30 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-[28px] border border-green-100 bg-white/90 shadow-sm backdrop-blur-sm">
          <div className="border-b border-green-100 bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 px-5 py-5 text-white md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/12 p-2.5">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold md:text-2xl">Notifications</h1>
                    <p className="mt-1 text-sm text-green-100">
                      Retrouvez ici toutes les alertes du systeme.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  Actualiser
                </button>
                <button
                  type="button"
                  onClick={() => void markAllAsRead()}
                  disabled={submitting || unreadCount === 0}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCheck size={12} />
                  Tout marquer lu
                </button>
              </div>
            </div>
          </div>

          {!receiveNotifications ? (
            <div className="p-5 md:p-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Les notifications sont desactivees dans vos parametres.
              </div>
            </div>
          ) : error ? (
            <div className="p-5 md:p-6">
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            </div>
          ) : loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500">
              <RefreshCw size={18} className="animate-spin text-green-500" />
              Chargement des notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-5 md:p-6">
              <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/40 px-4 py-10 text-center">
                <p className="text-base font-semibold text-gray-900">Aucune notification</p>
                <p className="mt-1 text-sm text-gray-500">
                  Les nouvelles alertes apparaitront ici.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[68vh] grid-cols-1 overflow-hidden xl:grid-cols-[24rem_minmax(0,1fr)]">
              <div className="border-b border-green-100 bg-gray-50/70 p-4 xl:max-h-[68vh] xl:overflow-y-auto xl:border-b-0 xl:border-r">
                <div className="space-y-5">
                  <Column
                    title="Non lues"
                    count={unreadNotifications.length}
                    accent="bg-emerald-100 text-emerald-700"
                  >
                    {unreadNotifications.length > 0 ? (
                      unreadNotifications.map((notification) => (
                        <NotificationRow
                          key={notification.id}
                          notification={notification}
                          isSelected={selectedNotification?.id === notification.id}
                          onSelect={(item) => void handleSelect(item)}
                        />
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 text-xs text-gray-400">
                        Rien ici, tout est lu.
                      </div>
                    )}
                  </Column>

                  <Column
                    title="Lues"
                    count={readNotifications.length}
                    accent="bg-gray-200 text-gray-600"
                  >
                    {readNotifications.length > 0 ? (
                      readNotifications.map((notification) => (
                        <NotificationRow
                          key={notification.id}
                          notification={notification}
                          isSelected={selectedNotification?.id === notification.id}
                          onSelect={(item) => void handleSelect(item)}
                        />
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 text-xs text-gray-400">
                        Aucune notification lue.
                      </div>
                    )}
                  </Column>
                </div>
              </div>

              <div className="bg-white p-5 md:p-6">
                {selectedNotification ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        severityStyles[selectedNotification.niveau]?.badge ?? severityStyles.warning.badge
                      }`}>
                        {selectedNotification.niveau}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {formatNotificationType(selectedNotification.type_alerte)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                        <Clock3 size={12} />
                        {new Date(selectedNotification.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Detail de la notification</h2>
                      <p className="mt-3 text-sm leading-7 text-gray-600">
                        {selectedNotification.message}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-green-100 bg-green-50/60 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                          Capteur
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {selectedNotification.capteur_nom ?? selectedNotification.capteur_type ?? 'Systeme'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedNotification.capteur_type ?? 'Evenement general'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Etat
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {selectedNotification.est_lue ? 'Lue' : 'Non lue'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedNotification.date_lecture
                            ? `Lue le ${new Date(selectedNotification.date_lecture).toLocaleString('fr-FR')}`
                            : 'Elle sera marquee comme lue a l ouverture.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Valeur</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">
                          {selectedNotification.valeur ?? '-'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Seuil</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">
                          {selectedNotification.seuil_valeur ?? '-'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Unite</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">
                          {selectedNotification.unite ?? '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-[24px] border border-dashed border-green-200 bg-green-50/40 p-6 text-center">
                    <TriangleAlert size={24} className="text-green-500" />
                    <p className="mt-3 text-base font-semibold text-gray-900">
                      Aucune notification selectionnee
                    </p>
                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                      Choisissez une alerte a gauche pour afficher le detail.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
