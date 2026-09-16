# Frontend ReactJS — Film Photo Platform

Phần việc của Người 4 (web ReactJS cho khách hàng): đăng ký/đăng nhập, tìm & lọc phòng,
chi tiết phòng, đặt chỗ theo khung giờ, thanh toán, lịch sử đặt chỗ, trang cá nhân/hỗ trợ.

Toàn bộ code gọi đúng API và đúng tên cột trong schema mà 4 bạn còn lại đã push lên GitHub.
Không dùng thư viện UI ngoài — chỉ React + react-router-dom + axios + CSS thuần.

---

## 1. Chạy thử trong 4 bước

```bash
# Bước 1 — cài thư viện
cd frontend
npm install

# Bước 2 — trỏ tới backend của nhóm
cp .env.example .env
# mặc định: VITE_API_URL=http://localhost:3000/api

# Bước 3 — bật backend trước (terminal khác)
cd ../backend && npm run dev

# Bước 4 — bật frontend
cd ../frontend && npm run dev
# mở http://localhost:5173
```

---

## 2. Cấu trúc thư mục

```
frontend/
├─ index.html
├─ vite.config.js
├─ .env.example
├─ backend-patch/            ← 2 endpoint cần nhờ Người 2 bổ sung
└─ src/
   ├─ main.jsx               điểm vào, bọc BrowserRouter + AuthProvider
   ├─ App.jsx                khai báo toàn bộ route
   ├─ styles.css             CSS thuần, một file duy nhất
   ├─ api/                   tầng gọi API — chỉ sửa ở đây khi backend đổi
   │  ├─ client.js           axios + tự gắn JWT + bắt lỗi 401
   │  ├─ spaceApi.js         phòng & thiết bị
   │  ├─ bookingApi.js       kiểm tra trống, tạo đơn, lịch sử
   │  ├─ paymentApi.js       VNPay / MoMo
   │  └─ userApi.js          auth, hồ sơ, khiếu nại
   ├─ context/AuthContext.jsx   lưu token, gọi /users/me, đăng nhập/đăng xuất
   ├─ components/
   │  ├─ Navbar.jsx
   │  ├─ ProtectedRoute.jsx  chặn trang cần đăng nhập
   │  ├─ Message.jsx         hộp thông báo lỗi/thành công
   │  └─ SpaceCard.jsx
   ├─ utils/format.js        định dạng tiền, datetime MySQL, nhãn ENUM
   └─ pages/                 7 trang đầu ra + trang kết quả thanh toán
```

---

## 3. Bảng route ↔ API ↔ bảng dữ liệu

| Trang | Route | API gọi tới | Bảng liên quan |
|---|---|---|---|
| Đăng nhập | `/login` | `POST /auth/login` | `users` |
| Đăng ký | `/register` | `POST /auth/register` | `users` |
| Tìm & lọc phòng | `/spaces` | `GET /bookings/spaces` | `spaces` |
| Chi tiết phòng | `/spaces/:id` | `GET /bookings/spaces`, `GET /bookings/spaces/:id/resources` | `spaces`, `resources` |
| Đặt chỗ theo giờ | `/spaces/:id/booking` | `POST /bookings/check-availability`, `POST /bookings` | `bookings`, `booking_resources` |
| Thanh toán | `/payment/:bookingId` | `POST /payments/vnpay/create`, `POST /payments/momo/create` | `transactions` |
| Kết quả thanh toán | `/payment-result` | `GET /payments/status/:orderId` | `transactions` |
| Lịch sử đặt chỗ | `/bookings` | `GET /bookings/my` | `bookings` |
| Cá nhân / hỗ trợ | `/profile` | `GET/PUT /users/me`, `POST /complaints`, `GET /complaints/my` | `users`, `complaints` |

---

## 4. Luồng đặt chỗ (đúng như logic transaction của Người 2)

1. Chọn ngày, giờ bắt đầu, số giờ, tick thiết bị muốn thuê kèm.
2. Bấm **Kiểm tra phòng trống** → `POST /bookings/check-availability`.
   Nút xác nhận chỉ mở khi backend trả `available: true`.
3. Bấm **Xác nhận và thanh toán** → `POST /bookings` với
   `{ spaceId, resourceIds, startTime, endTime, totalPrice }`.
   Backend dùng `SELECT ... FOR UPDATE` trong transaction; nếu có người khác đặt trước
   sẽ trả **409**, frontend reset lại bước kiểm tra và hiện thông báo.
4. Đơn tạo ra ở trạng thái `PENDING` → tự chuyển sang trang thanh toán.
5. Thanh toán thành công, backend đổi booking sang `CONFIRMED`.

`startTime` / `endTime` được gửi đúng định dạng `YYYY-MM-DD HH:MM:SS` khớp cột
`DATETIME` của MySQL (xem `utils/format.js` → `buildDatetime`).

Cách tính tiền hiện tại: `hourly_rate × số giờ + tổng rental_price của thiết bị đã chọn`
(thiết bị tính giá trọn đơn, không nhân theo giờ). Nếu nhóm quy định khác, sửa
`totalPrice` trong `pages/BookingPage.jsx`.

---

## 5. Những chỗ backend còn thiếu — và cách tôi xử lý tạm

Tất cả đều đã chạy được, không chặn demo:

| Vấn đề | Cách xử lý ở frontend | Cách sửa dứt điểm |
|---|---|---|
| Chưa có `GET /spaces/:id` | Tải cả danh sách rồi tìm theo id | `backend-patch/bookingHistory.patch.js` |
| Chưa có `GET /bookings/my` | Trang lịch sử báo rõ endpoint còn thiếu | cùng file patch trên |
| `index.js` chưa mount `paymentRoutes`, `complaintRoutes` | Trang hỗ trợ bỏ qua lỗi, không làm trắng trang | `backend-patch/index.mount.md` |
| Bảng `spaces` **không có cột khu vực** | Đọc khu vực từ cột JSON `specifications` (`area` / `district` / `location` / `city`) | Thêm cột `address` + `district` vào `spaces`, hoặc thống nhất key trong JSON |

Về **khu vực**: đây là điểm đáng nói trong báo cáo môn Thiết kế CSDL. Lọc theo khu vực
mà lưu trong cột JSON thì không đánh index được, truy vấn phải quét toàn bảng.
Cách chuẩn hoá là tách cột `district VARCHAR(100)` (hoặc bảng `locations` riêng)
rồi `CREATE INDEX idx_spaces_district ON spaces(district, type, hourly_rate)`.
Hiện frontend vẫn lọc phía client được vì dữ liệu demo ít.

Để dữ liệu hiện ra đúng, `specifications` khi Người 2 seed phòng nên có dạng:

```json
{ "area": "Quận 1", "size": "25m2", "lighting": "Đèn safelight đỏ" }
```

---

## 6. Gợi ý thứ tự làm/demo cho chắc từng bước

1. Chạy `npm run dev`, mở `/register` → tạo tài khoản → `/login`. Kiểm tra token đã
   lưu trong localStorage (DevTools → Application).
2. Nhờ Người 2 seed 3–4 phòng vào bảng `spaces` (khác `type`, khác `hourly_rate`,
   khác `area` trong `specifications`) và vài dòng `resources`.
3. Mở `/spaces`, thử từng bộ lọc: khu vực, loại phòng, giá tối đa.
4. Vào chi tiết một phòng, kiểm tra danh sách thiết bị hiện đúng.
5. Đặt chỗ → kiểm tra trống → xác nhận. Mở MySQL xem bảng `bookings` và
   `booking_resources` đã có dòng mới, `status = 'PENDING'`.
6. Đặt trùng khung giờ bằng tài khoản thứ hai để thấy lỗi 409 — đây là chỗ demo
   cơ chế transaction-safe, rất đáng đưa vào báo cáo.
7. Áp `backend-patch` rồi mở `/bookings` để thấy lịch sử.
8. Cuối cùng là `/profile`: sửa tên, số điện thoại, gửi một yêu cầu hỗ trợ.

## 7. Trước khi push lên GitHub

- Đừng commit `.env` và `node_modules/` (đã có `.gitignore`).
- Đặt thư mục này song song với `backend/` trong repo của nhóm, ví dụ `web-customer/`
  hoặc `frontend/`, rồi bổ sung cách chạy vào README gốc của nhóm.
