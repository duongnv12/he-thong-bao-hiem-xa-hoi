const protectRoute = (req, res, next) => {
    if (req.session.user) {
        // Nếu người dùng đã đăng nhập, cho phép truy cập
        next();
    } else {
        // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập với thông báo lỗi
        res.redirect('/login?error=Bạn cần đăng nhập để truy cập trang này.');
    }
};

module.exports = {
    protectRoute
};