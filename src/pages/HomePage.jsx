import { useEffect, useRef, useState } from "react";
import VirtualAvatarPanel from "../components/avatar/VirtualAvatarPanel";
import ChatWindow from "../components/chat/ChatWindow";
import BottomInputArea from "../components/input/BottomInputArea";
import { askChatbot, prepareTtsText } from "../services/chatbotApi";

function pickBestVietnameseVoice(voices) {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const viVoices = voices.filter((voice) => (voice.lang || "").toLowerCase().startsWith("vi"));
  if (viVoices.length === 0) return null;

  const scoreVoice = (voice) => {
    const name = (voice.name || "").toLowerCase();
    let score = 0;
    if (name.includes("natural")) score += 5;
    if (name.includes("google")) score += 3;
    if (name.includes("microsoft")) score += 2;
    if (name.includes("hoaimy") || name.includes("namminh")) score += 2;
    return score;
  };

  return [...viVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

const starterMessages = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Xin chào, tôi là trợ lý AI tư vấn thận học.\n- Hỗ trợ giải thích kết quả xét nghiệm\n- Theo dõi triệu chứng\n- Gợi ý hướng chăm sóc cơ bản",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "Lưu ý: **Thông tin chỉ để tham khảo**, bạn nên đến cơ sở y tế khi có dấu hiệu bất thường.",
  },
];

export default function HomePage() {
  const [messages, setMessages] = useState(starterMessages);
  const [inputValue, setInputValue] = useState("");
  const [interactionMode, setInteractionMode] = useState("chat");
  const [pendingImage, setPendingImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [apiError, setApiError] = useState("");
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const transcriptBufferRef = useRef("");
  const manualStopRef = useRef(false);
  const sendLockRef = useRef(false);
  const lastSentRef = useRef({ text: "", ts: 0 });

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleToggleListening = () => {
    if (interactionMode !== "voice") {
      setApiError("Hãy bật chế độ Giao tiếp để dùng micro.");
      return;
    }

    if (isSpeaking) {
      setIsSpeaking(false);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }

    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setApiError("Trình duyệt chưa hỗ trợ Speech Recognition.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let finalizedText = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const item = event.results[i];
          const piece = item?.[0]?.transcript?.trim() || "";
          if (!piece) continue;
          if (item.isFinal) {
            finalizedText += `${piece} `;
          }
        }

        if (finalizedText) {
          const merged = `${transcriptBufferRef.current} ${finalizedText}`.trim();
          transcriptBufferRef.current = merged;
          setInputValue(merged);
        }

        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        // Dừng khi người dùng im lặng một lúc.
        silenceTimeoutRef.current = setTimeout(() => {
          if (!recognitionRef.current) return;
          manualStopRef.current = true;
          recognitionRef.current.stop();
        }, 1800);
      };
      recognition.onend = async () => {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        const transcript = transcriptBufferRef.current.trim();
        transcriptBufferRef.current = "";
        manualStopRef.current = false;
        setIsListening(false);
        if (!transcript) return;
        setInputValue(transcript);
        await handleSendMessage(transcript, "voice");
      };
      recognition.onerror = () => {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        transcriptBufferRef.current = "";
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }

    if (isListening) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      transcriptBufferRef.current = "";
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      recognitionRef.current.start();
      setIsListening(true);
      setApiError("");
    } catch {
      setIsListening(false);
    }
  };

  const handleStopSpeaking = () => {
    setIsSpeaking(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleImagePick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPendingImage({ file, preview });
    setIsThinking(true);
    setTimeout(() => setIsThinking(false), 1200);
  };

  const handleRemoveImage = () => {
    if (pendingImage?.preview) {
      URL.revokeObjectURL(pendingImage.preview);
    }
    setPendingImage(null);
  };

  const handleSendMessage = async (overrideText = null, source = "manual") => {
    const draftText = String(overrideText ?? inputValue ?? "").trim();
    if (!draftText && !pendingImage) return;
    if (sendLockRef.current) return;

    const now = Date.now();
    const lastText = lastSentRef.current.text;
    const lastTs = lastSentRef.current.ts;
    // Chỉ chặn gửi trùng cho voice để tránh double fire từ SpeechRecognition.
    if (source === "voice" && draftText && draftText === lastText && now - lastTs < 1500) {
      return;
    }

    const userText = draftText;
    sendLockRef.current = true;
    if (userText) {
      lastSentRef.current = { text: userText, ts: now };
    }
    addMessage({
      id: `u-${Date.now()}`,
      role: "user",
      content: userText || "(uploaded image)",
      imagePreview: pendingImage?.preview,
    });

    setApiError("");
    setInputValue("");
    setIsListening(false);
    setIsThinking(true);

    try {
      const result = await askChatbot({
        query: userText || "Phân tích ảnh đã tải lên",
        topK: 5,
        includeDebug: false,
      });

      addMessage({
        id: `a-${Date.now()}`,
        role: "assistant",
        content: result?.answer || "Mình chưa tạo được câu trả lời từ hệ thống.",
      });
      const spoken = result?.answer || "";
      if (interactionMode === "voice" && spoken && typeof window !== "undefined" && window.speechSynthesis) {
        try {
          const prepared = await prepareTtsText({ text: spoken });
          const utterance = new SpeechSynthesisUtterance(prepared?.speak_text || spoken);
          const voices = window.speechSynthesis.getVoices();
          const bestVoice = pickBestVietnameseVoice(voices);
          if (bestVoice) {
            utterance.voice = bestVoice;
            utterance.lang = bestVoice.lang || "vi-VN";
          } else {
            utterance.lang = "vi-VN";
          }
          utterance.rate = 0.97;
          utterance.pitch = 1.03;
          utterance.volume = 1.0;
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        } catch {
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      setApiError(message);
      addMessage({
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          "Mình chưa kết nối được chatbot backend. Vui lòng kiểm tra API service và thử lại.",
      });
      setIsSpeaking(false);
    } finally {
      setIsThinking(false);
      handleRemoveImage();
      sendLockRef.current = false;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const warmup = () => window.speechSynthesis.getVoices();
      warmup();
      window.speechSynthesis.addEventListener?.("voiceschanged", warmup);
      return () => {
        window.speechSynthesis.cancel();
        window.speechSynthesis.removeEventListener?.("voiceschanged", warmup);
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    }
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (interactionMode === "voice") return;
    setIsListening(false);
    setIsSpeaking(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      recognitionRef.current.stop();
    }
  }, [interactionMode]);

  return (
    <section className="mx-auto flex h-screen max-w-[1680px] flex-col p-4 md:p-5">
      <header className="mb-4 flex items-center justify-between rounded-3xl border border-cyan-100 bg-white/75 px-5 py-4 shadow-sm backdrop-blur md:px-6">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-cyan-600 uppercase">
            Hệ thống AI Chatbot hỏi đáp về thận
          </p>
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Trợ lý tư vấn thận ảo
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-full border border-teal-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setInteractionMode("chat")}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                interactionMode === "chat"
                  ? "bg-teal-600 text-white"
                  : "text-slate-600 hover:bg-teal-50"
              }`}
            >
              Chat chữ
            </button>
            <button
              type="button"
              onClick={() => setInteractionMode("voice")}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                interactionMode === "voice"
                  ? "bg-teal-600 text-white"
                  : "text-slate-600 hover:bg-teal-50"
              }`}
            >
              Giao tiếp
            </button>
          </div>
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            Phiên an toàn
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="min-h-0">
          <VirtualAvatarPanel
            isListening={isListening}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            onStopSpeaking={handleStopSpeaking}
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <ChatWindow messages={messages} isThinking={isThinking} />
          {apiError ? (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Lỗi kết nối API: {apiError}
            </p>
          ) : null}
          <BottomInputArea
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
            isListening={isListening}
            onToggleListening={handleToggleListening}
            isSpeaking={isSpeaking}
            onStopSpeaking={handleStopSpeaking}
            interactionMode={interactionMode}
            pendingImage={pendingImage}
            onPickImage={handleImagePick}
            onRemoveImage={handleRemoveImage}
          />
        </div>
      </div>
    </section>
  );
}
