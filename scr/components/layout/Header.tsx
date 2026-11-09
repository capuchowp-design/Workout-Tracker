export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
