import type { CardioType, DaySlot, Exercise, Intensity, MuscleGroup } from '../types';

export const DAY_SLOTS: DaySlot[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

export const DAY_LABELS: Record<DaySlot, string> = {
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
};

export const DAY_SHORT: Record<DaySlot, string> = {
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
};

/** Mapeia Date#getDay() para o slot do plano (fim de semana = descanso). */
export const DAY_BY_GETDAY: Record<number, DaySlot | null> = {
  0: null,
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: null,
};

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Peito',
  back: 'Costas',
  legs_quad: 'Quadríceps',
  legs_ham: 'Posterior/Glúteos',
  legs_calves: 'Panturrilha',
  shoulders: 'Ombros',
  arms: 'Braços',
  core: 'Abdômen',
  cardio: 'Cardio',
};

export const RIR_VALUES = [0, 1, 2, 3, 4] as const;

export const RIR_LABELS: Record<number, string> = {
  0: 'Falha',
  1: '1 na reserva',
  2: '2 na reserva',
  3: '3 na reserva',
  4: '4+ na reserva',
};

/** Dias do plano com cardio previsto. */
export const CARDIO_DAYS: DaySlot[] = ['tue', 'thu'];

export const CARDIO_LABELS: Record<CardioType, string> = {
  bike: 'Bicicleta',
  elliptical: 'Elíptico',
  walk: 'Caminhada',
};

export const INTENSITY_LABELS: Record<Intensity, string> = {
  light: 'Leve',
  moderate: 'Moderada',
};

const ex = (
  day: DaySlot,
  order: number,
  name: string,
  muscleGroup: MuscleGroup,
  defaultSets: number,
  defaultReps: string,
  defaultRIR: number,
  defaultRestSec: number,
  extra: Partial<Exercise> = {},
): Exercise => ({
  id: `ex-${day}-${order}`,
  name,
  muscleGroup,
  daySlot: day,
  order,
  isSuperset: false,
  defaultSets,
  defaultReps,
  defaultRIR,
  defaultRestSec,
  ...extra,
});

const SS = { isSuperset: true };

/** Plano inicial (editável). Substitua pelos seus exercícios e faixas de reps. */
export const SEED_EXERCISES: Exercise[] = [
  ex('mon', 1, 'Agachamento Livre', 'legs_quad', 4, '6-8', 2, 150, {
    alternativeName: 'Leg Press 45°',
  }),
  ex('mon', 2, 'Stiff com Halteres', 'legs_ham', 3, '8-10', 2, 120, {
    alternativeName: 'Mesa Flexora Unilateral',
  }),
  ex('mon', 3, 'Cadeira Extensora', 'legs_quad', 3, '10-12', 1, 90, SS),
  ex('mon', 4, 'Cadeira Flexora', 'legs_ham', 3, '10-12', 1, 90, SS),
  ex('mon', 5, 'Panturrilha em Pé', 'legs_calves', 4, '12-15', 1, 60),

  ex('tue', 1, 'Supino Reto com Halteres', 'chest', 4, '6-8', 2, 120, {
    alternativeName: 'Supino Reto na Máquina',
  }),
  ex('tue', 2, 'Supino Inclinado com Halteres', 'chest', 3, '8-10', 2, 90),
  ex('tue', 3, 'Desenvolvimento com Halteres', 'shoulders', 3, '8-10', 2, 90),
  ex('tue', 4, 'Elevação Lateral', 'shoulders', 3, '12-15', 1, 60, SS),
  ex('tue', 5, 'Tríceps na Corda', 'arms', 3, '12-15', 1, 60, SS),

  ex('wed', 1, 'Remada Curvada', 'back', 4, '6-8', 2, 120, { alternativeName: 'Remada Cavalinho' }),
  ex('wed', 2, 'Puxada Frontal', 'back', 3, '8-10', 2, 90),
  ex('wed', 3, 'Rosca Direta', 'arms', 3, '8-10', 1, 60, SS),
  ex('wed', 4, 'Tríceps Testa', 'arms', 3, '8-10', 1, 60, SS),
  ex('wed', 5, 'Abdominal na Polia', 'core', 3, '12-15', 1, 60),

  ex('thu', 1, 'Leg Press 45°', 'legs_quad', 4, '8-10', 2, 120),
  ex('thu', 2, 'Mesa Flexora', 'legs_ham', 3, '8-10', 1, 90, {
    alternativeName: 'Mesa Flexora Unilateral',
  }),
  ex('thu', 3, 'Elevação Pélvica', 'legs_ham', 3, '8-12', 2, 90),
  ex('thu', 4, 'Panturrilha Sentado', 'legs_calves', 4, '12-15', 1, 60),
  ex('thu', 5, 'Elevação de Pernas', 'core', 3, '12-15', 1, 60),

  ex('fri', 1, 'Supino Inclinado na Máquina', 'chest', 3, '8-10', 2, 90),
  ex('fri', 2, 'Crucifixo na Máquina', 'chest', 3, '10-12', 1, 60),
  ex('fri', 3, 'Puxada Neutra', 'back', 3, '8-10', 2, 90),
  ex('fri', 4, 'Remada Baixa', 'back', 3, '10-12', 1, 90),
  ex('fri', 5, 'Elevação Lateral', 'shoulders', 4, '12-15', 0, 45),
  ex('fri', 6, 'Rosca Martelo', 'arms', 3, '10-12', 1, 60, SS),
  ex('fri', 7, 'Tríceps Corda', 'arms', 3, '10-12', 1, 60, SS),
];

/**
 * Fotos/GIFs reais de execução (opcional). Coloque o arquivo em `public/exercises/`
 * e informe o caminho relativo, por exemplo:
 *   'ex-mon-1': 'exercises/agachamento.webp',
 * Quando existir imagem para o exercício, ela substitui a ilustração animada.
 */
export const EXERCISE_IMAGES: Partial<Record<string, string>> = {};
