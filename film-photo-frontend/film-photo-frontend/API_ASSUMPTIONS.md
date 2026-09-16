# API_ASSUMPTIONS

Ghi lại API nào là **thật** (khớp code trong file Word tổng hợp) và API
nào là **giả định/mock** do backend nhóm chưa có. Khi backend cập nhật,
đối chiếu lại danh sách này rồi sửa trong `src/api/*.js` — không cần
đụng vào UI.

## Đã xác nhận là thật

| API | Nguồn |
|---|---|
| `POST /api/auth/register` | authController — Người 1 |
| `POST /api/auth/login` | authController — Người 1 |
| `GET /api/users/me` | userController — Người 1 |
| `PUT /api/users/me` | userController — Người 1 |
| `GET /api/spaces` (không filter) | routes_bookingRoutes — Người 2 |
| `GET /api/spaces/:spaceId/resources` | routes_bookingRoutes — Người 2 |
| `POST /api/bookings/check-availability` | routes_bookingRoutes — Người 2 |
| `POST /api/bookings` | routes_bookingRoutes — Người 2 (trả `{ bookingId, qrCodeHash }`) |
| `POST /api/payments/vnpay/create` | paymentController — Người 3 (trả `{ paymentUrl }`) |
| `POST /api/payments/momo/create` | paymentController — Người 3 (trả `{ paymentUrl }`) |
| `GET /api/payments/status/:orderId` | paymentController — Người 3 |
| `POST /api/complaints` | complaintController — Người 3 |
| `GET /api/complaints/my` | complaintController — Người 3 |

## Giả định / đang dùng mock (`VITE_USE_MOCKS=true`)

| Nhu cầu UI | API giả định | Vì sao |
|---|---|---|
| Lọc/tìm phòng theo khu vực, giá, loại | `GET /api/spaces?type=&location=&maxPrice=` | Backend hiện trả toàn bộ phòng, không filter. FE đang lọc ở client tạm thời. |
| Chi tiết 1 phòng | `GET /api/spaces/:id` | Không thấy route này trong code, chỉ có PUT/DELETE dành cho provider. |
| Lịch sử đặt chỗ của tôi | `GET /api/bookings/my` | Không thấy route liệt kê booking theo user, chỉ có check-availability/create/check-in/check-out. |
| Base path thanh toán/khiếu nại | `/api/payments/...`, `/api/complaints/...` | Không thấy dòng `app.use(...)` gắn 2 router này vào `index.js` trong file tổng hợp — path suy ra từ tên file router, cần Người 3 xác nhận. |
| Giá trị field `role` khi đăng ký | `"customer"` / `"provider"` | Backend không định nghĩa danh sách role cố định, chỉ thấy `checkRole('provider')`, `checkRole('expert')`, `checkRole('admin')` được dùng ở nơi khác. |

## Hai bản route đặt chỗ/không gian chưa hợp nhất

- Người 1: mount ở `/api/bookings` — path là `/`, `/check-availability`, `/checkin`, `/:bookingId/checkout` (PUT).
- Người 2: mount ở `/api` — router nội bộ có `/bookings`, `/bookings/check-availability`, `/bookings/check-in`, `/bookings/check-out`, cộng thêm toàn bộ `/spaces`, `/resources`.

**FE này code theo bản của Người 2** (đầy đủ hơn, có spaces/resources).
Nếu nhóm chốt dùng bản khác, chỉ cần sửa path trong `src/api/bookings.js`.

## Cách chuyển từ mock sang API thật

1. Trong `.env`, đặt `VITE_USE_MOCKS=false`.
2. Đặt `VITE_API_BASE` trỏ đúng backend thật (vd `http://localhost:3000/api`).
3. Nếu path giả định ở trên khác với path thật, sửa trong file tương ứng ở `src/api/`.
4. Test lại từng trang theo checklist trong `README_FE.md`.
