const db = require('./db');
const bcrypt = require('bcryptjs');

const User = {
    // Tìm người dùng theo username
    findByUsername: async (username) => {
        const result = await db.query('SELECT id, username, email, password, is_admin FROM users WHERE username = $1', [username]);
        return result.rows[0];
    },

    // Tìm người dùng theo email
    findByEmail: async (email) => {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    // Tạo người dùng mới
    create: async (username, email, password) => {
        const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu với salt factor 10
        const result = await db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );
        return result.rows[0];
    },

    // So sánh mật khẩu
    comparePassword: async (inputPassword, hashedPassword) => {
        return await bcrypt.compare(inputPassword, hashedPassword);
    }
};

module.exports = User;