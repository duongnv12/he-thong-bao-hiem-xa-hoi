const db = require('./db');

const Payment = {
    // Ghi nhận một thanh toán mới
    create: async (userId, amount, paymentMethod, transactionCode = null) => {
        const result = await db.query(
            `INSERT INTO payments (user_id, amount, payment_method, transaction_code)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, amount, paymentMethod, transactionCode]
        );
        return result.rows[0];
    },

    // Lấy tất cả các thanh toán của một người dùng
    findByUserId: async (userId) => {
        const result = await db.query(
            'SELECT * FROM payments WHERE user_id = $1 ORDER BY payment_date DESC',
            [userId]
        );
        return result.rows;
    },

    // Lấy một thanh toán theo ID
    findById: async (id) => {
        const result = await db.query('SELECT * FROM payments WHERE id = $1', [id]);
        return result.rows[0];
    }
};

module.exports = Payment;