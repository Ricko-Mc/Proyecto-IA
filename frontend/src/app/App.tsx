import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const minVisibleTimer = window.setTimeout(() => setFadeOut(true), 1500);
    const hideTimer = window.setTimeout(() => setShowSplash(false), 1800);

    return () => {
      window.clearTimeout(minVisibleTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen fadeOut={fadeOut} />;
  }

  return <RouterProvider router={router} />;
}