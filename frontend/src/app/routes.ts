import { createBrowserRouter } from 'react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { Chat } from './pages/Chat';
import { Dictionary } from './pages/Dictionary';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';
import { AdminReportes } from './pages/AdminReportes';
import { AdminUsuarios } from './pages/AdminUsuarios';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/auth/callback',
    Component: AuthCallback,
  },
  {
    path: '/chat',
    Component: Chat,
  },
  {
    path: '/dictionary',
    Component: Dictionary,
  },
  {
    path: '/settings',
    Component: Settings,
  },
  {
    path: '/help',
    Component: Help,
  },
  {
    path: '/about',
    Component: About,
  },
  {
    path: '/admin/reportes',
    Component: AdminReportes,
  },
  {
    path: '/admin/usuarios',
    Component: AdminUsuarios,
  },
  {
    path: '*',
    Component: NotFound,
  },
]);