import { beforeEach, describe, expect, it } from 'vitest';
import {
  abandonSession,
  finishSession,
  getActiveSession,
  getHistoryData,
  getLastSetsForExercise,
  getSessionSets,
  getWeekSummary,
  listCompletedSessions,
  logSet,
  startSession,
} from '../src/services/session.service';
import { clearDb } from './helpers';

const base = { exerciseId: 'ex-mon-1', rir: 2, restSecActual: 0 };

beforeEach(clearDb);

describe('session.service', () => {
  it('reaproveita a sessão em andamento', async () => {
    const a = await startSession('mon');
    const b = await startSession('tue');
    expect(b.id).toBe(a.id);
    expect((await getActiveSession())?.id).toBe(a.id);
  });

  it('registra séries e conclui com cardio', async () => {
    const s = await startSession('tue');
    await logSet({ ...base, sessionId: s.id, setNumber: 1, weightKg: 50, reps: 10 });
    await logSet({ ...base, sessionId: s.id, setNumber: 2, weightKg: 50, reps: 9 });
    expect(await getSessionSets(s.id)).toHaveLength(2);

    await finishSession(s.id, { type: 'bike', durationMin: 20, perceivedIntensity: 'light' });
    const done = await listCompletedSessions();
    expect(done).toHaveLength(1);
    expect(done[0].status).toBe('completed');

    const history = await getHistoryData();
    expect(history.cardio).toHaveLength(1);
    expect(history.sets).toHaveLength(2);
  });

  it('falha ao concluir sessão inexistente', async () => {
    await expect(finishSession('nope')).rejects.toThrow();
  });

  it('abandona sessão sem contá-la como concluída', async () => {
    const s = await startSession('mon');
    await abandonSession(s.id);
    await abandonSession('inexistente');
    expect(await getActiveSession()).toBeUndefined();
    expect(await listCompletedSessions()).toHaveLength(0);
  });

  it('getLastSetsForExercise usa só a última sessão concluída', async () => {
    const s1 = await startSession('mon');
    await logSet({ ...base, sessionId: s1.id, setNumber: 1, weightKg: 60, reps: 8 });
    await finishSession(s1.id);

    const s2 = await startSession('mon');
    await logSet({ ...base, sessionId: s2.id, setNumber: 1, weightKg: 100, reps: 8 });

    const last = await getLastSetsForExercise('ex-mon-1');
    expect(last).toHaveLength(1);
    expect(last[0].weightKg).toBe(60);
    expect(await getLastSetsForExercise('outro')).toEqual([]);
  });

  it('resume a semana atual', async () => {
    expect(await getWeekSummary()).toEqual({ sessions: 0, volumeKg: 0, durationMin: 0 });
    const s = await startSession('mon');
    await logSet({ ...base, sessionId: s.id, setNumber: 1, weightKg: 50, reps: 10 });
    await finishSession(s.id);
    const week = await getWeekSummary();
    expect(week.sessions).toBe(1);
    expect(week.volumeKg).toBe(500);
  });
});
