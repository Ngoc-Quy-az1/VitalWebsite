import { useRef, useEffect } from "react";
import { Send, Paperclip, Mic } from "lucide-react";

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative bg-white border border-slate-200 rounded-[24px] shadow-sm focus-within:ring-2 focus-within:ring-teal-100 focus-within:border-teal-300 transition-all">
      <div className="flex items-end gap-2 p-2">
        <button className="p-2 text-slate-400 hover:text-teal-600 rounded-full hover:bg-teal-50 transition-colors shrink-0">
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mô tả triệu chứng hoặc câu hỏi của bạn..."
          className="flex-1 max-h-[200px] min-h-[40px] py-2.5 bg-transparent resize-none focus:outline-none placeholder:text-slate-400 text-slate-700 leading-relaxed overflow-y-auto"
          rows={1}
          disabled={disabled}
        />

        {value.trim() ? (
          <button
            onClick={onSend}
            disabled={disabled}
            className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 hover:scale-105 transition-all shrink-0 shadow-sm disabled:opacity-50 disabled:hover:scale-100 mb-0.5 mr-0.5"
          >
            <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
          </button>
        ) : (
          <button className="p-2 text-slate-400 hover:text-teal-600 rounded-full hover:bg-teal-50 transition-colors shrink-0 mb-0.5 mr-0.5">
            <Mic size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
