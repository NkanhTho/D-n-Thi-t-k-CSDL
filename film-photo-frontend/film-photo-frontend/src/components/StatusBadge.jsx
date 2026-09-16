const LABELS = {
  PENDING: ["Chờ thanh toán", "badge-pending"],
  CONFIRMED: ["Đã xác nhận", "badge-ok"],
  CHECKED_IN: ["Đang sử dụng", "badge-ok"],
  COMPLETED: ["Hoàn thành", ""],
  CANCELLED: ["Đã huỷ", "badge-danger"],
  success: ["Thanh toán thành công", "badge-ok"],
  failed: ["Thanh toán thất bại", "badge-danger"],
};

export default function StatusBadge({ status }) {
  const [label, cls] = LABELS[status] || [status, ""];
  return <span className={`badge ${cls}`}>{label}</span>;
}
