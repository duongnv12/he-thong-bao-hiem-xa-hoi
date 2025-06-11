# Hệ Thống Tính Phí Bảo Hiểm Xã Hội

## Giới thiệu

Đây là hệ thống web giúp người lao động khai báo thông tin cá nhân, tính toán phí bảo hiểm xã hội (BHXH), thực hiện thanh toán và quản lý lịch sử thanh toán. Ngoài ra, hệ thống còn cung cấp giao diện quản trị cho admin để theo dõi người dùng, xuất báo cáo thanh toán và cấu hình các tham số hệ thống.

---

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cài đặt & Khởi động](#cài-đặt--khởi-động)
- [Cấu hình hệ thống](#cấu-hình-hệ-thống)
- [Luồng hoạt động](#luồng-hoạt-động)
- [Chi tiết các module](#chi-tiết-các-module)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [Quản trị viên (Admin)](#quản-trị-viên-admin)
- [Kiểm thử & Báo cáo](#kiểm-thử--báo-cáo)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Liên hệ & Đóng góp](#liên-hệ--đóng-góp)

---

## Tính năng chính

- Đăng ký, đăng nhập, đăng xuất tài khoản người dùng.
- Khai báo thông tin cá nhân, mức lương, vùng lương tối thiểu.
- Tính toán phí bảo hiểm xã hội dựa trên mức lương khai báo và vùng.
- Thanh toán phí bảo hiểm với nhiều phương thức (chuyển khoản, ví điện tử, tiền mặt).
- Quản lý lịch sử thanh toán.
- Trang quản trị cho admin: xem danh sách người dùng, xuất báo cáo thanh toán, cấu hình hệ thống.
- Báo lỗi, thông báo thành công, xác thực truy cập và phân quyền.

---

## Cấu trúc thư mục

```
.
├── controllers/           # Controllers cho các luồng nghiệp vụ (user, admin, profile)
├── middleware/            # Middleware xác thực, phân quyền
├── models/                # Models thao tác với cơ sở dữ liệu (users, payments, profiles, regions)
├── public/                # Tài nguyên tĩnh (CSS, JS, ảnh)
├── routes/                # Định nghĩa các route cho user, admin, auth
├── views/                 # Giao diện EJS cho user và admin
├── tests/                 # Unit test (nếu có)
├── e2e-tests/             # End-to-end test (nếu có)
├── db.sql                 # Cấu trúc và dữ liệu mẫu cho database PostgreSQL
├── .env                   # Biến môi trường cấu hình hệ thống
├── package.json           # Thông tin và scripts của dự án Node.js
├── server.js              # File khởi động ứng dụng
└── README.md              # Tài liệu này
```

---

## Cài đặt & Khởi động

### 1. Yêu cầu

- Node.js >= 14.x
- PostgreSQL >= 12.x

### 2. Cài đặt

```sh
git clone <repo-url>
cd he-thong-bao-hiem-xa-hoi
npm install
```

### 3. Cấu hình

- Tạo file `.env` dựa trên mẫu dưới đây:

```env
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=your_db_name
SESSION_SECRET=your_secret_key

# Các tham số mặc định (có thể cấu hình qua giao diện admin)
BHXH_TY_LE_NGUOI_LAO_DONG=0.08
BHYT_TY_LE_NGUOI_LAO_DONG=0.015
BHTN_TY_LE_NGUOI_LAO_DONG=0.01
LUONG_CO_SO_TOI_THIEU=1800000
LUONG_TOI_DA_DONG_BHXH_HE_SO=20
```

- Khởi tạo database và import file [db.sql](db.sql).

### 4. Chạy ứng dụng

```sh
npm start
# hoặc
node server.js
```

Truy cập: http://localhost:3000

---

## Cấu hình hệ thống

- Các tham số tỷ lệ đóng BHXH, BHYT, BHTN, lương cơ sở tối thiểu, hệ số trần lương... có thể chỉnh sửa tại trang `/admin/config` (chỉ dành cho admin).
- Các thay đổi hiện tại chỉ có hiệu lực tạm thời (chưa lưu vào DB).

---

## Luồng hoạt động

1. **Người dùng đăng ký/đăng nhập**.
2. **Khai báo thông tin cá nhân** tại `/profile/declare`.
3. **Tính phí bảo hiểm** dựa trên lương khai báo và vùng.
4. **Thanh toán phí bảo hiểm** tại `/profile/payment`.
5. **Xem lịch sử thanh toán** tại `/profile/payment-history`.
6. **Admin** đăng nhập, truy cập dashboard quản trị, xem danh sách người dùng, xuất báo cáo thanh toán, cấu hình hệ thống.

---

## Chi tiết các module

### Controllers

- [`controllers/authController.js`](controllers/authController.js): Xử lý đăng ký, đăng nhập, đăng xuất.
- [`controllers/profileController.js`](controllers/profileController.js): Quản lý hồ sơ, tính phí, thanh toán, lịch sử.
- [`controllers/adminController.js`](controllers/adminController.js): Dashboard admin, danh sách user, báo cáo, cấu hình.

### Models

- [`models/user.js`](models/user.js): Người dùng, xác thực, mã hóa mật khẩu.
- [`models/userProfile.js`](models/userProfile.js): Hồ sơ cá nhân, khai báo thông tin.
- [`models/payment.js`](models/payment.js): Ghi nhận và truy vấn thanh toán.
- [`models/regionMinWage.js`](models/regionMinWage.js): Mức lương tối thiểu vùng.
- [`models/db.js`](models/db.js): Kết nối và truy vấn PostgreSQL.

### Middleware

- [`middleware/authMiddleware.js`](middleware/authMiddleware.js): Bảo vệ route, xác thực đăng nhập.
- [`middleware/adminMiddleware.js`](middleware/adminMiddleware.js): Phân quyền admin.

### Views

- [`views/`](views/): Giao diện EJS cho user và admin (login, register, dashboard, declare, payment, paymentHistory, admin dashboard, userList, paymentReport, config...).

### Routes

- [`routes/authRoutes.js`](routes/authRoutes.js): Đăng ký, đăng nhập, đăng xuất.
- [`routes/profileRoutes.js`](routes/profileRoutes.js): Khai báo, tính phí, thanh toán, lịch sử.
- [`routes/adminRoutes.js`](routes/adminRoutes.js): Dashboard, danh sách user, báo cáo, cấu hình.

---

## Hướng dẫn sử dụng

### Đăng ký & Đăng nhập

- Truy cập `/register` để tạo tài khoản mới.
- Truy cập `/login` để đăng nhập.

### Khai báo thông tin cá nhân

- Sau khi đăng nhập, vào `/profile/declare`.
- Nhập đầy đủ thông tin, chọn vùng, nhập mức lương khai báo.
- Hệ thống tự động điều chỉnh lương khai báo không thấp hơn mức tối thiểu vùng.

### Tính phí bảo hiểm

- Nhấn "Tính phí bảo hiểm" để xem chi tiết các khoản phí (BHXH, BHYT, BHTN) và tổng cộng.

### Thanh toán

- Vào `/profile/payment`, chọn phương thức thanh toán, nhập mã giao dịch (nếu có), xác nhận thanh toán.

### Lịch sử thanh toán

- Vào `/profile/payment-history` để xem các lần thanh toán đã thực hiện.

---

## Quản trị viên (Admin)

- Đăng nhập bằng tài khoản có quyền admin.
- Truy cập `/admin/dashboard` để vào trang quản trị.
- Xem danh sách người dùng tại `/admin/users`.
- Xuất báo cáo thanh toán tại `/admin/payments/report` (lọc theo ngày).
- Cấu hình hệ thống tại `/admin/config`.

---

## Kiểm thử & Báo cáo

- Đã có thư mục `tests/` và `e2e-tests/` để phát triển unit test và end-to-end test.
- Báo cáo coverage nằm trong thư mục `coverage/`.

---

## Công nghệ sử dụng

- **Node.js** + **Express.js**: Backend server.
- **PostgreSQL**: Cơ sở dữ liệu.
- **EJS**: Template engine cho giao diện.
- **express-session**: Quản lý session đăng nhập.
- **bcryptjs**: Mã hóa mật khẩu.
- **CSS**: Giao diện người dùng.
- **Mocha/Chai** (gợi ý): Kiểm thử.

---

## Liên hệ & Đóng góp

- Đóng góp code qua pull request.
- Báo lỗi hoặc góp ý qua Issues trên GitHub.

---

**© 2024 Hệ Thống Tính Phí Bảo Hiểm Xã Hội**