-- ============================================================
-- DATABASE_SCHEMA — SPACES, RESOURCES, BOOKINGS, BOOKING_RESOURCES
-- Chạy SAU nguoi1.sql (cần bảng users).
-- Thứ tự lý tưởng: nguoi1.sql -> Database_Schema.sql -> nguoi5.sql
-- -> nguoi3.sql -> nguoi2.sql -> nguoi4.sql -> triggers.sql
-- ============================================================

-- 1. BẢNG QUẢN LÝ KHÔNG GIAN
CREATE TABLE IF NOT EXISTS spaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('DARKROOM', 'STUDIO') NOT NULL,
  description TEXT,
  capacity INT NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  operating_hours JSON,
  specifications JSON,
  status ENUM('AVAILABLE', 'MAINTENANCE', 'INACTIVE') DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_spaces_capacity CHECK (capacity > 0),
  CONSTRAINT chk_spaces_rate     CHECK (hourly_rate >= 0),
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_spaces_provider ON spaces (provider_id, status);
CREATE INDEX idx_spaces_type     ON spaces (type, status);

-- 2. BẢNG QUẢN LÝ THIẾT BỊ
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  space_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  category ENUM('CAMERA', 'LENS', 'ENLARGER', 'SCANNER', 'LIGHTING', 'CHEMICAL', 'PAPER') NOT NULL,
  serial_number VARCHAR(100),
  rental_price DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DAMAGED') DEFAULT 'AVAILABLE',
  CONSTRAINT chk_resources_price CHECK (rental_price >= 0),
  FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
);
CREATE INDEX idx_resources_space    ON resources (space_id, status);
CREATE INDEX idx_resources_category ON resources (category, status);

-- 3. BẢNG QUẢN LÝ ĐẶT CHỖ
-- LƯU Ý: space_id NOT NULL. Khi đặt trọn gói, app PHẢI chọn 1 space chính
-- trong gói làm bookings.space_id (các space khác của gói nằm ở booking_resources
-- nếu cần). Đây là design choice để giữ FK đơn giản.
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  space_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  qr_code_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_bookings_time  CHECK (end_time > start_time),
  CONSTRAINT chk_bookings_price CHECK (total_price >= 0),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
);
CREATE INDEX idx_bookings_space_time ON bookings (space_id, start_time, end_time, status);
CREATE INDEX idx_bookings_user       ON bookings (user_id, status, start_time);
-- QR code phải unique (cho phép NULL với booking chưa generate)
CREATE UNIQUE INDEX uq_bookings_qr ON bookings (qr_code_hash);

-- 4. BẢNG CHI TIẾT TÀI NGUYÊN ĐẶT CHỖ
CREATE TABLE IF NOT EXISTS booking_resources (
  booking_id INT NOT NULL,
  resource_id INT NOT NULL,
  quantity INT DEFAULT 1,
  CONSTRAINT chk_br_qty CHECK (quantity > 0),
  PRIMARY KEY (booking_id, resource_id),
  FOREIGN KEY (booking_id)  REFERENCES bookings(id)  ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);