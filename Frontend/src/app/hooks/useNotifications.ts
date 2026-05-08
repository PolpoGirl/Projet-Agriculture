import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../api/axios';
import { useAuth } from '../contexts/AuthContext';

export interface NotificationItem {
  id: number;
  est_lue: boolean;
  date_lecture: string | null;
  timestamp: string;
  type_alerte: string;
  message: string;
  niveau: 'info' | 'warning' | 'danger' | string;
  capteur_type: string | null;
  capteur_nom: string | null;
  valeur: number | null;
  seuil_valeur: number | null;
  unite: string | null;
}

interface NotificationResponse {
  results: NotificationItem[];
  unread_count: number;
}

export function formatNotificationType(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

export function useNotifications(limit = 80) {
  const { user } = useAuth();
  const receiveNotifications = user?.receive_notifications !== false;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async (silent = false) => {
    if (!receiveNotifications) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      return;
    }

    if (!silent) {
      setLoading(true);
    }

    try {
      const data: NotificationResponse = await getNotifications(limit);
      setNotifications(data.results ?? []);
      setUnreadCount(data.unread_count ?? 0);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? 'Impossible de charger les notifications.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [limit, receiveNotifications]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!receiveNotifications) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      void refresh(true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [receiveNotifications, refresh]);

  const markAsRead = useCallback(async (notification: NotificationItem) => {
    if (notification.est_lue) {
      return notification;
    }

    const updated: NotificationItem = await markNotificationAsRead(notification.id);
    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? updated : item)),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
    return updated;
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) {
      return;
    }

    setSubmitting(true);
    try {
      await markAllNotificationsAsRead();
      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          est_lue: true,
          date_lecture: item.date_lecture ?? now,
        })),
      );
      setUnreadCount(0);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? 'Impossible de marquer toutes les notifications comme lues.');
    } finally {
      setSubmitting(false);
    }
  }, [unreadCount]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.est_lue),
    [notifications],
  );
  const readNotifications = useMemo(
    () => notifications.filter((notification) => notification.est_lue),
    [notifications],
  );

  return {
    error,
    loading,
    notifications,
    readNotifications,
    receiveNotifications,
    refresh,
    setError,
    submitting,
    unreadCount,
    unreadNotifications,
    markAllAsRead,
    markAsRead,
  };
}
