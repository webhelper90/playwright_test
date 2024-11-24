const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Googleにアクセス
    await page.goto('https://www.google.com');
    
    // 検索ボックスが表示されるのを待つ
    await page.waitForSelector('input[name="q"]', { timeout: 60000 });

    // 検索ボックスに「アニメ」を入力
    await page.fill('input[name="q"]', 'アニメ');
    await page.keyboard.press('Enter');

    // 検索結果が表示されるのを待つ
    await page.waitForSelector('h3');

    // 検索結果を取得
    const results = await page.$$eval('h3', elements => elements.map(el => el.innerText));

    console.log('検索結果:', results);

    await browser.close();
})();
