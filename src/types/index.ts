export type DaySlot = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs_quad'
  | 'legs_ham'
  | 'legs_calves'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  alternativeName?: string;
  muscleGroup: MuscleGroup;
  daySlot: DaySlot;
  order: number;
  isSuperset: boolean;
  defaultSets: number;
  defaultReps: string;
  defaultRIR: number;
  defaultRestSec: number;
  notes?: string;
}

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface WorkoutSession {
  id: string;
  date: string;
  daySlot: DaySlot;
  startedAt: number;
  finishedAt?: number;
  durationSec: number;
  status: SessionStatus;
}

export interface ExerciseSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rir: number;
  /** Segundos decorridos desde a série anterior do mesmo exercício (0 na primeira). */
  restSecActual: number;
  loggedAt: number;
}

export type CardioType = 'bike' | 'elliptical' | 'walk';
export type Intensity = 'light' | 'moderate';

export interface CardioSession {
  id: string;
  sessionId: string;
  type: CardioType;
  durationMin: number;
  avgRpm?: number;
  perceivedIntensity: Intensity;
  notes?: string;
}

export interface BackupFile {
  version: 1;
  exportedAt: number;
  exercises: Exercise[];
  sessions: WorkoutSession[];
  sets: ExerciseSet[];
  cardio: CardioSession[];
}

export interface ProgressPoint {
  week: string;
  maxWeight: number | null;
  volume: number | null;
}
