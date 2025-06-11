const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route hiển thị form đăng ký
router.get('/register', authController.showRegisterForm);

// Route xử lý đăng ký
router.post('/register', authController.register);

// Route hiển thị form đăng nhập
router.get('/login', authController.showLoginForm);

// Route xử lý đăng nhập
router.post('/login', authController.login);

// Route đăng xuất
router.get('/logout', authController.logout);

module.exports = router;