import { Bot } from "lucide-react";
import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ChatWindow({ messages, isThinking }) {
  const listRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="mb-3 shrink-0 px-1">
        <p className="text-sm font-semibold tracking-[0.18em] text-teal-600 uppercase dark:text-teal-400">
          {t("consultationSession")}
        </p>
        <h2 className="text-xl font-semibold text-slate-800 md:text-2xl dark:text-slate-100">
          {t("conversation")}
        </h2>
      </header>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-2"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isThinking ? (
          <article className="flex items-end gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <Bot size={17} />
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
