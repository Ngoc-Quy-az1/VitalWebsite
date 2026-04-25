import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, isThinking }) {
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-3xl border border-teal-100 bg-white/80 p-5 shadow-lg shadow-cyan-100/60 backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.22em] text-teal-600 uppercase">
            Phiên tư vấn
          </p>
          <h2 className="text-2xl font-semibold text-slate-800">Hội thoại</h2>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1.5 text-sm text-teal-700">
          {messages.length} tin nhắn
        </span>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isThinking ? (
          <article className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl border border-teal-100 bg-white px-5 py-4 text-slate-700 shadow-sm">
              <p className="mb-2 text-xs font-semibold tracking-wide text-teal-600 uppercase">
                KidneyCare AI
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Đang suy nghĩ</span>
                <span className="thinking-dot" />
                <span className="thinking-dot" />
                <span className="thinking-dot" />
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
