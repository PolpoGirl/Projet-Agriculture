import { Bell, BellRing } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { useNotifications } from '../hooks/useNotifications';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications(40);

  const notificationsPath = location.pathname.startsWith('/admin')
    ? '/admin/notifications'
    : '/user/notifications';

  return (
    <button
      type="button"
      onClick={() => navigate(notificationsPath)}
      className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-green-200 bg-white text-green-700 shadow-sm transition-all hover:border-green-300 hover:bg-green-50 hover:shadow-md"
      aria-label="Ouvrir la page des notifications"
    >
      {unreadCount > 0 ? <BellRing size={18} /> : <Bell size={18} />}
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[11px] font-bold text-white shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
