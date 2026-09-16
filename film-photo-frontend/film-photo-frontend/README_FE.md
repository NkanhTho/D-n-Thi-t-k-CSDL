# Contact Sheet — Frontend (React, phần Người 4)

7 trang khách hàng cho nền tảng "Platform Connecting the Film
Photography Community with Darkroom and Studio Services":

1. Đăng ký / Đăng nhập — `/register`, `/login`
2. Tìm kiếm & lọc phòng — `/search`
3. Chi tiết phòng/studio — `/rooms/:id`
4. Đặt chỗ theo khung giờ — `/rooms/:id/book`
5. Thanh toán (VNPay/MoMo) — `/payment/:bookingId`
6. Lịch sử đặt chỗ — `/history`
7. Cá nhân / hỗ trợ — `/profile`

## Chạy thử

```bash
cp .env.example .env
npm install
npm run dev
```

Mặc định `VITE_USE_MOCKS=true` nên bạn có thể chạy và xem toàn bộ 7
trang ngay cả khi chưa nối backend thật (dữ liệu phòng/lịch sử là mock
trong `src/mocks/spaces.mock.js`).

## Cấu trúc

```
src/
  api/          1 file/resource, tất cả đi qua request() trong client.js
  context/      AuthContext (login/logout/user hiện tại, lưu JWT ở localStorage)
  components/   Layout, ProtectedRoute, StatusBadge
  pages/        7 trang tương ứng nhiệm vụ được giao
  mocks/        dữ liệu giả cho các API backend chưa có
```

## Trước khi tích hợp API thật

Đọc `API_ASSUMPTIONS.md` — liệt kê rõ API nào thật, API nào mình tự
giả định path/response. Việc chuyển từ mock sang API thật chỉ cần sửa
`.env` và (nếu path khác) file tương ứng trong `src/api/`, không phải
sửa lại UI.

## Checklist test thủ công theo từng trang

- [ ] Đăng ký tài khoản mới → chuyển qua đăng nhập được
- [ ] Đăng nhập sai mật khẩu → hiện lỗi rõ ràng
- [ ] Tìm phòng, lọc theo loại/khu vực/giá → danh sách cập nhật đúng
- [ ] Vào chi tiết phòng → thấy mô tả + thiết bị đi kèm
- [ ] Chọn khung giờ, kiểm tra khả dụng, xác nhận đặt chỗ → chuyển sang trang thanh toán
- [ ] Bấm thanh toán VNPay/MoMo → mở được `paymentUrl`
- [ ] Xem lịch sử đặt chỗ → hiển thị đúng trạng thái (PENDING/CONFIRMED/…)
- [ ] Trang cá nhân: sửa tên/SĐT lưu được, gửi yêu cầu hỗ trợ thành công
