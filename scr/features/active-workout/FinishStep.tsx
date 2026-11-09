import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { CARDIO_LABELS, INTENSITY_LABELS } from '../../lib/constants';
import { parseNumber } from '../../lib/utils';
import type { CardioInput } from '../../stores/workoutStore';
import type { CardioType, Intensity } from '../../types';

interface Props {
  hasCardio: boolean;
  onFinish: (cardio?: CardioInput) => Promise<void>;
}

export function FinishStep({ hasCardio, onFinish }: Props) {
  const [type, setType] = useState<CardioType>('bike');
  const [duration, setDuration] = useState('20');
  const [rpm, setRpm] = useState('');
  const [intensity, setIntensity] = useState<Intensity>('light');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const minutes = parseNumber(duration);
  const valid = Number.isFinite(minutes) && minutes > 0;

  const run = async (cardio?: CardioInput) => {
    setBusy(true);
    try {
      await onFinish(cardio);
    } finally {
      setBusy(false);
    }
  };

  if (!hasCardio) {
    return (
      <Card className="flex flex-col gap-3 text-center">
        <h2 className="text-xl font-semibold">Musculação concluída 💪</h2>
        <Button fullWidth disabled={busy} onClick={() => void run()} className="min-h-[52px]">
          Concluir treino
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Cardio</h2>
      <Select label="Tipo" value={type} onChange={(e) => setType(e.target.value as CardioType)}>
        {(Object.keys(CARDIO_LABELS) as CardioType[]).map((t) => (
          <option key={t} value={t}>
            {CARDIO_LABELS[t]}
          </option>
        ))}
      </Select>
      <Input
        label="Duração (min)"
        inputMode="numeric"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      {type === 'bike' && (
        <Input
          label="RPM médio (opcional)"
          inputMode="numeric"
          value={rpm}
          onChange={(e) => setRpm(e.target.value)}
        />
      )}
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Intensidade percebida">
        {(Object.keys(INTENSITY_LABELS) as Intensity[]).map((i) => (
          <Button
            key={i}
            role="radio"
            aria-checked={intensity === i}
            variant={intensity === i ? 'primary' : 'secondary'}
            onClick={() => setIntensity(i)}
          >
            {INTENSITY_LABELS[i]}
          </Button>
        ))}
      </div>
      <Input label="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button
        fullWidth
        disabled={busy || !valid}
        className="min-h-[52px]"
        onClick={() =>
          void run({
            type,
            durationMin: minutes,
            avgRpm: type === 'bike' && rpm.trim() ? parseNumber(rpm) : undefined,
            perceivedIntensity: intensity,
            notes: notes.trim() || undefined,
          })
        }
      >
        Salvar cardio e concluir
      </Button>
      <Button fullWidth variant="ghost" disabled={busy} onClick={() => void run()}>
        Concluir sem cardio
      </Button>
    </Card>
  );
}
