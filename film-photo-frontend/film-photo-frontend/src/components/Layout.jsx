import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            Contact Sheet <small>ẢNH PHIM</small>
          </NavLink>
          <nav className="nav-links">
            <NavLink to="/search" className={({ isActive }) => (isActive ? "active" : "")}>
              Tìm phòng
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => (isActive ? "active" : "")}>
              Lịch sử
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
              Cá nhân
            </NavLink>
          </nav>
          <div className="nav-user">
            {isAuthenticated ? (
              <>
                <span className="mono">{user.name || user.email}</span>
                <button className="btn btn-ghost" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <NavLink to="/login" className="btn btn-ghost">
                Đăng nhập
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>

      <footer className="footer">
        Contact Sheet — nền tảng kết nối cộng đồng nhiếp ảnh phim với phòng tối &amp; studio.
      </footer>
    </div>
  );
}
