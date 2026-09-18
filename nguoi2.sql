-- ============================================================
-- NGƯỜI 2 — LỊCH BẢO TRÌ + ALTER BOOKINGS/RESOURCES
-- Chạy SAU nguoi3.sql (cần service_packages cho FK bookings.package_id).
-- Lưu ý: đây là thứ tự đúng trong schema thống nhất.
-- ============================================================

-- ============================================================
-- PHẦN 1 — LỊCH BẢO TRÌ
-- ============================================================

CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  target_type ENUM('space', 'resource') NOT NULL,
  target_id INT NOT NULL,
  scheduled_start DATETIME NOT NULL,
  scheduled_end DATETIME NOT NULL,
  reason VARCHAR(255),
  status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_maint_time CHECK (scheduled_end > scheduled_start),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_maint_target_time ON maintenance_schedules (target_type, target_id, scheduled_start, scheduled_end, status);

-- ============================================================
-- PHẦN 2 — LIÊN KẾT BOOKINGS VỚI SERVICE_PACKAGES
-- ============================================================

ALTER TABLE bookings ADD COLUMN package_id INT NULL AFTER space_id;

ALTER TABLE bookings ADD CONSTRAINT fk_bookings_package
  FOREIGN KEY (package_id) REFERENCES service_packages(id) ON DELETE SET NULL;

-- ============================================================
-- PHẦN 3 — CHECK-IN / CHECK-OUT
-- ============================================================

ALTER TABLE bookings ADD COLUMN checkin_at  DATETIME NULL AFTER qr_code_hash;
ALTER TABLE bookings ADD COLUMN checkout_at DATETIME NULL AFTER checkin_at;

ALTER TABLE bookings ADD CONSTRAINT chk_bookings_checkout_after_checkin
  CHECK (checkout_at IS NULL OR checkin_at IS NULL OR checkout_at >= checkin_at);

-- ============================================================
-- PHẦN 4 — TỒN KHO VẬT TƯ TIÊU HAO
-- ============================================================

ALTER TABLE resources ADD COLUMN stock_quantity INT NULL AFTER rental_price;
ALTER TABLE resources ADD COLUMN unit           VARCHAR(20) NULL AFTER stock_quantity;

ALTER TABLE resources ADD CONSTRAINT chk_resources_stock
  CHECK (stock_quantity IS NULL OR stock_quantity >= 0);