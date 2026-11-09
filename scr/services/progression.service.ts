import { db } from '../lib/db';
import { repsTop, startOfWeek } from '../lib/utils';
import type { Exercise, ExerciseSet, ProgressPoint } from '../types';
import { getLastSetsForExercise } from './session.service';
import { listExercises } from './workout.service';

/** Agrega carga máxima e volume por semana (segunda a domingo) nas últimas `weeks` semanas. */
export function buildProgress(
  sets: ExerciseSet[],
  weeks = 8,
  now: number = Date.now(),
): ProgressPoint[] {
  const current = startOfWeek(new Date(now));
  const points: ProgressPoint[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(current);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const inWeek = sets.filter((s) => s.loggedAt >= start.getTime() && s.loggedAt < end.getTime());
    points.push({
      week: start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      maxWeight: inWeek.length ? Math.max(...inWeek.map((s) => s.weightKg)) : null,
      volume: inWeek.length
        ? Math.round(inWeek.reduce((acc, s) => acc + s.weightKg * s.reps, 0))
        : null,
    });
  }
  return points;
}

export async function getExerciseProgress(exerciseId: string, weeks = 8): Promise<ProgressPoint[]> {
  const [sets, completed] = await Promise.all([
    db.sets.where('exerciseId').equals(exerciseId).toArray(),
    db.sessions.where('status').equals('completed').primaryKeys(),
  ]);
  const done = new Set(completed);
  return buildProgress(
    sets.filter((s) => done.has(s.sessionId)),
    weeks,
  );
}

/** Progressão dupla: todas as séries previstas atingiram o topo da faixa de reps. */
export function hitTopOfRange(exercise: Exercise, sets: ExerciseSet[]): boolean {
  if (sets.length < exercise.defaultSets) return false;
  const top = repsTop(exercise.defaultReps);
  return sets.every((s) => s.reps >= top);
}

export async function getDoubleProgressionHits(): Promise<Exercise[]> {
  const exercises = await listExercises();
  const hits: Exercise[] = [];
  for (const exercise of exercises) {
    const last = await getLastSetsForExercise(exercise.id);
    if (hitTopOfRange(exercise, last)) hits.push(exercise);
  }
  return hits;
}
