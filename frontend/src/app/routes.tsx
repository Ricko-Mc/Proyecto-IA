import { Suspense, lazy, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { NotFound } from './pages/NotFound';

const Chat = lazy(() => import('./pages/Chat').then((module) => ({ default: module.Chat })));
const Dictionary = lazy(() => import('./pages/Dictionary').then((module) => ({ default: module.Dictionary })));
const About = lazy(() => import('./pages/About').then((module) => ({ default: module.About })));
const Games = lazy(() => import('./pages/Games').then((module) => ({ default: module.Games })));
const AdivinaSena = lazy(() => import('./pages/AdivinaSena').then((module) => ({ default: module.AdivinaSena })));
const Ahorcado = lazy(() => import('./pages/Ahorcado').then((module) => ({ default: module.Ahorcado })));

const SuspenseWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] dark:bg-[#050816]">
        <div className="h-10 w-10 rounded-full border-4 border-[#4997D0]/30 border-t-[#4997D0] animate-spin" />
      </div>
    }
  >
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/chat" replace />,
  },
  {
    path: '/chat',
    element: (
      <SuspenseWrapper>
        <Chat />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/dictionary',
    element: (
      <SuspenseWrapper>
        <Dictionary />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/games',
    element: (
      <SuspenseWrapper>
        <Games />
      </SuspenseWrapper>
    ),
  },

  {
    path: '/games/adivina-sena',
    element: (
      <SuspenseWrapper>
        <AdivinaSena />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/games/ahorcado',
    element: (
      <SuspenseWrapper>
        <Ahorcado />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/about',
    element: (
      <SuspenseWrapper>
        <About />
      </SuspenseWrapper>
    ),
  },
  {
    path: '*',
    Component: NotFound,
  },
]);