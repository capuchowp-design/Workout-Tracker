import { db } from '../lib/db';
import type { BackupFile, DaySlot, Exercise } from '../types';

export function getExercisesByDay(day: DaySlot): Promise<Exercise[]> {
  return db.exercises.where('daySlot').equals(day).sortBy('order');
}

export async function listExercises(): Promise<Exercise[]> {
  const all = await db.exercises.toArray();
  return all.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function exportAll(): Promise<BackupFile> {
  const [exercises, sessions, sets, cardio] = await Promise.all([
    db.exercises.toArray(),
    db.sessions.toArray(),
    db.sets.toArray(),
    db.cardio.toArray(),
  ]);
  return { version: 1, exportedAt: Date.now(), exercises, sessions, sets, cardio };
}

export function isBackupFile(x: unknown): x is BackupFile {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    o.version === 1 &&
    Array.isArray(o.exercises) &&
    Array.isArray(o.sessions) &&
    Array.isArray(o.sets) &&
    Array.isArray(o.cardio)
  );
}

export async function importAll(data: unknown): Promise<void> {
  if (!isBackupFile(data)) throw new Error('Arquivo de backup inválido');
  await db.transaction('rw', [db.exercises, db.sessions, db.sets, db.cardio], async () => {
    await Promise.all([db.exercises.clear(), db.sessions.clear(), db.sets.clear(), db.cardio.clear()]);
    await db.exercises.bulkAdd(data.exercises);
    await db.sessions.bulkAdd(data.sessions);
    await db.sets.bulkAdd(data.sets);
    await db.cardio.bulkAdd(data.cardio);
  });
}
