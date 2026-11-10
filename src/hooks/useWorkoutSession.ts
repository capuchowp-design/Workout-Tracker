import { useWorkoutStore } from '../stores/workoutStore';

/** Estado derivado do treino em andamento (exercício atual, séries restantes, etc.). */
export function useWorkoutSession() {
  const store = useWorkoutStore();
  const { exercises, sets, meta, session } = store;
  const current = exercises[meta.index];
  const loggedForCurrent = current ? sets.filter((s) => s.exerciseId === current.id) : [];
  const targetSets = current ? current.defaultSets + (meta.extraSets[current.id] ?? 0) : 0;

  return {
    ...store,
    current,
    loggedForCurrent,
    targetSets,
    exerciseDone: current ? loggedForCurrent.length >= targetSets : false,
    liftingDone: session !== null && meta.index >= exercises.length,
    isLast: meta.index === exercises.length - 1,
  };
}
