import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative flex items-center justify-center">
          {/* Ripple rings */}
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-teal-400/20" />
          <div className="absolute h-24 w-24 animate-pulse rounded-full bg-cyan-400/10" />
          
          {/* Main loader */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
        </div>
        <p className="mt-6 text-sm font-medium tracking-wide text-slate-500 animate-pulse dark:text-slate-400">
          Đang xác thực thông tin...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
