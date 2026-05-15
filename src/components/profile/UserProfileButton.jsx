import { ChevronUp } from "lucide-react";
import { cn } from "../../utils/cn";

export default function UserProfileButton({
  collapsed = false,
  isOpen = false,
  userName = "Ngọc Quý",
  userPlan = "Free",
  userInitials = "NQ",
  onClick,
  triggerRef,
  menuId,
  ...props
}) {
  if (collapsed) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={onClick}
        aria-label="Tài khoản"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200",
          "bg-slate-800 text-white shadow-sm hover:bg-slate-700",
          "dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white",
          isOpen && "ring-2 ring-teal-500/30 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"
        )}
        {...props}
      >
        {userInitials}
      </button>
    );
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-controls={isOpen ? menuId : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-all duration-200",
        "hover:bg-slate-100/70 dark:hover:bg-slate-800/50",
        isOpen && "bg-slate-100/80 dark:bg-slate-800/60"
      )}
      {...props}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white dark:bg-slate-200 dark:text-slate-900">
        {userInitials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{userName}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userPlan}</p>
      </div>
      <ChevronUp
        size={16}
        className={cn(
          "shrink-0 text-slate-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
        strokeWidth={2}
      />
    </button>
  );
}
