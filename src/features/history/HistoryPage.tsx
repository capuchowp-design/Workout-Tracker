import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import {
  CARDIO_LABELS,
  DAY_LABELS,
  INTENSITY_LABELS,
  MUSCLE_LABELS,
} from '../../lib/constants';
import { formatDateBR, formatDuration, setVolume, toISODate } from '../../lib/utils';
import { getHistoryData } from '../../services/session.service';
import { listExercises } from '../../services/workout.service';
import type { CardioSession, ExerciseSet, MuscleGroup, WorkoutSession } from '../../types';

const PERIODS = [
  { value: 0, label: 'Todo o período' },
  { value: 7, label: 'Últimos 7 dias' },
  { value: 30, label: 'Últimos 30 dias' },
  { value: 90, label: 'Últimos 90 dias' },
];

export default function HistoryPage() {
  const data = useLiveQuery(getHistoryData, []);
  const exercises = useLiveQuery(listExercises, []);
  const [muscle, setMuscle] = useState<MuscleGroup | 'all'>('all');
  const [period, setPeriod] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const exerciseById = useMemo(() => new Map((exercises ?? []).map((e) => [e.id, e])), [exercises]);

  const rows = useMemo(() => {
    if (!data) return [];
    const from = period ? toISODate(new Date(Date.now() - period * 86_400_000)) : '';
    const bySession = new Map<string, ExerciseSet[]>();
    for (const s of data.sets) {
      if (muscle !== 'all' && exerciseById.get(s.exerciseId)?.muscleGroup !== muscle) continue;
      bySession.set(s.sessionId, [...(bySession.get(s.sessionId) ?? []), s]);
    }
    const cardioBySession = new Map<string, CardioSession>(data.cardio.map((c) => [c.sessionId, c]));
    return data.sessions
      .filter((s) => s.date >= from && (muscle === 'all' || bySession.has(s.id)))
      .map((session) => ({
        session,
        sets: (bySession.get(session.id) ?? []).sort((a, b) => a.loggedAt - b.loggedAt),
        cardio: cardioBySession.get(session.id),
      }));
  }, [data, exerciseById, muscle, period]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <Select
          label="Grupo muscular"
          value={muscle}
          onChange={(e) => setMuscle(e.target.value as MuscleGroup | 'all')}
        >
          <option value="all">Todos</option>
          {(Object.keys(MUSCLE_LABELS) as MuscleGroup[]).map((m) => (
            <option key={m} value={m}>
              {MUSCLE_LABELS[m]}
            </option>
          ))}
        </Select>
        <Select label="Período" value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>

      {data && rows.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Nenhuma sessão concluída para esse filtro.
        </p>
      )}

      {rows.map(({ session, sets, cardio }) => (
        <HistoryItem
          key={session.id}
          session={session}
          sets={sets}
          cardio={cardio}
          exerciseName={(id) => exerciseById.get(id)?.name ?? 'Exercício removido'}
          open={openId === session.id}
          onToggle={() => setOpenId(openId === session.id ? null : session.id)}
        />
      ))}
    </div>
  );
}

interface ItemProps {
  session: WorkoutSession;
  sets: ExerciseSet[];
  cardio?: CardioSession;
  exerciseName: (id: string) => string;
  open: boolean;
  onToggle: () => void;
}

function HistoryItem({ session, sets, cardio, exerciseName, open, onToggle }: ItemProps) {
  const volume = Math.round(sets.reduce((acc, s) => acc + setVolume(s), 0));
  const grouped = useMemo(() => {
    const map = new Map<string, ExerciseSet[]>();
    for (const s of sets) map.set(s.exerciseId, [...(map.get(s.exerciseId) ?? []), s]);
    return [...map.entries()];
  }, [sets]);

  return (
    <Card className="p-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 p-4 text-left"
      >
        <div>
          <p className="font-semibold capitalize">
            {formatDateBR(session.date)} · {DAY_LABELS[session.daySlot]}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDuration(session.durationSec)} min · {sets.length} séries ·{' '}
            {volume.toLocaleString('pt-BR')} kg
          </p>
        </div>
        <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="flex flex-col gap-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
          {grouped.map(([exerciseId, list]) => (
            <div key={exerciseId}>
              <p className="text-sm font-semibold">{exerciseName(exerciseId)}</p>
              <ul className="mt-1 text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
                {list.map((s) => (
                  <li key={s.id}>
                    {s.setNumber}. {s.weightKg} kg × {s.reps} · RIR {s.rir}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {cardio && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Cardio: {CARDIO_LABELS[cardio.type]} · {cardio.durationMin} min ·{' '}
              {INTENSITY_LABELS[cardio.perceivedIntensity]}
              {cardio.avgRpm ? ` · ${cardio.avgRpm} rpm` : ''}
              {cardio.notes ? ` — ${cardio.notes}` : ''}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
