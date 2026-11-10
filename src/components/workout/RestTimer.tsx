import { AnimatePresence, motion } from 'framer-motion';
import { formatDuration } from '../../lib/utils';
import { Button } from '../ui/Button';

interface Props {
  running: boolean;
  remaining: number;
  total: number;
  onAdjust: (deltaSec: number) => void;
  onStop: () => void;
}

const RADIUS = 44;
const CIRC = 2 * Math.PI * RADIUS;

export function RestTimer({ running, remaining, total, onAdjust, onStop }: Props) {
  const pct = total > 0 ? Math.min(1, remaining / total) : 0;
  return (
    <AnimatePresence>
      {running && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md p-4"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
        >
          <div className="flex items-center gap-4 rounded-2xl bg-zinc-900 p-4 text-white shadow-2xl dark:bg-zinc-800">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#3f3f46" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - pct)}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-xl font-semibold tabular-nums"
                aria-live="off"
              >
                {formatDuration(remaining)}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm font-medium text-zinc-300">Descanso</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => onAdjust(-15)}>
                  −15s
                </Button>
                <Button variant="secondary" onClick={() => onAdjust(15)}>
                  +15s
                </Button>
              </div>
              <Button onClick={onStop}>Pular descanso</Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
