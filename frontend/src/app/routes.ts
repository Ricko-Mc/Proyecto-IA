import { createBrowserRouter } from 'react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Chat } from './pages/Chat';
import { Dictionary } from './pages/Dictionary';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';

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
    path: '*',
    Component: NotFound,
  },
]);