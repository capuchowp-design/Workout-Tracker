import { db } from '../lib/db';
import { setVolume, toISODate, uid, weekStartISO } from '../lib/utils';
import type { CardioSession, DaySlot, ExerciseSet, WorkoutSession } from '../types';

export type NewSet = Omit<ExerciseSet, 'id' | 'loggedAt'>;
export type NewCardio = Omit<CardioSession, 'id' | 'sessionId'>;

export async function getActiveSession(): Promise<WorkoutSession | undefined> {
  return db.sessions.where('status').equals('in_progress').first();
}

export async function startSession(daySlot: DaySlot): Promise<WorkoutSession> {
  const existing = await getActiveSession();
  if (existing) return existing;
  const session: WorkoutSession = {
    id: uid(),
    date: toISODate(),
    daySlot,
    startedAt: Date.now(),
    durationSec: 0,
    status: 'in_progress',
  };
  await db.sessions.add(session);
  return session;
}

export async function logSet(input: NewSet): Promise<ExerciseSet> {
  const row: ExerciseSet = { ...input, id: uid(), loggedAt: Date.now() };
  await db.sets.add(row);
  return row;
}

export function getSessionSets(sessionId: string): Promise<ExerciseSet[]> {
  return db.sets.where('sessionId').equals(sessionId).sortBy('loggedAt');
}

export async function finishSession(id: string, cardio?: NewCardio): Promise<void> {
  const session = await db.sessions.get(id);
  if (!session) throw new Error('Sessão não encontrada');
  const finishedAt = Date.now();
  await db.transaction('rw', [db.sessions, db.cardio], async () => {
    await db.sessions.update(id, {
      status: 'completed',
      finishedAt,
      durationSec: Math.round((finishedAt - session.startedAt) / 1000),
    });
    if (cardio) await db.cardio.add({ ...cardio, id: uid(), sessionId: id });
  });
}

export async function abandonSession(id: string): Promise<void> {
  const session = await db.sessions.get(id);
  if (!session) return;
  const finishedAt = Date.now();
  await db.sessions.update(id, {
    status: 'abandoned',
    finishedAt,
    durationSec: Math.round((finishedAt - session.startedAt) / 1000),
  });
}

export async function listCompletedSessions(): Promise<WorkoutSession[]> {
  const all = await db.sessions.where('status').equals('completed').toArray();
  return all.sort((a, b) => b.startedAt - a.startedAt);
}

export async function getHistoryData() {
  const [sessions, sets, cardio] = await Promise.all([
    listCompletedSessions(),
    db.sets.toArray(),
    db.cardio.toArray(),
  ]);
  return { sessions, sets, cardio };
}

/** Séries da última sessão concluída em que o exercício foi feito (para pré-preencher). */
export async function getLastSetsForExercise(exerciseId: string): Promise<ExerciseSet[]> {
  const [sets, completed] = await Promise.all([
    db.sets.where('exerciseId').equals(exerciseId).toArray(),
    db.sessions.where('status').equals('completed').primaryKeys(),
  ]);
  const done = new Set(completed);
  const valid = sets.filter((s) => done.has(s.sessionId)).sort((a, b) => b.loggedAt - a.loggedAt);
  if (valid.length === 0) return [];
  const lastId = valid[0].sessionId;
  return valid.filter((s) => s.sessionId === lastId).sort((a, b) => a.setNumber - b.setNumber);
}

export async function getWeekSummary(now: Date = new Date()) {
  const from = weekStartISO(now);
  const sessions = (await db.sessions.where('status').equals('completed').toArray()).filter(
    (s) => s.date >= from,
  );
  const ids = sessions.map((s) => s.id);
  const sets = ids.length ? await db.sets.where('sessionId').anyOf(ids).toArray() : [];
  return {
    sessions: sessions.length,
    volumeKg: Math.round(sets.reduce((acc, s) => acc + setVolume(s), 0)),
    durationMin: Math.round(sessions.reduce((acc, s) => acc + s.durationSec, 0) / 60),
  };
}
