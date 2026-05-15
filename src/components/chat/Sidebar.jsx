import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquarePlus, 
  Search, 
  Stethoscope, 
  PanelLeftClose, 
  PanelLeft, 
  User,
  Settings,
  LogOut,
  HelpCircle,
  Sun,
  Moon,
  ChevronUp
} from "lucide-react";
import { cn } from "../../utils/cn";

// Dữ liệu mock lịch sử chat
const CHAT_HISTORY = [
  {
    group: "Hôm nay",
    items: [
      "Tư vấn kết quả xét nghiệm máu",
      "Triệu chứng đau đầu chóng mặt",
      "Phân tích chỉ số eGFR"
    ]
  },
  {
    group: "Hôm qua",
    items: [
      "Thực đơn cho người tiểu đường",
      "Tìm hiểu về huyết áp cao"
    ]
  },
  {
    group: "7 ngày trước",
    items: [
      "Khám tổng quát định kỳ",
      "Lịch uống thuốc dạ dày",
      "Đọc kết quả nội soi",
      "Tác dụng phụ của thuốc"
    ]
  }
];

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#f9fafb]">
      {/* 1. Header: Toggle & Mobile Close */}
      <div className="flex h-14 items-center justify-between px-3 shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            "p-2 hover:bg-slate-200/50 rounded-lg text-slate-500 hover:text-slate-700 transition-colors",
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {isCollapsed ? <PanelLeft size={20} strokeWidth={2} /> : <PanelLeftClose size={20} strokeWidth={2} />}
        </button>

        {!isCollapsed && (
          <button 
            className="p-2 hover:bg-slate-200/50 rounded-lg text-slate-500 hover:text-slate-700 transition-colors md:hidden" 
            onClick={onMobileClose}
          >
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>

      {/* 2. Top Actions (New Chat, Search, AI Tools) */}
      <div className="px-3 pb-2 space-y-1 shrink-0">
        <button
          className={cn(
            "group relative flex items-center w-full rounded-xl transition-all duration-200",
            isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-3",
            "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
          )}
        >
          <MessageSquarePlus size={20} strokeWidth={2} className="shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="truncate font-medium text-sm"
              >
                Đoạn chat mới
              </motion.span>
            )}
          </AnimatePresence>
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              Đoạn chat mới
            </div>
          )}
        </button>

        <button
          className={cn(
            "group relative flex items-center w-full rounded-xl transition-all duration-200",
            isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-3",
            "text-slate-600 hover:bg-slate-200/60"
          )}
        >
          <Search size={20} strokeWidth={2} className="shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="truncate font-medium text-sm"
              >
                Tìm kiếm
              </motion.span>
            )}
          </AnimatePresence>
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              Tìm kiếm
            </div>
          )}
        </button>

        <button
          className={cn(
            "group relative flex items-center w-full rounded-xl transition-all duration-200",
            isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-3",
            "text-slate-600 hover:bg-slate-200/60"
          )}
        >
          <Stethoscope size={20} strokeWidth={2} className="shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="truncate font-medium text-sm"
              >
                Công cụ Y tế
              </motion.span>
            )}
          </AnimatePresence>
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              Công cụ Y tế
            </div>
          )}
        </button>
      </div>

      {/* 3. Chat History (Scrollable, hidden when collapsed) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="space-y-6"
            >
              {CHAT_HISTORY.map((group, idx) => (
                <div key={idx}>
                  <div className="text-[11px] font-semibold text-slate-400 px-3 pb-2 tracking-wider">
                    {group.group}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((title, i) => (
                      <button
                        key={i}
                        className="w-full text-left truncate px-3 py-2 text-[13.5px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Bottom Actions (Profile Menu) */}
      <div className="p-3 shrink-0 relative" ref={profileRef}>
        <AnimatePresence>
          {isProfileOpen && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 py-1.5"
            >
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="text-xs text-slate-500 mb-0.5">Tài khoản</div>
                <div className="text-sm font-medium text-slate-800 truncate">quydang16012004@gmail.com</div>
              </div>
              
              <div className="py-1.5">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <User size={16} strokeWidth={2} className="text-slate-400" />
                  Hồ sơ
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <Settings size={16} strokeWidth={2} className="text-slate-400" />
                  Cài đặt
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDarkMode(!isDarkMode);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-[14px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon size={16} strokeWidth={2} className="text-slate-400" /> : <Sun size={16} strokeWidth={2} className="text-slate-400" />}
                    Giao diện
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {isDarkMode ? 'Tối' : 'Sáng'}
                  </span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <HelpCircle size={16} strokeWidth={2} className="text-slate-400" />
                  Trợ giúp
                </button>
              </div>

              <div className="py-1.5 border-t border-slate-100">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={16} strokeWidth={2} className="text-red-400" />
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => !isCollapsed && setIsProfileOpen(!isProfileOpen)}
          className={cn(
            "group relative flex items-center w-full rounded-xl transition-all duration-200",
            isCollapsed ? "justify-center p-2.5" : "px-2 py-2 gap-3",
            "hover:bg-slate-200/60",
            isProfileOpen ? "bg-slate-200/60" : "transparent"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center font-medium text-xs shrink-0 shadow-sm">
            NQ
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <>
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col items-start truncate flex-1"
                >
                  <span className="font-semibold text-[14px] text-slate-800">Ngọc Quý</span>
                  <span className="text-[12px] text-slate-500">Premium</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ChevronUp size={16} className={cn("text-slate-400 transition-transform duration-200", isProfileOpen && "rotate-180")} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              Hồ sơ & Cài đặt
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:block h-full border-r border-slate-200 z-20 relative shrink-0"
      >
        {SidebarContent}
      </motion.div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[260px] border-r border-slate-200 z-50 shadow-2xl md:hidden overflow-hidden"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
