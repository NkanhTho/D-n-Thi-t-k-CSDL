// ⚠️ API_ASSUMPTIONS: đọc kèm file API_ASSUMPTIONS.md ở gốc project.
//
// CÓ THẬT (khớp routes_bookingRoutes của Người 2):
//   GET /api/spaces                     -> toàn bộ phòng AVAILABLE, không filter
//   GET /api/spaces/:spaceId/resources  -> thiết bị của 1 phòng
//
// CHƯA CÓ THẬT (mình tự giả định path, đang dùng mock cho tới khi có):
//   GET /api/spaces?type=&minPrice=&maxPrice=&location=   (lọc/tìm kiếm)
//   GET /api/spaces/:id                                    (chi tiết 1 phòng)
//
// Khi backend bổ sung xong, chỉ cần đổi USE_MOCKS=false trong .env
// (và sửa lại path bên dưới nếu nhóm đặt tên khác).

import { request, USE_MOCKS } from "./client";
import { MOCK_SPACES, MOCK_RESOURCES_BY_SPACE } from "../mocks/spaces.mock";

function applyClientFilters(spaces, { type, location, minPrice, maxPrice, q } = {}) {
  return spaces.filter((s) => {
    if (type && s.type !== type) return false;
    if (location && !s.location?.toLowerCase().includes(location.toLowerCase())) return false;
    if (minPrice && s.hourly_rate < Number(minPrice)) return false;
    if (maxPrice && s.hourly_rate > Number(maxPrice)) return false;
    if (q && !`${s.name} ${s.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
}

export async function searchSpaces(filters = {}) {
  if (USE_MOCKS) {
    return applyClientFilters(MOCK_SPACES, filters);
  }
  // Backend thật hiện không nhận query filter -> lấy toàn bộ rồi lọc ở
  // client. Nếu nhóm bổ sung filter server-side, thay dòng dưới bằng
  // request(`/spaces?${new URLSearchParams(filters)}`)
  const all = await request("/spaces");
  return applyClientFilters(all, filters);
}

export async function getSpaceDetail(id) {
  if (USE_MOCKS) {
    const found = MOCK_SPACES.find((s) => String(s.id) === String(id));
    if (!found) throw new Error("Không tìm thấy không gian này.");
    return found;
  }
  // Giả định path — cần xác nhận với Người 2. Nếu API thật không tồn
  // tại, có thể tạm lấy từ list rồi tìm theo id.
  try {
    return await request(`/spaces/${id}`);
  } catch {
    const all = await request("/spaces");
    const found = all.find((s) => String(s.id) === String(id));
    if (!found) throw new Error("Không tìm thấy không gian này.");
    return found;
  }
}

export async function getSpaceResources(spaceId) {
  if (USE_MOCKS) {
    return MOCK_RESOURCES_BY_SPACE[spaceId] || [];
  }
  return request(`/spaces/${spaceId}/resources`);
}
