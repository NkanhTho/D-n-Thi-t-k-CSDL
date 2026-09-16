import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { createMomoPayment, createVnpayPayment } from "../api/payments";
import { ApiError } from "../api/client";

const METHODS = [
  { id: "vnpay", label: "VNPay", create: createVnpayPayment },
  { id: "momo", label: "MoMo", create: createMomoPayment },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const totalPrice = location.state?.totalPrice;

  const [method, setMethod] = useState("vnpay");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setError("");
    setLoading(true);
    setPaymentUrl("");
    try {
      const selected = METHODS.find((m) => m.id === method);
      const res = await selected.create({ bookingId: Number(bookingId) });
      setPaymentUrl(res.paymentUrl);
      window.open(res.paymentUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không tạo được giao dịch thanh toán.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container panel-narrow">
      <p className="eyebrow">THANH TOÁN</p>
      <h1>Hoàn tất đặt chỗ #{bookingId}</h1>
      {totalPrice != null && (
        <p>
          Số tiền cần thanh toán: <strong className="mono">{Number(totalPrice).toLocaleString("vi-VN")} đ</strong>
        </p>
      )}

      <div className="card">
        <label>Chọn phương thức thanh toán</label>
        <div className="field-row" style={{ marginBottom: 16 }}>
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`slot-btn ${method === m.id ? "selected" : ""}`}
              onClick={() => setMethod(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary btn-block" onClick={handlePay} disabled={loading}>
          {loading ? "Đang tạo giao dịch…" : `Thanh toán qua ${METHODS.find((m) => m.id === method).label}`}
        </button>

        {paymentUrl && (
          <p className="help-text" style={{ marginTop: 16 }}>
            Đã mở cổng thanh toán ở tab mới. Nếu không tự mở,{" "}
            <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
              bấm vào đây
            </a>
            .
          </p>
        )}

        <hr className="hairline" />
        <p className="help-text">
          Sau khi thanh toán xong, cổng thanh toán sẽ xác nhận với server (VNPay qua redirect, MoMo
          qua IPN) và cập nhật trạng thái đơn sang "Đã xác nhận". Kiểm tra lại ở{" "}
          <Link to="/history">Lịch sử đặt chỗ</Link>.
        </p>
      </div>
    </div>
  );
}
