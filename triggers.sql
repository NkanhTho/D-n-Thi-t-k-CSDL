-- ============================================================
-- TRIGGERS — CHẠY CUỐI CÙNG, sau TẤT CẢ các file schema.
-- Gồm: chống trùng lịch booking, chặn booking khi space đang bảo trì,
--       chặn trùng lịch resource, đồng bộ workshop.registered_count.
-- Lưu ý: trigger promotion dùng bảng promotions, xuất hiện ở nguoi3.sql.
-- Vì vậy phải chạy sau khi service_packages, promotions, bookings và workshops
-- đã được tạo xong.
-- ============================================================

DELIMITER $$

-- ============================================================
-- 1. CHỐNG TRÙNG LỊCH BOOKING (BEFORE INSERT)
--    - Space đã có booking PENDING/CONFIRMED/CHECKED_IN trùng giờ → chặn
--    - Space đang bảo trì (planned/in_progress) trùng giờ → chặn
-- ============================================================
DROP TRIGGER IF EXISTS trg_bookings_overlap_bi $$
CREATE TRIGGER trg_bookings_overlap_bi
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
  DECLARE v_count INT DEFAULT 0;

  IF NEW.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN') THEN
    -- 1a. Check trùng booking khác
    SELECT COUNT(*) INTO v_count
    FROM bookings
    WHERE space_id = NEW.space_id
      AND status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
      AND NEW.start_time < end_time
      AND NEW.end_time   > start_time;

    IF v_count > 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Space đã có booking trùng khung giờ';
    END IF;

    -- 1b. Check maintenance
    SELECT COUNT(*) INTO v_count
    FROM maintenance_schedules
    WHERE target_type = 'space'
      AND target_id   = NEW.space_id
      AND status IN ('planned', 'in_progress')
      AND NEW.start_time < scheduled_end
      AND NEW.end_time   > scheduled_start;

    IF v_count > 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Space đang bảo trì trong khung giờ này';
    END IF;
  END IF;
END $$

-- ============================================================
-- 2. CHỐNG TRÙNG LỊCH BOOKING (BEFORE UPDATE)
--    Chỉ check khi status/thời gian/space thay đổi.
-- ============================================================
DROP TRIGGER IF EXISTS trg_bookings_overlap_bu $$
CREATE TRIGGER trg_bookings_overlap_bu
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
  DECLARE v_count INT DEFAULT 0;

  IF NEW.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
     AND (OLD.status    <> NEW.status
       OR OLD.space_id  <> NEW.space_id
       OR OLD.start_time<> NEW.start_time
       OR OLD.end_time  <> NEW.end_time)
  THEN
    SELECT COUNT(*) INTO v_count
    FROM bookings
    WHERE space_id = NEW.space_id
      AND id <> NEW.id
      AND status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
      AND NEW.start_time < end_time
      AND NEW.end_time   > start_time;

    IF v_count > 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Space đã có booking trùng khung giờ';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM maintenance_schedules
    WHERE target_type = 'space'
      AND target_id   = NEW.space_id
      AND status IN ('planned', 'in_progress')
      AND NEW.start_time < scheduled_end
      AND NEW.end_time   > scheduled_start;

    IF v_count > 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Space đang bảo trì trong khung giờ này';
    END IF;
  END IF;
END $$

-- ============================================================
-- 3. CHỐNG TRÙNG LỊCH RESOURCE KHI THÊM VÀO BOOKING
-- ============================================================
DROP TRIGGER IF EXISTS trg_booking_resources_overlap_bi $$
CREATE TRIGGER trg_booking_resources_overlap_bi
BEFORE INSERT ON booking_resources
FOR EACH ROW
BEGIN
  DECLARE v_start DATETIME;
  DECLARE v_end   DATETIME;
  DECLARE v_count INT DEFAULT 0;

  SELECT start_time, end_time INTO v_start, v_end
  FROM bookings WHERE id = NEW.booking_id;

  IF v_start IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking không tồn tại';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM booking_resources br
  JOIN bookings b ON b.id = br.booking_id
  WHERE br.resource_id = NEW.resource_id
    AND br.booking_id <> NEW.booking_id
    AND b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
    AND v_start < b.end_time
    AND v_end   > b.start_time;

  IF v_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Resource đã được đặt trùng khung giờ';
  END IF;

  -- Check resource đang bảo trì
  SELECT COUNT(*) INTO v_count
  FROM maintenance_schedules
  WHERE target_type = 'resource'
    AND target_id   = NEW.resource_id
    AND status IN ('planned', 'in_progress')
    AND v_start < scheduled_end
    AND v_end   > scheduled_start;

  IF v_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Resource đang bảo trì';
  END IF;
END $$

-- ============================================================
-- 4. ĐỒNG BỘ workshops.registered_count
-- ============================================================

-- 4a. Kiểm tra capacity + chặn đăng ký khi đã đủ chỗ
DROP TRIGGER IF EXISTS trg_workshop_reg_capacity $$
CREATE TRIGGER trg_workshop_reg_capacity
BEFORE INSERT ON workshop_registrations
FOR EACH ROW
BEGIN
  DECLARE v_count INT;
  DECLARE v_cap   INT;
  DECLARE v_ws_date DATETIME;

  SELECT registered_count, capacity, date
    INTO v_count, v_cap, v_ws_date
  FROM workshops WHERE id = NEW.workshop_id;

  IF v_count >= v_cap THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Workshop đã đủ chỗ';
  END IF;

  IF v_ws_date < NOW() THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Workshop đã diễn ra';
  END IF;
END $$

-- 4b. Tăng registered_count khi thêm đăng ký mới
DROP TRIGGER IF EXISTS trg_workshop_reg_ai $$
CREATE TRIGGER trg_workshop_reg_ai
AFTER INSERT ON workshop_registrations
FOR EACH ROW
BEGIN
  UPDATE workshops
     SET registered_count = registered_count + 1
   WHERE id = NEW.workshop_id;
END $$

-- 4c. Giảm registered_count khi xóa
DROP TRIGGER IF EXISTS trg_workshop_reg_ad $$
CREATE TRIGGER trg_workshop_reg_ad
AFTER DELETE ON workshop_registrations
FOR EACH ROW
BEGIN
  UPDATE workshops
     SET registered_count = GREATEST(registered_count - 1, 0)
   WHERE id = OLD.workshop_id;
END $$

-- 4d. Giảm khi user cancel (UPDATE status → CANCELLED)
DROP TRIGGER IF EXISTS trg_workshop_reg_au $$
CREATE TRIGGER trg_workshop_reg_au
AFTER UPDATE ON workshop_registrations
FOR EACH ROW
BEGIN
  IF OLD.status <> 'CANCELLED' AND NEW.status = 'CANCELLED' THEN
    UPDATE workshops
       SET registered_count = GREATEST(registered_count - 1, 0)
     WHERE id = NEW.workshop_id;
  ELSEIF OLD.status = 'CANCELLED' AND NEW.status <> 'CANCELLED' THEN
    UPDATE workshops
       SET registered_count = registered_count + 1
     WHERE id = NEW.workshop_id;
  END IF;
END $$

-- ============================================================
-- 5. TỰ ĐỘNG CẬP NHẬT used_count CỦA PROMOTION KHI BOOKING DÙNG MÃ
-- ============================================================
DROP TRIGGER IF EXISTS trg_bookings_promo_ai $$
CREATE TRIGGER trg_bookings_promo_ai
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
  IF NEW.promotion_id IS NOT NULL THEN
    UPDATE promotions
       SET used_count = used_count + 1
     WHERE id = NEW.promotion_id;
  END IF;
END $$

DROP TRIGGER IF EXISTS trg_bookings_promo_au $$
CREATE TRIGGER trg_bookings_promo_au
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF OLD.promotion_id IS NULL AND NEW.promotion_id IS NOT NULL THEN
    UPDATE promotions SET used_count = used_count + 1 WHERE id = NEW.promotion_id;
  ELSEIF OLD.promotion_id IS NOT NULL AND NEW.promotion_id IS NULL THEN
    UPDATE promotions SET used_count = GREATEST(used_count - 1, 0) WHERE id = OLD.promotion_id;
  ELSEIF OLD.promotion_id IS NOT NULL AND NEW.promotion_id IS NOT NULL
         AND OLD.promotion_id <> NEW.promotion_id THEN
    UPDATE promotions SET used_count = GREATEST(used_count - 1, 0) WHERE id = OLD.promotion_id;
    UPDATE promotions SET used_count = used_count + 1           WHERE id = NEW.promotion_id;
  END IF;
END $$

DELIMITER ;

-- ============================================================
-- KIỂM TRA SAU KHI CHẠY
-- ============================================================
-- SHOW TRIGGERS;
--   Phải có: trg_bookings_overlap_bi, trg_bookings_overlap_bu,
--            trg_booking_resources_overlap_bi,
--            trg_workshop_reg_capacity, trg_workshop_reg_ai,
--            trg_workshop_reg_ad, trg_workshop_reg_au,
--            trg_bookings_promo_ai, trg_bookings_promo_au
--
-- TEST CHỐNG TRÙNG LỊCH:
--   INSERT INTO bookings (user_id, space_id, start_time, end_time, total_price)
--   VALUES (2, 1, '2025-01-15 09:00:00', '2025-01-15 11:00:00', 100000);
--   -- chạy lại lệnh trên với khung giờ 10:00-12:00 → phải báo lỗi
--
-- TEST WORKSHOP CAPACITY:
--   INSERT INTO workshop_registrations (workshop_id, user_id) VALUES (1, 99);
--   -- nếu workshop đầy → lỗi