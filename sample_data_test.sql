-- ============================================================
-- FILE DỮ LIỆU MẪU CHO TEST SQL
-- Chạy sau khi schema đã tạo xong.
-- ============================================================

USE film_photo_booking_platform;

-- ============================================================
-- 1. USERS (10 người)
-- ============================================================
INSERT INTO users (id, name, email, password_hash, role, phone, business_name, address, description)
VALUES
  (1, 'Nguyen Van A', 'a@example.com', 'hash_a', 'provider', '0901111111', 'Studio A', 'HCM', 'Studio chụp ảnh tối'),
  (2, 'Tran Thi B', 'b@example.com', 'hash_b', 'photographer', '0902222222', NULL, 'HCM', 'Nhiếp ảnh gia'),
  (3, 'Le Van C', 'c@example.com', 'hash_c', 'expert', '0903333333', 'Lab C', 'Da Nang', 'Chuyên gia xử lý ảnh'),
  (4, 'Pham Thi D', 'd@example.com', 'hash_d', 'admin', '0904444444', NULL, 'Hanoi', 'Quản trị'),
  (5, 'Hoang Van E', 'e@example.com', 'hash_e', 'photographer', '0905555555', NULL, 'HCM', 'Chuyên chụp sự kiện'),
  (6, 'Vu Thi F', 'f@example.com', 'hash_f', 'provider', '0906666666', 'Pixel House', 'Hanoi', 'Studio quà tặng, model'),
  (7, 'Dang Van G', 'g@example.com', 'hash_g', 'expert', '0907777777', 'Color Lab', 'Da Nang', 'Chỉnh sửa màu'),
  (8, 'Bui Thi H', 'h@example.com', 'hash_h', 'photographer', '0908888888', NULL, 'HCM', 'Chụp portrait'),
  (9, 'Ngo Van I', 'i@example.com', 'hash_i', 'provider', '0909999999', 'Darkroom Co', 'Hanoi', 'Phòng tối analog'),
  (10, 'Mai Thi K', 'k@example.com', 'hash_k', 'photographer', '0901010101', NULL, 'HCM', 'Nhiếp ảnh thương hiệu')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  phone = VALUES(phone),
  business_name = VALUES(business_name),
  address = VALUES(address),
  description = VALUES(description);
-- ============================================================
-- 2. SPACES
-- ============================================================
INSERT INTO spaces (id, provider_id, name, type, description, capacity, hourly_rate, operating_hours, specifications, status)
VALUES
  (1, 1, 'Studio Mini 1', 'STUDIO', 'Phòng chụp studio nhỏ dành cho sản phẩm', 4, 500000.00, '{"open":"08:00","close":"22:00"}', '{"lighting":"3","background":"2"}', 'AVAILABLE'),
  (2, 1, 'Darkroom A', 'DARKROOM', 'Phòng tối cho phim ảnh analog', 2, 700000.00, '{"open":"09:00","close":"20:00"}', '{"chemical":"yes"}', 'AVAILABLE')
ON DUPLICATE KEY UPDATE
  provider_id = VALUES(provider_id),
  name = VALUES(name),
  type = VALUES(type),
  description = VALUES(description),
  capacity = VALUES(capacity),
  hourly_rate = VALUES(hourly_rate),
  operating_hours = VALUES(operating_hours),
  specifications = VALUES(specifications),
  status = VALUES(status);

-- ============================================================
-- 3. RESOURCES
-- ============================================================
INSERT INTO resources (id, space_id, name, category, serial_number, rental_price, stock_quantity, unit, status)
VALUES
  (1, 1, 'Canon 5D Mark IV', 'CAMERA', 'CAM-001', 300000.00, 2, 'set', 'AVAILABLE'),
  (2, 1, '50mm Lens', 'LENS', 'LEN-001', 150000.00, 5, 'set', 'AVAILABLE'),
  (3, 2, 'Enlarger Durst', 'ENLARGER', 'ENL-001', 200000.00, 1, 'unit', 'AVAILABLE')
ON DUPLICATE KEY UPDATE
  space_id = VALUES(space_id),
  name = VALUES(name),
  category = VALUES(category),
  serial_number = VALUES(serial_number),
  rental_price = VALUES(rental_price),
  stock_quantity = VALUES(stock_quantity),
  unit = VALUES(unit),
  status = VALUES(status);

-- ============================================================
-- 4. SERVICE PACKAGES + PACKAGE ITEMS
-- ============================================================
INSERT INTO service_packages (id, provider_id, name, description, price)
VALUES
  (1, 1, 'Gói Chụp Studio', 'Gói chụp studio + máy ảnh + lens', 1800000.00),
  (2, 1, 'Gói Darkroom', 'Gói phòng tối + enlarger', 1200000.00)
ON DUPLICATE KEY UPDATE
  provider_id = VALUES(provider_id),
  name = VALUES(name),
  description = VALUES(description),
  price = VALUES(price);

INSERT INTO package_items (package_id, item_type, item_id, quantity)
VALUES
  (1, 'space', 1, 1),
  (1, 'resource', 1, 1),
  (1, 'resource', 2, 1),
  (2, 'space', 2, 1),
  (2, 'resource', 3, 1)
ON DUPLICATE KEY UPDATE
  quantity = VALUES(quantity);

-- ============================================================
-- 5. PROMOTIONS
-- ============================================================
INSERT INTO promotions (id, provider_id, code, description, discount_percent, start_at, end_at, max_uses, used_count, active)
VALUES
  (1, 1, 'WELCOME10', 'Giảm 10% cho đơn mới', 10, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 100, 0, TRUE),
  (2, 1, 'VIP20', 'Giảm 20% cho khách hàng thân thiết', 20, '2026-01-01 00:00:00', '2026-06-30 23:59:59', 50, 0, TRUE)
ON DUPLICATE KEY UPDATE
  provider_id = VALUES(provider_id),
  code = VALUES(code),
  description = VALUES(description),
  discount_percent = VALUES(discount_percent),
  start_at = VALUES(start_at),
  end_at = VALUES(end_at),
  max_uses = VALUES(max_uses),
  used_count = VALUES(used_count),
  active = VALUES(active);

-- ============================================================
-- 6. BOOKINGS
-- Dữ liệu hợp lệ: không trùng lịch với nhau.
-- ============================================================
INSERT INTO bookings (id, user_id, space_id, start_time, end_time, total_price, status, qr_code_hash, package_id, promotion_id, discount_amount)
VALUES
  (1, 2, 1, '2026-09-21 09:00:00', '2026-09-21 12:00:00', 1500000.00, 'PENDING', 'QR-001', 1, 1, 150000.00),
  (2, 3, 2, '2026-09-22 10:00:00', '2026-09-22 13:00:00', 2100000.00, 'CONFIRMED', 'QR-002', 2, NULL, 0.00),
  (3, 5, 1, '2026-09-23 13:00:00', '2026-09-23 16:00:00', 1800000.00, 'CONFIRMED', 'QR-003', 1, 2, 300000.00),
  (4, 8, 2, '2026-09-24 15:00:00', '2026-09-24 18:00:00', 2400000.00, 'PENDING', 'QR-004', 2, NULL, 0.00),
  (5, 10, 1, '2026-09-25 08:00:00', '2026-09-25 10:00:00', 1000000.00, 'CHECKED_IN', 'QR-005', NULL, 1, 100000.00)
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  space_id = VALUES(space_id),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time),
  total_price = VALUES(total_price),
  status = VALUES(status),
  qr_code_hash = VALUES(qr_code_hash),
  package_id = VALUES(package_id),
  promotion_id = VALUES(promotion_id),
  discount_amount = VALUES(discount_amount);
-- ============================================================
-- 7. BOOKING RESOURCES
-- ============================================================
INSERT INTO booking_resources (booking_id, resource_id, quantity)
VALUES
  (1, 1, 1),
  (1, 2, 1),
  (2, 3, 1),
  (3, 1, 1),
  (4, 3, 1),
  (5, 2, 1)
ON DUPLICATE KEY UPDATE
  quantity = VALUES(quantity);
-- ============================================================
-- 8. MAINTENANCE SCHEDULES
-- Dùng để test trigger bảo trì.
-- ============================================================
INSERT INTO maintenance_schedules (id, target_type, target_id, scheduled_start, scheduled_end, reason, status, created_by)
VALUES
  (1, 'space', 1, '2026-09-21 10:00:00', '2026-09-21 11:00:00', 'Bảo trì hệ thống ánh sáng', 'planned', 4),
  (2, 'resource', 1, '2026-09-22 11:00:00', '2026-09-22 12:00:00', 'Bảo trì máy ảnh', 'in_progress', 4),
  (3, 'space', 2, '2026-09-24 16:00:00', '2026-09-24 17:30:00', 'Kiểm tra phòng tối', 'planned', 4)
ON DUPLICATE KEY UPDATE
  target_type = VALUES(target_type),
  target_id = VALUES(target_id),
  scheduled_start = VALUES(scheduled_start),
  scheduled_end = VALUES(scheduled_end),
  reason = VALUES(reason),
  status = VALUES(status),
  created_by = VALUES(created_by);
-- ============================================================
-- 9. WORKSHOPS
-- ============================================================
INSERT INTO workshops (id, organizer_id, title, description, date, location, capacity, registered_count)
VALUES
  (1, 3, 'Workshop Chụp Hình Màu', 'Workshop chụp ảnh màu cơ bản', '2026-10-10 09:00:00', 'Studio A', 3, 0),
  (2, 3, 'Workshop Film Analog', 'Workshop darkroom analog', '2026-10-12 14:00:00', 'Darkroom A', 2, 0),
  (3, 7, 'Advanced Retouching', 'Workshop nâng cao retouching ảnh', '2026-10-15 10:00:00', 'Color Lab', 4, 0)
ON DUPLICATE KEY UPDATE
  organizer_id = VALUES(organizer_id),
  title = VALUES(title),
  description = VALUES(description),
  date = VALUES(date),
  location = VALUES(location),
  capacity = VALUES(capacity),
  registered_count = VALUES(registered_count);
-- ============================================================
-- 10. WORKSHOP REGISTRATIONS
-- ============================================================
INSERT INTO workshop_registrations (id, workshop_id, user_id, status)
VALUES
  (1, 1, 2, 'PENDING'),
  (2, 1, 4, 'PAID'),
  (3, 1, 5, 'PENDING'),
  (4, 2, 8, 'PAID'),
  (5, 3, 10, 'PENDING')
ON DUPLICATE KEY UPDATE
  workshop_id = VALUES(workshop_id),
  user_id = VALUES(user_id),
  status = VALUES(status);
-- ============================================================
-- 11. FAVORITES + NOTIFICATIONS (optional)
-- ============================================================
INSERT INTO favorites (user_id, space_id)
VALUES
  (2, 1),
  (3, 2),
  (5, 1),
  (8, 2),
  (10, 1)
ON DUPLICATE KEY UPDATE
  space_id = VALUES(space_id);

INSERT INTO notifications (id, user_id, title, message, type, is_read)
VALUES
  (1, 2, 'Booking confirmed', 'Booking của bạn đã được xác nhận.', 'booking', FALSE),
  (2, 3, 'Reminder', 'Workshop của bạn sắp diễn ra.', 'workshop', FALSE),
  (3, 5, 'Payment success', 'Thanh toán đã thành công.', 'payment', FALSE),
  (4, 8, 'Maintenance notice', 'Studio sẽ bảo trì vào ngày mai.', 'maintenance', FALSE)
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  title = VALUES(title),
  message = VALUES(message),
  type = VALUES(type),
  is_read = VALUES(is_read);

-- ============================================================
-- 12. DỮ LIỆU TEST TRIGGER (BÌNH LUẬN)
-- ============================================================
-- CÁC LỆNH DƯỚI ĐÂY PHẢI CHẠY THỦ CÔNG ĐỂ TEST TRIGGER:
--
-- 1) Test booking overlap:
-- INSERT INTO bookings (user_id, space_id, start_time, end_time, total_price, status)
-- VALUES (2, 1, '2026-09-21 10:30:00', '2026-09-21 11:30:00', 500000, 'PENDING');
-- -> Sẽ lỗi vì trùng với booking id=1
--
-- 2) Test maintenance conflict:
-- INSERT INTO bookings (user_id, space_id, start_time, end_time, total_price, status)
-- VALUES (2, 1, '2026-09-21 10:15:00', '2026-09-21 10:45:00', 500000, 'PENDING');
-- -> Sẽ lỗi vì space 1 đang bảo trì
--
-- 3) Test duplicate resource booking:
-- INSERT INTO booking_resources (booking_id, resource_id, quantity)
-- VALUES (2, 1, 1);
-- -> Sẽ lỗi vì resource 1 đã được booking ở booking 1 trong khung giờ trùng nhau
--
-- 4) Test workshop capacity:
-- INSERT INTO workshop_registrations (workshop_id, user_id, status)
-- VALUES (1, 1, 'PENDING');
-- -> Nếu workshop 1 đã đủ 3 người thì sẽ lỗi
--
-- 5) Test promotion used_count auto update:
-- INSERT INTO bookings (user_id, space_id, start_time, end_time, total_price, status, promotion_id)
-- VALUES (4, 1, '2026-09-25 09:00:00', '2026-09-25 12:00:00', 900000, 'PENDING', 1);
-- -> promotions.used_count sẽ tăng lên
