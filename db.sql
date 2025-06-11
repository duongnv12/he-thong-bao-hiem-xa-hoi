-- Active: 1749638719553@@127.0.0.1@5432@social_insurance_db@public
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

UPDATE users SET is_admin = TRUE WHERE username = 'admin';

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(10), -- 'Nam', 'Nữ', 'Khác'
    identity_card_number VARCHAR(20) UNIQUE, -- CCCD/CMND
    social_insurance_code VARCHAR(20) UNIQUE, -- Mã số BHXH
    address TEXT,
    occupation VARCHAR(255),
    declared_salary DECIMAL(18, 2) NOT NULL, -- Mức lương đóng BHXH (decimal để lưu số thập phân)
    declaration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Thêm một index cho user_id để tăng hiệu suất truy vấn
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Bảng thanh toán để lưu thông tin các giao dịch thanh toán bảo hiểm
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(18, 2) NOT NULL, -- Số tiền thanh toán
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50), -- Ví dụ: 'Bank Transfer', 'E-Wallet', 'Cash'
    status VARCHAR(20) DEFAULT 'success', -- Ví dụ: 'success', 'pending', 'failed'
    transaction_code VARCHAR(255) UNIQUE -- Mã giao dịch (nếu có từ cổng thanh toán)
);
-- Thêm một index cho user_id để tăng hiệu suất truy vấn
CREATE INDEX idx_payments_user_id ON payments(user_id);

ALTER TABLE user_profiles ADD COLUMN region VARCHAR(50); -- Ví dụ: 'Vùng I', 'Vùng II', 'Vùng III', 'Vùng IV'

CREATE TABLE regions_min_wage (
    id SERIAL PRIMARY KEY,
    region_name VARCHAR(50) UNIQUE NOT NULL,
    min_monthly_wage DECIMAL(18, 2) NOT NULL,
    effective_date DATE DEFAULT CURRENT_DATE
);

-- Chèn dữ liệu mức lương tối thiểu vùng năm 2025 (theo thông tin bạn cung cấp)
INSERT INTO regions_min_wage (region_name, min_monthly_wage) VALUES
('Vùng I', 4960000),
('Vùng II', 4410000),
('Vùng III', 3860000),
('Vùng IV', 3450000)
ON CONFLICT (region_name) DO UPDATE SET min_monthly_wage = EXCLUDED.min_monthly_wage;