import { Check, ChevronRight, Plus, SkipForward, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { RestTimer } from '../../components/workout/RestTimer';
import { SetLogger, type SetValues } from '../../components/workout/SetLogger';
import { useRestTimer } from '../../hooks/useRestTimer';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import { CARDIO_DAYS } from '../../lib/constants';
import { unlockAudio } from '../../lib/sound';
import { formatDuration, repsBottom, vibrate } from '../../lib/utils';
import { getLastSetsForExercise } from '../../services/session.service';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { ExerciseSet } from '../../types';
import { FinishStep } from './FinishStep';

export default function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const w = useWorkoutSession();
  const load = useWorkoutStore((s) => s.load);
  const timer = useRestTimer();
  const [ready, setReady] = useState(false);
  const [previous, setPrevious] = useState<ExerciseSet[]>([]);
  const [exitOpen, setExitOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const { session, current } = w;
  const currentId = current?.id;

  useEffect(() => {
    void load().then(() => setReady(true));
  }, [load]);

  useEffect(() => {
    if (ready && !session) navigate('/', { replace: true });
  }, [ready, session, navigate]);

  useEffect(() => {
    if (!session) return;
    const tick = () => setElapsed(Math.floor((Date.now() - session.startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  // Mantém a tela acesa durante o treino (quando suportado).
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    navigator.wakeLock
      ?.request('screen')
      .then((l) => {
        lock = l;
      })
      .catch(() => undefined);
    return () => {
      void lock?.release();
    };
  }, []);

  useEffect(() => {
    if (!currentId) return;
    let ignore = false;
    void getLastSetsForExercise(currentId).then((r) => {
      if (!ignore) setPrevious(r);
    });
    return () => {
      ignore = true;
    };
  }, [currentId]);

  if (!ready || !session) {
    return <div className="p-6 text-center text-zinc-500">Carregando…</div>;
  }

  const hasCardio = CARDIO_DAYS.includes(session.daySlot);

  const handleSave = async (values: SetValues) => {
    if (!current) return;
    unlockAudio();
    const prev = w.loggedForCurrent.at(-1);
    await w.saveSet({
      exerciseId: current.id,
      ...values,
      restSecActual: prev ? Math.round((Date.now() - prev.loggedAt) / 1000) : 0,
    });
    vibrate(60);
    if (w.loggedForCurrent.length + 1 < w.targetSets) timer.start(current.defaultRestSec);
  };

  const goNext = () => {
    timer.stop();
    w.nextExercise();
  };

  const handleSkip = () => {
    timer.stop();
    w.skipExercise();
  };

  const body = () => {
    if (w.liftingDone || !current) {
      return (
        <FinishStep
          hasCardio={hasCardio}
          onFinish={async (cardio) => {
            await w.finish(cardio);
            navigate('/', { replace: true });
          }}
        />
      );
    }

    const setNumber = w.loggedForCurrent.length + 1;
    const last = w.loggedForCurrent.at(-1) ?? previous[setNumber - 1] ?? previous.at(-1);
    const initial: SetValues = {
      weightKg: last?.weightKg ?? 0,
      reps: last?.reps ?? repsBottom(current.defaultReps),
      rir: last?.rir ?? current.defaultRIR,
    };

    return (
      <>
        <ExerciseCard key={current.id} exercise={current} large />

        {w.loggedForCurrent.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Séries registradas">
            {w.loggedForCurrent.map((s) => (
              <li
                key={s.id}
                className="rounded-full bg-zinc-200 px-3 py-1 text-sm tabular-nums dark:bg-zinc-800"
              >
                {s.setNumber}: {s.weightKg} kg × {s.reps} · RIR {s.rir}
              </li>
            ))}
          </ul>
        )}

        {w.exerciseDone ? (
          <Card className="flex flex-col gap-3 text-center">
            <p className="flex items-center justify-center gap-2 font-semibold">
              <Check size={18} className="text-green-600" /> Exercício concluído
            </p>
            <Button fullWidth onClick={goNext} className="min-h-[52px]">
              {w.isLast ? 'Finalizar musculação' : 'Próximo exercício'} <ChevronRight size={18} />
            </Button>
          </Card>
        ) : (
          <SetLogger
            key={`${current.id}-${setNumber}`}
            setNumber={setNumber}
            totalSets={w.targetSets}
            initial={initial}
            onSave={(v) => void handleSave(v)}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => w.addExtraSet(current.id)}>
            <Plus size={16} /> Série extra
          </Button>
          <Button variant="secondary" onClick={handleSkip}>
            <SkipForward size={16} /> Pular exercício
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pb-48 pt-[calc(env(safe-area-inset-top)+1rem)]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Sair do treino"
          onClick={() => setExitOpen(true)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <X size={22} />
        </button>
        <p className="text-sm font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
          {formatDuration(elapsed)} · {Math.min(w.meta.index + 1, w.exercises.length)}/
          {w.exercises.length}
        </p>
        <span className="w-[44px]" />
      </div>

      {body()}

      <RestTimer
        running={timer.running}
        remaining={timer.remaining}
        total={timer.total}
        onAdjust={timer.adjust}
        onStop={timer.stop}
      />

      <Modal open={exitOpen} title="Sair do treino?" onClose={() => setExitOpen(false)}>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
          Abandonar encerra a sessão sem contá-la no histórico de concluídos.
        </p>
        <div className="flex flex-col gap-2">
          <Button fullWidth onClick={() => setExitOpen(false)}>
            Continuar treinando
          </Button>
          <Button
            fullWidth
            variant="danger"
            onClick={() => {
              timer.stop();
              void w.abandon().then(() => navigate('/', { replace: true }));
            }}
          >
            Abandonar treino
          </Button>
        </div>
      </Modal>
    </div>
  );
}
