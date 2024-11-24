const { chromium, webkit, firefox, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

const devicesList = [
    { name: 'MacOS Safari', browserType: webkit, options: {} },
    { name: 'iPhone 12', browserType: webkit, options: devices['iPhone 12'] },
    { name: 'Pixel 2', browserType: chromium, options: devices['Pixel 2'] },
    { name: 'Windows Chrome', browserType: chromium, options: { viewport: { width: 1280, height: 720 } } },
    { name: 'Windows Firefox', browserType: firefox, options: { viewport: { width: 1280, height: 720 } } },
    { name: 'Linux Chrome', browserType: chromium, options: { viewport: { width: 1280, height: 720 } } },
    { name: 'Linux Firefox', browserType: firefox, options: { viewport: { width: 1280, height: 720 } } },
];

(async () => {
    // screen_shotディレクトリが存在しない場合は作成する
    const screenshotDir = path.join(__dirname, 'screen_shot');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }
    
    // ビデオを保存するディレクトリを作成
    const videoDir = path.join(__dirname, 'videos');
    if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir);
    }
    
    for (const device of devicesList) {
        console.log(`Running tests on ${device.name}`);

        const browser = await device.browserType.launch();
        const context = await browser.newContext({
            ...device.options,
            recordVideo: {
                dir: videoDir, // ビデオファイルを保存するディレクトリ
                size: { width: 1280, height: 720 }, // ビデオのサイズ
            },
        });
        const page = await context.newPage();

        try {
            // ここに共通のテスト処理を追加
            await page.goto('https://www.google.jp', { waitUntil: 'domcontentloaded' });
            
            // スクリーンショットを取得
            await page.screenshot({ path: path.join(screenshotDir, `google_screenshot1_${device.name}.png`) });
            
            await page.waitForSelector('textarea[name="q"]', { timeout: 30000 });
            await page.fill('textarea[name="q"]', 'アニメ');
            
            await page.screenshot({ path: path.join(screenshotDir, `${device.name.replace(' ', '_')}_screenshot.png`) });
            
            await page.keyboard.press('Enter');
            await page.waitForTimeout(2000); // 結果が表示されるのを待つ

            // デバイスに応じて検索結果のセレクタを変更
            const resultSelector = device.name.includes('iPhone') || device.name.includes('Pixel') ? 'div[role="link"]' : 'h3';
            await page.waitForSelector(resultSelector);

            // 要素をスクロールして表示させる
            await page.evaluate(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.scrollIntoView();
                }
            }, resultSelector);
                        
            const results = await page.$$eval(resultSelector, elements => elements.map(el => el.innerText));
            console.log('検索結果:', results);
        } catch (error) {
            console.error('エラーが発生しました:', error);
        } finally {
            const videoPath = await page.video().path(); // ビデオのパスを取得
            if (videoPath) {
                const newVideoName = `${device.name.replace(' ', '_')}_test_video.webm`; // 任意の名前を設定
                const newVideoPath = path.join(videoDir, newVideoName);
                fs.renameSync(videoPath, newVideoPath); // ビデオファイルをリネーム
                console.log(`ビデオの保存先: ${newVideoPath}`);
            }
            
            await context.close();
            await browser.close();
        }
    }
})();
