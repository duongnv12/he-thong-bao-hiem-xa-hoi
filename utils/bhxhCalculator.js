// utils/bhxhCalculator.js
const MIN_LUONG_CO_SO = 1800000; // Ví dụ
const TY_LE_BHXH = 0.08;
const TY_LE_BHYT = 0.015;
const TY_LE_BHTN = 0.01;

function calculateInsuranceFee(declaredSalary, regionMinSalary) {
    let appliedSalary = declaredSalary;

    // Quy tắc: Nếu lương khai báo < mức lương tối thiểu vùng, lấy mức tối thiểu vùng
    if (declaredSalary < regionMinSalary) {
        appliedSalary = regionMinSalary;
    }

    // Quy tắc: Mức trần lương đóng BHXH (20 lần lương cơ sở)
    const maxInsuranceSalary = 20 * MIN_LUONG_CO_SO;
    if (appliedSalary > maxInsuranceSalary) {
        appliedSalary = maxInsuranceSalary;
    }

    const bhxhFee = appliedSalary * TY_LE_BHXH;
    const bhytFee = appliedSalary * TY_LE_BHYT;
    const bhtnFee = appliedSalary * TY_LE_BHTN;
    const totalFee = bhxhFee + bhytFee + bhtnFee;

    return {
        appliedSalary,
        bhxhFee: Math.round(bhxhFee), // Làm tròn để tránh số thập phân
        bhytFee: Math.round(bhytFee),
        bhtnFee: Math.round(bhtnFee),
        totalFee: Math.round(totalFee)
    };
}

module.exports = {
    calculateInsuranceFee
};