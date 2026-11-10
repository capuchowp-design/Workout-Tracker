/**
 * Ilustrações esquemáticas (boneco de palitos, vista lateral) dos exercícios.
 * Cada demonstração tem uma pose inicial e uma final; o componente anima entre elas.
 *
 * Ângulos em graus: 0 = para cima, 90 = para a direita, 180 = para baixo, -90 = para a esquerda.
 *  - shin:  direção tornozelo → joelho
 *  - thigh: direção joelho → quadril
 *  - torso: direção quadril → ombro
 *  - ua/fa: direção ombro → cotovelo / cotovelo → punho
 */
export type Pt = readonly [number, number];
export type Seg = readonly [number, number, number, number];

export interface Pose {
  /** Posição do ponto de ancoragem (tornozelo ou quadril, conforme `anchor`). */
  at: Pt;
  thigh: number;
  shin: number;
  torso: number;
  ua: number;
  fa: number;
}

export interface Demo {
  anchor: 'ankle' | 'hip';
  start: Pose;
  end: Pose;
  implement: 'bar' | 'dumbbell' | 'none';
  implementAt?: 'wrist' | 'shoulder' | 'hip';
  furniture?: Seg[];
  cable?: Pt;
  tip: string;
}

export interface Joints {
  toe: Pt;
  ankle: Pt;
  knee: Pt;
  hip: Pt;
  shoulder: Pt;
  elbow: Pt;
  wrist: Pt;
  head: Pt;
}

export const GROUND = 150;
export const LENGTHS = { thigh: 36, shin: 34, torso: 38, ua: 22, fa: 20 } as const;

const dir = (deg: number): Pt => {
  const r = (deg * Math.PI) / 180;
  return [Math.sin(r), -Math.cos(r)];
};
const move = (p: Pt, d: Pt, len: number): Pt => [p[0] + d[0] * len, p[1] + d[1] * len];

export function computeJoints(pose: Pose, anchor: Demo['anchor']): Joints {
  let ankle: Pt;
  let knee: Pt;
  let hip: Pt;
  if (anchor === 'ankle') {
    ankle = pose.at;
    knee = move(ankle, dir(pose.shin), LENGTHS.shin);
    hip = move(knee, dir(pose.thigh), LENGTHS.thigh);
  } else {
    hip = pose.at;
    knee = move(hip, dir(pose.thigh), -LENGTHS.thigh);
    ankle = move(knee, dir(pose.shin), -LENGTHS.shin);
  }
  const shoulder = move(hip, dir(pose.torso), LENGTHS.torso);
  const elbow = move(shoulder, dir(pose.ua), LENGTHS.ua);
  const wrist = move(elbow, dir(pose.fa), LENGTHS.fa);
  const head = move(shoulder, dir(pose.torso), 13);
  const toe: Pt = anchor === 'ankle' ? [ankle[0] + 13, GROUND] : move(ankle, dir(pose.shin + 90), 12);
  return { toe, ankle, knee, hip, shoulder, elbow, wrist, head };
}

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const l = (x: number, y: number) => x + (y - x) * t;
  return {
    at: [l(a.at[0], b.at[0]), l(a.at[1], b.at[1])],
    thigh: l(a.thigh, b.thigh),
    shin: l(a.shin, b.shin),
    torso: l(a.torso, b.torso),
    ua: l(a.ua, b.ua),
    fa: l(a.fa, b.fa),
  };
}

const pose = (
  at: Pt,
  thigh: number,
  shin: number,
  torso: number,
  ua: number,
  fa: number,
): Pose => ({ at, thigh, shin, torso, ua, fa });

const STAND: Pt = [100, 150];
const SEATED: Pt = [95, 116];
const BENCH_HIP: Pt = [105, 126];
const BENCH: Seg[] = [
  [48, 132, 130, 132],
  [56, 132, 56, 150],
  [122, 132, 122, 150],
];
const SEAT_PRESS: Seg[] = [
  [78, 122, 112, 122],
  [86, 122, 85, 64],
];

export type DemoKey =
  | 'squat'
  | 'hinge'
  | 'leg_extension'
  | 'leg_curl'
  | 'calf_raise'
  | 'seated_calf'
  | 'bench_press'
  | 'incline_press'
  | 'shoulder_press'
  | 'lateral_raise'
  | 'triceps_pushdown'
  | 'skull_crusher'
  | 'biceps_curl'
  | 'bent_row'
  | 'seated_row'
  | 'lat_pulldown'
  | 'fly'
  | 'leg_press'
  | 'crunch'
  | 'leg_raise'
  | 'hip_thrust';

export const DEMOS: Record<DemoKey, Demo> = {
  squat: {
    anchor: 'ankle',
    start: pose([95, 150], 0, 0, 0, 200, 20),
    end: pose([95, 150], -80, 35, 30, 200, 20),
    implement: 'bar',
    implementAt: 'shoulder',
    tip: 'Pés na largura dos ombros e coluna reta. Desça até as coxas ficarem paralelas ao chão e suba empurrando o chão.',
  },
  hinge: {
    anchor: 'ankle',
    start: pose(STAND, 0, 0, 0, 180, 180),
    end: pose(STAND, -25, 8, 80, 180, 180),
    implement: 'dumbbell',
    tip: 'Joelhos levemente flexionados. Empurre o quadril para trás com a coluna reta até sentir o posterior da coxa alongar.',
  },
  leg_extension: {
    anchor: 'hip',
    start: pose([80, 95], -90, 0, -8, 150, 100),
    end: pose([80, 95], -90, -90, -8, 150, 100),
    implement: 'none',
    furniture: [
      [64, 100, 112, 100],
      [68, 100, 62, 54],
    ],
    tip: 'Costas apoiadas. Estenda os joelhos até quase travar e desça devagar, sem deixar a carga bater.',
  },
  leg_curl: {
    anchor: 'hip',
    start: pose([80, 95], -90, -90, -8, 150, 100),
    end: pose([80, 95], -90, 35, -8, 150, 100),
    implement: 'none',
    furniture: [
      [64, 100, 112, 100],
      [68, 100, 62, 54],
    ],
    tip: 'Flexione os joelhos levando os calcanhares para baixo do assento e volte controlando o movimento.',
  },
  calf_raise: {
    anchor: 'ankle',
    start: pose([100, 147], 0, 0, 0, 180, 180),
    end: pose([100, 133], 0, 0, 0, 180, 180),
    implement: 'dumbbell',
    tip: 'Suba na ponta dos pés o mais alto possível, pause 1 segundo e desça alongando bem o calcanhar.',
  },
  seated_calf: {
    anchor: 'hip',
    start: pose([95, 112], -90, 0, 0, 140, 130),
    end: pose([95, 112], -90, 16, 0, 140, 130),
    implement: 'none',
    furniture: [[78, 118, 112, 118]],
    tip: 'Joelhos a 90°. Eleve os calcanhares ao máximo, pause e desça até alongar a panturrilha.',
  },
  bench_press: {
    anchor: 'hip',
    start: pose(BENCH_HIP, -113, 0, -90, 80, -67),
    end: pose(BENCH_HIP, -113, 0, -90, 0, 0),
    implement: 'bar',
    furniture: BENCH,
    tip: 'Escápulas juntas e pés firmes no chão. Desça a barra até o peito e empurre para cima sem travar os cotovelos.',
  },
  incline_press: {
    anchor: 'hip',
    start: pose([100, 126], -113, 0, -45, 100, -50),
    end: pose([100, 126], -113, 0, -45, 10, 5),
    implement: 'dumbbell',
    furniture: [
      [88, 132, 116, 132],
      [100, 132, 100, 150],
      [92, 131, 62, 101],
    ],
    tip: 'Banco inclinado entre 30° e 45°. Desça a carga até a parte alta do peito e empurre em linha reta.',
  },
  shoulder_press: {
    anchor: 'hip',
    start: pose(SEATED, -90, 0, -3, 180, 0),
    end: pose(SEATED, -90, 0, -3, 5, 3),
    implement: 'dumbbell',
    furniture: SEAT_PRESS,
    tip: 'Costas apoiadas. Empurre os halteres acima da cabeça sem arquear a lombar e desça até a altura das orelhas.',
  },
  lateral_raise: {
    anchor: 'ankle',
    start: pose(STAND, 0, 0, 3, 180, 180),
    end: pose(STAND, 0, 0, 3, 85, 90),
    implement: 'dumbbell',
    tip: 'Eleve os braços para o lado até a altura dos ombros, cotovelos levemente flexionados, sem balançar o tronco. (Desenho em vista lateral.)',
  },
  triceps_pushdown: {
    anchor: 'ankle',
    start: pose(STAND, 0, 0, 8, 180, 90),
    end: pose(STAND, 0, 0, 8, 180, 180),
    implement: 'bar',
    cable: [118, 8],
    tip: 'Cotovelos colados ao corpo. Estenda os cotovelos até embaixo e volte sem tirá-los do lugar.',
  },
  skull_crusher: {
    anchor: 'hip',
    start: pose(BENCH_HIP, -113, 0, -90, 0, 0),
    end: pose(BENCH_HIP, -113, 0, -90, 0, -140),
    implement: 'bar',
    furniture: BENCH,
    tip: 'Cotovelos fixos apontando para cima. Flexione levando a barra em direção à testa e estenda sem abrir os cotovelos.',
  },
  biceps_curl: {
    anchor: 'ankle',
    start: pose(STAND, 0, 0, 0, 178, 178),
    end: pose(STAND, 0, 0, 0, 176, 25),
    implement: 'dumbbell',
    tip: 'Cotovelos colados ao tronco. Suba a carga sem balançar o corpo e desça controlando.',
  },
  bent_row: {
    anchor: 'ankle',
    start: pose(STAND, -25, 8, 70, 180, 180),
    end: pose(STAND, -25, 8, 70, -75, 175),
    implement: 'bar',
    tip: 'Tronco inclinado com a coluna reta. Puxe os cotovelos para trás aproximando as escápulas e desça controlando.',
  },
  seated_row: {
    anchor: 'hip',
    start: pose([90, 116], -90, -80, 0, 90, 90),
    end: pose([90, 116], -90, -80, 0, 260, 90),
    implement: 'bar',
    cable: [170, 78],
    furniture: [
      [74, 122, 110, 122],
      [162, 106, 162, 138],
    ],
    tip: 'Tronco ereto. Puxe o triângulo até o abdômen levando os cotovelos para trás e volte alongando as costas.',
  },
  lat_pulldown: {
    anchor: 'hip',
    start: pose([95, 118], -90, 0, -10, 5, 5),
    end: pose([95, 118], -90, 0, -10, 170, 20),
    implement: 'bar',
    cable: [100, 6],
    furniture: [
      [78, 124, 112, 124],
      [86, 124, 78, 72],
    ],
    tip: 'Peito aberto. Puxe a barra até a altura do peito levando os cotovelos para baixo e volte controlando.',
  },
  fly: {
    anchor: 'hip',
    start: pose(SEATED, -90, 0, -3, 235, 245),
    end: pose(SEATED, -90, 0, -3, 90, 90),
    implement: 'none',
    furniture: SEAT_PRESS,
    tip: 'Braços levemente flexionados. Abra e feche como um abraço, sentindo o peitoral contrair no centro.',
  },
  leg_press: {
    anchor: 'hip',
    start: pose([75, 120], -170, -90, -55, 120, 60),
    end: pose([75, 120], -130, -130, -55, 120, 60),
    implement: 'none',
    furniture: [
      [72, 125, 41, 103],
      [72, 125, 96, 125],
    ],
    tip: 'Costas e quadril apoiados. Empurre a plataforma sem travar os joelhos e retorne até cerca de 90° de flexão.',
  },
  crunch: {
    anchor: 'hip',
    start: pose([100, 144], -130, -31, -92, 80, -80),
    end: pose([100, 144], -130, -31, -50, 80, -80),
    implement: 'none',
    tip: 'Costas no chão e joelhos flexionados. Contraia o abdômen elevando só os ombros, sem puxar o pescoço.',
  },
  leg_raise: {
    anchor: 'hip',
    start: pose([70, 144], -90, -90, -90, 90, 90),
    end: pose([70, 144], -180, -180, -90, 90, 90),
    implement: 'none',
    tip: 'Lombar colada no chão. Eleve as pernas estendidas até 90° e desça devagar sem encostar os pés.',
  },
  hip_thrust: {
    anchor: 'ankle',
    start: pose([125, 150], -125, -10, -57, 120, 100),
    end: pose([125, 150], -90, -10, -90, 120, 100),
    implement: 'bar',
    implementAt: 'hip',
    furniture: [
      [28, 122, 70, 122],
      [34, 122, 34, 150],
      [64, 122, 64, 150],
    ],
    tip: 'Ombros apoiados no banco. Empurre o quadril para cima contraindo os glúteos até o tronco ficar alinhado com as coxas.',
  },
};

/** Liga cada exercício do plano a uma ilustração (pelo id). Exercícios novos: adicione aqui. */
export const DEMO_BY_ID: Partial<Record<string, DemoKey>> = {
  'ex-mon-1': 'squat',
  'ex-mon-2': 'hinge',
  'ex-mon-3': 'leg_extension',
  'ex-mon-4': 'leg_curl',
  'ex-mon-5': 'calf_raise',
  'ex-tue-1': 'bench_press',
  'ex-tue-2': 'incline_press',
  'ex-tue-3': 'shoulder_press',
  'ex-tue-4': 'lateral_raise',
  'ex-tue-5': 'triceps_pushdown',
  'ex-wed-1': 'bent_row',
  'ex-wed-2': 'lat_pulldown',
  'ex-wed-3': 'biceps_curl',
  'ex-wed-4': 'skull_crusher',
  'ex-wed-5': 'crunch',
  'ex-thu-1': 'leg_press',
  'ex-thu-2': 'leg_curl',
  'ex-thu-3': 'hip_thrust',
  'ex-thu-4': 'seated_calf',
  'ex-thu-5': 'leg_raise',
  'ex-fri-1': 'incline_press',
  'ex-fri-2': 'fly',
  'ex-fri-3': 'lat_pulldown',
  'ex-fri-4': 'seated_row',
  'ex-fri-5': 'lateral_raise',
  'ex-fri-6': 'biceps_curl',
  'ex-fri-7': 'triceps_pushdown',
};
