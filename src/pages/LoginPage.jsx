import { Link } from "react-router-dom";

export default function LoginPage() {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-cyan-100 bg-white/90 p-6 shadow-sm backdrop-blur md:p-8">
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-600 uppercase">Vital AI</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">Đăng nhập</h1>
        <p className="mt-1 text-sm text-slate-500">Đăng nhập để tiếp tục sử dụng trợ lý sức khỏe.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu</span>
            <input
              type="password"
              required
              placeholder="Nhập mật khẩu"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-teal-600 px-4 py-2.5 font-medium text-white transition hover:bg-teal-700"
          >
            Đăng nhập
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
            Đăng ký ngay
          </Link>
        </p>
        <Link to="/" className="mt-2 inline-block text-sm text-slate-500 hover:text-slate-700">
          Quay lại trang chính
        </Link>
      </div>
    </section>
  );
}
