import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/chat/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageBubble from "../components/chat/MessageBubble";
import ChatInput from "../components/chat/ChatInput";
import SuggestionChips from "../components/chat/SuggestionChips";
import RightHealthPanel from "../components/chat/RightHealthPanel";
import TypingIndicator from "../components/chat/TypingIndicator";

const MOCK_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    content: "Xin chào Ngọc Quý, tôi là VitalAI. Tôi có thể giúp gì cho tình trạng sức khỏe của bạn hôm nay?"
  }
];

export default function ChatPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Dựa trên hồ sơ của bạn, chỉ số eGFR là 98 mL/min, đây là mức rất tốt cho thấy thận đang hoạt động bình thường. Bạn có triệu chứng gì cụ thể không?"
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0fdf9]">
      {/* 1. Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <ChatHeader onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 md:space-y-8 pb-32">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-6 pb-4 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            {messages.length === 1 && <SuggestionChips onSelect={handleSuggestionSelect} />}
            <ChatInput 
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              disabled={isTyping}
            />
            <div className="text-center mt-2">
              <span className="text-[11px] text-slate-400">VitalAI có thể đưa ra thông tin không chính xác. Hãy luôn tham khảo ý kiến bác sĩ.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right Panel */}
      <RightHealthPanel />
    </div>
  );
}
