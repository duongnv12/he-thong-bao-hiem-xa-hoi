const db = require('./db');

const UserProfile = {
    // Tìm hồ sơ theo user_id
    findByUserId: async (userId) => {
        const result = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
        return result.rows[0];
    },

    // Tạo mới hồ sơ người dùng
    create: async (userId, data) => {
        const { fullName, dateOfBirth, gender, identityCardNumber, socialInsuranceCode, address, occupation, declaredSalary, region } = data; // Thêm region
        const result = await db.query(
            `INSERT INTO user_profiles (user_id, full_name, date_of_birth, gender, identity_card_number, social_insurance_code, address, occupation, declared_salary, region)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, // Thêm $10
            [userId, fullName, dateOfBirth, gender, identityCardNumber, socialInsuranceCode, address, occupation, declaredSalary, region] // Thêm region
        );
        return result.rows[0];
    },

    // Cập nhật hồ sơ người dùng hiện có
    update: async (userId, data) => {
        const { fullName, dateOfBirth, gender, identityCardNumber, socialInsuranceCode, address, occupation, declaredSalary, region } = data; // Thêm region
        const result = await db.query(
            `UPDATE user_profiles SET
             full_name = $2, date_of_birth = $3, gender = $4, identity_card_number = $5, social_insurance_code = $6, address = $7, occupation = $8, declared_salary = $9, region = $10, declaration_date = CURRENT_TIMESTAMP
             WHERE user_id = $1 RETURNING *`, // Thêm region = $10
            [userId, fullName, dateOfBirth, gender, identityCardNumber, socialInsuranceCode, address, occupation, declaredSalary, region] // Thêm region
        );
        return result.rows[0];
    }
};

module.exports = UserProfile;