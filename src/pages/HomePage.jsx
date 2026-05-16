import { useEffect, useRef, useState } from "react";
import VirtualAvatarPanel from "../components/avatar/VirtualAvatarPanel";
import ChatHistorySidebar from "../components/chat/ChatHistorySidebar";
import ChatWindow from "../components/chat/ChatWindow";
import BottomInputArea from "../components/input/BottomInputArea";
import { QUICK_REPLIES } from "../constants/quickReplies";
import { useTheme } from "../hooks/useTheme";
import { analyzeAndAnswerHealthReportImage, prepareTtsText, streamChatbot } from "../services/chatbotApi";

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

const initialRecentChats = [
  {
    id: "chat-1",
    title: "Năm case lâm sàng mẫu",
    preview: "Tóm tắt hướng xử lý và dấu hiệu cần theo dõi",
  },
  {
    id: "chat-2",
    title: "Sửa cấu trúc JSON và thêm trường",
    preview: "Điều chỉnh dữ liệu đầu vào để chatbot đọc đúng",
  },
  {
    id: "chat-3",
    title: "Nhận diện mã số trong ảnh xét nghiệm",
    preview: "Phân tích ảnh tải lên và rút trích thông tin",
  },
  {
    id: "chat-4",
    title: "Điền dữ liệu thiếu trong file",
    preview: "Bổ sung trường còn trống từ nguồn hiện có",
  },
];

export default function HomePage() {
  const [messages, setMessages] = useState(starterMessages);
  const [recentChats, setRecentChats] = useState(initialRecentChats);
  const [activeChatId, setActiveChatId] = useState(initialRecentChats[0].id);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [interactionMode, setInteractionMode] = useState("chat");
  const [pendingImage, setPendingImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showMobileAvatar, setShowMobileAvatar] = useState(false);
  const { isDark, toggleTheme, setIsDark } = useTheme();
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const transcriptBufferRef = useRef("");
  const manualStopRef = useRef(false);
  const sendLockRef = useRef(false);
  const lastSentRef = useRef({ text: "", ts: 0 });

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setMessages(starterMessages);
    setInputValue("");
    setPendingImage(null);
    setApiError("");
    setActiveChatId(newChatId);
    setRecentChats((prev) => [
      {
        id: newChatId,
        title: "Cuộc trò chuyện mới",
        preview: "Bắt đầu một phiên tư vấn mới",
      },
      ...prev,
    ].slice(0, 4));
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleQuickReply = (text) => {
    setInputValue(text);
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
    const pendingImageForMessage = pendingImage;

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
      imagePreview: pendingImageForMessage?.preview,
    });
    // Clear composer image immediately after submitting.
    // Keep preview on the sent message bubble via pendingImageForMessage.
    setPendingImage(null);

    setApiError("");
    setInputValue("");
    setIsListening(false);
    setIsThinking(true);

    try {
      let result;
      if (pendingImageForMessage?.file) {
        result = await analyzeAndAnswerHealthReportImage({
          file: pendingImageForMessage.file,
          question: userText || "Phân tích ảnh đã tải lên",
          language: "vi",
          patientId: null,
          topK: 5,
        });
      } else {
        const assistantMessageId = `a-${Date.now()}`;
        let hasStartedStreaming = false;
        let streamedAnswer = "";
        const upsertAssistantMessage = (content, replace = false) => {
          setMessages((prev) => {
            const exists = prev.some((message) => message.id === assistantMessageId);
            if (!exists) {
              return [...prev, { id: assistantMessageId, role: "assistant", content }];
            }
            return prev.map((message) => (
              message.id === assistantMessageId
                ? {
                    ...message,
                    content: replace ? content : `${message.content}${content}`,
                  }
                : message
            ));
          });
        };

        result = await streamChatbot({
          query: userText || "Phân tích ảnh đã tải lên",
          topK: 5,
          includeDebug: false,
          onToken: (token) => {
            streamedAnswer += token;
            if (!hasStartedStreaming) {
              hasStartedStreaming = true;
              setIsThinking(false);
            }
            upsertAssistantMessage(token);
          },
          onDone: (payload) => {
            const finalAnswer = payload?.answer || streamedAnswer || "Mình chưa tạo được câu trả lời từ hệ thống.";
            upsertAssistantMessage(finalAnswer, true);
          },
        });
      }

      if (pendingImageForMessage?.file) {
        addMessage({
          id: `a-${Date.now()}`,
          role: "assistant",
          content: result?.answer || "Mình chưa tạo được câu trả lời từ hệ thống.",
        });
      }
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
        content: `Không xử lý được yêu cầu: ${message}`,
      });
      setIsSpeaking(false);
    } finally {
      setIsThinking(false);
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
    <section className="flex h-screen w-full flex-col p-2 sm:p-0">

      <section
        className="home-chat-grid relative min-h-0 flex-1 gap-2 sm:gap-0"
        style={{ "--sidebar-width": isSidebarCollapsed ? "88px" : "320px" }}
      >
        <div className="order-1 flex h-full min-h-0 flex-col overflow-visible xl:col-start-1 xl:row-start-1 xl:order-none">
          <ChatHistorySidebar
            recentChats={recentChats}
            activeChatId={activeChatId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            collapsed={isSidebarCollapsed}
            onToggleCollapsed={handleToggleSidebar}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onSetDark={setIsDark}
          />
        </div>

        <div className="order-3 flex h-full min-h-0 flex-col rounded-3xl border border-teal-100 bg-white/80 p-4 shadow-lg shadow-cyan-100/60 backdrop-blur sm:rounded-none sm:border-x-0 sm:border-y-0 sm:shadow-none md:p-5 xl:col-start-2 xl:row-start-1 xl:order-none dark:border-slate-700 dark:bg-slate-900/80">
          <ChatWindow messages={messages} isThinking={isThinking} />
          {apiError ? (
            <p className="mx-1 mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
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
            onInteractionModeChange={setInteractionMode}
            pendingImage={pendingImage}
            onPickImage={handleImagePick}
            onRemoveImage={handleRemoveImage}
            quickReplies={QUICK_REPLIES}
            onQuickReply={handleQuickReply}
          />
        </div>

        <section
          className={`order-2 relative hidden min-h-0 h-full 2xl:col-start-3 2xl:row-start-1 2xl:order-none 2xl:flex 2xl:flex-col ${showMobileAvatar ? "fixed inset-x-3 top-[5.5rem] z-40 block h-[38vh] 2xl:static 2xl:h-full" : ""}`}
        >
          <VirtualAvatarPanel
            isListening={isListening}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            onStopSpeaking={handleStopSpeaking}
          />
          {showMobileAvatar ? (
            <button
              type="button"
              onClick={() => setShowMobileAvatar(false)}
              className="absolute -bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-800 px-3 py-1 text-xs text-white 2xl:hidden"
            >
              Thu gọn avatar
            </button>
          ) : null}
        </section>
      </section>
    </section>
  );
}
