// __tests__/bhxhCalculator.test.js
const { calculateInsuranceFee } = require('../utils/bhxhCalculator');

describe('calculateInsuranceFee', () => {
    // Test case 1: Lương khai báo nằm giữa min vùng và trần BHXH
    test('should calculate correctly for salary within limits', () => {
        const declaredSalary = 10_000_000; // 10,000,000 VNĐ
        const regionMinSalary = 4_960_000; // Vùng I
        const result = calculateInsuranceFee(declaredSalary, regionMinSalary);

        expect(result.appliedSalary).toBe(10_000_000);
        expect(result.bhxhFee).toBe(800_000); // 8%
        expect(result.bhytFee).toBe(150_000); // 1.5%
        expect(result.bhtnFee).toBe(100_000); // 1%
        expect(result.totalFee).toBe(1_050_000); // 10.5%
    });

    // Test case 2: Lương khai báo thấp hơn mức tối thiểu vùng
    test('should use region min salary if declared salary is lower', () => {
        const declaredSalary = 4_000_000;
        const regionMinSalary = 4_960_000; // Vùng I
        const result = calculateInsuranceFee(declaredSalary, regionMinSalary);

        expect(result.appliedSalary).toBe(4_960_000);
        // Các tính toán khác dựa trên 4_960_000
        expect(result.bhxhFee).toBe(Math.round(4_960_000 * 0.08));
    });

    // Test case 3: Lương khai báo cao hơn mức trần BHXH
    test('should cap salary at max insurance limit', () => {
        const declaredSalary = 50_000_000;
        const regionMinSalary = 4_960_000; // Vùng I
        const result = calculateInsuranceFee(declaredSalary, regionMinSalary);

        // Giả định LUONG_CO_SO_TOI_THIEU là 1,800,000 -> Trần là 36,000,000
        const expectedAppliedSalary = 36_000_000;
        expect(result.appliedSalary).toBe(expectedAppliedSalary);
        // Các tính toán khác dựa trên 36,000,000
        expect(result.bhxhFee).toBe(Math.round(expectedAppliedSalary * 0.08));
    });

    // Test case 4: Mức lương 0
    test('should handle zero declared salary', () => {
        const declaredSalary = 0;
        const regionMinSalary = 4_960_000;
        const result = calculateInsuranceFee(declaredSalary, regionMinSalary);

        expect(result.appliedSalary).toBe(4_960_000); // Vẫn áp dụng min vùng
    });
});