const UserProfile = require('../models/userProfile');
const Payment = require('../models/payment');
const RegionMinWage = require('../models/regionMinWage'); // Thêm dòng này

// Tỷ lệ đóng bảo hiểm xã hội (Ví dụ, cần cập nhật theo quy định hiện hành của VN)
// Tham khảo: https://thuvienphapluat.vn/hoi-dap-phap-luat/635676B-hd-ty-le-dong-bao-hiem-xa-hoi-nam-2024-cua-nguoi-lao-dong-va-doanh-nghiep.html
// Giả định: Người lao động đóng 8% BHXH, 1.5% BHYT, 1% BHTN = 10.5%
// Mức lương tối đa đóng BHXH: 20 lần mức lương cơ sở (hiện tại 1.8tr VND) = 36 triệu VND
const BHXH_TY_LE_NGUOI_LAO_DONG = parseFloat(process.env.BHXH_TY_LE_NGUOI_LAO_DONG || 0.08);
const BHYT_TY_LE_NGUOI_LAO_DONG = parseFloat(process.env.BHYT_TY_LE_NGUOI_LAO_DONG || 0.015);
const BHTN_TY_LE_NGUOI_LAO_DONG = parseFloat(process.env.BHTN_TY_LE_NGUOI_LAO_DONG || 0.01);
const TONG_TY_LE_NGUOI_LAO_DONG = BHXH_TY_LE_NGUOI_LAO_DONG + BHYT_TY_LE_NGUOI_LAO_DONG + BHTN_TY_LE_NGUOI_LAO_DONG;

const LUONG_CO_SO_TOI_THIEU = parseFloat(process.env.LUONG_CO_SO_TOI_THIEU || 1800000);
const LUONG_TOI_DA_DONG_BHXH_HE_SO = parseFloat(process.env.LUONG_TOI_DA_DONG_BHXH_HE_SO || 20);
const LUONG_TOI_DA_DONG_BHXH = LUONG_CO_SO_TOI_THIEU * LUONG_TOI_DA_DONG_BHXH_HE_SO;

const profileController = {
    // Hiển thị form khai báo thông tin hoặc thông tin đã khai báo
    showProfileForm: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const userProfile = await UserProfile.findByUserId(userId);
            const regions = await RegionMinWage.findAll(); // Lấy danh sách vùng

            res.render('profile/declare', {
                title: 'Khai báo thông tin cá nhân',
                user: req.session.user,
                profile: userProfile || null,
                regions: regions, // Truyền danh sách vùng
                calculatedFee: null,
                error: req.query.error,
                message: req.query.message
            });
        } catch (error) {
            console.error('Lỗi khi hiển thị form khai báo:', error);
            res.redirect('/dashboard?error=Không thể tải thông tin hồ sơ.');
        }
    },

    // Xử lý logic lưu/cập nhật thông tin khai báo
    saveProfile: async (req, res) => {
        const userId = req.session.user.id;
        // Thêm 'region' vào destructuring
        const { fullName, dateOfBirth, gender, identityCardNumber, socialInsuranceCode, address, occupation, declaredSalary, region } = req.body;

        // Validation cơ bản
        if (!fullName || !dateOfBirth || !gender || !declaredSalary || !region) { // Kiểm tra cả region
            return res.redirect('/profile/declare?error=Vui lòng điền đầy đủ các trường bắt buộc, bao gồm cả Vùng.');
        }

        const salary = parseFloat(declaredSalary);
        if (isNaN(salary) || salary < 0) { // Lương có thể là 0 đối với các trường hợp đặc biệt, nhưng thường là > 0
            return res.redirect('/profile/declare?error=Mức lương khai báo không hợp lệ.');
        }

        // Lấy mức lương tối thiểu vùng
        const minWageRegion = await RegionMinWage.findByRegionName(region);
        if (!minWageRegion) {
             return res.redirect('/profile/declare?error=Vùng được chọn không hợp lệ.');
        }
        const minSalaryForRegion = parseFloat(minWageRegion.min_monthly_wage);

        // Áp dụng mức lương tối thiểu vùng vào lương đóng BHXH
        // Mức lương dùng để đóng BHXH phải không thấp hơn mức lương tối thiểu vùng
        const actualDeclaredSalary = Math.max(salary, minSalaryForRegion);


        const profileData = {
            fullName,
            dateOfBirth,
            gender,
            identityCardNumber: identityCardNumber || null,
            socialInsuranceCode: socialInsuranceCode || null,
            address: address || null,
            occupation: occupation || null,
            declaredSalary: actualDeclaredSalary, // Sử dụng mức lương đã điều chỉnh
            region // Thêm region vào profileData
        };

        try {
            const existingProfile = await UserProfile.findByUserId(userId);
            if (existingProfile) {
                // Cập nhật hồ sơ
                await UserProfile.update(userId, profileData);
                res.redirect('/profile/declare?message=Cập nhật thông tin thành công!');
            } else {
                // Tạo hồ sơ mới
                await UserProfile.create(userId, profileData);
                res.redirect('/profile/declare?message=Khai báo thông tin thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi lưu/cập nhật hồ sơ:', error);
            if (error.code === '23505') {
                 let errorMessage = 'Thông tin CCCD/CMND hoặc Mã số BHXH đã tồn tại.';
                 if (error.detail.includes('identity_card_number')) {
                     errorMessage = 'Số CCCD/CMND đã tồn tại. Vui lòng kiểm tra lại.';
                 } else if (error.detail.includes('social_insurance_code')) {
                     errorMessage = 'Mã số BHXH đã tồn tại. Vui lòng kiểm tra lại.';
                 }
                 return res.redirect(`/profile/declare?error=${encodeURIComponent(errorMessage)}`);
            }
            res.redirect('/profile/declare?error=Có lỗi xảy ra khi lưu thông tin.');
        }
    },

    // Tính toán phí bảo hiểm và hiển thị kết quả
    calculateInsuranceFee: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const userProfile = await UserProfile.findByUserId(userId);
            const regions = await RegionMinWage.findAll(); // Lấy danh sách vùng cho form hiển thị

            if (!userProfile || !userProfile.declared_salary || !userProfile.region) { // Kiểm tra cả region
                return res.redirect('/profile/declare?error=Vui lòng khai báo đầy đủ thông tin cá nhân, mức lương và vùng trước khi tính phí.');
            }

            // Lấy mức lương tối thiểu vùng từ DB để tính toán chính xác
            const minWageRegion = await RegionMinWage.findByRegionName(userProfile.region);
            if (!minWageRegion) {
                 return res.redirect('/profile/declare?error=Vùng của hồ sơ không hợp lệ. Vui lòng cập nhật lại.');
            }
            const minSalaryForRegion = parseFloat(minWageRegion.min_monthly_wage);

            let salaryToCalculate = userProfile.declared_salary;

            // Áp dụng mức lương tối thiểu vùng: đảm bảo mức lương tính toán không thấp hơn mức tối thiểu vùng
            // Lưu ý: declared_salary đã được điều chỉnh khi lưu. Logic này chỉ để double-check hoặc nếu có thay đổi quy định
            salaryToCalculate = Math.max(salaryToCalculate, minSalaryForRegion);


            // Áp dụng mức trần lương đóng BHXH
            if (salaryToCalculate > LUONG_TOI_DA_DONG_BHXH) {
                salaryToCalculate = LUONG_TOI_DA_DONG_BHXH;
            }

            const bhxhFee = salaryToCalculate * BHXH_TY_LE_NGUOI_LAO_DONG;
            const bhytFee = salaryToCalculate * BHYT_TY_LE_NGUOI_LAO_DONG;
            const bhtnFee = salaryToCalculate * BHTN_TY_LE_NGUOI_LAO_DONG;
            const totalFee = salaryToCalculate * TONG_TY_LE_NGUOI_LAO_DONG;

            const calculatedFee = {
                declaredSalary: userProfile.declared_salary, // Lương người dùng đã khai báo
                minSalaryApplied: minSalaryForRegion, // Lương tối thiểu vùng áp dụng
                salaryAppliedForCalculation: salaryToCalculate, // Lương cuối cùng dùng để tính toán
                bhxhFee: bhxhFee.toFixed(0),
                bhytFee: bhytFee.toFixed(0),
                bhtnFee: bhtnFee.toFixed(0),
                totalFee: totalFee.toFixed(0),
                bhxhRate: (BHXH_TY_LE_NGUOI_LAO_DONG * 100).toFixed(2),
                bhytRate: (BHYT_TY_LE_NGUOI_LAO_DONG * 100).toFixed(2),
                bhtnRate: (BHTN_TY_LE_NGUOI_LAO_DONG * 100).toFixed(2),
                totalRate: (TONG_TY_LE_NGUOI_LAO_DONG * 100).toFixed(2)
            };

            res.render('profile/declare', {
                title: 'Kết quả tính phí bảo hiểm',
                user: req.session.user,
                profile: userProfile,
                regions: regions, // Truyền danh sách vùng
                calculatedFee: calculatedFee,
                error: null,
                message: null
            });

        } catch (error) {
            console.error('Lỗi khi tính phí bảo hiểm:', error);
            res.redirect('/profile/declare?error=Có lỗi xảy ra khi tính phí bảo hiểm.');
        }
    },

    // Hiển thị form thanh toán (hoặc xác nhận thanh toán)
    showPaymentForm: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const userProfile = await UserProfile.findByUserId(userId);

            if (!userProfile || !userProfile.declared_salary) {
                return res.redirect('/profile/declare?error=Vui lòng khai báo thông tin cá nhân và mức lương trước khi thanh toán.');
            }

            // Tính toán số tiền cần thanh toán tương tự như calculateInsuranceFee
            let salaryToCalculate = userProfile.declared_salary;
            if (salaryToCalculate > LUONG_TOI_DA_DONG_BHXH) {
                salaryToCalculate = LUONG_TOI_DA_DONG_BHXH;
            }
            const totalFee = salaryToCalculate * TONG_TY_LE_NGUOI_LAO_DONG;

            res.render('profile/payment', {
                title: 'Thanh toán phí bảo hiểm',
                user: req.session.user,
                totalFee: totalFee.toFixed(0), // Số tiền cần thanh toán
                error: req.query.error,
                message: req.query.message
            });

        } catch (error) {
            console.error('Lỗi khi hiển thị form thanh toán:', error);
            res.redirect('/dashboard?error=Không thể tải trang thanh toán.');
        }
    },

    // Xử lý logic thanh toán
    processPayment: async (req, res) => {
        const userId = req.session.user.id;
        const { amount, paymentMethod, transactionCode } = req.body; // 'amount' sẽ được lấy từ form, có thể ẩn
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.redirect('/profile/payment?error=Số tiền thanh toán không hợp lệ.');
        }
        if (!paymentMethod) {
            return res.redirect('/profile/payment?error=Vui lòng chọn phương thức thanh toán.');
        }

        try {
            // Ghi nhận thanh toán vào CSDL
            await Payment.create(userId, parsedAmount, paymentMethod, transactionCode || null);

            res.redirect('/profile/payment-history?message=Thanh toán thành công!');
        } catch (error) {
            console.error('Lỗi khi xử lý thanh toán:', error);
            // Kiểm tra lỗi UNIQUE constraint cho transaction_code
            if (error.code === '23505' && error.detail.includes('transaction_code')) {
                return res.redirect('/profile/payment?error=Mã giao dịch đã tồn tại. Vui lòng kiểm tra lại.');
            }
            res.redirect('/profile/payment?error=Có lỗi xảy ra khi xử lý thanh toán.');
        }
    },

    // Hiển thị lịch sử thanh toán của người dùng
    showPaymentHistory: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const payments = await Payment.findByUserId(userId);

            res.render('profile/paymentHistory', {
                title: 'Lịch sử thanh toán',
                user: req.session.user,
                payments: payments,
                message: req.query.message,
                error: req.query.error
            });
        } catch (error) {
            console.error('Lỗi khi tải lịch sử thanh toán:', error);
            res.redirect('/dashboard?error=Không thể tải lịch sử thanh toán.');
        }
    }
};

module.exports = profileController;