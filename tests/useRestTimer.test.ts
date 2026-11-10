import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRestTimer } from '../src/hooks/useRestTimer';
import { playFinish, playTick } from '../src/lib/sound';
import { useUIStore } from '../src/stores/uiStore';

vi.mock('../src/lib/sound', () => ({
  unlockAudio: vi.fn(),
  playTick: vi.fn(),
  playFinish: vi.fn(),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  useUIStore.setState({ soundEnabled: true });
});
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

  it('toca bipes nos últimos 3 segundos e ao terminar', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => result.current.start(5));
    act(() => {
      vi.advanceTimersByTime(5200);
    });
    expect(playTick).toHaveBeenCalledTimes(3);
    expect(playFinish).toHaveBeenCalledTimes(1);
  });

  it('não toca nada com o som desligado', () => {
    useUIStore.setState({ soundEnabled: false });
    const { result } = renderHook(() => useRestTimer());
    act(() => result.current.start(4));
    act(() => {
      vi.advanceTimersByTime(4200);
    });
    expect(playTick).not.toHaveBeenCalled();
    expect(playFinish).not.toHaveBeenCalled();
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
