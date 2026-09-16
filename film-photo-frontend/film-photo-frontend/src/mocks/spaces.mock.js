// Dữ liệu giả lập cho phòng/studio.
// Dùng khi VITE_USE_MOCKS=true, để dựng UI trong lúc chờ backend bổ
// sung GET /spaces (có filter) và GET /spaces/:id.
// Field đặt tên giống hệt cột trong bảng `spaces` (xem schema Người 2)
// để khi nối API thật, không phải đổi tên field trong component.

export const MOCK_SPACES = [
  {
    id: 1,
    provider_id: 10,
    name: "Phòng tối An Phú",
    type: "darkroom",
    description:
      "Phòng tối tráng phim đen trắng, 2 máy phóng ảnh Beseler, thông gió tốt, cách âm.",
    capacity: 4,
    hourly_rate: 90000,
    location: "Quận 2, TP.HCM",
    operating_hours: "08:00 - 22:00",
    status: "AVAILABLE",
    rating: 4.8,
  },
  {
    id: 2,
    provider_id: 11,
    name: "Studio Ánh Sáng Vàng",
    type: "studio",
    description:
      "Studio chụp chân dung ánh sáng tự nhiên, backdrop đổi được, hệ đèn Profoto.",
    capacity: 8,
    hourly_rate: 250000,
    location: "Quận Bình Thạnh, TP.HCM",
    operating_hours: "09:00 - 21:00",
    status: "AVAILABLE",
    rating: 4.6,
  },
  {
    id: 3,
    provider_id: 12,
    name: "Lab Phim Cổ Điển",
    type: "darkroom",
    description:
      "Phòng tối tráng phim màu C-41 & đen trắng, máy quét phim Noritsu, phù hợp workshop.",
    capacity: 6,
    hourly_rate: 120000,
    location: "Quận 1, TP.HCM",
    operating_hours: "08:00 - 20:00",
    status: "AVAILABLE",
    rating: 4.9,
  },
  {
    id: 4,
    provider_id: 13,
    name: "Studio Nền Xám",
    type: "studio",
    description: "Studio nhỏ gọn cho chụp sản phẩm, nền xám/trắng, softbox 3 điểm.",
    capacity: 3,
    hourly_rate: 150000,
    location: "Quận 7, TP.HCM",
    operating_hours: "07:00 - 22:00",
    status: "AVAILABLE",
    rating: 4.4,
  },
];

export const MOCK_RESOURCES_BY_SPACE = {
  1: [
    { id: 101, space_id: 1, name: "Máy phóng ảnh Beseler 23C", category: "enlarger", rental_price: 50000, status: "AVAILABLE" },
    { id: 102, space_id: 1, name: "Bộ hóa chất tráng phim D-76", category: "chemical", rental_price: 30000, status: "AVAILABLE" },
  ],
  2: [
    { id: 201, space_id: 2, name: "Đèn Profoto B10", category: "lighting", rental_price: 80000, status: "AVAILABLE" },
    { id: 202, space_id: 2, name: "Backdrop vải xám", category: "backdrop", rental_price: 20000, status: "AVAILABLE" },
  ],
  3: [
    { id: 301, space_id: 3, name: "Máy quét phim Noritsu HS-1800", category: "scanner", rental_price: 100000, status: "AVAILABLE" },
  ],
  4: [
    { id: 401, space_id: 4, name: "Softbox 60x90", category: "lighting", rental_price: 25000, status: "AVAILABLE" },
  ],
};

// Giả lập lịch sử đặt chỗ của user hiện tại — dùng cho trang
// "Lịch sử đặt chỗ" khi backend chưa có GET /bookings/my.
export const MOCK_MY_BOOKINGS = [
  {
    id: 5001,
    space_id: 1,
    space_name: "Phòng tối An Phú",
    start_time: "2026-09-10T09:00:00+07:00",
    end_time: "2026-09-10T11:00:00+07:00",
    total_price: 180000,
    status: "COMPLETED",
  },
  {
    id: 5002,
    space_id: 3,
    space_name: "Lab Phim Cổ Điển",
    start_time: "2026-09-20T14:00:00+07:00",
    end_time: "2026-09-20T16:00:00+07:00",
    total_price: 240000,
    status: "CONFIRMED",
  },
  {
    id: 5003,
    space_id: 2,
    space_name: "Studio Ánh Sáng Vàng",
    start_time: "2026-09-25T10:00:00+07:00",
    end_time: "2026-09-25T12:00:00+07:00",
    total_price: 500000,
    status: "PENDING",
  },
];
