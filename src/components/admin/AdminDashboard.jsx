import { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  BarChart3,
  Lock,
  Search,
  ArrowLeft,
  LogOut,
  ChevronRight,
  Activity,
  ShieldAlert,
} from "lucide-react";
import {
  getAdminStats,
  getAdminUsers,
  getAdminSessions,
  getAdminSessionMessages,
} from "../../services/chatbotApi";
import MessageBubble from "../chat/MessageBubble";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'users' | 'chats'
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalMessages: 0,
    chartData: [],
    rolesData: [],
    popularTopics: [],
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Calculate dynamic SVG path coordinates for Message Trend Chart
  const getChartPaths = () => {
    const data = stats.chartData || [];
    const width = 500;
    const height = 150;
    const paddingLeft = 20;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 20;

    if (data.length === 0) {
      return { strokePath: "", areaPath: "", points: [] };
    }
    
    const maxVal = Math.max(...data.map(d => d.count), 5); // default min height scale
    const usableWidth = width - paddingLeft - paddingRight;
    const usableHeight = height - paddingTop - paddingBottom;
    
    const points = data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * usableWidth;
      const y = height - paddingBottom - (d.count / maxVal) * usableHeight;
      return { x, y, count: d.count, label: d.label };
    });
    
    let strokePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      strokePath += ` L ${points[i].x} ${points[i].y}`;
    }
    
    const areaPath = `${strokePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
    
    return { strokePath, areaPath, points };
  };

  const { strokePath, areaPath, points: chartPoints } = getChartPaths();

  // Calculate dynamic User Roles segments percentage for Donut/Bar Chart
  const getRolesStats = () => {
    const data = stats.rolesData || [];
    const total = stats.totalUsers || 1;
    const userCount = data.find(r => r.role === 'USER')?.count || 0;
    const adminCount = data.find(r => r.role === 'ADMIN')?.count || 0;
    
    const userPercentage = Math.round((userCount / total) * 100) || 0;
    const adminPercentage = Math.round((adminCount / total) * 100) || 0;
    
    return {
      userCount,
      adminCount,
      userPercentage,
      adminPercentage,
    };
  };

  const { userCount, adminCount, userPercentage, adminPercentage } = getRolesStats();
  
  // All sessions in system (for 2-column chat manager)
  const [allSessions, setAllSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Load stats and users on mount
  useEffect(() => {
    async function loadStatsAndUsers() {
      try {
        setLoading(true);
        setError("");
        const [statsData, usersData] = await Promise.all([
          getAdminStats(),
          getAdminUsers(),
        ]);
        setStats(statsData);
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin quản trị. Vui lòng kiểm tra quyền hạn.");
      } finally {
        setLoading(false);
      }
    }
    loadStatsAndUsers();
  }, []);

  // Fetch all sessions when chats tab is selected
  useEffect(() => {
    if (activeTab === "chats") {
      async function loadSessions() {
        try {
          setSessionsLoading(true);
          const data = await getAdminSessions();
          setAllSessions(data);
          setFilteredSessions(data);
          // Auto-select first session if available and none selected
          if (data.length > 0 && !selectedSession) {
            handleSelectSession(data[0]);
          }
        } catch (err) {
          console.error(err);
          setError("Không thể tải danh sách cuộc trò chuyện.");
        } finally {
          setSessionsLoading(false);
        }
      }
      loadSessions();
    }
  }, [activeTab]);

  // Filter users or sessions based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (activeTab === "users") {
      if (!query) {
        setFilteredUsers(users);
        return;
      }
      const filtered = users.filter(
        (u) =>
          (u.username || "").toLowerCase().includes(query) ||
          (u.email || "").toLowerCase().includes(query) ||
          (u.full_name || "").toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    } else if (activeTab === "chats") {
      if (!query) {
        setFilteredSessions(allSessions);
        return;
      }
      const filtered = allSessions.filter(
        (s) =>
          (s.title || "").toLowerCase().includes(query) ||
          (s.user?.full_name || "").toLowerCase().includes(query) ||
          (s.user?.email || "").toLowerCase().includes(query)
      );
      setFilteredSessions(filtered);
    }
  }, [searchQuery, users, allSessions, activeTab]);

  // Select Session & load messages
  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    try {
      setMessagesLoading(true);
      const data = await getAdminSessionMessages(session.id);
      const mapped = data.map((msg) => ({
        id: msg.id,
        role: msg.sender_type === "USER" ? "user" : "assistant",
        content: msg.message_type === 'IMAGE' ? '' : msg.content,
        imagePreviews: msg.message_type === 'IMAGE' ? [msg.content] : undefined,
      }));
      setMessages(mapped);
    } catch (err) {
      console.error(err);
      setError("Không thể tải chi tiết tin nhắn.");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Đang tải dữ liệu quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden">
      
      {/* LEFT NAVIGATION MENU */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-2 shrink-0">
            <div className="bg-teal-500 text-white p-1.5 rounded-lg">
              <Lock size={18} />
            </div>
            <div>
              <h1 className="font-bold text-white text-md tracking-wide">KidneyCare Admin</h1>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Hệ thống quản lý</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === "overview"
                  ? "bg-teal-600 text-white"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 size={18} />
              Tổng quan & Thống kê
            </button>

            <button
              onClick={() => {
                setActiveTab("users");
                setSearchQuery("");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === "users"
                  ? "bg-teal-600 text-white"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users size={18} />
              Quản lý tài khoản
            </button>

            <button
              onClick={() => {
                setActiveTab("chats");
                setSearchQuery("");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === "chats"
                  ? "bg-teal-600 text-white"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare size={18} />
              Quản lý hội thoại
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 overflow-hidden p-8">
        
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-950 dark:bg-rose-950/50 dark:text-rose-300 shrink-0">
            {error}
          </div>
        )}

        {/* ================== TAB: OVERVIEW ================== */}
        {activeTab === "overview" && (
          <div className="flex flex-col min-h-0 flex-1 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tổng quan hệ thống</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Các chỉ số đo lường hiệu năng hoạt động của AI và người dùng</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 shrink-0">
              <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="rounded-xl bg-teal-50 p-4 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng người dùng</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{stats.totalUsers}</h3>
                </div>
              </div>

              <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="rounded-xl bg-cyan-50 p-4 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                  <MessageSquare size={28} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng cuộc hội thoại</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{stats.totalSessions}</h3>
                </div>
              </div>

              <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="rounded-xl bg-purple-50 p-4 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <BarChart3 size={28} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng số tin nhắn</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{stats.totalMessages}</h3>
                </div>
              </div>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
              
              {/* Message Activity Line/Area Chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                    <Activity size={18} className="text-teal-500" /> Tần suất hội thoại (7 ngày qua)
                  </h3>
                  <p className="text-xs text-slate-400">Số lượng tin nhắn được gửi lên AI hàng ngày</p>
                </div>
                
                {/* SVG Area Chart */}
                <div className="my-6 h-40 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartTealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="chartTealStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    <line x1="0" y1="25" x2="500" y2="25" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
                    <line x1="0" y1="125" x2="500" y2="125" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
                    
                    {/* Area path */}
                    {areaPath && (
                      <path
                        d={areaPath}
                        fill="url(#chartTealGrad)"
                      />
                    )}
                    
                    {/* Stroke path */}
                    {strokePath && (
                      <path
                        d={strokePath}
                        fill="none"
                        stroke="url(#chartTealStroke)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Dynamic chart dots */}
                    {chartPoints.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill="#0d9488"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        title={`${p.label}: ${p.count}`}
                      />
                    ))}
                  </svg>
                </div>
                
                {/* Labels */}
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-1 border-t border-slate-100 dark:border-slate-800/50 pt-3">
                  {(stats.chartData || []).map((d, i) => (
                    <span key={i}>{d.label}</span>
                  ))}
                </div>
              </div>

              {/* User Plan Distribution Donut & Analytics */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                    <Users size={18} className="text-cyan-500" /> Tỷ lệ phân hạng & Chủ đề quan tâm
                  </h3>
                  <p className="text-xs text-slate-400">Thống kê người dùng và các câu hỏi phổ biến</p>
                </div>

                <div className="my-4 grid grid-cols-2 gap-4 items-center">
                  
                  {/* Circular/Donut chart representation */}
                  <div className="flex justify-center relative">
                    <svg className="w-28 h-28" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" className="dark:stroke-slate-800" />
                      {/* ADMIN segment */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="3.5"
                        strokeDasharray={`${adminPercentage} ${100 - adminPercentage}`}
                        strokeDashoffset="100"
                      />
                      {/* USER segment */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="3.5"
                        strokeDasharray={`${userPercentage} ${100 - userPercentage}`}
                        strokeDashoffset={`${100 - adminPercentage}`}
                      />
                      <g className="text-center">
                        <text x="50%" y="54%" textAnchor="middle" className="text-[7px] font-bold fill-slate-700 dark:fill-slate-300">
                          {stats.totalUsers} Acc
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* Legend & Topic Progress */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> USER</span>
                        <span>{userPercentage}% ({userCount})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full" style={{ width: `${userPercentage}%` }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> ADMIN</span>
                        <span>{adminPercentage}% ({adminCount})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${adminPercentage}%` }} />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Popular Topics List */}
                <div className="border-t border-slate-100 dark:border-slate-800/50 pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Chủ đề quan tâm nhiều nhất</p>
                  <div className="flex flex-wrap gap-2">
                    {(stats.popularTopics || []).map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                        {t.icon} {t.name} ({t.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================== TAB: USER MANAGEMENT ================== */}
        {activeTab === "users" && (
          <div className="flex flex-col min-h-0 flex-1 space-y-6">
            <div className="flex items-center justify-between gap-4 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản lý tài khoản</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý phân quyền và xem tần suất sử dụng của người dùng</p>
              </div>

              {/* Search input for User tab */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tài khoản..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
            </div>

            {/* Full-width Users Table Container */}
            <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                    <th className="pb-4">Tên hiển thị</th>
                    <th className="pb-4">Email liên kết</th>
                    <th className="pb-4 text-center">Vai trò</th>
                    <th className="pb-4 text-center">Số hội thoại</th>
                    <th className="pb-4 text-center">Số tin nhắn</th>
                    <th className="pb-4 text-right">Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {user.full_name || user.username || "Chưa đặt tên"}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-slate-500 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.role === 'ADMIN' 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' 
                            : 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                        💬 {user.sessionCount}
                      </td>
                      <td className="py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                        ✉️ {user.messageCount}
                      </td>
                      <td className="py-4 text-right text-xs text-slate-400">
                        {new Date(user.created_at).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================== TAB: CONVERSATION LOGS (2-COLUMN LAYOUT) ================== */}
        {activeTab === "chats" && (
          <div className="flex flex-col min-h-0 flex-1 space-y-6">
            <div className="flex items-center justify-between gap-4 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản lý cuộc hội thoại</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách toàn bộ cuộc trò chuyện trong hệ thống</p>
              </div>

              {/* Search input for chats tab (filters by user name or session title) */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tiêu đề chat, tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
            </div>

            {/* 2-Column Layout */}
            <div className="grid grid-cols-12 gap-6 min-h-0 flex-1 overflow-hidden">
              
              {/* Left Column: All Sessions List (Col 5) */}
              <div className="col-span-5 flex flex-col rounded-2xl border border-slate-200 bg-white p-4 min-h-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3 px-1">Tất cả hội thoại ({filteredSessions.length})</h3>
                
                {sessionsLoading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  </div>
                ) : filteredSessions.length > 0 ? (
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {filteredSessions.map((session) => {
                      const isSelected = selectedSession?.id === session.id;
                      return (
                        <button
                          key={session.id}
                          onClick={() => handleSelectSession(session)}
                          className={`w-full rounded-xl p-3.5 text-left transition border ${
                            isSelected
                              ? "bg-teal-50/60 border-teal-200 dark:bg-teal-950/20 dark:border-teal-900/50 text-teal-700 dark:text-teal-400 font-semibold"
                              : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {session.user?.full_name || session.user?.username || "Ẩn danh"}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(session.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate mb-2">{session.title || "Cuộc trò chuyện mới"}</p>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{session.user?.email || "No email"}</span>
                            <span className="font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                              💬 {session.messageCount} tin nhắn
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-slate-400 text-xs">
                    <MessageSquare size={36} className="mb-2 opacity-50" />
                    <p>Không tìm thấy cuộc hội thoại nào.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Message Details Viewer (Col 7) */}
              <div className="col-span-7 flex flex-col rounded-2xl border border-slate-200 bg-white p-5 min-h-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Nội dung hội thoại</h3>
                  {selectedSession && (
                    <span className="text-xs text-slate-400">
                      ID: <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{selectedSession.id}</span>
                    </span>
                  )}
                </div>

                {selectedSession ? (
                  messagesLoading ? (
                    <div className="flex flex-1 items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pr-2">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-slate-400 text-xs">
                      <p>Cuộc hội thoại trống.</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-slate-400 text-xs">
                    <ArrowLeft size={36} className="mb-2 opacity-50 animate-pulse" />
                    <p>Hãy chọn cuộc trò chuyện bên cột trái để xem chi tiết.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
