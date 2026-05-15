import { cn } from "../../utils/cn";

export default function DropdownMenuItem({
  icon: Icon,
  label,
  onClick,
  trailing,
  variant = "default",
  className,
  ...props
}) {
  const isDanger = variant === "danger";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.9375rem] transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900",
        isDanger
          ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
          : "text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800/80",
        className
      )}
      {...props}
    >
      {Icon ? (
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            isDanger
              ? "text-rose-500 dark:text-rose-400"
              : "text-slate-500 dark:text-slate-400"
          )}
        >
          <Icon size={18} strokeWidth={1.75} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1 font-medium">{label}</span>
      {trailing ? <span className="shrink-0 text-slate-400 dark:text-slate-500">{trailing}</span> : null}
    </button>
  );
}
