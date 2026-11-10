type AudioCtor = typeof AudioContext;

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor: AudioCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  return ctx;
}

/** Deve ser chamado dentro de um toque/clique do usuário (exigência dos navegadores). */
export function unlockAudio(): void {
  const c = getContext();
  if (c && c.state === 'suspended') void c.resume();
}

function tone(freq: number, offsetSec: number, durSec: number, volume = 0.25): void {
  const c = getContext();
  if (!c) return;
  const t0 = c.currentTime + offsetSec;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durSec);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + durSec + 0.02);
}

/** Bip curto usado na contagem regressiva (3, 2, 1). */
export function playTick(): void {
  tone(660, 0, 0.12);
}

/** Três bipes ao fim do descanso. */
export function playFinish(): void {
  tone(880, 0, 0.18);
  tone(880, 0.25, 0.18);
  tone(1319, 0.5, 0.45, 0.3);
}
