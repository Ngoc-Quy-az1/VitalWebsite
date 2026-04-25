import { BrainCircuit, Mic, Volume2 } from "lucide-react";

function getStatusLabel({ isListening, isSpeaking, isThinking }) {
  if (isThinking) return "Đang phân tích";
  if (isSpeaking) return "Đang nói";
  if (isListening) return "Đang nghe";
  return "Sẵn sàng";
}

export default function VirtualAvatarPanel({
  isListening,
  isSpeaking,
  isThinking,
  onStopSpeaking,
}) {
  const status = getStatusLabel({ isListening, isSpeaking, isThinking });

  return (
    <section className="relative h-full rounded-3xl border border-teal-100 bg-white/70 p-5 shadow-lg shadow-teal-100/60 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.22em] text-teal-600 uppercase">
            Trợ lý ảo
          </p>
          <h2 className="text-2xl font-semibold text-slate-800">KidneyCare AI</h2>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700">
          {status}
        </span>
      </div>

      <div className="relative flex h-[calc(100%-4.5rem)] min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50 to-sky-100/70">
        {isListening && (
          <div className="listening-ring absolute inset-14 rounded-full border-2 border-teal-300" />
        )}

        <div className={`avatar-shell relative z-10 ${isSpeaking ? "avatar-speaking" : ""}`}>
          <div className="avatar-halo" />
          <div className="avatar-head">
            <div className="avatar-hair" />
            <div className="avatar-eye avatar-eye-left" />
            <div className="avatar-eye avatar-eye-right" />
            <div className={`avatar-mouth ${isSpeaking ? "avatar-mouth-open" : ""}`} />
          </div>
          <div className="avatar-body" />
        </div>

        {isThinking && (
          <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-xl bg-slate-900/85 px-3 py-2 text-sm text-white">
            <BrainCircuit size={16} className="animate-pulse" />
            Đang phân tích dữ liệu y khoa...
          </div>
        )}

        {isListening && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-teal-600/90 px-3 py-2 text-sm text-white">
            <Mic size={16} />
            Đang ghi nhận giọng nói
          </div>
        )}

        {isSpeaking && (
          <button
            type="button"
            onClick={onStopSpeaking}
            className="absolute top-4 right-4 flex items-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm font-medium text-white shadow transition hover:bg-rose-600"
          >
            <Volume2 size={16} />
            Dừng đọc
          </button>
        )}
      </div>
    </section>
  );
}
