require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình EJS làm template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình Express để phục vụ các file tĩnh từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để parse body của request (ví dụ: dữ liệu từ form)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Định nghĩa route cơ bản
app.get('/', (req, res) => {
    res.render('index', { title: 'Hệ thống tính phí bảo hiểm xã hội' });
});

// Lắng nghe cổng
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});