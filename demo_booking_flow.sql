-- ============================================================
-- DEMO: MỘT NGƯỜI DÙNG ĐẶT PHÒNG + THUÊ THIẾT BỊ, TỪ ĐẦU ĐẾN CUỐI
-- Chạy SAU sample_data_test.sql.
--
-- Cách chạy: MySQL Workbench -> File > Open SQL Script -> bấm tia sét (chạy tất cả).
-- Hoặc CLI: mysql -uroot -p --table film_photo_booking_platform < demo_booking_flow.sql
-- Script chạy một mạch, không dừng vì lỗi: các lần đặt bị chặn ở bước 4
-- được bắt lỗi và in ra thành bảng kết quả.
--
-- Kịch bản:
--   Người đặt : user 8 (Bui Thi H, photographer)
--   Không gian: Studio Mini 1 (space 1, 500.000đ/giờ)
--   Thời gian : 2026-09-26 14:00 -> 17:00 (3 giờ)
--   Thuê thêm : Canon 5D Mark IV (300.000) + 50mm Lens (150.000)
--   Mã giảm   : WELCOME10 (-10%)
--
-- Quy ước giá dùng trong demo (schema KHÔNG ép, backend tự quy định):
--   tổng gốc = giờ x hourly_rate + tổng rental_price của thiết bị
--   total_price = tổng gốc - discount_amount
-- ============================================================

USE film_photo_booking_platform;

SET @start = '2026-09-26 14:00:00';
SET @end   = '2026-09-26 17:00:00';
SET @user  = 8;
SET @space = 1;

-- ------------------------------------------------------------
-- BƯỚC 1. TÌM CHỖ TRỐNG: space có trống không? thiết bị nào rảnh?
-- ------------------------------------------------------------
SELECT 'BUOC 1a: space co trong khong? (0 = trong)' AS step;
SELECT
  (SELECT COUNT(*) FROM bookings
    WHERE space_id = @space
      AND status IN ('PENDING','CONFIRMED','CHECKED_IN')
      AND @start < end_time AND @end > start_time)
  +
  (SELECT COUNT(*) FROM maintenance_schedules
    WHERE target_type = 'space' AND target_id = @space
      AND status IN ('planned','in_progress')
      AND @start < scheduled_end AND @end > scheduled_start)
  AS so_xung_dot;

SELECT 'BUOC 1b: thiet bi cua space dang ranh trong khung gio' AS step;
SELECT r.id, r.name, r.category, r.rental_price
FROM resources r
WHERE r.space_id = @space
  AND r.status = 'AVAILABLE'
  AND NOT EXISTS (
    SELECT 1 FROM booking_resources br
    JOIN bookings b ON b.id = br.booking_id
    WHERE br.resource_id = r.id
      AND b.status IN ('PENDING','CONFIRMED','CHECKED_IN')
      AND @start < b.end_time AND @end > b.start_time)
  AND NOT EXISTS (
    SELECT 1 FROM maintenance_schedules m
    WHERE m.target_type = 'resource' AND m.target_id = r.id
      AND m.status IN ('planned','in_progress')
      AND @start < m.scheduled_end AND @end > m.scheduled_start);

-- ------------------------------------------------------------
-- BƯỚC 2. TÍNH GIÁ (backend làm việc này, trigger không tính giùm)
-- ------------------------------------------------------------
SELECT hourly_rate INTO @rate FROM spaces WHERE id = @space;
SELECT COALESCE(SUM(rental_price),0) INTO @res_total FROM resources WHERE id IN (1, 2);

-- Mã hợp lệ = đang active, trong thời hạn, chưa hết lượt.
-- (Trigger KHÔNG kiểm tra các điều kiện này, phải kiểm ở đây.)
SELECT id, discount_percent INTO @promo_id, @pct
FROM promotions
WHERE code = 'WELCOME10'
  AND active = TRUE
  AND NOW() BETWEEN start_at AND end_at
  AND (max_uses IS NULL OR used_count < max_uses);

SET @hours    = TIMESTAMPDIFF(MINUTE, @start, @end) / 60;
SET @subtotal = @hours * @rate + @res_total;
SET @discount = ROUND(@subtotal * COALESCE(@pct,0) / 100, 2);
SET @total    = @subtotal - @discount;

SELECT 'BUOC 2: bang gia' AS step;
SELECT @hours AS gio, @rate AS gia_gio, @res_total AS tien_thiet_bi,
       @subtotal AS tong_goc, @pct AS giam_pct, @discount AS giam, @total AS phai_tra;

-- ------------------------------------------------------------
-- BƯỚC 3. TẠO BOOKING (PENDING) + GẮN THIẾT BỊ
--   -> trg_bookings_overlap_bi kiểm tra trùng lịch / bảo trì
--   -> trg_bookings_promo_ai tăng used_count của WELCOME10
--   -> trg_booking_resources_overlap_bi kiểm tra từng thiết bị
-- ------------------------------------------------------------
SELECT 'BUOC 3: used_count TRUOC khi dat' AS step;
SELECT code, used_count FROM promotions WHERE id = @promo_id;

INSERT INTO bookings
  (user_id, space_id, start_time, end_time, total_price, status,
   qr_code_hash, promotion_id, discount_amount)
VALUES
  (@user, @space, @start, @end, @total, 'PENDING',
   'QR-DEMO-001', @promo_id, @discount);
SET @bid = LAST_INSERT_ID();

INSERT INTO booking_resources (booking_id, resource_id, quantity)
VALUES (@bid, 1, 1), (@bid, 2, 1);

SELECT 'BUOC 3: used_count SAU khi dat (+1)' AS step;
SELECT code, used_count FROM promotions WHERE id = @promo_id;

-- ------------------------------------------------------------
-- BƯỚC 4. NGƯỜI KHÁC THỬ ĐẶT -> XEM TRIGGER CHẶN HAY CHO QUA
-- Thủ tục tạm demo_try: thử đặt trong một transaction, bắt lỗi (nếu có)
-- rồi ROLLBACK, nên không để lại dữ liệu rác.
-- ------------------------------------------------------------
DELIMITER $$
DROP PROCEDURE IF EXISTS demo_try $$
CREATE PROCEDURE demo_try(
  IN p_label VARCHAR(120), IN p_user INT, IN p_space INT,
  IN p_start DATETIME, IN p_end DATETIME, IN p_resource INT)
BEGIN
  DECLARE v_msg TEXT DEFAULT NULL;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1 v_msg = MESSAGE_TEXT;
    ROLLBACK;
    SELECT p_label AS thu_nghiem, 'BI CHAN' AS ket_qua, v_msg AS ly_do;
  END;

  START TRANSACTION;
  INSERT INTO bookings (user_id, space_id, start_time, end_time, total_price, status)
  VALUES (p_user, p_space, p_start, p_end, 100000, 'PENDING');
  IF p_resource IS NOT NULL THEN
    INSERT INTO booking_resources (booking_id, resource_id)
    VALUES (LAST_INSERT_ID(), p_resource);
  END IF;
  ROLLBACK;
  SELECT p_label AS thu_nghiem, 'THANH CONG' AS ket_qua, 'khong bi chan' AS ly_do;
END $$
DELIMITER ;

CALL demo_try('4a: user 10 dat trung gio o Studio Mini 1 (15:00-16:00)',
              10, 1, '2026-09-26 15:00:00', '2026-09-26 16:00:00', NULL);
CALL demo_try('4b: user 10 dat Darkroom cung gio, thue Canon da bi giu',
              10, 2, '2026-09-26 15:00:00', '2026-09-26 16:00:00', 1);
CALL demo_try('4c: user 10 dat sat ngay sau (17:00-19:00, lien ke)',
              10, 1, '2026-09-26 17:00:00', '2026-09-26 19:00:00', NULL);

DROP PROCEDURE demo_try;

-- ------------------------------------------------------------
-- BƯỚC 5. THANH TOÁN -> XÁC NHẬN BOOKING
-- ------------------------------------------------------------
INSERT INTO transactions (booking_id, user_id, amount, method, status, external_ref)
VALUES (@bid, @user, @total, 'VNPAY', 'PENDING', 'VNPAY-DEMO-0001');
SET @tid = LAST_INSERT_ID();

-- (giả lập callback thanh toán thành công từ cổng VNPAY)
UPDATE transactions SET status = 'SUCCESS' WHERE id = @tid;
UPDATE bookings     SET status = 'CONFIRMED' WHERE id = @bid;

INSERT INTO notifications (user_id, title, message, type)
VALUES (@user, 'Dat cho thanh cong',
        CONCAT('Booking #', @bid, ' da duoc xac nhan. Ma QR: QR-DEMO-001'), 'booking');

-- ------------------------------------------------------------
-- BƯỚC 6. NGÀY SỬ DỤNG: QUÉT QR CHECK-IN -> CHECK-OUT -> HOÀN TẤT
-- ------------------------------------------------------------
UPDATE bookings
   SET status = 'CHECKED_IN', checkin_at = @start + INTERVAL 5 MINUTE
 WHERE qr_code_hash = 'QR-DEMO-001';

UPDATE bookings
   SET status = 'COMPLETED', checkout_at = @end
 WHERE qr_code_hash = 'QR-DEMO-001';

-- ------------------------------------------------------------
-- BƯỚC 7. SAU KHI DÙNG: ĐÁNH GIÁ (khiếu nại là tùy chọn)
-- ------------------------------------------------------------
INSERT INTO reviews (user_id, target_type, target_id, rating, comment)
VALUES (@user, 'studio', @space, 5, 'Phong sach, den tot, thue may tien.');

-- INSERT INTO complaints (booking_id, user_id, content)
-- VALUES (@bid, @user, 'Lens bi tray.');

-- ------------------------------------------------------------
-- BƯỚC 8. XEM KẾT QUẢ
-- ------------------------------------------------------------
SELECT 'BUOC 8a: hoa don booking' AS step;
SELECT b.id, u.name AS khach, s.name AS phong, b.start_time, b.end_time,
       b.total_price, b.discount_amount, p.code AS ma_giam, b.status,
       b.checkin_at, b.checkout_at
FROM bookings b
JOIN users u  ON u.id = b.user_id
JOIN spaces s ON s.id = b.space_id
LEFT JOIN promotions p ON p.id = b.promotion_id
WHERE b.id = @bid;

SELECT 'BUOC 8b: thiet bi da thue' AS step;
SELECT r.name, br.quantity, r.rental_price
FROM booking_resources br JOIN resources r ON r.id = br.resource_id
WHERE br.booking_id = @bid;

SELECT 'BUOC 8c: thanh toan' AS step;
SELECT id, amount, method, status, external_ref FROM transactions WHERE booking_id = @bid;

SELECT 'BUOC 8d: lich cua Studio Mini 1 ngay 26/09 (sau khi COMPLETED, khung gio duoc nha ra)' AS step;
SELECT id, start_time, end_time, status FROM bookings
WHERE space_id = @space AND DATE(start_time) = '2026-09-26';

-- ------------------------------------------------------------
-- DỌN DẸP (bỏ comment nếu muốn chạy lại demo từ đầu)
-- ------------------------------------------------------------
-- DELETE FROM reviews      WHERE user_id = 8 AND target_type = 'studio' AND target_id = 1;
-- DELETE FROM notifications WHERE message LIKE '%QR-DEMO-001%';
-- DELETE FROM bookings     WHERE qr_code_hash = 'QR-DEMO-001';   -- cascade xóa booking_resources; transactions.booking_id -> NULL
-- DELETE FROM transactions WHERE external_ref = 'VNPAY-DEMO-0001';
-- UPDATE promotions SET used_count = 2 WHERE code = 'WELCOME10';  -- vì DELETE booking không tự giảm used_count
