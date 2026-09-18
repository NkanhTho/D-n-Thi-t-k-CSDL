-- ============================================================
-- NGƯỜI 1 — USERS (tài khoản, xác thực, phân quyền)
-- Chạy ĐẦU TIÊN. Mọi bảng khác đều FK tới users.id.
-- ============================================================

CREATE DATABASE IF NOT EXISTS film_photo_booking_platform;
USE film_photo_booking_platform;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('photographer','provider','expert','admin') NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Các cột mở rộng cho Provider/Expert
ALTER TABLE users ADD COLUMN business_name VARCHAR(150) NULL;
ALTER TABLE users ADD COLUMN address       VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN description   TEXT NULL;

-- CHECK cơ bản cho email format
-- Nếu DB đã có dữ liệu cũ không hợp lệ, cần cleanup trước khi thêm constraint.
ALTER TABLE users ADD CONSTRAINT chk_users_email_format
  CHECK (email LIKE '%_@_%._%');

CREATE INDEX idx_users_role ON users (role);