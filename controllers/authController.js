const User = require('../models/user');

const authController = {
    // Hiển thị form đăng ký
    showRegisterForm: (req, res) => {
        res.render('auth/register', { title: 'Đăng ký' });
    },

    // Xử lý logic đăng ký
    register: async (req, res) => {
        const { username, email, password, confirmPassword } = req.body;

        // Kiểm tra các trường dữ liệu
        if (!username || !email || !password || !confirmPassword) {
            return res.render('auth/register', { title: 'Đăng ký', error: 'Vui lòng điền đầy đủ thông tin.' });
        }
        if (password !== confirmPassword) {
            return res.render('auth/register', { title: 'Đăng ký', error: 'Mật khẩu xác nhận không khớp.' });
        }

        try {
            // Kiểm tra trùng username hoặc email
            let user = await User.findByUsername(username);
            if (user) {
                return res.render('auth/register', { title: 'Đăng ký', error: 'Tên người dùng đã tồn tại.' });
            }
            user = await User.findByEmail(email);
            if (user) {
                return res.render('auth/register', { title: 'Đăng ký', error: 'Email đã được sử dụng.' });
            }

            // Tạo người dùng mới
            await User.create(username, email, password);
            res.redirect('/login?message=Đăng ký thành công! Vui lòng đăng nhập.');
        } catch (error) {
            console.error('Lỗi khi đăng ký:', error);
            res.render('auth/register', { title: 'Đăng ký', error: 'Có lỗi xảy ra trong quá trình đăng ký.' });
        }
    },

    // Hiển thị form đăng nhập
    showLoginForm: (req, res) => {
        const message = req.query.message || '';
        res.render('auth/login', { title: 'Đăng nhập', message: message });
    },

    // Xử lý logic đăng nhập
    login: async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.render('auth/login', { title: 'Đăng nhập', error: 'Vui lòng nhập tên người dùng và mật khẩu.' });
        }

        try {
            const user = await User.findByUsername(username);
            if (!user) {
                return res.render('auth/login', { title: 'Đăng nhập', error: 'Tên người dùng hoặc mật khẩu không đúng.' });
            }

            const isMatch = await User.comparePassword(password, user.password);
            if (!isMatch) {
                return res.render('auth/login', { title: 'Đăng nhập', error: 'Tên người dùng hoặc mật khẩu không đúng.' });
            }

            // Đăng nhập thành công: Lưu thông tin người dùng vào session
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                is_admin: user.is_admin // Thêm trường is_admin vào session
                // Không lưu mật khẩu hoặc các thông tin nhạy cảm khác vào session
            };
            res.redirect('/dashboard');
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            res.render('auth/login', { title: 'Đăng nhập', error: 'Có lỗi xảy ra trong quá trình đăng nhập.' });
        }
    },

    // Xử lý đăng xuất
    logout: (req, res) => {
        req.session.destroy(err => { // Hủy session
            if (err) {
                console.error('Lỗi khi đăng xuất:', err);
                return res.redirect('/dashboard'); // Hoặc hiển thị lỗi
            }
            res.clearCookie('connect.sid'); // Xóa cookie session
            res.redirect('/?message=Bạn đã đăng xuất thành công.');
        });
    }
};

module.exports = authController;