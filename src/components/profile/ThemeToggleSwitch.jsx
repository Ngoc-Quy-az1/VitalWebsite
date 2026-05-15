import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "../../utils/cn";

export default function ThemeToggleSwitch({ isDark, onChange, className }) {
  return (
    <motion.div
      layout
      className={cn(
        "relative flex h-9 w-full items-center rounded-full bg-slate-100/90 p-1 dark:bg-slate-800/90",
        className
      )}
      role="group"
      aria-label="Chế độ giao diện"
    >
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm dark:bg-slate-700"
        initial={false}
        animate={{ left: isDark ? "calc(50% + 2px)" : "4px" }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors",
          !isDark ? "text-slate-900" : "text-slate-500 dark:text-slate-400"
        )}
        aria-pressed={!isDark}
      >
        <Sun size={14} strokeWidth={2} />
        Sáng
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors",
          isDark ? "text-slate-100" : "text-slate-500"
        )}
        aria-pressed={isDark}
      >
        <Moon size={14} strokeWidth={2} />
        Tối
      </button>
    </motion.div>
  );
}
