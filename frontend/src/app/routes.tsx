import { createBrowserRouter, Navigate } from 'react-router';
import { Chat } from './pages/Chat';
import { Dictionary } from './pages/Dictionary';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/chat" replace />,
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
    path: '/about',
    Component: About,
  },
  {
    path: '*',
    Component: NotFound,
  },
]);