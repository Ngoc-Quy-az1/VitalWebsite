import { useEffect, useRef } from "react";
import {
  ArrowUp,
  AudioLines,
  Keyboard,
  Mic,
  Plus,
  Square,
  X,
} from "lucide-react";
import QuickReplies from "../chat/QuickReplies";
import { useLanguage } from "../../contexts/LanguageContext";

const waveDelays = [0, 100, 200, 300];

export default function BottomInputArea({
  inputValue,
  onInputChange,
  onSendMessage,
  isThinking,
  isListening,
  onToggleListening,
  isSpeaking,
  onStopSpeaking,
  interactionMode,
  onInteractionModeChange,
  pendingImage,
  onPickImage,
  onRemoveImage,
  quickReplies,
  onQuickReply,
  onStopGeneration,
}) {
  const { t } = useLanguage();
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [inputValue]);

  const voiceEnabled = interactionMode === "voice";
  const hasAttachment = Array.isArray(pendingImage) ? pendingImage.length > 0 : Boolean(pendingImage);
  const canSend = Boolean((inputValue?.trim()) || hasAttachment) && !isThinking;

  const handleVoiceClick = () => {
    if (isSpeaking) {
      onStopSpeaking();
      return;
    }
    if (!voiceEnabled) {
      onInteractionModeChange?.("voice");
      return;
    }
    onToggleListening();
  };

  return (
    <section className="mt-auto shrink-0 pt-3 md:pt-4">
      {pendingImage && pendingImage.length > 0 && (
        <div className="mb-3">
          <div className="flex gap-3 overflow-x-auto py-1">
            {pendingImage.map((item, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden w-56 h-40">
                  <img src={item.preview} alt={`attachment-${idx}`} className="block w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
                  className="absolute -top-2 -right-2 rounded-full bg-white p-1 text-rose-500 shadow-md"
                  aria-label={t("removeImage")}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <article className="flex items-end gap-1.5 rounded-[32px] bg-[#f0f4f9] px-3.5 py-2 shadow-none border-0 dark:bg-slate-800">
        {/* Nút đính kèm Plus */}
        <label
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#444746] transition hover:bg-[#e0e4e9] dark:text-[#c4c7c5] dark:hover:bg-slate-700 mb-0.5"
          title={t("attachImage")}
        >
          <Plus size={22} strokeWidth={2} />
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onPickImage}
          />
        </label>

        {/* Ô nhập liệu textarea tự động giãn nở gọn gàng */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSend) onSendMessage();
            }
          }}
          placeholder={t("inputPlaceholder")}
          className="flex-1 resize-none border-none bg-transparent px-2 py-2 text-base leading-relaxed text-[#1f1f1f] placeholder-[#444746] outline-none dark:text-[#e3e3e3] dark:placeholder-[#c4c7c5] max-h-[140px] min-h-[24px] overflow-y-auto"
        />

        {/* Bộ nút chức năng bên phải */}
        <div className="flex items-center gap-1 shrink-0 mb-0.5">
          {/* Biểu tượng chuyển chế độ giọng nói / bàn phím tinh gọn */}
          <button
            type="button"
            onClick={() =>
              onInteractionModeChange?.(interactionMode === "voice" ? "chat" : "voice")
            }
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#444746] transition hover:bg-[#e0e4e9] dark:text-[#c4c7c5] dark:hover:bg-slate-700"
            title={interactionMode === "voice" ? t("chatMode") : t("voiceMode")}
          >
            {interactionMode === "voice" ? <Keyboard size={20} /> : <Mic size={20} />}
          </button>

          {/* Hiển thị nút Thu âm / Dừng thu ở chế độ giọng nói */}
          {voiceEnabled && (
            <button
              type="button"
              onClick={handleVoiceClick}
              title={
                isListening
                  ? t("stopRecording")
                  : t("clickToTalk")
              }
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                isListening
                  ? "bg-rose-500 text-white shadow-md animate-pulse"
                  : "text-[#444746] hover:bg-[#e0e4e9] dark:text-[#c4c7c5] dark:hover:bg-slate-700"
              }`}
            >
              {isListening ? (
                <Square size={14} className="fill-white" />
              ) : (
                <Mic size={20} />
              )}
            </button>
          )}

          {/* Nút gửi tin nhắn hoặc dừng tạo câu trả lời (chỉ ở chế độ chat chữ hoặc khi AI đang suy nghĩ) */}
          {(!voiceEnabled || isThinking) && (
            isThinking ? (
              <button
                type="button"
                onClick={onStopGeneration}
                aria-label="Dừng tạo câu trả lời"
                title="Dừng tạo câu trả lời"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition"
              >
                <Square size={14} className="fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSendMessage()}
                disabled={!canSend}
                aria-label={t("sendMessage")}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  canSend
                    ? "bg-teal-600 text-white shadow-md hover:bg-teal-700"
                    : "cursor-not-allowed text-[#444746]/40 dark:text-[#c4c7c5]/30"
                }`}
              >
                <ArrowUp size={20} strokeWidth={2.5} />
              </button>
            )
          )}
        </div>
      </article>

      <QuickReplies
        suggestions={quickReplies}
        onSelect={onQuickReply}
        disabled={Boolean(isThinking)}
      />
    </section>
  );
}
