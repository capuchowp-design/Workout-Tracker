import { useCallback, useEffect, useRef, useState } from 'react';
import { vibrate } from '../lib/utils';

export function useRestTimer(onFinish?: () => void) {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const finishRef = useRef(onFinish);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (endAt === null) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setEndAt(null);
        vibrate([200, 100, 200]);
        finishRef.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endAt]);

  const start = useCallback((seconds: number) => {
    setTotal(seconds);
    setRemaining(seconds);
    setEndAt(Date.now() + seconds * 1000);
  }, []);

  const adjust = useCallback((deltaSec: number) => {
    setEndAt((prev) => (prev === null ? prev : prev + deltaSec * 1000));
    setTotal((t) => Math.max(0, t + deltaSec));
  }, []);

  const stop = useCallback(() => {
    setEndAt(null);
    setRemaining(0);
  }, []);

  return { remaining, total, running: endAt !== null, start, adjust, stop };
}
