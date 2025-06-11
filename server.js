require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session'); // Thêm dòng này
const { protectRoute } = require('./middleware/authMiddleware'); // Thêm dòng này
const { isAdmin } = require('./middleware/adminMiddleware'); // Thêm dòng này
require('./models/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình EJS làm template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình Express để phục vụ các file tĩnh từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để parse body của request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Chuỗi bí mật để ký kết session ID cookie
    resave: false, // Không lưu lại session nếu không có thay đổi
    saveUninitialized: false, // Không lưu session mới chưa được khởi tạo
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 // Thời gian sống của cookie session: 1 ngày (ví dụ)
        // secure: true // Chỉ dùng với HTTPS, bật khi triển khai lên production
    }
}));

// Middleware để kiểm tra session và truyền thông tin người dùng vào locals (để EJS có thể truy cập)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // Gán thông tin user từ session vào res.locals
    next();
});

// Import routes

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes'); // Thêm dòng này
const adminRoutes = require('./routes/adminRoutes'); // Thêm dòng này


// Sử dụng routes
app.use('/', authRoutes);
app.use('/profile', profileRoutes); // Các route profile sẽ có tiền tố /profile
app.use('/admin', adminRoutes); // Các route admin sẽ có tiền tố /admin



// Định nghĩa route cơ bản
app.get('/', (req, res) => {
    res.render('index', { title: 'Hệ thống tính phí bảo hiểm xã hội', message: req.query.message });
});

// Route dashboard chung (có thể điều hướng sang dashboard admin nếu là admin)
app.get('/dashboard', protectRoute, (req, res) => {
    if (req.session.user.is_admin) {
        return res.redirect('/admin/dashboard'); // Nếu là admin, chuyển sang dashboard admin
    }
    res.render('dashboard', { title: 'Dashboard', user: req.session.user });
});

// Tạo template error.ejs (cho middleware isAdmin)
app.use((req, res, next) => {
    res.status(404).render('error', { title: 'Trang không tồn tại', message: 'Rất tiếc, trang bạn tìm kiếm không tồn tại.' });
});

// Middleware xử lý lỗi cuối cùng (error handling middleware)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { title: 'Lỗi máy chủ', message: 'Đã xảy ra lỗi nội bộ máy chủ. Vui lòng thử lại sau.' });
});

// Lắng nghe cổng
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});