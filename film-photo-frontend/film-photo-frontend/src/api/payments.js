// ⚠️ API_ASSUMPTIONS: paymentRoutes (Người 3) chưa thấy app.use(...) gắn
// vào index.js trong file tổng hợp, nên base path /api/payments là GIẢ
// ĐỊNH theo tên router file. Xác nhận lại path thật với Người 3.
//
// Body/response khớp với paymentController thật:
//   POST /api/payments/vnpay/create { bookingId } -> { paymentUrl }
//   POST /api/payments/momo/create  { bookingId } -> { paymentUrl }
//   GET  /api/payments/status/:orderId (cần token) -> transaction row

import { request } from "./client";

export function createVnpayPayment({ bookingId }) {
  return request("/payments/vnpay/create", {
    method: "POST",
    auth: true,
    body: { bookingId },
  });
}

export function createMomoPayment({ bookingId }) {
  return request("/payments/momo/create", {
    method: "POST",
    auth: true,
    body: { bookingId },
  });
}

export function getTransactionStatus(orderId) {
  return request(`/payments/status/${orderId}`, { auth: true });
}
