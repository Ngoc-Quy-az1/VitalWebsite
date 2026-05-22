import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Crown,
  Globe2,
  HelpCircle,
  LogOut,
  Settings2,
  UserRound,
} from "lucide-react";
import DropdownMenuItem from "./DropdownMenuItem";
import ThemeToggleSwitch from "./ThemeToggleSwitch";
import { usePopoverPosition } from "../../hooks/usePopoverPosition";
import { cn } from "../../utils/cn";

const menuVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.1, ease: [0.4, 0, 1, 1] },
  },
};

const compactItemClass =
  "gap-2 rounded-lg px-2 py-1.5 text-[0.8125rem] [&_span:first-child]:h-7 [&_span:first-child]:w-7 [&_svg]:size-4";

function MenuPanel({
  menuId,
  isDark,
  userName,
  userPlan,
  userInitials,
  language = "VI",
  onThemeChange,
  onNavigate,
  className,
  rail,
}) {
  const handleItemClick = (action) => () => {
    onNavigate?.(action);
  };

  const setTheme = (nextDark) => {
    if (nextDark !== isDark) onThemeChange?.();
  };

  // Switchable translations
  const t = {
    VI: {
      profile: "Hồ sơ",
      settings: "Cài đặt",
      theme: "Giao diện",
      light: "Sáng",
      dark: "Tối",
      language: "Ngôn ngữ",
      help: "Trợ giúp",
      upgrade: "Nâng cấp gói",
      logout: "Đăng xuất",
      proBadge: "Pro",
    },
    EN: {
      profile: "Profile",
      settings: "Settings",
      theme: "Interface",
      light: "Light",
      dark: "Dark",
      language: "Language",
      help: "Help",
      upgrade: "Upgrade Plan",
      logout: "Log out",
      proBadge: "Pro",
    },
  }[language || "VI"];

  return (
    <motion.div
      id={menuId}
      role="menu"
      aria-orientation="vertical"
      variants={menuVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ transformOrigin: "bottom center" }}
      className={cn(
        rail ? "w-[240px]" : "w-full",
        "overflow-hidden rounded-2xl",
        "border border-slate-200/80 bg-white p-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)]",
        "dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      <button
        type="button"
        onClick={handleItemClick("profile")}
        className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white dark:bg-slate-200 dark:text-slate-900 animate-pulse">
          {userInitials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">
            {userName}
          </span>
          <span className="block truncate text-[11px] font-semibold text-teal-600 dark:text-teal-400">
            {userPlan}
          </span>
        </span>
        <ChevronRight size={14} className="shrink-0 text-slate-400" strokeWidth={2} />
      </button>

      <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

      <div className="py-0.5">
        <DropdownMenuItem
          role="menuitem"
          icon={UserRound}
          label={t.profile}
          className={compactItemClass}
          onClick={handleItemClick("profile")}
        />
        <DropdownMenuItem
          role="menuitem"
          icon={Settings2}
          label={t.settings}
          className={compactItemClass}
          onClick={handleItemClick("settings")}
        />
      </div>

      <div className="px-2 py-1.5" role="none">
        <p className="mb-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.theme}</p>
        <ThemeToggleSwitch isDark={isDark} onChange={setTheme} className="h-8" />
      </div>

      <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

      <div className="py-0.5">
        <DropdownMenuItem
          role="menuitem"
          icon={Globe2}
          label={t.language}
          className={compactItemClass}
          trailing={<span className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400">{language}</span>}
          onClick={handleItemClick("language")}
        />
        <DropdownMenuItem
          role="menuitem"
          icon={HelpCircle}
          label={t.help}
          className={compactItemClass}
          trailing={<ChevronRight size={14} className="text-slate-400" strokeWidth={2} />}
          onClick={handleItemClick("help")}
        />
        <DropdownMenuItem
          role="menuitem"
          icon={Crown}
          label={t.upgrade}
          className={compactItemClass}
          trailing={
            <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
              {t.proBadge}
            </span>
          }
          onClick={handleItemClick("upgrade")}
        />
      </div>

      <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

      <DropdownMenuItem
        role="menuitem"
        icon={LogOut}
        label={t.logout}
        variant="danger"
        className={compactItemClass}
        trailing={<ChevronRight size={14} className="text-rose-400" strokeWidth={2} />}
        onClick={handleItemClick("logout")}
      />
    </motion.div>
  );
}

export default function ProfileDropdown({
  isOpen,
  menuId,
  isDark,
  onThemeChange,
  anchorRef,
  usePortal = false,
  userName = "Ngọc Quý",
  userPlan = "Free",
  userInitials = "NQ",
  language = "VI",
  rail = false,
  className,
  onNavigate,
}) {
  const position = usePopoverPosition(anchorRef, isOpen && usePortal);

  const panelProps = {
    menuId,
    isDark,
    userName,
    userPlan,
    userInitials,
    language,
    rail,
    onThemeChange,
    onNavigate,
    className,
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !usePortal ? (
          <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-[calc(100%-8px)]">
            <MenuPanel {...panelProps} />
          </div>
        ) : null}
      </AnimatePresence>

      {typeof document !== "undefined" && usePortal
        ? createPortal(
            <AnimatePresence>
              {isOpen && position ? (
                <div
                  className="fixed z-[200]"
                  style={{
                    left: position.left,
                    bottom: position.bottom,
                    transform: "translateX(-50%)",
                  }}
                >
                  <MenuPanel {...panelProps} />
                </div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
