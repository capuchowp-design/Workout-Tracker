import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const styles: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary:
    'bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
  ghost: 'text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800/60',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', fullWidth = false, className = '', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${styles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    />
  );
});
