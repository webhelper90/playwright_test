const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    // screen_shotディレクトリが存在しない場合は作成する
    const screenshotDir = path.join(__dirname, 'screen_shot');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }

    const browser = await chromium.launch();
    const context = await browser.newContext({
        recordVideo: {
          dir: 'screen_shot/', // ビデオファイルを保存するディレクトリ
          size: { width: 1280, height: 720 }, // ビデオのサイズ
        },
    });
    const page = await context.newPage();

    try {  
        // Googleにアクセス
        await page.goto('https://www.google.jp', { waitUntil: 'domcontentloaded' });

        // 検索ボックスが表示されるのを待つ
        await page.waitForSelector('textarea[name="q"]', { timeout: 30000 });

        // 検索ボックスに「アニメ」を入力
        await page.fill('textarea[name="q"]', 'アニメ');

        // スクリーンショットを取得
        await page.screenshot({ path: path.join(screenshotDir, 'google_screenshot1.png') });

        await page.keyboard.press('Enter');

        // 検索結果が表示されるのを待つ
        await page.waitForSelector('h3');

        // スクリーンショットを取得
        await page.screenshot({ path: path.join(screenshotDir, 'google_screenshot2.png') });

        // 検索結果を取得
        const results = await page.$$eval('h3', elements => elements.map(el => el.innerText));

        
        console.log('検索結果:', results);
    } catch (error) {
        console.error('エラーが発生しました:', error);
    } finally {
        await context.close();
        await browser.close();
    }
})();
