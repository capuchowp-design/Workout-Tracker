import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DaySlot, Exercise, ExerciseSet, WorkoutSession } from '../types';
import {
  abandonSession,
  finishSession,
  getActiveSession,
  getSessionSets,
  logSet,
  startSession,
  type NewCardio,
} from '../services/session.service';
import { getExercisesByDay } from '../services/workout.service';

export type SetInput = Pick<ExerciseSet, 'exerciseId' | 'weightKg' | 'reps' | 'rir' | 'restSecActual'>;
export type CardioInput = NewCardio;

interface Meta {
  sessionId: string | null;
  index: number;
  extraSets: Record<string, number>;
  skipped: string[];
}

const emptyMeta: Meta = { sessionId: null, index: 0, extraSets: {}, skipped: [] };

interface WorkoutState {
  session: WorkoutSession | null;
  exercises: Exercise[];
  sets: ExerciseSet[];
  meta: Meta;
  load: () => Promise<void>;
  start: (day: DaySlot) => Promise<void>;
  saveSet: (input: SetInput) => Promise<ExerciseSet>;
  addExtraSet: (exerciseId: string) => void;
  skipExercise: () => void;
  nextExercise: () => void;
  finish: (cardio?: CardioInput) => Promise<void>;
  abandon: () => Promise<void>;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      session: null,
      exercises: [],
      sets: [],
      meta: emptyMeta,

      load: async () => {
        const session = (await getActiveSession()) ?? null;
        if (!session) {
          set({ session: null, exercises: [], sets: [], meta: emptyMeta });
          return;
        }
        const [exercises, sets] = await Promise.all([
          getExercisesByDay(session.daySlot),
          getSessionSets(session.id),
        ]);
        const prev = get().meta;
        const meta = prev.sessionId === session.id ? prev : { ...emptyMeta, sessionId: session.id };
        set({ session, exercises, sets, meta });
      },

      start: async (day) => {
        await startSession(day);
        await get().load();
      },

      saveSet: async (input) => {
        const { session, sets } = get();
        if (!session) throw new Error('Nenhum treino em andamento');
        const setNumber = sets.filter((s) => s.exerciseId === input.exerciseId).length + 1;
        const row = await logSet({ ...input, sessionId: session.id, setNumber });
        set((s) => ({ sets: [...s.sets, row] }));
        return row;
      },

      addExtraSet: (exerciseId) =>
        set((s) => ({
          meta: {
            ...s.meta,
            extraSets: { ...s.meta.extraSets, [exerciseId]: (s.meta.extraSets[exerciseId] ?? 0) + 1 },
          },
        })),

      skipExercise: () =>
        set((s) => {
          const current = s.exercises[s.meta.index];
          return {
            meta: {
              ...s.meta,
              index: Math.min(s.meta.index + 1, s.exercises.length),
              skipped: current ? [...s.meta.skipped, current.id] : s.meta.skipped,
            },
          };
        }),

      nextExercise: () =>
        set((s) => ({
          meta: { ...s.meta, index: Math.min(s.meta.index + 1, s.exercises.length) },
        })),

      finish: async (cardio) => {
        const { session } = get();
        if (!session) return;
        await finishSession(session.id, cardio);
        get().reset();
      },

      abandon: async () => {
        const { session } = get();
        if (!session) return;
        await abandonSession(session.id);
        get().reset();
      },

      reset: () => set({ session: null, exercises: [], sets: [], meta: emptyMeta }),
    }),
    { name: 'active-workout-meta', partialize: (s) => ({ meta: s.meta }) },
  ),
);
