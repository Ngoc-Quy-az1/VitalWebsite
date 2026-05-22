import { BrainCircuit, Mic, Volume2 } from "lucide-react";
import HealthSnapshot from "./HealthSnapshot";
import VoiceVisualizer from "./VoiceVisualizer";
import { useLanguage } from "../../contexts/LanguageContext";

function getStatusLabel({ isListening, isSpeaking, isThinking, t }) {
  if (isThinking) return t("thinking");
  if (isSpeaking) return t("speaking");
  if (isListening) return t("listening");
  return t("ready");
}

function getVisualizerVariant({ isListening, isSpeaking, isThinking }) {
  if (isThinking) return "thinking";
  if (isListening) return "listening";
  if (isSpeaking) return "speaking";
  return "idle";
}

export default function VirtualAvatarPanel({
  isListening,
  isSpeaking,
  isThinking,
  onStopSpeaking,
  compact = false,
}) {
  const { t, language } = useLanguage();
  const status = getStatusLabel({ isListening, isSpeaking, isThinking, t });
  const visualizerActive = isListening || isSpeaking || isThinking;
  const visualizerVariant = getVisualizerVariant({ isListening, isSpeaking, isThinking });

  return (
    <section className="relative flex h-full flex-col rounded-3xl border border-teal-100 bg-white/70 p-4 shadow-lg shadow-teal-100/60 backdrop-blur sm:rounded-none sm:border-y-0 sm:border-r-0 sm:shadow-none md:p-5 dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-none">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-teal-600 uppercase dark:text-teal-400">
            {t("assistantTitle")}
          </p>
          <h2 className="text-lg font-semibold text-slate-800 md:text-xl dark:text-slate-100">
            KidneyCare AI
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          {status}
        </span>
      </div>

      {!compact && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("healthSnapshot")}
          </p>
          <HealthSnapshot />
        </div>
      )}

      <div
        className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50 to-sky-100/70 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 ${compact ? "min-h-[200px]" : "min-h-[220px]"}`}
      >
        {isListening && (
          <div className="listening-ring absolute inset-10 rounded-full border-2 border-teal-300 dark:border-teal-600" />
        )}

        <div className={`avatar-shell relative z-10 scale-90 md:scale-100 ${isSpeaking ? "avatar-speaking" : ""}`}>
          <div className="avatar-halo" />
          <div className="avatar-head">
            <div className="avatar-hair" />
            <div className="avatar-eye avatar-eye-left" />
            <div className="avatar-eye avatar-eye-right" />
            <div className={`avatar-mouth ${isSpeaking ? "avatar-mouth-open" : ""}`} />
          </div>
          <div className="avatar-body" />
        </div>

        <div className="absolute bottom-3 left-1/2 z-20 w-[85%] max-w-xs -translate-x-1/2 rounded-xl bg-white/90 px-3 py-2 shadow dark:bg-slate-900/90">
          <p className="mb-1 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {isSpeaking ? t("speaking") : isListening ? t("listening") : isThinking ? t("thinking") : t("waitingInteraction")}
          </p>
          <VoiceVisualizer active={visualizerActive} variant={visualizerVariant} />
        </div>

        {isThinking && (
          <div className="absolute top-3 right-3 flex items-center gap-2 rounded-xl bg-slate-900/85 px-2.5 py-1.5 text-xs text-white">
            <BrainCircuit size={14} className="animate-pulse" />
            {t("scanningData")}
          </div>
        )}

        {isListening && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-xl bg-teal-600/90 px-2.5 py-1.5 text-xs text-white">
            <Mic size={14} />
            {t("voiceVisualizerText")}
          </div>
        )}

        {isSpeaking && (
          <button
            type="button"
            onClick={onStopSpeaking}
            className="absolute right-3 bottom-3 z-30 flex items-center gap-1.5 rounded-xl bg-rose-500 px-2.5 py-1.5 text-xs font-medium text-white shadow transition hover:bg-rose-600"
          >
            <Volume2 size={14} />
            {t("stopSpeaking")}
          </button>
        )}
      </div>
    </section>
  );
}
