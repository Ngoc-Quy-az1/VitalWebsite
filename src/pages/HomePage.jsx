import { useEffect, useRef, useState } from "react";
import VirtualAvatarPanel from "../components/avatar/VirtualAvatarPanel";
import ChatHistorySidebar from "../components/chat/ChatHistorySidebar";
import ChatWindow from "../components/chat/ChatWindow";
import BottomInputArea from "../components/input/BottomInputArea";
import { QUICK_REPLIES } from "../constants/quickReplies";
import { useTheme } from "../hooks/useTheme";
import { analyzeAndAnswerHealthReportImage, analyzeHealthReportImage, prepareTtsText, streamChatbot, fetchWithAuth, voiceStt, deleteChatSession, pinChatSession } from "../services/chatbotApi";
import { useLanguage } from "../contexts/LanguageContext";
import UpgradePage from "../components/profile/UpgradePage";
import InteractiveTour from "../components/tour/InteractiveTour";
import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "../components/admin/AdminDashboard";


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
  const { t, language } = useLanguage();
  const { user } = useAuth();

  if (user && user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  const [activeView, setActiveView] = useState("chat"); // 'chat' or 'upgrade'
  const [customPlan, setCustomPlan] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vital_plan") || "Standard Plan";
    }
    return "Standard Plan";
  });

  const handleUpgradeSuccess = () => {
    localStorage.setItem("vital_plan", "Premium Pro");
    setCustomPlan("Premium Pro");
  };

  const [messages, setMessages] = useState(() => {
    return starterMessages.map((msg) => {
      if (msg.id === "m1") return { ...msg, content: t("starterGreeting") };
      if (msg.id === "m2") return { ...msg, content: t("starterDisclaimer") };
      return msg;
    });
  });
  const [recentChats, setRecentChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [interactionMode, setInteractionMode] = useState("chat");
  const [pendingImages, setPendingImages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [useServerStt] = useState(false); // use browser SpeechRecognition by default
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showMobileAvatar, setShowMobileAvatar] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isDark, toggleTheme, setIsDark } = useTheme();
  
  const ttsQueueRef = useRef([]);
  const isTtsSpeakingRef = useRef(false);
  const ttsSentenceBufferRef = useRef("");
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const silenceTimeoutRef = useRef(null);
  const transcriptBufferRef = useRef("");
  const manualStopRef = useRef(false);
  const autoSubmitVoiceRef = useRef(false);
  const sendLockRef = useRef(false);
  const lastSentRef = useRef({ text: "", ts: 0 });
  const activeAbortControllerRef = useRef(null);
  const pendingCreationPromiseRef = useRef(null);

  const refreshSessionsList = async (targetActiveId = null) => {
    try {
      const response = await fetchWithAuth("/auth-api/chat/sessions");
      if (response.ok) {
        const sessions = await response.json();
        setRecentChats(sessions);
        if (targetActiveId) {
          setActiveChatId(targetActiveId);
        } else if (sessions.length > 0 && !activeChatId) {
          setActiveChatId(sessions[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to refresh sessions:", err);
    }
  };

  const consumeFreshLoginFlag = () => {
    try {
      const isFreshLogin = sessionStorage.getItem("vital_fresh_login") === "1";
      if (isFreshLogin) {
        sessionStorage.removeItem("vital_fresh_login");
      }
      return isFreshLogin;
    } catch {
      return false;
    }
  };

  const createNewSession = async (title = "Cuộc trò chuyện mới") => {
    try {
      const response = await fetchWithAuth("/auth-api/chat/sessions", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      if (response.ok) {
        const newSession = await response.json();
        setRecentChats((prev) => [newSession, ...prev]);
        setActiveChatId(newSession.id);
        return newSession;
      }
    } catch (err) {
      console.error("Failed to create new session:", err);
    }
  };

  // Fetch all user sessions on mount (do not auto-create a session here)
  useEffect(() => {
    async function initChats() {
      try {
        const response = await fetchWithAuth("/auth-api/chat/sessions");
        if (response.ok) {
          const sessions = await response.json();
          const isFreshLogin = consumeFreshLoginFlag();

          if (sessions && sessions.length > 0) {
            if (isFreshLogin) {
              const newSession = await createNewSession("Cuộc trò chuyện mới");
              setRecentChats((prev) => (newSession ? [newSession, ...prev] : sessions));
              if (newSession?.id) {
                setActiveChatId(newSession.id);
              }
            } else {
              setRecentChats(sessions);
              setActiveChatId(sessions[0].id);
            }
          } else {
            // no sessions yet; create a new one for the first visit or fresh login
            const newSession = await createNewSession("Cuộc trò chuyện mới");
            if (!newSession?.id) {
              setRecentChats([]);
              setActiveChatId(null);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user chat sessions:", err);
      }
    }
    initChats();
  }, []);

  // When user has just logged in (fresh), auto-create a new session and open it.
  useEffect(() => {
    const handler = async () => {
      try {
        const newSession = await createNewSession("Cuộc trò chuyện mới");
        if (newSession && newSession.id) {
          setActiveChatId(newSession.id);
        }
      } catch (err) {
        console.error("Failed to create session on login:", err);
      }
    };
    window.addEventListener("auth-just-logged-in", handler);
    return () => window.removeEventListener("auth-just-logged-in", handler);
  }, []);

  // Fetch messages when activeChatId changes
  useEffect(() => {
    if (!activeChatId) return;

    async function loadMessages() {
      try {
        const response = await fetchWithAuth(`/auth-api/chat/sessions/${activeChatId}/messages`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const mapped = data.map((msg) => ({
              id: msg.id,
              role: msg.sender_type === "USER" ? "user" : "assistant",
              content: msg.message_type === 'IMAGE' ? '' : msg.content,
              imagePreviews: msg.message_type === 'IMAGE' ? [msg.content] : undefined,
            }));
            setMessages(mapped);
          } else {
            setMessages(
              starterMessages.map((msg) => {
                if (msg.id === "m1") return { ...msg, content: t("starterGreeting") };
                if (msg.id === "m2") return { ...msg, content: t("starterDisclaimer") };
                return msg;
              })
            );
          }
        }
      } catch (err) {
        console.error("Failed to load chat messages:", err);
      }
    }

    loadMessages();
  }, [activeChatId, language]);

  // Sync starter messages with language updates (when viewing a new empty session)
  useEffect(() => {
    if (messages.length === starterMessages.length) {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === "m1") {
            return { ...msg, content: t("starterGreeting") };
          }
          if (msg.id === "m2") {
            return { ...msg, content: t("starterDisclaimer") };
          }
          return msg;
        })
      );
    }
  }, [language]);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleNewChat = async () => {
    setInputValue("");
    setPendingImages([]);
    setApiError("");

    const tempId = `temp-${Date.now()}`;
    const tempSession = {
      id: tempId,
      title: "Cuộc trò chuyện mới",
      is_pinned: false,
      created_at: new Date().toISOString(),
    };

    setRecentChats((prev) => [tempSession, ...prev]);
    setActiveChatId(tempId);

    setMessages(
      starterMessages.map((msg) => {
        if (msg.id === "m1") return { ...msg, content: t("starterGreeting") };
        if (msg.id === "m2") return { ...msg, content: t("starterDisclaimer") };
        return msg;
      })
    );

    const creationPromise = (async () => {
      try {
        const response = await fetchWithAuth("/auth-api/chat/sessions", {
          method: "POST",
          body: JSON.stringify({ title: "Cuộc trò chuyện mới" }),
        });
        if (response.ok) {
          const newSession = await response.json();
          setRecentChats((prev) =>
            prev.map((chat) => (chat.id === tempId ? newSession : chat))
          );
          setActiveChatId((currentId) => (currentId === tempId ? newSession.id : currentId));
          return newSession.id;
        }
        throw new Error("Không thể tạo cuộc trò chuyện trên server");
      } catch (err) {
        console.error("Failed to create session in background:", err);
        setRecentChats((prev) => prev.filter((chat) => chat.id !== tempId));
        setApiError("Không thể kết nối máy chủ để tạo cuộc trò chuyện");
        throw err;
      }
    })();

    pendingCreationPromiseRef.current = { tempId, promise: creationPromise };
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const handleDeleteChat = async (chatId) => {
    const previousChats = [...recentChats];
    const previousActiveId = activeChatId;

    const updated = recentChats.filter((chat) => chat.id !== chatId);
    setRecentChats(updated);
    if (activeChatId === chatId) {
      if (updated.length > 0) {
        setActiveChatId(updated[0].id);
      } else {
        void handleNewChat();
      }
    }

    try {
      await deleteChatSession(chatId);
    } catch (err) {
      console.error("Failed to delete chat session:", err);
      setApiError(err?.message || "Không thể xóa cuộc trò chuyện");
      setRecentChats(previousChats);
      setActiveChatId(previousActiveId);
    }
  };

  const handleTogglePinChat = async (chatId, isPinned) => {
    const previousChats = [...recentChats];

    setRecentChats((prev) => {
      const updated = prev.map((chat) =>
        chat.id === chatId ? { ...chat, is_pinned: isPinned } : chat
      );
      return updated.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
    });

    try {
      await pinChatSession(chatId, isPinned);
    } catch (err) {
      console.error("Failed to toggle pin state:", err);
      setApiError(err?.message || "Không thể thay đổi trạng thái ghim");
      setRecentChats(previousChats);
    }
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

    // If configured to use server STT (PhoWhisper), record audio, send to backend
    if (useServerStt) {
      if (isListening) {
        // stop recording
        try {
          mediaRecorderRef.current?.stop();
        } catch (e) {
          // ignore
        }
        setIsListening(false);
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setApiError('Trình duyệt không hỗ trợ ghi âm.');
        return;
      }

      const startRecording = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const options = {};
          const mediaRecorder = new MediaRecorder(stream, options);
          recordedChunksRef.current = [];

          mediaRecorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
          };

          mediaRecorder.onstop = async () => {
            try {
              const blob = new Blob(recordedChunksRef.current, { type: recordedChunksRef.current[0]?.type || 'audio/webm' });
              const audioBase64 = await blobToWavBase64(blob);
              setIsListening(false);
              setApiError('');
              try {
                const resp = await voiceStt({ audio_base64: audioBase64, language: 'vi' });
                const text = resp?.text || '';
                if (text) {
                  setInputValue(text);
                  await handleSendMessage(text, 'voice');
                }
              } catch (err) {
                setApiError(err?.message || 'STT server error');
              }
            } catch (err) {
              setApiError('Không thể xử lý file âm thanh.');
              setIsListening(false);
            }
            // stop all tracks
            try { stream.getTracks().forEach((t) => t.stop()); } catch {}
          };

          mediaRecorder.start();
          mediaRecorderRef.current = mediaRecorder;
          setIsListening(true);
          setApiError('');
        } catch (err) {
          setApiError('Không thể truy cập micro: ' + (err?.message || String(err)));
          setIsListening(false);
        }
      };

      startRecording();
      return;
    }
    // Otherwise use browser SpeechRecognition (Web Speech API)
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

      const submitVoiceTranscript = async (transcript) => {
        const normalized = String(transcript || "").trim();
        if (!normalized || autoSubmitVoiceRef.current) return;

        const now = Date.now();
        const lastText = lastSentRef.current.text;
        const lastTs = lastSentRef.current.ts;
        if (normalized === lastText && now - lastTs < 1500) {
          return;
        }

        autoSubmitVoiceRef.current = true;
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        manualStopRef.current = true;
        transcriptBufferRef.current = "";
        setIsListening(false);

        try {
          recognition.stop();
        } catch {
          // ignore
        }

        await handleSendMessage(normalized, "voice");
      };

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
          void submitVoiceTranscript(merged);
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
        if (autoSubmitVoiceRef.current) {
          autoSubmitVoiceRef.current = false;
          manualStopRef.current = false;
          setIsListening(false);
          return;
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
        autoSubmitVoiceRef.current = false;
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
      autoSubmitVoiceRef.current = false;
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

  const cleanMarkdownForTts = (text) => {
    return text
      .replace(/[*#`_\-]/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/\n+/g, " ")
      .trim();
  };

  const playTtsQueue = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isTtsSpeakingRef.current) return;

    if (ttsQueueRef.current.length === 0) {
      return;
    }

    const nextSentence = ttsQueueRef.current.shift();
    const cleaned = cleanMarkdownForTts(nextSentence);
    if (!cleaned) {
      playTtsQueue();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = pickBestVietnameseVoice(voices);
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang || "vi-VN";
    } else {
      utterance.lang = "vi-VN";
    }
    utterance.rate = 0.98;
    utterance.pitch = 1.02;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      isTtsSpeakingRef.current = true;
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      isTtsSpeakingRef.current = false;
      setIsSpeaking(false);
      playTtsQueue();
    };
    utterance.onerror = () => {
      isTtsSpeakingRef.current = false;
      setIsSpeaking(false);
      playTtsQueue();
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakTextInstantly = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
    try {
      const cleaned = cleanMarkdownForTts(text);
      const utterance = new SpeechSynthesisUtterance(cleaned);
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = pickBestVietnameseVoice(voices);
      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang || "vi-VN";
      } else {
        utterance.lang = "vi-VN";
      }
      utterance.rate = 0.98;
      utterance.pitch = 1.02;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Instant TTS failed:", err);
      setIsSpeaking(false);
    }
  };

  const processTtsBuffer = (isFinal = false) => {
    let buffer = ttsSentenceBufferRef.current;
    if (!buffer) return;

    // Safety regex to ignore decimals and abbreviations
    const sentenceBoundaryRegex = /(?<!\d)\.(?!\d)|[?!]|\n+/;

    while (true) {
      const match = buffer.match(sentenceBoundaryRegex);
      if (!match) {
        break;
      }

      const index = match.index;
      const delimiter = match[0];
      const chunk = buffer.substring(0, index + delimiter.length);
      
      const isListItem = /^\s*[-*•]\s|^\s*\d+\.\s/.test(chunk.trim());
      
      if (isListItem) {
        const matches = buffer.match(/^\s*[-*•]\s|^\s*\d+\.\s/gm) || [];
        // Group list items (wait for 3 lines/bullet points unless it's final flush)
        if (matches.length < 3 && !isFinal) {
          break;
        }
      } else {
        // Min-length threshold: wait if sentence is shorter than 45 chars
        if (chunk.length < 45 && !isFinal) {
          const remainingBuffer = buffer.substring(index + delimiter.length);
          const nextMatch = remainingBuffer.match(sentenceBoundaryRegex);
          if (!nextMatch) {
            break;
          }
          const nextIndex = nextMatch.index;
          const nextDelimiter = nextMatch[0];
          const combinedChunk = chunk + remainingBuffer.substring(0, nextIndex + nextDelimiter.length);
          buffer = buffer.substring(chunk.length + nextIndex + nextDelimiter.length);
          ttsQueueRef.current.push(combinedChunk);
          playTtsQueue();
          continue;
        }
      }

      buffer = buffer.substring(chunk.length);
      if (chunk.trim().length > 0) {
        ttsQueueRef.current.push(chunk);
        playTtsQueue();
      }
    }

    ttsSentenceBufferRef.current = buffer;

    if (isFinal && buffer.trim().length > 0) {
      ttsQueueRef.current.push(buffer);
      ttsSentenceBufferRef.current = "";
      playTtsQueue();
    }
  };

  const handleStopSpeaking = () => {
    ttsQueueRef.current = [];
    ttsSentenceBufferRef.current = "";
    isTtsSpeakingRef.current = false;
    setIsSpeaking(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Convert recorded Blob (webm/ogg) -> WAV PCM16 @16k and return base64 string
  async function blobToWavBase64(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    const targetRate = 16000;
    const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, Math.ceil(decoded.duration * targetRate), targetRate);
    const bufferSource = offlineCtx.createBufferSource();
    bufferSource.buffer = decoded;
    bufferSource.connect(offlineCtx.destination);
    bufferSource.start(0);
    const rendered = await offlineCtx.startRendering();
    const channelData = rendered.getChannelData(0);

    const wavBuffer = encodeWAV(channelData, targetRate);
    const wavUint8 = new Uint8Array(wavBuffer);
    let binary = "";
    for (let i = 0; i < wavUint8.length; i++) binary += String.fromCharCode(wavUint8[i]);
    return btoa(binary);
  }

  function encodeWAV(samples, sampleRate) {
    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    }

    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  const handleImagePick = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const newItems = files.map((file) => ({ file, preview: URL.createObjectURL(file), uploading: false }));
    setPendingImages((prev) => [...prev, ...newItems]);
    event.target.value = null;
  };

  const handleStopGeneration = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
      setIsThinking(false);
      sendLockRef.current = false;
    }
  };

  const handleRemoveImage = (index) => {
    setPendingImages((prev) => {
      const item = prev[index];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSendMessage = async (overrideText = null, source = "manual") => {
    const draftText = String(overrideText ?? inputValue ?? "").trim();
    if (!draftText && pendingImages.length === 0) return;
    if (sendLockRef.current) return;
    const pendingImagesForMessage = pendingImages;

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
      imagePreviews: pendingImagesForMessage.map((p) => p.preview),
    });
    // Clear composer images immediately after submitting.
    setPendingImages([]);

    setApiError("");
    setInputValue("");
    setIsListening(false);
    setIsThinking(true);

    activeAbortControllerRef.current = new AbortController();

    // Await session creation if it's currently temporary
    let currentChatId = activeChatId;
    if (currentChatId && currentChatId.startsWith("temp-")) {
      if (pendingCreationPromiseRef.current && pendingCreationPromiseRef.current.tempId === currentChatId) {
        try {
          currentChatId = await pendingCreationPromiseRef.current.promise;
        } catch (err) {
          setApiError("Không thể tự động tạo cuộc trò chuyện mới");
          setIsThinking(false);
          sendLockRef.current = false;
          return;
        }
      }
    }

    // Reset TTS state before sending new query
    ttsQueueRef.current = [];
    ttsSentenceBufferRef.current = "";
    isTtsSpeakingRef.current = false;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      if (pendingImagesForMessage?.length) {
        // Asynchronously upload the image to the chat history first
        const firstFile = pendingImagesForMessage[0].file;
        try {
          const form = new FormData();
          form.append('file', firstFile);
          if (currentChatId) form.append('session_id', currentChatId);

          await fetchWithAuth('/auth-api/files/upload', {
            method: 'POST',
            body: form,
            signal: activeAbortControllerRef.current?.signal,
          });
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
        }

        // Call OCR analysis tool first (Step 1)
        setIsThinking(true);
        const ocrResult = await analyzeHealthReportImage({
          file: firstFile,
          language: "vi",
          patientId: null,
        });

        const ocrText = ocrResult?.ocr?.text || ocrResult?.text || "";
        if (!ocrText.trim()) {
          throw new Error("Không thể trích xuất chữ từ ảnh hoặc ảnh không có chữ.");
        }

        // Build prompt (Step 2)
        const ocrQuery = `Bạn là bác sĩ trợ lý y khoa chuyên nghiệp và chu đáo. Người dùng đã gửi ảnh chụp phiếu kết quả khám sức khỏe, xét nghiệm hoặc kết quả lâm sàng.
Dưới đây là toàn bộ nội dung văn bản y khoa trích xuất được từ ảnh (OCR):
=========================================
${ocrText}
=========================================

Yêu cầu của người dùng: ${userText || "Phân tích ảnh đã tải lên"}

Nhiệm vụ của bạn:
Hãy đọc hiểu văn bản y khoa trên cực kỳ kỹ lưỡng, nhận diện tất cả các chỉ số xét nghiệm, kết quả đo, khoảng tham chiếu và đơn vị có trong văn bản.
Sau đó, hãy nhận xét chi tiết, chuyên nghiệp và chính xác về kết quả y tế này bằng tiếng Việt.

Quy tắc trả lời:
1) Trả lời rõ ràng, dễ hiểu, có cấu trúc tốt bằng tiếng Việt (sử dụng định dạng Markdown, bullet points).
2) Nhận xét chi tiết từng chỉ số có dấu hiệu bất thường (nằm ngoài khoảng tham chiếu cao/thấp) và giải thích ý nghĩa lâm sàng đơn giản.
3) Đưa ra mức độ ưu tiên theo dõi (thấp/vừa/cao) kèm lý do y khoa rõ ràng.
4) Đưa ra các khuyến nghị hữu ích về chế độ dinh dưỡng, chế độ sinh hoạt hoặc các xét nghiệm/khám bổ sung tiếp theo nếu cần.
5) Luôn kèm theo cảnh báo y khoa: 'Mọi thông tin phân tích từ văn bản ảnh chỉ mang tính chất tham khảo, không thay thế cho chẩn đoán và tư vấn chuyên môn của bác sĩ chuyên khoa.'`;

        // Stream the answer
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

        await streamChatbot({
          query: ocrQuery,
          originalQuery: userText || "Phân tích ảnh đã tải lên",
          topK: 5,
          includeDebug: false,
          sessionId: currentChatId,
          signal: activeAbortControllerRef.current?.signal,
          onToken: (token) => {
            streamedAnswer += token;
            if (!hasStartedStreaming) {
              hasStartedStreaming = true;
              setIsThinking(false);
            }
            upsertAssistantMessage(token);

            if (interactionMode === "voice") {
              ttsSentenceBufferRef.current += token;
              processTtsBuffer(false);
            }
          },
          onDone: (payload) => {
            const finalAnswer = payload?.answer || streamedAnswer || "Mình chưa tạo được câu trả lời từ hệ thống.";
            upsertAssistantMessage(finalAnswer, true);
            refreshSessionsList();

            if (interactionMode === "voice") {
              processTtsBuffer(true);
            }
          },
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

        await streamChatbot({
          query: userText || "Phân tích ảnh đã tải lên",
          topK: 5,
          includeDebug: false,
          sessionId: currentChatId,
          signal: activeAbortControllerRef.current?.signal,
          onToken: (token) => {
            streamedAnswer += token;
            if (!hasStartedStreaming) {
              hasStartedStreaming = true;
              setIsThinking(false);
            }
            upsertAssistantMessage(token);

            if (interactionMode === "voice") {
              ttsSentenceBufferRef.current += token;
              processTtsBuffer(false);
            }
          },
          onDone: (payload) => {
            const finalAnswer = payload?.answer || streamedAnswer || "Mình chưa tạo được câu trả lời từ hệ thống.";
            upsertAssistantMessage(finalAnswer, true);
            refreshSessionsList();

            if (interactionMode === "voice") {
              processTtsBuffer(true);
            }
          },
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        addMessage({
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Đã dừng tạo câu trả lời.",
        });
      } else {
        const message = error instanceof Error ? error.message : "Lỗi không xác định";
        setApiError(message);
        addMessage({
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `Không xử lý được yêu cầu: ${message}`,
        });
      }
      setIsSpeaking(false);
    } finally {
      setIsThinking(false);
      sendLockRef.current = false;
      activeAbortControllerRef.current = null;
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
    setIsThinking(false);
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

  const getTranslatedQuickReplies = () => [
    {
      id: "symptoms",
      label: language === "VI" ? "Triệu chứng" : "Symptoms",
      prompt: language === "VI" ? "Dấu hiệu suy thận giai đoạn 1 là gì?" : "What are the signs of stage 1 kidney failure?",
      icon: QUICK_REPLIES[0].icon,
    },
    {
      id: "labs",
      label: language === "VI" ? "Xét nghiệm" : "Lab Tests",
      prompt: language === "VI" ? "Creatinine cao có nguy hiểm không?" : "Is high creatinine dangerous?",
      icon: QUICK_REPLIES[1].icon,
    },
    {
      id: "diet",
      label: language === "VI" ? "Ăn uống" : "Diet",
      prompt: language === "VI" ? "Chế độ ăn uống cho người bệnh thận" : "Dietary plan for kidney patients",
      icon: QUICK_REPLIES[2].icon,
    },
    {
      id: "emergency",
      label: language === "VI" ? "Khẩn cấp" : "Emergency",
      prompt: language === "VI" ? "Khi nào cần đi khám cấp cứu?" : "When should I go to the emergency room?",
      icon: QUICK_REPLIES[3].icon,
    },
  ];

  return (
    <section className="flex h-screen w-full flex-col p-2 sm:p-0 overflow-hidden">

      <section
        className="home-chat-grid relative min-h-0 flex-1 gap-2 sm:gap-0 w-full overflow-hidden"
        style={{ "--sidebar-width": isSidebarCollapsed ? "60px" : "280px" }}
      >
        {/* Sidebar Container: Sliding Drawer on Mobile, Static Side Panel on Desktop */}
        <div className={`
          fixed inset-y-0 left-0 z-50 flex h-full min-h-0 flex-col transition-transform duration-300 xl:static xl:translate-x-0 xl:z-0 xl:order-none
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
        `}>
          <ChatHistorySidebar
            recentChats={recentChats}
            activeChatId={activeChatId}
            onNewChat={() => {
              handleNewChat();
              setIsMobileSidebarOpen(false);
            }}
            onSelectChat={(id) => {
              handleSelectChat(id);
              setIsMobileSidebarOpen(false);
            }}
            onDeleteChat={handleDeleteChat}
            onTogglePinChat={handleTogglePinChat}
            collapsed={isSidebarCollapsed}
            onToggleCollapsed={handleToggleSidebar}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onSetDark={setIsDark}
            onNavigateUpgrade={() => {
              setActiveView("upgrade");
              setIsMobileSidebarOpen(false);
            }}
          />
        </div>

        {/* Mobile Sidebar Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm xl:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <div 
          data-tour="chat-window" 
          className="order-3 flex h-full min-h-0 flex-col rounded-3xl border border-teal-100 bg-white/80 p-4 shadow-lg shadow-cyan-100/60 backdrop-blur sm:rounded-none sm:border-x-0 sm:border-y-0 sm:shadow-none md:p-5 xl:col-start-2 xl:row-start-1 xl:order-none dark:border-slate-700 dark:bg-slate-900/80 w-full min-w-0 overflow-hidden"
        >
          {activeView === "upgrade" ? (
            <UpgradePage
              onBack={() => setActiveView("chat")}
              onUpgradeSuccess={handleUpgradeSuccess}
              currentPlan={customPlan}
            />
          ) : (
            <>
              <ChatWindow
                messages={messages}
                isThinking={isThinking}
                onMenuClick={() => setIsMobileSidebarOpen(true)}
                onToggleAvatar={() => setShowMobileAvatar(!showMobileAvatar)}
                showMobileAvatar={showMobileAvatar}
              />

              {apiError ? (
                <p className="mx-1 mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
                  Lỗi kết nối API: {apiError}
                </p>
              ) : null}
              
              <div data-tour="input" className="w-full">
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
                  pendingImage={pendingImages}
                  onPickImage={handleImagePick}
                  onRemoveImage={handleRemoveImage}
                  quickReplies={getTranslatedQuickReplies()}
                  onQuickReply={handleQuickReply}
                  onStopGeneration={handleStopGeneration}
                />
              </div>
            </>
          )}
        </div>

        <section
          data-tour="avatar"
          className={`order-2 relative hidden min-h-0 h-full 2xl:col-start-3 2xl:row-start-1 2xl:order-none 2xl:flex 2xl:flex-col ${
            showMobileAvatar
              ? "fixed inset-x-4 top-24 z-40 !flex h-[40vh] max-h-[350px] flex-col rounded-3xl border border-teal-100 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 2xl:static 2xl:h-full 2xl:max-h-none 2xl:p-0 2xl:border-0 2xl:shadow-none 2xl:bg-transparent"
              : ""
          }`}
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

      {/* Global Interactive Tour spotlight onboarding */}
      <InteractiveTour />
    </section>
  );
}
