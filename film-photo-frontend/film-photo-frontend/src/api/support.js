// Khớp với complaintController thật của Người 3:
//   POST /api/complaints      { bookingId?, content } (cần token)
//   GET  /api/complaints/my   (cần token) -> danh sách khiếu nại của user
//
// ⚠️ Base path /api/complaints là GIẢ ĐỊNH theo tên router file —
// không thấy app.use('/api/complaints', complaintRoutes) trong file
// tổng hợp. Xác nhận lại với Người 3.
import { request } from "./client";

export function createComplaint({ bookingId, content }) {
  return request("/complaints", {
    method: "POST",
    auth: true,
    body: { bookingId: bookingId || null, content },
  });
}

export function getMyComplaints() {
  return request("/complaints/my", { auth: true });
}
