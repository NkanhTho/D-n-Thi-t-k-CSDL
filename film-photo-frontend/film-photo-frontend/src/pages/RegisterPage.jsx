import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="container panel-narrow">
        <p className="eyebrow">ĐĂNG KÝ</p>
        <h1>Đã tạo tài khoản</h1>
        <p>Bạn có thể đăng nhập ngay bây giờ.</p>
        <Link className="btn btn-primary" to="/login">
          Đến trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="container panel-narrow">
      <p className="eyebrow">ĐĂNG KÝ</p>
      <h1>Tham gia cộng đồng nhiếp ảnh phim</h1>
      <p>Tạo tài khoản để tìm và đặt phòng tối, studio gần bạn.</p>

      <form className="card" onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}

        <div className="field">
          <label htmlFor="name">Họ tên</label>
          <input id="name" required value={form.name} onChange={update("name")} />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update("password")}
            autoComplete="new-password"
          />
        </div>

        <div className="field">
          <label htmlFor="role">Vai trò</label>
          <select id="role" value={form.role} onChange={update("role")}>
            <option value="customer">Nhiếp ảnh gia (khách hàng)</option>
            <option value="provider">Nhà cung cấp dịch vụ</option>
          </select>
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? "Đang tạo tài khoản…" : "Đăng ký"}
        </button>
      </form>

      <p className="help-text" style={{ marginTop: 16 }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
}
