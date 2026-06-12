import {
  ArrowUp,
  AudioLines,
  ChevronDown,
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

      <article className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-xl shadow-cyan-100/70 dark:border-slate-600 dark:bg-slate-900 dark:shadow-none">
        <textarea
          rows={3}
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSend) onSendMessage();
            }
          }}
          placeholder={t("inputPlaceholder")}
          className="block w-full resize-none border-none bg-transparent px-5 pt-5 pb-2 text-base leading-relaxed text-slate-700 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        <footer className="flex items-center justify-between gap-2 px-3 pb-3 pt-1">
          <label
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-teal-600 transition hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-slate-800"
            title={t("attachImage")}
          >
            <Plus size={20} strokeWidth={2} />
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPickImage}
            />
          </label>

          <button
            type="button"
            onClick={() =>
              onInteractionModeChange?.(interactionMode === "voice" ? "chat" : "voice")
            }
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-slate-800"
          >
            {interactionMode === "voice" ? t("voiceMode") : t("chatMode")}
            <ChevronDown size={14} className="opacity-60" />
          </button>

          <span className="flex-1" />

          <button
            type="button"
            onClick={handleVoiceClick}
            title={
              isListening
                ? t("stopRecording")
                : voiceEnabled
                  ? t("clickToTalk")
                  : t("voiceModeToggle")
            }
            className={`relative flex h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl px-3.5 text-sm font-semibold shadow-md transition ${
              isListening
                ? "bg-rose-500 text-white ring-4 ring-rose-200/80 dark:ring-rose-900/60"
                : voiceEnabled
                  ? "voice-btn-active bg-gradient-to-r from-teal-500 to-cyan-500 text-white ring-4 ring-teal-200/90 hover:from-teal-600 hover:to-cyan-600 dark:ring-teal-800/80"
                  : "border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-950 dark:text-teal-200"
            }`}
          >
            {isListening ? (
              <>
                <Square size={18} className="relative z-10 shrink-0 fill-white" />
                <span className="relative z-10 hidden sm:inline">{t("listening")}</span>
                <span className="absolute inset-0 flex items-center justify-center gap-1 px-10 opacity-40">
                  {waveDelays.map((delay) => (
                    <span
                      key={delay}
                      style={{ animationDelay: `${delay}ms` }}
                      className="wave-bar h-6 w-1 rounded-full bg-white/80"
                    />
                  ))}
                </span>
              </>
            ) : isSpeaking ? (
              <>
                <Square size={18} className="shrink-0 fill-current" />
                <span className="hidden sm:inline">{t("stopSpeaking")}</span>
              </>
            ) : voiceEnabled ? (
              <>
                <span className="relative flex shrink-0 items-center">
                  <Mic size={22} strokeWidth={2.5} />
                  <AudioLines
                    size={16}
                    strokeWidth={2.5}
                    className="absolute -right-2 -bottom-1 opacity-95"
                    aria-hidden
                  />
                </span>
                <span>{t("voiceVisualizerText")}</span>
              </>
            ) : (
              <>
                <Mic size={22} strokeWidth={2.5} className="shrink-0" />
                <span className="hidden min-[400px]:inline">{t("voiceMode")}</span>
              </>
            )}
          </button>

          {isThinking ? (
            <button
              type="button"
              onClick={onStopGeneration}
              aria-label="Dừng tạo câu trả lời"
              title="Dừng tạo câu trả lời"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md hover:bg-rose-600 transition"
            >
              <Square size={16} className="fill-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSendMessage()}
              disabled={!canSend}
              aria-label={t("sendMessage")}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                canSend
                  ? "bg-teal-600 text-white shadow-md hover:bg-teal-700"
                  : "cursor-not-allowed bg-teal-100 text-teal-300 dark:bg-slate-700 dark:text-slate-500"
              }`}
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          )}
        </footer>
      </article>

      <QuickReplies
        suggestions={quickReplies}
        onSelect={onQuickReply}
        disabled={Boolean(isThinking)}
      />
    </section>
  );
}
