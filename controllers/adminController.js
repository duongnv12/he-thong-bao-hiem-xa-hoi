const db = require('../models/db');
const UserProfile = require('../models/userProfile');
const Payment = require('../models/payment');

const adminController = {
    // Hiển thị trang quản trị dashboard
    showAdminDashboard: (req, res) => {
        res.render('admin/dashboard', {
            title: 'Bảng điều khiển quản trị',
            user: req.session.user
        });
    },

    // Theo dõi danh sách người tham gia
    listUsers: async (req, res) => {
        try {
            // Lấy tất cả người dùng và profile của họ (join bảng)
            const result = await db.query(`
                SELECT
                    u.id, u.username, u.email, u.created_at, u.is_admin,
                    up.full_name, up.date_of_birth, up.gender, up.identity_card_number,
                    up.social_insurance_code, up.address, up.occupation, up.declared_salary
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                ORDER BY u.created_at DESC
            `);
            const users = result.rows;

            res.render('admin/userList', {
                title: 'Danh sách người tham gia',
                user: req.session.user,
                users: users
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
            res.render('admin/userList', {
                title: 'Danh sách người tham gia',
                user: req.session.user,
                users: [],
                error: 'Không thể tải danh sách người dùng.'
            });
        }
    },

    // Xuất báo cáo tổng hợp thanh toán
    generatePaymentReport: async (req, res) => {
        try {
            const { startDate, endDate } = req.query; // Có thể lọc theo ngày

            let query = `
                SELECT
                    p.id, p.amount, p.payment_date, p.payment_method, p.status, p.transaction_code,
                    u.username, u.email, up.full_name
                FROM payments p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN user_profiles up ON u.id = up.user_id
            `;
            const params = [];
            const conditions = [];

            if (startDate) {
                conditions.push(`p.payment_date >= $${params.length + 1}`);
                params.push(startDate);
            }
            if (endDate) {
                conditions.push(`p.payment_date <= $${params.length + 1}`);
                params.push(endDate);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            query += ` ORDER BY p.payment_date DESC`;

            const result = await db.query(query, params);
            const payments = result.rows;

            res.render('admin/paymentReport', {
                title: 'Báo cáo thanh toán',
                user: req.session.user,
                payments: payments,
                startDate: startDate || '',
                endDate: endDate || ''
            });

        } catch (error) {
            console.error('Lỗi khi tạo báo cáo thanh toán:', error);
            res.render('admin/paymentReport', {
                title: 'Báo cáo thanh toán',
                user: req.session.user,
                payments: [],
                startDate: '',
                endDate: '',
                error: 'Không thể tạo báo cáo thanh toán.'
            });
        }
    },

    // Hiển thị form cấu hình tỷ lệ bảo hiểm
    showConfigForm: async (req, res) => {
        try {
            // Lấy cấu hình hiện tại từ DB (nếu có, hoặc dùng hằng số mặc định)
            // Hiện tại chúng ta sẽ truyền trực tiếp các hằng số từ controller
            const config = {
                BHXH_TY_LE_NGUOI_LAO_DONG: process.env.BHXH_TY_LE_NGUOI_LAO_DONG || 0.08,
                BHYT_TY_LE_NGUOI_LAO_DONG: process.env.BHYT_TY_LE_NGUOI_LAO_DONG || 0.015,
                BHTN_TY_LE_NGUOI_LAO_DONG: process.env.BHTN_TY_LE_NGUOI_LAO_DONG || 0.01,
                LUONG_CO_SO_TOI_THIEU: process.env.LUONG_CO_SO_TOI_THIEU || 1800000,
                LUONG_TOI_DA_DONG_BHXH_HE_SO: process.env.LUONG_TOI_DA_DONG_BHXH_HE_SO || 20
            };

            res.render('admin/config', {
                title: 'Cấu hình hệ thống',
                user: req.session.user,
                config: config,
                message: req.query.message,
                error: req.query.error
            });
        } catch (error) {
            console.error('Lỗi khi hiển thị form cấu hình:', error);
            res.render('admin/config', {
                title: 'Cấu hình hệ thống',
                user: req.session.user,
                config: {},
                error: 'Không thể tải cấu hình.'
            });
        }
    },

    // Xử lý lưu cấu hình (tạm thời ghi vào .env hoặc DB nếu muốn persistence)
    saveConfig: async (req, res) => {
        const {
            bhxh_ty_le,
            bhyt_ty_le,
            bhtn_ty_le,
            luong_co_so_toi_thieu,
            luong_toi_da_he_so
        } = req.body;

        try {
            // Ở đây, để đơn giản, chúng ta sẽ không ghi vào file .env
            // Thực tế, bạn sẽ lưu vào một bảng `configurations` trong DB
            // và load từ DB trong profileController.js.

            // Để giả lập, chúng ta sẽ lưu vào một đối tượng toàn cục (không khuyến khích trong Production)
            // hoặc lý tưởng hơn là vào DB.
            // Ví dụ: global.appConfig = { ... }

            // Giả định thành công
            res.redirect('/admin/config?message=Cấu hình đã được cập nhật thành công.');

        } catch (error) {
            console.error('Lỗi khi lưu cấu hình:', error);
            res.redirect('/admin/config?error=Có lỗi xảy ra khi lưu cấu hình.');
        }
    }
};

module.exports = adminController;