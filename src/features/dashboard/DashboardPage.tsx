import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { DAY_BY_GETDAY, DAY_LABELS, DAY_SHORT, DAY_SLOTS, MUSCLE_LABELS } from '../../lib/constants';
import { getActiveSession, getWeekSummary } from '../../services/session.service';
import { getExercisesByDay } from '../../services/workout.service';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { DaySlot } from '../../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const start = useWorkoutStore((s) => s.start);
  const today = DAY_BY_GETDAY[new Date().getDay()];
  const [day, setDay] = useState<DaySlot>(today ?? 'mon');
  const [starting, setStarting] = useState(false);

  const exercises = useLiveQuery(() => getExercisesByDay(day), [day]);
  const active = useLiveQuery(() => getActiveSession().then((s) => s ?? null), []);
  const week = useLiveQuery(() => getWeekSummary(), []);

  useEffect(() => {
    if (active) navigate('/workout', { replace: true });
  }, [active, navigate]);

  const groups = [...new Set((exercises ?? []).map((e) => MUSCLE_LABELS[e.muscleGroup]))];

  const handleStart = async () => {
    setStarting(true);
    await start(day);
    navigate('/workout');
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Treinos na semana" value={String(week?.sessions ?? 0)} />
        <Stat label="Volume (kg)" value={(week?.volumeKg ?? 0).toLocaleString('pt-BR')} />
        <Stat label="Minutos" value={String(week?.durationMin ?? 0)} />
      </Card>

      {today === null && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Hoje é dia de descanso. Se quiser, escolha um treino abaixo.
        </p>
      )}

      <div className="flex gap-2" role="tablist" aria-label="Dia do treino">
        {DAY_SLOTS.map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={day === d}
            onClick={() => setDay(d)}
            className={`min-h-[44px] flex-1 rounded-xl text-sm font-semibold ${
              day === d
                ? 'bg-brand text-white'
                : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {DAY_SHORT[d]}
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold">
          {DAY_LABELS[day]}
          {day === today && ' · hoje'}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{groups.join(' · ')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {(exercises ?? []).map((e) => (
          <ExerciseCard key={e.id} exercise={e} />
        ))}
      </div>

      <Button
        fullWidth
        disabled={starting || !exercises?.length}
        onClick={() => void handleStart()}
        className="min-h-[52px] text-base"
      >
        Iniciar treino
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}
