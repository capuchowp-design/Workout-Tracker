import { useEffect, useState } from 'react';
import {
  computeJoints,
  DEMOS,
  GROUND,
  lerpPose,
  type DemoKey,
  type Pt,
} from '../../lib/poses';

const CYCLE_MS = 2800;

const points = (...list: Pt[]) => list.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

interface Props {
  demoKey: DemoKey;
  label: string;
}

/** Ilustração animada (início → fim → início) do movimento do exercício. */
export function ExerciseDemo({ demoKey, label }: Props) {
  const demo = DEMOS[demoKey];
  const [t, setT] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const startedAt = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const phase = ((now - startedAt) % CYCLE_MS) / CYCLE_MS;
      setT(0.5 - 0.5 * Math.cos(2 * Math.PI * phase));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [demoKey]);

  const j = computeJoints(lerpPose(demo.start, demo.end, t), demo.anchor);
  const implement = j[demo.implementAt ?? 'wrist'];

  return (
    <figure className="mt-3 rounded-xl bg-zinc-100 p-3 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      <svg viewBox="0 0 200 160" role="img" aria-label={`Ilustração do exercício ${label}`} className="h-44 w-full">
        <line x1="10" y1={GROUND} x2="190" y2={GROUND} stroke="currentColor" strokeWidth="2" opacity="0.25" />
        {demo.furniture?.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.4"
          />
        ))}
        {demo.cable && (
          <line
            x1={demo.cable[0]}
            y1={demo.cable[1]}
            x2={j.wrist[0]}
            y2={j.wrist[1]}
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.5"
          />
        )}
        <g stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <polyline points={points(j.toe, j.ankle, j.knee, j.hip, j.shoulder)} />
          <polyline points={points(j.shoulder, j.elbow, j.wrist)} opacity="0.75" />
        </g>
        <circle cx={j.head[0]} cy={j.head[1]} r="8" fill="currentColor" />
        {demo.implement !== 'none' && (
          <circle
            cx={implement[0]}
            cy={implement[1]}
            r={demo.implement === 'bar' ? 7 : 5}
            fill="#2563eb"
          />
        )}
      </svg>
      <figcaption className="mt-1 text-sm">{demo.tip}</figcaption>
    </figure>
  );
}
