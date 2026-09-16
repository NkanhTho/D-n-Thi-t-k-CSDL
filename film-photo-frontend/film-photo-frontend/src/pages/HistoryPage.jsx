import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings } from "../api/bookings";
import { USE_MOCKS } from "../api/client";
import StatusBadge from "../components/StatusBadge";

function formatRange(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const date = start.toLocaleDateString("vi-VN");
  const startTime = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const endTime = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${startTime} – ${endTime}`;
}

export default function HistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <p className="eyebrow">LỊCH SỬ</p>
      <h1>Lịch sử đặt chỗ</h1>
      <p>Toàn bộ các lượt đặt phòng tối &amp; studio bạn đã thực hiện.</p>

      {USE_MOCKS && (
        <p className="help-text" style={{ marginBottom: 16 }}>
          Đang hiển thị dữ liệu mock — backend chưa có API GET /bookings/my (xem
          API_ASSUMPTIONS.md).
        </p>
      )}

      {loading && <p className="spinner-text">Đang tải lịch sử…</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state">
          Bạn chưa có lượt đặt chỗ nào. <Link to="/search">Tìm phòng ngay</Link>.
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="card">
          {bookings.map((b) => (
            <div className="history-row" key={b.id}>
              <div className="history-main">
                <h3>{b.space_name || `Không gian #${b.space_id}`}</h3>
                <div className="history-meta">{formatRange(b.start_time, b.end_time)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono">{Number(b.total_price).toLocaleString("vi-VN")} đ</div>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
