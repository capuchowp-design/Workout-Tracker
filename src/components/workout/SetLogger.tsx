import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { RIR_LABELS, RIR_VALUES } from '../../lib/constants';
import { parseNumber } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

export interface SetValues {
  weightKg: number;
  reps: number;
  rir: number;
}

interface Props {
  setNumber: number;
  totalSets: number;
  initial: SetValues;
  onSave: (values: SetValues) => void;
}

export function SetLogger({ setNumber, totalSets, initial, onSave }: Props) {
  const [weight, setWeight] = useState(String(initial.weightKg));
  const [reps, setReps] = useState(String(initial.reps));
  const [rir, setRir] = useState(Math.min(4, Math.max(0, initial.rir)));

  const w = parseNumber(weight);
  const r = parseInt(reps, 10);
  const valid = Number.isFinite(w) && w >= 0 && Number.isInteger(r) && r > 0;

  const step = (delta: number) => {
    const base = Number.isFinite(w) ? w : 0;
    setWeight(String(Math.max(0, Math.round((base + delta) * 100) / 100)));
  };

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
        Série {setNumber} de {totalSets}
      </p>

      <div className="grid grid-cols-[44px_1fr_44px] items-end gap-2">
        <Button variant="secondary" aria-label="Diminuir 2,5 kg" onClick={() => step(-2.5)}>
          <Minus size={18} />
        </Button>
        <Input
          label="Carga (kg)"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="text-center text-lg font-semibold"
        />
        <Button variant="secondary" aria-label="Aumentar 2,5 kg" onClick={() => step(2.5)}>
          <Plus size={18} />
        </Button>
      </div>

      <Input
        label="Repetições"
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="text-center text-lg font-semibold"
      />

      <div>
        <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          RIR · {RIR_LABELS[rir]}
        </p>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="RIR">
          {RIR_VALUES.map((v) => (
            <Button
              key={v}
              role="radio"
              aria-checked={rir === v}
              variant={rir === v ? 'primary' : 'secondary'}
              onClick={() => setRir(v)}
              className="px-0"
            >
              {v === 4 ? '4+' : v}
            </Button>
          ))}
        </div>
      </div>

      <Button
        fullWidth
        disabled={!valid}
        onClick={() => onSave({ weightKg: w, reps: r, rir })}
        className="min-h-[52px] text-base"
      >
        Salvar série
      </Button>
    </Card>
  );
}
