import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-teal-100 bg-white p-6 text-center shadow-lg">
        <h2 className="text-3xl font-bold text-slate-800">404</h2>
        <p className="mt-2 text-slate-600">Page not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-teal-600">
          Back to home
        </Link>
      </div>
    </section>
  );
}
