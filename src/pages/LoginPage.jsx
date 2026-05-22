import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Initialize Google Sign-In and One Tap
  useEffect(() => {
    const initGoogleGsi = () => {
      if (typeof window !== "undefined" && window.google) {
        try {
          const clientId =
            import.meta.env.VITE_GOOGLE_CLIENT_ID ||
            "your-google-client-id-here.apps.googleusercontent.com";

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              setIsSubmitting(true);
              setLocalError(null);
              try {
                const userRecord = await googleLogin(response.credential);
                navigate("/");
              } catch (err) {
                console.error("Error during Google Login:", err);
                setLocalError(err.message || "Không thể xác thực với tài khoản Google này.");
              } finally {
                setIsSubmitting(false);
              }
            },
            auto_select: false, // Don't auto log in to prevent loops
          });

          const btnParent = document.getElementById("google-signin-btn");
          if (btnParent) {
            window.google.accounts.id.renderButton(btnParent, {
              theme: "outline",
              size: "large",
              width: btnParent.offsetWidth || 380,
              text: "signin_with",
              shape: "pill",
              logo_alignment: "left",
            });
          }

          // Trigger One Tap
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              // no-op
            }
          });
        } catch (e) {
          console.error("GSI init error:", e);
        }
      }
    };

    const timer = setTimeout(initGoogleGsi, 600);
    return () => clearTimeout(timer);
  }, [googleLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setLocalError(err.message || "Tài khoản hoặc mật khẩu không chính xác.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 md:py-16">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[450px] w-[450px] translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />
      
      {/* Moving overlay design grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl md:p-10"
      >
        {/* Card Border glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400/0 via-teal-400/60 to-cyan-400/0" />

        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-teal-500/20"
          >
            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-slate-950">
              <Sparkles className="size-5 text-teal-400" />
            </div>
          </motion.div>

          <span className="mt-4 text-xs font-bold tracking-[0.35em] text-teal-400 uppercase">Vital AI</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Chào mừng trở lại</h1>
          <p className="mt-1 text-sm text-slate-400">Đăng nhập để kết nối với trợ lý sức khỏe của bạn.</p>
        </div>

        {/* Global Error Banner */}
        {localError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400"
          >
            <AlertCircle className="size-5 shrink-0 text-rose-500" />
            <p className="font-medium leading-normal">{localError}</p>
          </motion.div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</span>
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten-cua-ban@gmail.com"
                className="w-full rounded-2xl border border-white/5 bg-slate-950/40 py-3.5 pr-4 pl-12 text-sm text-white placeholder-slate-600 outline-none ring-teal-500/30 transition focus:border-teal-500/40 focus:ring-4"
              />
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Mật khẩu</span>
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full rounded-2xl border border-white/5 bg-slate-950/40 py-3.5 pr-12 pl-12 text-sm text-white placeholder-slate-600 outline-none ring-teal-500/30 transition focus:border-teal-500/40 focus:ring-4"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="relative mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3.5 font-bold text-slate-950 shadow-lg shadow-teal-500/15 transition hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-950" />
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="my-6 flex items-center justify-between gap-4">
          <div className="h-[1px] flex-1 bg-white/5" />
          <span className="text-xs font-bold text-slate-500 uppercase">Hoặc</span>
          <div className="h-[1px] flex-1 bg-white/5" />
        </div>

        {/* Google SSO Container */}
        <div className="flex flex-col items-center justify-center">
          <div
            id="google-signin-btn"
            className="w-full min-h-[44px] flex items-center justify-center rounded-full overflow-hidden border border-white/10 hover:bg-white/5 transition"
          />
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-bold text-teal-400 transition hover:text-teal-300 hover:underline"
          >
            Đăng ký tài khoản mới
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
