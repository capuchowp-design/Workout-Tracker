import Dexie, { type Table } from 'dexie';
import type { CardioSession, Exercise, ExerciseSet, WorkoutSession } from '../types';
import { SEED_EXERCISES } from './constants';

export type { CardioSession, Exercise, ExerciseSet, WorkoutSession } from '../types';

class WorkoutDB extends Dexie {
  exercises!: Table<Exercise, string>;
  sessions!: Table<WorkoutSession, string>;
  sets!: Table<ExerciseSet, string>;
  cardio!: Table<CardioSession, string>;

  constructor() {
    super('workout-tracker-pwa');
    this.version(1).stores({
      exercises: 'id, daySlot, muscleGroup',
      sessions: 'id, date, daySlot, status',
      sets: 'id, sessionId, exerciseId, loggedAt',
      cardio: 'id, sessionId',
    });
  }
}

export const db = new WorkoutDB();

export async function seedIfEmpty(): Promise<void> {
  if ((await db.exercises.count()) === 0) await db.exercises.bulkAdd(SEED_EXERCISES);
}
