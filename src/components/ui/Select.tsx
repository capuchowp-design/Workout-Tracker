import { forwardRef, useId, type SelectHTMLAttributes } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, className = '', id, children, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 text-base text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
});
