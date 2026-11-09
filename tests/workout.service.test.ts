import { beforeEach, describe, expect, it } from 'vitest';
import { SEED_EXERCISES } from '../src/lib/constants';
import { db, seedIfEmpty } from '../src/lib/db';
import {
  exportAll,
  getExercisesByDay,
  importAll,
  isBackupFile,
  listExercises,
} from '../src/services/workout.service';
import { clearDb } from './helpers';

beforeEach(clearDb);

describe('workout.service', () => {
  it('semeia o plano uma única vez e ordena por dia', async () => {
    await seedIfEmpty();
    await seedIfEmpty();
    expect(await db.exercises.count()).toBe(SEED_EXERCISES.length);
    const monday = await getExercisesByDay('mon');
    expect(monday.map((e) => e.order)).toEqual([...monday.map((e) => e.order)].sort((a, b) => a - b));
    expect(monday.every((e) => e.daySlot === 'mon')).toBe(true);
    expect((await listExercises()).length).toBe(SEED_EXERCISES.length);
  });

  it('exporta e importa (round-trip)', async () => {
    await seedIfEmpty();
    const backup = await exportAll();
    expect(isBackupFile(backup)).toBe(true);
    await clearDb();
    await importAll(backup);
    expect(await db.exercises.count()).toBe(SEED_EXERCISES.length);
  });

  it('rejeita backups inválidos', async () => {
    expect(isBackupFile(null)).toBe(false);
    expect(isBackupFile({ version: 2 })).toBe(false);
    await expect(importAll({ foo: 1 })).rejects.toThrow('inválido');
  });
});
