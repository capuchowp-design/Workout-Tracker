import { forwardRef, useId, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, className = '', id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 text-base text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${className}`}
        {...rest}
      />
    </div>
  );
});
