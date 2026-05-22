import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext(null);

export const translations = {
  VI: {
    sidebarTitle: "Vital AI",
    newChat: "Cuộc trò chuyện mới",
    resources: "Tài nguyên",
    recent: "Gần đây",
    inputPlaceholder: "Nhập câu hỏi về sức khỏe thận của bạn...",
    voiceMode: "Chế độ giọng nói",
    chatMode: "Chế độ chat chữ",
    listening: "Đang lắng nghe...",
    thinking: "Đang phân tích...",
    speaking: "Đang phát âm thanh",
    ready: "Sẵn sàng",
    assistantTitle: "Trợ lý ảo",
    assistantSub: "KidneyCare AI",
    healthSnapshot: "Chỉ số tham khảo",
    voiceVisualizerText: "Ghi âm",
    stopSpeaking: "Dừng đọc",
    apiError: "Lỗi kết nối API",
    starterGreeting: "Xin chào, tôi là trợ lý AI tư vấn thận học.\n- Hỗ trợ giải thích kết quả xét nghiệm\n- Theo dõi triệu chứng\n- Gợi ý hướng chăm sóc cơ bản",
    starterDisclaimer: "Lưu ý: **Thông tin chỉ để tham khảo**, bạn nên đến cơ sở y tế khi có dấu hiệu bất thường.",
    tourSidebarTitle: "Khung lịch sử & Tài khoản",
    tourSidebarText: "Nơi bạn có thể quản lý các cuộc hội thoại gần đây, chuyển đổi giao diện Sáng/Tối, thay đổi ngôn ngữ, nâng cấp gói và xem hồ sơ cá nhân của mình.",
    tourInputTitle: "Nhập dữ liệu & Tải ảnh",
    tourInputText: "Gõ câu hỏi tư vấn, tải lên hình ảnh kết quả xét nghiệm sinh hóa thận, hoặc chuyển sang chế độ Voice để nói chuyện trực tiếp.",
    tourAvatarTitle: "Trợ lý ảo KidneyCare AI",
    tourAvatarText: "Trợ lý sức khỏe 2D hoạt hình trực quan. Sẽ hiển thị trạng thái lắng nghe, nói chuyện sinh động và phân tích chỉ số của bạn real-time.",
    tourChatWindowTitle: "Khung hội thoại",
    tourChatWindowText: "Các câu hỏi của bạn và giải đáp chi tiết từ AI sẽ hiển thị ở đây. Nhận diện chỉ số và đưa ra khuyến cáo thận học chuyên sâu.",
    tourSkip: "Bỏ qua",
    tourNext: "Tiếp tục",
    tourBack: "Quay lại",
    tourDone: "Hoàn tất",
    quickRepliesTitle: "Gợi ý câu hỏi nhanh",
    consultationSession: "Phiên tư vấn",
    conversation: "Hội thoại",
    thinkingText: "Đang suy nghĩ",
    imageWillSend: "Sẽ gửi kèm tin nhắn",
    removeImage: "Xóa ảnh",
    attachImage: "Đính kèm ảnh xét nghiệm / bệnh án",
    stopRecording: "Dừng ghi âm",
    clickToTalk: "Nhấn để nói",
    voiceModeToggle: "Bật chế độ giao tiếp",
    sendMessage: "Gửi tin nhắn",
    waitingInteraction: "Chờ tương tác",
    scanningData: "Đang quét dữ liệu...",
    bloodPressure: "Huyết áp",
    average: "Trung bình",
    stable: "Ổn định",
    normal: "Bình thường",
    newChatDesc: "Bắt đầu một phiên tư vấn mới",
    recentChat1Title: "Năm case lâm sàng mẫu",
    recentChat1Desc: "Tóm tắt hướng xử lý và dấu hiệu cần theo dõi",
    recentChat2Title: "Sửa cấu trúc JSON và thêm trường",
    recentChat2Desc: "Điều chỉnh dữ liệu đầu vào để chatbot đọc đúng",
    recentChat3Title: "Nhận diện mã số trong ảnh xét nghiệm",
    recentChat3Desc: "Phân tích ảnh tải lên và rút trích thông tin",
    recentChat4Title: "Điền dữ liệu thiếu trong file",
    recentChat4Desc: "Bổ sung trường còn trống từ nguồn hiện có",
  },
  EN: {
    sidebarTitle: "Vital AI",
    newChat: "New Chat Session",
    resources: "Resources & Spark",
    recent: "Recent Conversations",
    inputPlaceholder: "Ask a question about your kidney health...",
    voiceMode: "Voice Mode",
    chatMode: "Text Mode",
    listening: "Listening...",
    thinking: "Analyzing...",
    speaking: "Speaking",
    ready: "Ready",
    assistantTitle: "Virtual Assistant",
    assistantSub: "KidneyCare AI",
    healthSnapshot: "Reference Indicators",
    voiceVisualizerText: "Recording",
    stopSpeaking: "Stop Speaking",
    apiError: "API Connection Error",
    starterGreeting: "Hello! I am your AI kidney health assistant.\n- Help explain lab test results\n- Track your symptoms\n- Provide basic care suggestions",
    starterDisclaimer: "Note: **Information is for reference only**, please consult a medical professional for any anomalies.",
    tourSidebarTitle: "Sidebar & Accounts",
    tourSidebarText: "Manage your recent chats, toggle light/dark mode, switch languages, upgrade your plan, or view your profile settings here.",
    tourInputTitle: "Input Area & File Upload",
    tourInputText: "Type your health questions, upload pictures of kidney lab reports, or switch to Voice Mode to speak directly.",
    tourAvatarTitle: "KidneyCare AI Assistant",
    tourAvatarText: "Your interactive 2D animated assistant. Displays real-time states of listening, talking, and thinking.",
    tourChatWindowTitle: "Chat Conversation Window",
    tourChatWindowText: "Your messages and AI-generated detailed medical insights will stream here with parsed health snapshots.",
    tourSkip: "Skip Tour",
    tourNext: "Next",
    tourBack: "Back",
    tourDone: "Finish",
    quickRepliesTitle: "Quick Suggestions",
    consultationSession: "Consultation Session",
    conversation: "Conversation",
    thinkingText: "Thinking",
    imageWillSend: "Will be sent with message",
    removeImage: "Remove image",
    attachImage: "Attach lab report / medical record image",
    stopRecording: "Stop recording",
    clickToTalk: "Press to talk",
    voiceModeToggle: "Enable voice conversation mode",
    sendMessage: "Send message",
    waitingInteraction: "Waiting for input",
    scanningData: "Scanning data...",
    bloodPressure: "Blood Pressure",
    average: "Average",
    stable: "Stable",
    normal: "Normal",
    newChatDesc: "Start a new consultation session",
    recentChat1Title: "Five Clinical Case Models",
    recentChat1Desc: "Summary of treatment guidelines & symptom tracking",
    recentChat2Title: "Modify JSON Schema & Fields",
    recentChat2Desc: "Adjust input data for accurate chatbot parsing",
    recentChat3Title: "Lab Report ID Character Recognition",
    recentChat3Desc: "Analyze uploaded reports & extract information",
    recentChat4Title: "Fill Missing Data in Documents",
    recentChat4Desc: "Populate empty fields from existing sources",
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vital_language") || "VI";
    }
    return "VI";
  });

  useEffect(() => {
    localStorage.setItem("vital_language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "VI" ? "EN" : "VI"));
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
