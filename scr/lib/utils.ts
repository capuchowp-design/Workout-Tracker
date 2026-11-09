import type { ExerciseSet } from '../types';

export function uid(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function toISODate(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function formatDateBR(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** Maior número de uma faixa de repetições ("8-10" → 10). */
export function repsTop(range: string): number {
  const nums = range.match(/\d+/g)?.map(Number) ?? [0];
  return Math.max(...nums);
}

/** Primeiro número de uma faixa de repetições ("8-10" → 8). */
export function repsBottom(range: string): number {
  return Number(range.match(/\d+/)?.[0] ?? 0);
}

export const setVolume = (s: Pick<ExerciseSet, 'weightKg' | 'reps'>): number => s.weightKg * s.reps;

/** Segunda-feira 00:00 da semana de `d`. */
export function startOfWeek(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
}

export function weekStartISO(d: Date): string {
  return toISODate(startOfWeek(d));
}

export function parseNumber(v: string): number {
  if (v.trim() === '') return NaN;
  return Number(v.replace(',', '.'));
}

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
}
