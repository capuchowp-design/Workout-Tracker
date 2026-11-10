import { useCallback, useEffect, useRef, useState } from 'react';
import { playFinish, playTick, unlockAudio } from '../lib/sound';
import { vibrate } from '../lib/utils';
import { useUIStore } from '../stores/uiStore';

export function useRestTimer(onFinish?: () => void) {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const finishRef = useRef(onFinish);
  const lastTickRef = useRef(-1);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (endAt === null) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      const sound = useUIStore.getState().soundEnabled;
      setRemaining(left);
      if (left > 0 && left <= 3 && lastTickRef.current !== left) {
        lastTickRef.current = left;
        if (sound) playTick();
      }
      if (left === 0) {
        setEndAt(null);
        if (sound) playFinish();
        vibrate([200, 100, 200]);
        finishRef.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endAt]);

  const start = useCallback((seconds: number) => {
    unlockAudio();
    lastTickRef.current = -1;
    setTotal(seconds);
    setRemaining(seconds);
    setEndAt(Date.now() + seconds * 1000);
  }, []);

  const adjust = useCallback((deltaSec: number) => {
    lastTickRef.current = -1;
    setEndAt((prev) => (prev === null ? prev : prev + deltaSec * 1000));
    setTotal((t) => Math.max(0, t + deltaSec));
  }, []);

  const stop = useCallback(() => {
    setEndAt(null);
    setRemaining(0);
  }, []);

  return { remaining, total, running: endAt !== null, start, adjust, stop };
}
