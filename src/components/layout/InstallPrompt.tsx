import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { Button } from '../ui/Button';

export function InstallPrompt() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md px-4">
      <div className="flex items-center gap-3 rounded-2xl bg-brand p-3 text-white shadow-lg">
        <Download size={20} className="shrink-0" />
        <p className="flex-1 text-sm font-medium">Instale o app para usar offline.</p>
        <Button variant="secondary" onClick={() => void install()}>
          Instalar
        </Button>
        <button
          type="button"
          aria-label="Dispensar"
          onClick={() => setDismissed(true)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
