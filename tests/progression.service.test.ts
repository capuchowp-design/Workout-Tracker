import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../src/lib/db';
import {
  buildProgress,
  getDoubleProgressionHits,
  getExerciseProgress,
  hitTopOfRange,
} from '../src/services/progression.service';
import type { Exercise, ExerciseSet } from '../src/types';
import { clearDb } from './helpers';

const exercise: Exercise = {
  id: 'e1',
  name: 'Supino',
  muscleGroup: 'chest',
  daySlot: 'mon',
  order: 1,
  isSuperset: false,
  defaultSets: 2,
  defaultReps: '8-10',
  defaultRIR: 2,
  defaultRestSec: 90,
};

const mk = (over: Partial<ExerciseSet>): ExerciseSet => ({
  id: crypto.randomUUID(),
  sessionId: 's1',
  exerciseId: 'e1',
  setNumber: 1,
  weightKg: 40,
  reps: 10,
  rir: 2,
  restSecActual: 0,
  loggedAt: Date.now(),
  ...over,
});

beforeEach(clearDb);

describe('progression.service', () => {
  it('buildProgress agrega por semana e devolve 8 pontos', () => {
    const now = new Date(2026, 10, 9, 12).getTime(); // segunda
    const points = buildProgress(
      [
        mk({ weightKg: 40, reps: 10, loggedAt: now }),
        mk({ weightKg: 50, reps: 5, loggedAt: now }),
        mk({ weightKg: 30, reps: 10, loggedAt: now - 8 * 86_400_000 }),
      ],
      8,
      now,
    );
    expect(points).toHaveLength(8);
    expect(points[7]).toMatchObject({ maxWeight: 50, volume: 650 });
    expect(points[6]).toMatchObject({ maxWeight: 30, volume: 300 });
    expect(points[0]).toMatchObject({ maxWeight: null, volume: null });
  });

  it('hitTopOfRange exige todas as séries no topo da faixa', () => {
    expect(hitTopOfRange(exercise, [mk({ reps: 10 }), mk({ reps: 10 })])).toBe(true);
    expect(hitTopOfRange(exercise, [mk({ reps: 10 }), mk({ reps: 9 })])).toBe(false);
    expect(hitTopOfRange(exercise, [mk({ reps: 10 })])).toBe(false);
  });

  it('getDoubleProgressionHits e getExerciseProgress usam só sessões concluídas', async () => {
    await db.exercises.add(exercise);
    await db.sessions.add({
      id: 's1',
      date: '2026-11-09',
      daySlot: 'mon',
      startedAt: Date.now(),
      durationSec: 60,
      status: 'completed',
    });
    await db.sets.bulkAdd([mk({ setNumber: 1 }), mk({ setNumber: 2 })]);

    const hits = await getDoubleProgressionHits();
    expect(hits.map((e) => e.id)).toEqual(['e1']);

    const progress = await getExerciseProgress('e1');
    expect(progress.some((p) => p.maxWeight === 40)).toBe(true);
  });
});
