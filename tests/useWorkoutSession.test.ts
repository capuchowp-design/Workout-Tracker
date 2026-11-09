import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { seedIfEmpty } from '../src/lib/db';
import { useWorkoutSession } from '../src/hooks/useWorkoutSession';
import { listCompletedSessions } from '../src/services/session.service';
import { useWorkoutStore } from '../src/stores/workoutStore';
import { clearDb } from './helpers';

beforeEach(async () => {
  await clearDb();
  useWorkoutStore.getState().reset();
  await seedIfEmpty();
});

const input = { weightKg: 50, reps: 8, rir: 2, restSecActual: 0 };

describe('useWorkoutSession', () => {
  it('percorre o fluxo: iniciar, registrar, extra, pular e finalizar', async () => {
    const { result } = renderHook(() => useWorkoutSession());

    await act(async () => {
      await result.current.start('mon');
    });
    expect(result.current.session?.daySlot).toBe('mon');
    expect(result.current.current?.id).toBe('ex-mon-1');
    expect(result.current.targetSets).toBe(4);

    await act(async () => {
      await result.current.saveSet({ exerciseId: 'ex-mon-1', ...input });
    });
    expect(result.current.loggedForCurrent).toHaveLength(1);
    expect(result.current.exerciseDone).toBe(false);

    act(() => result.current.addExtraSet('ex-mon-1'));
    expect(result.current.targetSets).toBe(5);

    act(() => result.current.skipExercise());
    expect(result.current.meta.index).toBe(1);
    expect(result.current.meta.skipped).toEqual(['ex-mon-1']);

    act(() => {
      for (let i = 0; i < result.current.exercises.length; i++) result.current.nextExercise();
    });
    expect(result.current.liftingDone).toBe(true);

    await act(async () => {
      await result.current.finish({ type: 'walk', durationMin: 15, perceivedIntensity: 'light' });
    });
    expect(result.current.session).toBeNull();
    expect(await listCompletedSessions()).toHaveLength(1);
  });

  it('load restaura a sessão ativa e abandon encerra', async () => {
    const { result } = renderHook(() => useWorkoutSession());
    await act(async () => {
      await result.current.start('tue');
    });
    act(() => useWorkoutStore.setState({ session: null, exercises: [], sets: [] }));
    await act(async () => {
      await result.current.load();
    });
    expect(result.current.session?.daySlot).toBe('tue');

    await act(async () => {
      await result.current.abandon();
    });
    expect(result.current.session).toBeNull();
    await act(async () => {
      await result.current.load();
    });
    expect(result.current.session).toBeNull();
  });

  it('saveSet falha sem treino em andamento', async () => {
    await expect(
      useWorkoutStore.getState().saveSet({ exerciseId: 'x', ...input }),
    ).rejects.toThrow();
  });
});
