import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchSpaces } from "../api/spaces";
import { USE_MOCKS } from "../api/client";

const TYPE_LABELS = { darkroom: "Phòng tối", studio: "Studio" };

export default function SearchPage() {
  const [filters, setFilters] = useState({ q: "", type: "", location: "", maxPrice: "" });
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    searchSpaces(filters)
      .then((data) => !cancelled && setSpaces(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.type, filters.location, filters.maxPrice]);

  function update(field) {
    return (e) => setFilters((f) => ({ ...f, [field]: e.target.value }));
  }

  return (
    <div className="container">
      <p className="eyebrow">TÌM PHÒNG</p>
      <h1>Phòng tối &amp; studio quanh bạn</h1>
      <p>Lọc theo khu vực, mức giá và loại không gian để tìm chỗ phù hợp.</p>

      {USE_MOCKS && (
        <p className="help-text" style={{ marginBottom: 16 }}>
          Đang hiển thị dữ liệu mock — backend chưa có API lọc/tìm kiếm phòng (xem
          API_ASSUMPTIONS.md).
        </p>
      )}

      <div className="filter-bar">
        <div className="field">
          <label htmlFor="q">Từ khoá</label>
          <input id="q" placeholder="Tên phòng, mô tả…" value={filters.q} onChange={update("q")} />
        </div>
        <div className="field">
          <label htmlFor="type">Loại phòng</label>
          <select id="type" value={filters.type} onChange={update("type")}>
            <option value="">Tất cả</option>
            <option value="darkroom">Phòng tối</option>
            <option value="studio">Studio</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="location">Khu vực</label>
          <input
            id="location"
            placeholder="VD: Quận 1"
            value={filters.location}
            onChange={update("location")}
          />
        </div>
        <div className="field">
          <label htmlFor="maxPrice">Giá tối đa (đ/giờ)</label>
          <input
            id="maxPrice"
            type="number"
            min="0"
            placeholder="VD: 200000"
            value={filters.maxPrice}
            onChange={update("maxPrice")}
          />
        </div>
      </div>

      {loading && <p className="spinner-text">Đang tải danh sách phòng…</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && spaces.length === 0 && (
        <div className="empty-state">Không tìm thấy phòng nào khớp bộ lọc của bạn.</div>
      )}

      {!loading && !error && spaces.length > 0 && (
        <div className="room-grid">
          {spaces.map((s) => (
            <Link key={s.id} to={`/rooms/${s.id}`} className="room-card">
              <div className="room-thumb">{TYPE_LABELS[s.type] || s.type}</div>
              <div className="room-body">
                <h3>{s.name}</h3>
                <div className="room-meta">
                  {s.location || "—"} · sức chứa {s.capacity}
                </div>
                <div className="room-price mono">
                  {Number(s.hourly_rate).toLocaleString("vi-VN")} đ/giờ
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
