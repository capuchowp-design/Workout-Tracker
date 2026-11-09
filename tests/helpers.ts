import { db } from '../src/lib/db';

export async function clearDb(): Promise<void> {
  await Promise.all([db.exercises.clear(), db.sessions.clear(), db.sets.clear(), db.cardio.clear()]);
}
