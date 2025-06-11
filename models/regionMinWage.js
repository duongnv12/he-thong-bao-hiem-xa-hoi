const db = require('./db');

const RegionMinWage = {
    // Lấy tất cả các mức lương tối thiểu vùng
    findAll: async () => {
        const result = await db.query('SELECT * FROM regions_min_wage ORDER BY region_name');
        return result.rows;
    },

    // Lấy mức lương tối thiểu theo tên vùng
    findByRegionName: async (regionName) => {
        const result = await db.query('SELECT * FROM regions_min_wage WHERE region_name = $1', [regionName]);
        return result.rows[0];
    }
};

module.exports = RegionMinWage;