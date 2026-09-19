-- ============================================================
-- NGƯỜI 3 — GÓI DỊCH VỤ · DANH MỤC · GIAO DỊCH · KHIẾU NẠI · CHAT · KHUYẾN MÃI
-- Chạy SAU nguoi5.sql (cần bảng posts), SAU Database_Schema.sql
-- (cần spaces, resources, bookings).
-- Chạy TRƯỚC nguoi2.sql (nguoi2 cần service_packages cho FK).
-- Lưu ý: đây là thứ tự đúng để tránh lỗi foreign key khi bookings.package_id
-- tham chiếu tới service_packages(id).
-- ============================================================

-- ============================================================
-- PHẦN A — GÓI DỊCH VỤ
-- ============================================================

CREATE TABLE IF NOT EXISTS service_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_pkg_price CHECK (price >= 0),
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_pkg_provider ON service_packages (provider_id);

-- item_id là khóa polymorphic (trỏ tới spaces/resources/users) — không FK.
-- Backend phải validate item_id tồn tại đúng bảng theo item_type khi insert.
-- Dùng 'user' thay cho 'instructor' để khớp với mô hình users hiện có.
CREATE TABLE IF NOT EXISTS package_items (
  package_id INT NOT NULL,
  item_type ENUM('space', 'resource', 'user') NOT NULL,
  item_id INT NOT NULL,
  quantity INT DEFAULT 1,
  CONSTRAINT chk_pkg_items_qty CHECK (quantity > 0),
  PRIMARY KEY (package_id, item_type, item_id),
  FOREIGN KEY (package_id) REFERENCES service_packages(id) ON DELETE CASCADE
);
CREATE INDEX idx_pkg_items_lookup ON package_items (item_type, item_id);

-- ============================================================
-- PHẦN B — DANH MỤC
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  applies_to ENUM('space', 'resource', 'post', 'package') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_name_applies (name, applies_to)
);

CREATE TABLE IF NOT EXISTS space_categories (
  space_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (space_id, category_id),
  FOREIGN KEY (space_id)    REFERENCES spaces(id)     ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resource_categories (
  resource_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (resource_id, category_id),
  FOREIGN KEY (resource_id) REFERENCES resources(id)  ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Cần bảng posts (nguoi5.sql) đã tồn tại
CREATE TABLE IF NOT EXISTS post_categories (
  post_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (post_id, category_id),
  FOREIGN KEY (post_id)     REFERENCES posts(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ============================================================
-- PHẦN C — KHUYẾN MÃI (Provider cấu hình)
-- ============================================================

CREATE TABLE IF NOT EXISTS promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_id INT NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  discount_percent TINYINT NOT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  max_uses INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_promo_percent CHECK (discount_percent BETWEEN 1 AND 100),
  CONSTRAINT chk_promo_time    CHECK (end_at > start_at),
  CONSTRAINT chk_promo_used    CHECK (used_count >= 0),
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_promotions_provider_active ON promotions (provider_id, active, start_at, end_at);

-- Gắn khuyến mãi vào bookings
ALTER TABLE bookings ADD COLUMN promotion_id INT NULL;
ALTER TABLE bookings ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE bookings ADD CONSTRAINT fk_bookings_promotion
  FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL;

ALTER TABLE bookings ADD CONSTRAINT chk_bookings_discount
  CHECK (discount_amount >= 0);

-- ============================================================
-- PHẦN D — GIAO DỊCH THANH TOÁN
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method ENUM('VNPAY', 'MOMO', 'STRIPE', 'CASH') NOT NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  external_ref VARCHAR(255) NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_tx_amount CHECK (amount > 0),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);
CREATE INDEX idx_tx_booking    ON transactions (booking_id, status);
CREATE INDEX idx_tx_user_time  ON transactions (user_id, created_at);
CREATE UNIQUE INDEX uq_tx_external_ref ON transactions (method, external_ref);

-- FK cho workshop_registrations.payment_id (đã tạo bảng ở nguoi5.sql)
ALTER TABLE workshop_registrations ADD CONSTRAINT fk_wr_payment
  FOREIGN KEY (payment_id) REFERENCES transactions(id) ON DELETE SET NULL;

-- ============================================================
-- PHẦN E — KHIẾU NẠI
-- ============================================================

CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  status ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED') DEFAULT 'OPEN',
  resolution TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);
CREATE INDEX idx_complaints_status ON complaints (status, created_at);
CREATE INDEX idx_complaints_user   ON complaints (user_id);

-- ============================================================
-- PHẦN F — CHAT LOGS (AI Assistant)
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_chat_session   ON chat_logs (session_id, created_at);
CREATE INDEX idx_chat_user_time ON chat_logs (user_id, created_at);