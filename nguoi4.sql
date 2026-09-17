-- ============================================================
-- NGƯỜI 4 — FAVORITES & NOTIFICATIONS
-- Chạy sau nguoi1.sql và Database_Schema.sql.
-- Có thể chạy sau nguoi2.sql nếu muốn, nhưng không được chạy trước khi users/spaces đã tồn tại.
-- ============================================================

-- 1. Phòng yêu thích
CREATE TABLE IF NOT EXISTS favorites (
  user_id INT NOT NULL,
  space_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, space_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
);

-- 2. Thông báo
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking', 'payment', 'complaint', 'review', 'workshop', 'maintenance', 'system') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read, created_at);