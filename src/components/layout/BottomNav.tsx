import { History, Home, Settings, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Treino', icon: Home },
  { to: '/history', label: 'Histórico', icon: History },
  { to: '/progression', label: 'Progressão', icon: TrendingUp },
  { to: '/settings', label: 'Ajustes', icon: Settings },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-md grid-cols-4 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-xs font-medium after:absolute after:top-0 after:h-0.5 after:w-8 after:rounded-full ${
              isActive
                ? 'text-brand after:bg-brand'
                : 'text-zinc-500 after:bg-transparent dark:text-zinc-400'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
