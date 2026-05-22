import {
  PanelLeftClose,
  PanelLeft,
  Plus,
  Sparkles,
} from "lucide-react";
import UserProfileSection from "../profile/UserProfileSection";
import { useLanguage } from "../../contexts/LanguageContext";

const getQuickActions = (t) => [
  { label: t("newChat"), icon: Plus },
  { label: t("resources"), icon: Sparkles },
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
  onNavigateUpgrade,
  customPlan,
  onUpgradeSuccess,
}) {
  const { t } = useLanguage();
  const railButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200";

  const quickActions = getQuickActions(t);
  const visibleRecentChats = recentChats.filter(
    (chat) => chat?.title?.trim() !== "Cuộc trò chuyện mới"
  );

  return (
    <aside
      data-tour="sidebar"
      className={`flex h-full min-h-0 flex-col border border-slate-200/80 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20 sm:rounded-none sm:border-y-0 sm:shadow-none ${
        collapsed
          ? "w-[60px] overflow-visible p-2.5 sm:border-l-0"
          : "w-[320px] overflow-visible p-4 sm:border-l-0"
      }`}
    >
      {collapsed ? (
        <div className="flex h-full min-h-0 flex-col items-center">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="mb-4 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Mở rộng khung lịch sử chat"
            aria-expanded={false}
            title="Mở thanh bên"
          >
            <PanelLeft size={18} />
          </button>

          <div className="flex flex-col items-center gap-2">
            {quickActions.map((item) => {
              const Icon = item.icon;
              const isPrimaryAction = item.label === t("newChat");
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={isPrimaryAction ? onNewChat : undefined}
                  className={railButtonClass}
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
            onNavigateUpgrade={onNavigateUpgrade}
            customPlan={customPlan}
            onUpgradeSuccess={onUpgradeSuccess}
            className="mt-auto shrink-0 self-center pt-2"
          />
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800/60">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                  {t("sidebarTitle")}
                </span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Thu gọn khung lịch sử chat"
              aria-expanded={true}
              title="Đóng thanh bên"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          <nav className="shrink-0 space-y-0.5">
            {quickActions.map((item) => {
              const Icon = item.icon;
              const isPrimaryAction = item.label === t("newChat");

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={isPrimaryAction ? onNewChat : undefined}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 text-slate-700 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:bg-slate-800/50"
                >
                  <Icon size={16} className="text-slate-500 dark:text-slate-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <p className="mb-2 shrink-0 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t("recent")}
            </p>
            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
              {visibleRecentChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => onSelectChat?.(chat.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 truncate ${
                      isActive
                        ? "bg-slate-150 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
                        : "text-slate-700 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:bg-slate-800/50"
                    }`}
                    title={chat.title}
                  >
                    <span className="block truncate">{chat.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <UserProfileSection
            rail={false}
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            onNavigateUpgrade={onNavigateUpgrade}
            customPlan={customPlan}
            onUpgradeSuccess={onUpgradeSuccess}
            className="mt-auto flex w-full shrink-0 justify-center border-t border-slate-100 pt-3 dark:border-slate-800/60"
          />
        </div>
      )}
    </aside>
  );
}

