const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protectRoute } = require('../middleware/authMiddleware');

// Áp dụng middleware protectRoute cho tất cả các route trong profileRoutes
router.use(protectRoute);

// Route hiển thị form khai báo thông tin cá nhân
router.get('/declare', profileController.showProfileForm);

// Route xử lý lưu/cập nhật thông tin cá nhân
router.post('/save', profileController.saveProfile);

// Route xử lý tính toán phí bảo hiểm
router.get('/calculate', profileController.calculateInsuranceFee);

// Route hiển thị form thanh toán
router.get('/payment', profileController.showPaymentForm);

// Route xử lý thanh toán
router.post('/payment', profileController.processPayment);

// Route hiển thị lịch sử thanh toán
router.get('/payment-history', profileController.showPaymentHistory);


module.exports = router;