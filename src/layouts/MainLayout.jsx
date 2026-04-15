import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
