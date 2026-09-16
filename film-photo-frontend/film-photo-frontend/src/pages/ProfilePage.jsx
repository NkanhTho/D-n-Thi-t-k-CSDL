import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMe } from "../api/users";
import { createComplaint, getMyComplaints } from "../api/support";
import { ApiError } from "../api/client";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setSaved(false);
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateMe(form);
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  }

  const [complaints, setComplaints] = useState([]);
  const [complaintContent, setComplaintContent] = useState("");
  const [sendingComplaint, setSendingComplaint] = useState(false);
  const [complaintError, setComplaintError] = useState("");
  const [complaintsLoaded, setComplaintsLoaded] = useState(false);

  useEffect(() => {
    getMyComplaints()
      .then((data) => {
        setComplaints(data);
        setComplaintsLoaded(true);
      })
      .catch(() => setComplaintsLoaded(true));
  }, []);

  async function handleSendComplaint(e) {
    e.preventDefault();
    if (!complaintContent.trim()) return;
    setComplaintError("");
    setSendingComplaint(true);
    try {
      await createComplaint({ content: complaintContent });
      setComplaintContent("");
      const fresh = await getMyComplaints();
      setComplaints(fresh);
    } catch (err) {
      setComplaintError(err instanceof ApiError ? err.message : "Không gửi được yêu cầu hỗ trợ.");
    } finally {
      setSendingComplaint(false);
    }
  }

  if (!user) return null;

  return (
    <div className="container panel-narrow">
      <p className="eyebrow">CÁ NHÂN &amp; HỖ TRỢ</p>
      <h1>Hồ sơ của bạn</h1>
      <p>Thông tin này lấy từ GET /api/users/me và cập nhật qua PUT /api/users/me.</p>

      <form className="card" onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}
        {saved && <p className="help-text">Đã lưu thay đổi.</p>}

        <div className="field">
          <label>Email</label>
          <input value={user.email} disabled />
        </div>

        <div className="field">
          <label>Vai trò</label>
          <input value={user.role} disabled className="mono" />
        </div>

        <div className="field">
          <label htmlFor="name">Họ tên</label>
          <input id="name" value={form.name} onChange={update("name")} />
        </div>

        <div className="field">
          <label htmlFor="phone">Số điện thoại</label>
          <input id="phone" value={form.phone} onChange={update("phone")} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </form>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>Hỗ trợ</h2>
        <p>Gửi yêu cầu hỗ trợ hoặc khiếu nại — admin sẽ xử lý qua trang quản trị.</p>

        <form onSubmit={handleSendComplaint}>
          {complaintError && <p className="error-text">{complaintError}</p>}
          <div className="field">
            <label htmlFor="complaint">Nội dung</label>
            <textarea
              id="complaint"
              rows={3}
              value={complaintContent}
              onChange={(e) => setComplaintContent(e.target.value)}
              placeholder="Mô tả vấn đề bạn gặp phải…"
            />
          </div>
          <button className="btn btn-ghost" type="submit" disabled={sendingComplaint}>
            {sendingComplaint ? "Đang gửi…" : "Gửi yêu cầu hỗ trợ"}
          </button>
        </form>

        <hr className="hairline" />

        {!complaintsLoaded && <p className="spinner-text">Đang tải lịch sử hỗ trợ…</p>}
        {complaintsLoaded && complaints.length === 0 && (
          <p className="help-text">Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
        )}
        {complaints.map((c) => (
          <div className="history-row" key={c.id}>
            <div className="history-main">
              <p style={{ margin: 0 }}>{c.content}</p>
              <div className="history-meta">
                {c.created_at ? new Date(c.created_at).toLocaleString("vi-VN") : ""}
              </div>
            </div>
            <span className="badge">{c.status || "Đang chờ xử lý"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
