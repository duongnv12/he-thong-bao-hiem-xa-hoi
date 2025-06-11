const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Kiểm tra kết nối
pool.connect((err, client, done) => {
    if (err) {
        console.error('Database connection error:', err.stack);
        return;
    }
    console.log('Connected to PostgreSQL database!');
    client.release(); // Giải phóng client về pool
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool // Xuất cả pool nếu cần dùng cho transaction hoặc các tác vụ nâng cao
};