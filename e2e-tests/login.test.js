// e2e-tests/login.test.js
const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const geckodriverPath = '/usr/local/bin/geckodriver'; // Hoặc đường dẫn thực tế của geckodriver
// ************************************************************************
const firefoxBinaryPath = '/usr/lib/firefox/firefox';
// ************************************************************************

let serviceBuilder = new firefox.ServiceBuilder(geckodriverPath);
let options = new firefox.Options();
options.setBinary(firefoxBinaryPath); // <-- Dòng mới quan trọng này!
// options.addArguments('--headless'); // BỎ COMMENT DÒNG NÀY ĐỂ DEBUG, ĐỂ LẠI COMMENT KHI ĐÃ CHẠY THÀNH CÔNG

describe('User Login Flow', () => {
    let driver;

    beforeEach(async () => {
        driver = await new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(options)
            .setFirefoxService(serviceBuilder)
            .build();
        
        await driver.get('http://localhost:3000/login'); // Đảm bảo URL này đúng
    }, 30000);

    afterEach(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    // Test Case: Đăng nhập thành công với thông tin hợp lệ
    test('should log in successfully with valid credentials', async () => {
        // ************************************************************************
        // CẬP NHẬT ID Ở ĐÂY!
        await driver.findElement(By.id('username')).sendKeys('user'); // ĐÃ CẬP NHẬT!
        // ************************************************************************
        
        await driver.findElement(By.id('password')).sendKeys('123456'); // Vui lòng kiểm tra lại ID này
        
        await driver.findElement(By.css('button[type="submit"]')).click(); // Vui lòng kiểm tra lại selector này

        // Chờ chuyển hướng hoặc element trên trang dashboard
        await driver.wait(until.urlContains('/dashboard'), 10000); // Hoặc một URL mà bạn mong đợi sau khi đăng nhập thành công
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toContain('/dashboard'); // Ví dụ, '/dashboard'

        // Optional: Xác minh một element trên trang dashboard
        const welcomeMessage = await driver.findElement(By.id('welcome-message')).getText(); // Kiểm tra ID này
        expect(welcomeMessage).toContain('Chào mừng, user!'); // Hoặc một thông điệp chào mừng khác
    }, 60000);

    // Test Case: Đăng nhập thất bại với thông tin không hợp lệ
    test('should show error message with invalid credentials', async () => {
        // ************************************************************************
        // CẬP NHẬT ID Ở ĐÂY!
        await driver.findElement(By.id('username')).sendKeys('invaliduser'); // ĐÃ CẬP NHẬT!
        // ************************************************************************

        await driver.findElement(By.id('password')).sendKeys('wrongpass');
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.elementLocated(By.id('error-message')), 5000);
        const errorMessage = await driver.findElement(By.id('error-message')).getText();
        expect(errorMessage).toContain('Tên người dùng hoặc mật khẩu không đúng.');
    }, 60000);
});