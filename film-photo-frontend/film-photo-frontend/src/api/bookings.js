// ⚠️ API_ASSUMPTIONS: đọc kèm file API_ASSUMPTIONS.md.
//
// CÓ THẬT (khớp routes_bookingRoutes của Người 2, mount ở app.use('/api', bookingRoutes)):
//   POST /api/bookings/check-availability  { spaceId, resourceIds, startTime, endTime }
//   POST /api/bookings                     { spaceId, resourceIds, startTime, endTime, totalPrice } (cần token)
//
// CHƯA CÓ THẬT (tự giả định, đang mock):
//   GET /api/bookings/my  (cần token) -> danh sách booking của user hiện tại
//
// Nếu nhóm cuối cùng chốt dùng bản route của Người 1 thay vì Người 2,
// chỉ cần đổi 2 path check-availability/tạo booking bên dưới.

import { request, USE_MOCKS } from "./client";
import { MOCK_MY_BOOKINGS } from "../mocks/spaces.mock";

export function checkAvailability({ spaceId, resourceIds = [], startTime, endTime }) {
  return request("/bookings/check-availability", {
    method: "POST",
    body: { spaceId, resourceIds, startTime, endTime },
  });
}

export function createBooking({ spaceId, resourceIds = [], startTime, endTime, totalPrice }) {
  return request("/bookings", {
    method: "POST",
    auth: true,
    body: { spaceId, resourceIds, startTime, endTime, totalPrice },
  });
}

export async function getMyBookings() {
  if (USE_MOCKS) {
    return MOCK_MY_BOOKINGS;
  }
  try {
    return await request("/bookings/my", { auth: true });
  } catch (err) {
    // Path giả định có thể chưa tồn tại trên backend thật.
    throw new Error(
      `${err.message} — API GET /bookings/my có thể chưa được backend triển khai, kiểm tra lại với nhóm.`
    );
  }
}
