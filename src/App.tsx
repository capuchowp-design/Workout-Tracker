import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { InstallPrompt } from './components/layout/InstallPrompt';
import ActiveWorkoutPage from './features/active-workout/ActiveWorkoutPage';
import DashboardPage from './features/dashboard/DashboardPage';
import HistoryPage from './features/history/HistoryPage';
import SettingsPage from './features/settings/SettingsPage';
import { useUIStore } from './stores/uiStore';

const ProgressionPage = lazy(() => import('./features/progression/ProgressionPage'));

const TITLES: Record<string, string> = {
  '/': 'Treino de hoje',
  '/history': 'Histórico',
  '/progression': 'Progressão',
  '/settings': 'Ajustes',
};

function AppLayout() {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <Header title={TITLES[pathname] ?? 'Treino'} />
      <main className="flex-1 px-4 pb-28 pt-4">
        <Suspense fallback={<p className="py-8 text-center text-zinc-500">Carregando…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}

export default function App() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? '#09090b' : '#2563eb');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="progression" element={<ProgressionPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="workout" element={<ActiveWorkoutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
