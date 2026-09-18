-- ============================================================
-- NGƯỜI 5 — CỘNG ĐỒNG & WORKSHOP
-- Chạy SAU nguoi1.sql.
-- BẢNG `posts` PHẢI tồn tại trước khi chạy nguoi3.sql (post_categories FK).
-- ============================================================

-- 1. Đánh giá / xếp hạng (polymorphic target — không FK thật)
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  target_type VARCHAR(50) NOT NULL,   -- 'studio' | 'service' | 'workshop'
  target_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_reviews_target ON reviews (target_type, target_id);
CREATE INDEX idx_reviews_user   ON reviews (user_id, created_at);

-- 2. Bộ sưu tập ảnh cá nhân
CREATE TABLE IF NOT EXISTS photo_collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  collection_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES photo_collections(id) ON DELETE CASCADE
);
CREATE INDEX idx_photos_collection ON photos (collection_id, uploaded_at);

-- 3. Bài viết / hướng dẫn cộng đồng
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('article', 'guide') DEFAULT 'article',
  tags VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_posts_author ON posts (author_id, created_at);
CREATE INDEX idx_posts_type   ON posts (type, created_at);

-- 4. Workshop
CREATE TABLE IF NOT EXISTS workshops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizer_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATETIME NOT NULL,
  location VARCHAR(255),
  capacity INT NOT NULL,
  registered_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_workshops_capacity   CHECK (capacity > 0),
  CONSTRAINT chk_workshops_registered CHECK (registered_count >= 0),
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_workshops_date ON workshops (date);

-- 5. Đăng ký workshop
-- registered_count được đồng bộ bằng trigger trong triggers.sql
CREATE TABLE IF NOT EXISTS workshop_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workshop_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('PENDING','PAID','CANCELLED') DEFAULT 'PENDING',
  payment_id INT NULL,   -- FK tới transactions(id) được thêm ở nguoi3.sql sau
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_registration (workshop_id, user_id),
  FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE
);
CREATE INDEX idx_wr_user_status ON workshop_registrations (user_id, status);