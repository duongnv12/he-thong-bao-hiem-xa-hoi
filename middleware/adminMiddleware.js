const isAdmin = (req, res, next) => {
    // protectRoute đã đảm bảo req.session.user tồn tại
    if (req.session.user && req.session.user.is_admin) {
        next(); // Người dùng là admin, cho phép truy cập
    } else {
        // Không phải admin, chuyển hướng hoặc trả về lỗi
        res.status(403).render('error', { title: 'Không có quyền truy cập', message: 'Bạn không có quyền truy cập vào trang này.' });
    }
};

module.exports = {
    isAdmin
};