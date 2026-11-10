import { describe, expect, it } from 'vitest';
import { SEED_EXERCISES } from '../src/lib/constants';
import { computeJoints, DEMO_BY_ID, DEMOS, LENGTHS, lerpPose, type Pt } from '../src/lib/poses';

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe('poses', () => {
  it('mantém o comprimento dos membros em todas as fases do movimento', () => {
    for (const [key, demo] of Object.entries(DEMOS)) {
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const j = computeJoints(lerpPose(demo.start, demo.end, t), demo.anchor);
        expect(dist(j.ankle, j.knee), key).toBeCloseTo(LENGTHS.shin, 5);
        expect(dist(j.knee, j.hip), key).toBeCloseTo(LENGTHS.thigh, 5);
        expect(dist(j.hip, j.shoulder), key).toBeCloseTo(LENGTHS.torso, 5);
        expect(dist(j.shoulder, j.elbow), key).toBeCloseTo(LENGTHS.ua, 5);
        expect(dist(j.elbow, j.wrist), key).toBeCloseTo(LENGTHS.fa, 5);
      }
    }
  });

  it('todo exercício do plano inicial tem ilustração', () => {
    for (const e of SEED_EXERCISES) expect(DEMO_BY_ID[e.id], e.id).toBeDefined();
  });
});
