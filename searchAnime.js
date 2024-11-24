const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Googleにアクセス
        await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });

        // スクリーンショットを取得
        await page.screenshot({ path: path.join(__dirname, 'google_screenshot1.png') });
        
        // 検索ボックスが表示されるのを待つ
        await page.waitForSelector('textarea[name="q"]', { timeout: 30000 });

        // 検索ボックスに「アニメ」を入力
        await page.fill('textarea[name="q"]', 'アニメ');
        await page.keyboard.press('Enter');

        // 検索結果が表示されるのを待つ
        await page.waitForSelector('h3');

        // スクリーンショットを取得
        await page.screenshot({ path: path.join(__dirname, 'google_screenshot2.png') });

        // 検索結果を取得
        const results = await page.$$eval('h3', elements => elements.map(el => el.innerText));

        
        console.log('検索結果:', results);
    } catch (error) {
        console.error('エラーが発生しました:', error);
    } finally {
        await browser.close();
    }
})();
