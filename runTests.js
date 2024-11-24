const { chromium, webkit, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

const devicesList = [
    { name: 'MacOS Safari', browserType: webkit, options: {} },
    { name: 'iPhone 12', browserType: webkit, options: devices['iPhone 12'] },
    { name: 'Pixel 2', browserType: chromium, options: devices['Pixel 2'] },
];

(async () => {
    // screen_shotディレクトリが存在しない場合は作成する
    const screenshotDir = path.join(__dirname, 'screen_shot');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
  
    for (const device of devicesList) {
        console.log(`Running tests on ${device.name}`);

        const browser = await device.browserType.launch();
        const context = await browser.newContext({
            ...device.options,
            recordVideo: {
                dir: 'screen_shot', // ビデオファイルを保存するディレクトリ
                size: { width: 1280, height: 720 }, // ビデオのサイズ
            },
        });
        const page = await context.newPage();

        try {
            // ここに共通のテスト処理を追加
            await page.goto('https://www.google.jp', { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('textarea[name="q"]', { timeout: 30000 });
            await page.fill('textarea[name="q"]', 'アニメ');
            await page.screenshot({ path: `screen_shot/${device.name.replace(' ', '_')}_screenshot.png` });
            await page.keyboard.press('Enter');
            await page.waitForSelector('h3');
            const results = await page.$$eval('h3', elements => elements.map(el => el.innerText));
            console.log('検索結果:', results);
        } catch (error) {
            console.error('エラーが発生しました:', error);
        } finally {
            await context.close();
            await browser.close();
        }
    }
})();
