import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { toISODate } from '../../lib/utils';
import { exportAll, importAll, isBackupFile } from '../../services/workout.service';
import { useUIStore, type Theme } from '../../stores/uiStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { BackupFile } from '../../types';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore();
  const { canInstall, install } = useInstallPrompt();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-backup-${toISODate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Backup exportado.');
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBackupFile(parsed)) throw new Error('formato');
      setPending(parsed);
    } catch {
      setMessage('Arquivo inválido: use um backup exportado por este app.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!pending) return;
    await importAll(pending);
    useWorkoutStore.getState().reset();
    setPending(null);
    setMessage('Backup importado com sucesso.');
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">Tema</h2>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tema">
          {THEMES.map((t) => (
            <Button
              key={t.value}
              role="radio"
              aria-checked={theme === t.value}
              variant={theme === t.value ? 'primary' : 'secondary'}
              onClick={() => setTheme(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">Backup</h2>
        <Button fullWidth variant="secondary" onClick={() => void handleExport()}>
          <Download size={16} /> Exportar JSON
        </Button>
        <Button fullWidth variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload size={16} /> Importar JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">Instalar app</h2>
        {canInstall ? (
          <Button fullWidth onClick={() => void install()}>
            Instalar App
          </Button>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No Chrome Android, use o menu ⋮ → “Instalar app”. No iOS Safari, toque em Compartilhar →
            “Adicionar à Tela de Início”.
          </p>
        )}
      </Card>

      {message && (
        <p role="status" className="text-center text-sm text-zinc-600 dark:text-zinc-300">
          {message}
        </p>
      )}

      <Modal open={pending !== null} title="Substituir dados?" onClose={() => setPending(null)}>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
          Importar apaga todos os dados atuais e os substitui pelo conteúdo do backup (
          {pending?.sessions.length ?? 0} sessões).
        </p>
        <div className="flex flex-col gap-2">
          <Button fullWidth variant="danger" onClick={() => void confirmImport()}>
            Substituir tudo
          </Button>
          <Button fullWidth variant="secondary" onClick={() => setPending(null)}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
