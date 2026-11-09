import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRestTimer } from '../src/hooks/useRestTimer';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useRestTimer', () => {
  it('conta regressivamente e chama onFinish ao zerar', () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useRestTimer(onFinish));

    act(() => result.current.start(3));
    expect(result.current.running).toBe(true);
    expect(result.current.remaining).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(2);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.running).toBe(false);
    expect(result.current.remaining).toBe(0);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('permite ajustar o tempo e parar', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => result.current.start(10));
    act(() => result.current.adjust(15));
    expect(result.current.remaining).toBe(25);
    expect(result.current.total).toBe(25);

    act(() => result.current.stop());
    expect(result.current.running).toBe(false);
    act(() => result.current.adjust(5)); // sem efeito parado
    expect(result.current.running).toBe(false);
  });
});
