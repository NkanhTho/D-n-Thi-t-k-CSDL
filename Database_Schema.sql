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
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. BẢNG QUẢN LÝ THIẾT BỊ
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    space_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category ENUM('CAMERA', 'LENS', 'ENLARGER', 'SCANNER', 'LIGHTING', 'CHEMICAL', 'PAPER') NOT NULL,
    serial_number VARCHAR(100),
    rental_price DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DAMAGED') DEFAULT 'AVAILABLE',
    FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
);

-- 3. BẢNG QUẢN LÝ ĐẶT CHỖ
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
);

-- 4. BẢNG CHI TIẾT TÀI NGUYÊN ĐẶT CHỖ
CREATE TABLE IF NOT EXISTS booking_resources (
    booking_id INT NOT NULL,
    resource_id INT NOT NULL,
    quantity INT DEFAULT 1,
    PRIMARY KEY (booking_id, resource_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 5. CHỈ MỤC TỐI ƯU HÓA TRUY VẤN
CREATE INDEX idx_bookings_space_time ON bookings (space_id, start_time, end_time, status);
CREATE INDEX idx_bookings_time_range ON bookings (start_time, end_time);