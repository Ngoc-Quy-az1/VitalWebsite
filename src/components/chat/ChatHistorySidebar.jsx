import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
} from "lucide-react";
import UserProfileSection from "../profile/UserProfileSection";

const quickActions = [
  { label: "Cuộc trò chuyện mới", icon: Plus },
  { label: "Tài nguyên", icon: Sparkles },
];

export default function ChatHistorySidebar({
  recentChats = [],
  activeChatId,
  onNewChat,
  onSelectChat,
  collapsed = false,
  onToggleCollapsed,
  isDark = false,
  onToggleTheme,
  onSetDark,
  userEmail = "quydang16012004@gmail.com",
}) {
  const railButtonClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300";

  return (
    <aside
      className={`flex h-full min-h-0 flex-col border border-slate-200/80 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20 sm:rounded-none sm:border-y-0 sm:shadow-none ${
        collapsed
          ? "w-[88px] overflow-visible p-2 sm:border-l-0"
          : "overflow-visible p-4 sm:border-l-0"
      }`}
    >
      {collapsed ? (
        <div className="flex h-full min-h-0 flex-col">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="mb-3 inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300"
            aria-label="Mở rộng khung lịch sử chat"
            aria-expanded={false}
          >
            <ChevronRight size={18} />
          </button>

          <div className="flex flex-col items-center gap-2">
            {quickActions.map((item) => {
              const Icon = item.icon;
              const isPrimaryAction = item.label === "Cuộc trò chuyện mới";
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={isPrimaryAction ? onNewChat : undefined}
                  className={`${railButtonClass} ${isPrimaryAction ? "bg-slate-100 dark:bg-slate-800" : ""}`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>

          <UserProfileSection
            rail={collapsed}
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            className="mt-auto shrink-0 self-center pt-2"
          />
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-4 flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                VitalWebsite
              </h2>
            </div>
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300"
              aria-label="Thu gọn khung lịch sử chat"
              aria-expanded={true}
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <nav className="shrink-0 space-y-1.5">
            {quickActions.map((item) => {
              const Icon = item.icon;
              const isPrimaryAction = item.label === "Cuộc trò chuyện mới";

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={isPrimaryAction ? onNewChat : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[0.98rem] transition ${
                    isPrimaryAction
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Icon size={18} />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <p className="mb-3 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">Gần đây</p>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {recentChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => onSelectChat?.(chat.id)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-teal-200 bg-teal-50 text-slate-900 shadow-sm dark:border-teal-800 dark:bg-teal-950/40 dark:text-slate-100"
                        : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    <p className="truncate text-[0.98rem] font-medium">{chat.title}</p>
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                      {chat.preview}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <UserProfileSection
            rail={false}
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            className="mt-auto flex w-full shrink-0 justify-center border-t border-slate-100 pt-3 dark:border-slate-800"
          />
        </div>
      )}
    </aside>
  );
}
