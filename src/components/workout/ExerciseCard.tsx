import { ArrowLeftRight, Link2 } from 'lucide-react';
import { useState } from 'react';
import { EXERCISE_IMAGES, MUSCLE_LABELS } from '../../lib/constants';
import { DEMO_BY_ID } from '../../lib/poses';
import type { Exercise } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ExerciseDemo } from './ExerciseDemo';

interface Props {
  exercise: Exercise;
  large?: boolean;
}

export function ExerciseCard({ exercise, large = false }: Props) {
  const [showAlt, setShowAlt] = useState(false);
  const [showMedia, setShowMedia] = useState(large);
  const name = showAlt && exercise.alternativeName ? exercise.alternativeName : exercise.name;
  const image = EXERCISE_IMAGES[exercise.id];
  const demoKey = DEMO_BY_ID[exercise.id];
  const hasMedia = Boolean(image ?? demoKey);

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {MUSCLE_LABELS[exercise.muscleGroup]}
          </p>
          <h3 className={`font-semibold ${large ? 'text-xl' : 'text-base'}`}>{name}</h3>
        </div>
        {exercise.alternativeName && (
          <button
            type="button"
            onClick={() => setShowAlt((v) => !v)}
            aria-label="Alternar exercício alternativo"
            aria-pressed={showAlt}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowLeftRight size={18} />
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        {exercise.defaultSets} × {exercise.defaultReps} · RIR {exercise.defaultRIR} ·{' '}
        {exercise.defaultRestSec}s
      </p>
      {exercise.isSuperset && (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
          <Link2 size={12} /> Bi-set
        </span>
      )}
      {exercise.notes && (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{exercise.notes}</p>
      )}

      {hasMedia && (
        <Button
          variant="ghost"
          className="mt-2 -ml-2"
          aria-expanded={showMedia}
          onClick={() => setShowMedia((v) => !v)}
        >
          {showMedia ? 'Ocultar execução' : 'Ver execução'}
        </Button>
      )}
      {showMedia && image && (
        <img
          src={`${import.meta.env.BASE_URL}${image}`}
          alt={`Execução: ${name}`}
          loading="lazy"
          className="mt-3 w-full rounded-xl"
        />
      )}
      {showMedia && !image && demoKey && <ExerciseDemo demoKey={demoKey} label={name} />}
    </Card>
  );
}
