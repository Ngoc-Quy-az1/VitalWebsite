import { Bot, Menu, Stethoscope } from "lucide-react";
import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ChatWindow({
  messages,
  isThinking,
  onMenuClick,
  onToggleAvatar,
  showMobileAvatar,
  onTriggerWebSearch,
}) {
  const listRef = useRef(null);
  const { t } = useLanguage();

  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const isNewMessage = messages.length !== prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    const behavior = isNewMessage ? "smooth" : "auto";
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, [messages, isThinking]);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="mb-3 shrink-0 px-1 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="xl:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
            aria-label="Mở lịch sử chat"
            title="Lịch sử chat"
          >
            <Menu size={20} />
          </button>
          
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-teal-600 uppercase sm:text-xs dark:text-teal-400">
              {t("consultationSession")}
            </p>
            <h2 className="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl dark:text-slate-100">
              {t("conversation")}
            </h2>
          </div>
        </div>

        {/* Nút bật/tắt Avatar AI trên di động */}
        <button
          type="button"
          onClick={onToggleAvatar}
          className="2xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/80 text-teal-700 hover:bg-teal-100 text-xs font-bold transition backdrop-blur-sm dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/50"
        >
          <Bot size={16} />
          <span>{showMobileAvatar ? "Ẩn trợ lý AI" : "Hiện trợ lý AI"}</span>
        </button>
      </header>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-2"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onTriggerWebSearch={onTriggerWebSearch} />
        ))}
        {isThinking ? (
          <article className="flex items-end gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm">
              <Stethoscope size={17} />
            </span>
            <span className="max-w-[75%] rounded-2xl rounded-bl-sm border border-teal-100 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                {t("thinkingText")}
                <span className="thinking-dot" />
                <span className="thinking-dot" />
                <span className="thinking-dot" />
              </span>
            </span>
          </article>
        ) : null}
      </div>
    </section>
  );
}
