const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protectRoute } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware'); // Thêm dòng này

// Áp dụng protectRoute và isAdmin cho tất cả các route trong adminRoutes
router.use(protectRoute);
router.use(isAdmin);

// Trang dashboard quản trị
router.get('/dashboard', adminController.showAdminDashboard);

// Danh sách người tham gia
router.get('/users', adminController.listUsers);

// Báo cáo thanh toán
router.get('/payments/report', adminController.generatePaymentReport);

// Cấu hình hệ thống
router.get('/config', adminController.showConfigForm);
router.post('/config', adminController.saveConfig);

module.exports = router;