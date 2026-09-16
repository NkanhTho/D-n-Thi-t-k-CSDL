import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSpaceDetail, getSpaceResources } from "../api/spaces";
import { checkAvailability, createBooking } from "../api/bookings";
import { ApiError } from "../api/client";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parseHours(operatingHours) {
  // "08:00 - 22:00" -> [8, 22]
  const match = /(\d{1,2}):\d{2}\s*-\s*(\d{1,2}):\d{2}/.exec(operatingHours || "");
  return match ? [Number(match[1]), Number(match[2])] : [8, 20];
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [space, setSpace] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [date, setDate] = useState(todayIso());
  const [startHour, setStartHour] = useState(null);
  const [duration, setDuration] = useState(1);
  const [selectedResourceIds, setSelectedResourceIds] = useState([]);

  const [availability, setAvailability] = useState(null); // { available, reason }
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSpaceDetail(id), getSpaceResources(id)])
      .then(([s, r]) => {
        if (cancelled) return;
        setSpace(s);
        setResources(r);
      })
      .catch((err) => !cancelled && setLoadError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const hourSlots = useMemo(() => {
    if (!space) return [];
    const [open, close] = parseHours(space.operating_hours);
    const slots = [];
    for (let h = open; h < close; h++) slots.push(h);
    return slots;
  }, [space]);

  const { startTime, endTime } = useMemo(() => {
    if (startHour === null) return {};
    const start = new Date(`${date}T${String(startHour).padStart(2, "0")}:00:00`);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
    return { startTime: start.toISOString(), endTime: end.toISOString() };
  }, [date, startHour, duration]);

  const totalPrice = useMemo(() => {
    if (!space) return 0;
    const roomCost = Number(space.hourly_rate) * duration;
    const resourceCost = resources
      .filter((r) => selectedResourceIds.includes(r.id))
      .reduce((sum, r) => sum + Number(r.rental_price) * duration, 0);
    return roomCost + resourceCost;
  }, [space, resources, selectedResourceIds, duration]);

  function toggleResource(resId) {
    setSelectedResourceIds((prev) =>
      prev.includes(resId) ? prev.filter((x) => x !== resId) : [...prev, resId]
    );
  }

  function selectSlot(h) {
    setStartHour(h);
    setAvailability(null);
    setActionError("");
  }

  async function handleCheckAvailability() {
    setActionError("");
    setChecking(true);
    setAvailability(null);
    try {
      const res = await checkAvailability({
        spaceId: Number(id),
        resourceIds: selectedResourceIds,
        startTime,
        endTime,
      });
      setAvailability(res);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Không kiểm tra được tình trạng phòng.");
    } finally {
      setChecking(false);
    }
  }

  async function handleConfirmBooking() {
    setActionError("");
    setSubmitting(true);
    try {
      const res = await createBooking({
        spaceId: Number(id),
        resourceIds: selectedResourceIds,
        startTime,
        endTime,
        totalPrice,
      });
      navigate(`/payment/${res.bookingId}`, { state: { totalPrice } });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Đặt chỗ thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="container spinner-text">Đang tải khung giờ…</p>;
  if (loadError) return <p className="container error-text">{loadError}</p>;
  if (!space) return null;

  return (
    <div className="container">
      <p className="eyebrow">ĐẶT CHỖ</p>
      <h1>{space.name}</h1>
      <p>Chọn ngày, khung giờ và thiết bị đi kèm nếu cần.</p>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="field">
          <label htmlFor="date">Ngày</label>
          <input
            id="date"
            type="date"
            value={date}
            min={todayIso()}
            onChange={(e) => {
              setDate(e.target.value);
              setAvailability(null);
            }}
          />
        </div>

        <label>Khung giờ bắt đầu</label>
        <div className="slot-grid">
          {hourSlots.map((h) => (
            <button
              key={h}
              type="button"
              className={`slot-btn ${startHour === h ? "selected" : ""}`}
              onClick={() => selectSlot(h)}
            >
              {String(h).padStart(2, "0")}:00
            </button>
          ))}
        </div>

        <div className="field" style={{ maxWidth: 200 }}>
          <label htmlFor="duration">Số giờ thuê</label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => {
              setDuration(Number(e.target.value));
              setAvailability(null);
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} giờ
              </option>
            ))}
          </select>
        </div>

        {resources.length > 0 && (
          <>
            <label>Thiết bị đi kèm (không bắt buộc)</label>
            {resources.map((r) => (
              <div key={r.id} className="field" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  id={`res-${r.id}`}
                  checked={selectedResourceIds.includes(r.id)}
                  onChange={() => {
                    toggleResource(r.id);
                    setAvailability(null);
                  }}
                  style={{ width: "auto" }}
                />
                <label htmlFor={`res-${r.id}`} style={{ margin: 0, flex: 1 }}>
                  {r.name}
                </label>
                <span className="mono help-text">
                  {Number(r.rental_price).toLocaleString("vi-VN")} đ/giờ
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="field-row">
          <div>
            <div className="help-text">Tổng tạm tính</div>
            <div className="mono" style={{ fontSize: "1.2rem" }}>
              {totalPrice.toLocaleString("vi-VN")} đ
            </div>
          </div>
          <div>
            <div className="help-text">Thời gian</div>
            <div className="mono">
              {startHour === null
                ? "Chưa chọn khung giờ"
                : `${String(startHour).padStart(2, "0")}:00 – ${String(
                    (startHour + duration) % 24
                  ).padStart(2, "0")}:00, ${date}`}
            </div>
          </div>
        </div>

        {actionError && (
          <p className="error-text" style={{ marginTop: 16 }}>
            {actionError}
          </p>
        )}

        {availability && (
          <p className={availability.available ? "help-text" : "error-text"} style={{ marginTop: 16 }}>
            {availability.available ? "✓ " : "✗ "}
            {availability.message || availability.reason}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={startHour === null || checking}
            onClick={handleCheckAvailability}
          >
            {checking ? "Đang kiểm tra…" : "Kiểm tra khả dụng"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={startHour === null || !availability?.available || submitting}
            onClick={handleConfirmBooking}
          >
            {submitting ? "Đang tạo đơn…" : "Xác nhận đặt chỗ"}
          </button>
        </div>
      </div>
    </div>
  );
}
