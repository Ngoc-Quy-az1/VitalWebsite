import { ImagePlus, Mic, SendHorizonal, Square, X } from "lucide-react";

const waveDelays = [0, 120, 220, 320, 420];

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
  pendingImage,
  onPickImage,
  onRemoveImage,
}) {
  const voiceEnabled = interactionMode === "voice";

  return (
    <section className="mt-4 rounded-3xl border border-teal-100 bg-white/90 p-5 shadow-xl shadow-cyan-100/70 backdrop-blur">
      {pendingImage && (
        <div className="mb-3 inline-flex items-center gap-3 rounded-2xl bg-sky-50 p-2 pr-3">
          <img
            src={pendingImage.preview}
            alt="Pending upload"
            className="h-14 w-14 rounded-xl object-cover"
          />
          <div>
            <p className="max-w-[10rem] truncate text-base font-medium text-slate-700">
              {pendingImage.file.name}
            </p>
            <p className="text-sm text-slate-500">Ảnh sẵn sàng gửi kèm tin nhắn</p>
          </div>
          <button
            type="button"
            onClick={onRemoveImage}
            className="rounded-full p-1 text-slate-400 transition hover:bg-white hover:text-rose-500"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <button
          type="button"
          onClick={isSpeaking ? onStopSpeaking : onToggleListening}
          disabled={!voiceEnabled}
          className={`relative flex h-[84px] w-full items-center justify-center overflow-hidden rounded-3xl px-6 text-base text-white shadow-lg transition lg:w-48 ${
            isListening
              ? "bg-rose-500 hover:bg-rose-600"
              : voiceEnabled
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                : "cursor-not-allowed bg-slate-300 text-slate-600 shadow-none"
          }`}
        >
          {isListening ? (
            <>
              <Square size={20} className="relative z-10 mr-2 fill-white" />
              <span className="relative z-10 font-semibold">Đang ghi âm</span>
              <div className="absolute inset-0 flex items-center justify-center gap-1 px-8">
                {waveDelays.map((delay) => (
                  <span
                    key={delay}
                    style={{ animationDelay: `${delay}ms` }}
                    className="wave-bar h-8 w-1 rounded-full bg-white/65"
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <Mic size={24} className="mr-2" />
              <span className="font-semibold">
                {voiceEnabled ? (isSpeaking ? "Dừng đọc" : "Nhấn để nói") : "Đang ở chat chữ"}
              </span>
            </>
          )}
        </button>

        <div className="flex h-[84px] flex-1 items-center gap-2 rounded-2xl border border-teal-100 bg-white px-4 py-3">
          <label className="cursor-pointer rounded-xl p-2 text-teal-600 transition hover:bg-teal-50">
            <ImagePlus size={20} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickImage}
            />
          </label>
          <textarea
            rows={2}
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Nhập triệu chứng hoặc câu hỏi về bệnh thận..."
            className="h-full max-h-[70px] min-h-[56px] flex-1 resize-none border-none bg-transparent text-base text-slate-700 outline-none"
          />
          <button
            type="button"
            onClick={() => onSendMessage()}
            disabled={Boolean(isThinking)}
            className="rounded-xl bg-teal-600 p-3 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
