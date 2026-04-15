import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="card">
      <h2>404</h2>
      <p>Page not found.</p>
      <Link to="/">Back to home</Link>
    </section>
  );
}
