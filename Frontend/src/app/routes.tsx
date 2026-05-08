import { createBrowserRouter, Navigate } from 'react-router';
import Login from './components/Login';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import Actuators from './components/Actuators';
import History from './components/History';
import ActuatorLogs from './components/ActuatorLogs';
import UserManagement from './components/UserManagement';
import Setting from './components/setting';
import NotificationsPage from './components/NotificationsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/user',
    Component: Layout,
    children: [
      {
        index: true,
        element: <Navigate to="/user/dashboard" replace />,
      },
      {
        path: 'dashboard',
        Component: Dashboard,
      },
      {
        path: 'actuators',
        Component: Actuators,
      },
      {
        path: 'history',
        Component: History,
      },
      {
        path: 'notifications',
        Component: NotificationsPage,
      },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        Component: Dashboard,
      },
      {
        path: 'actuators',
        Component: Actuators,
      },
      {
        path: 'history',
        Component: History,
      },
      {
        path: 'notifications',
        Component: NotificationsPage,
      },
      {
        path: 'logs',
        Component: ActuatorLogs,
      },
      {
        path: 'users',
        Component: UserManagement,
      },
      {
        path: 'settings',
        Component: Setting,
      },
    ],
  },
]);
