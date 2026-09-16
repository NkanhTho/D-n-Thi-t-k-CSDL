import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSpaceDetail, getSpaceResources } from "../api/spaces";
import { USE_MOCKS } from "../api/client";

const TYPE_LABELS = { darkroom: "Phòng tối", studio: "Studio" };

export default function RoomDetailPage() {
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([getSpaceDetail(id), getSpaceResources(id)])
      .then(([spaceData, resourceData]) => {
        if (cancelled) return;
        setSpace(spaceData);
        setResources(resourceData);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="container spinner-text">Đang tải thông tin phòng…</p>;
  if (error) return <p className="container error-text">{error}</p>;
  if (!space) return null;

  return (
    <div className="container">
      <p className="eyebrow">{TYPE_LABELS[space.type] || space.type}</p>
      <h1>{space.name}</h1>
      <p>{space.location}</p>

      {USE_MOCKS && (
        <p className="help-text" style={{ marginBottom: 16 }}>
          Dữ liệu mock — backend chưa có API GET /spaces/:id (xem API_ASSUMPTIONS.md).
        </p>
      )}

      <div className="room-thumb" style={{ marginBottom: 24, borderRadius: 3 }}>
        {space.name}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2>Chi tiết không gian</h2>
        <p>{space.description}</p>
        <hr className="hairline" />
        <div className="field-row">
          <div>
            <div className="help-text">Sức chứa</div>
            <div className="mono">{space.capacity} người</div>
          </div>
          <div>
            <div className="help-text">Giờ hoạt động</div>
            <div className="mono">{space.operating_hours}</div>
          </div>
        </div>
        <div className="field-row" style={{ marginTop: 16 }}>
          <div>
            <div className="help-text">Giá thuê</div>
            <div className="mono">{Number(space.hourly_rate).toLocaleString("vi-VN")} đ/giờ</div>
          </div>
          <div>
            <div className="help-text">Đánh giá</div>
            <div className="mono">{space.rating ?? "—"} / 5</div>
          </div>
        </div>
      </div>

      {resources.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2>Thiết bị đi kèm</h2>
          {resources.map((r) => (
            <div className="history-row" key={r.id}>
              <div className="history-main">
                <h3>{r.name}</h3>
                <div className="history-meta">{r.category}</div>
              </div>
              <div className="mono">{Number(r.rental_price).toLocaleString("vi-VN")} đ</div>
            </div>
          ))}
        </div>
      )}

      <Link className="btn btn-primary" to={`/rooms/${space.id}/book`}>
        Chọn khung giờ &amp; đặt chỗ
      </Link>
    </div>
  );
}
