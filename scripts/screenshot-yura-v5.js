const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2
  });

  const slides = [
    'yura-01-title',
    'yura-02-concept',
    'yura-03-market',
    'yura-04-blueocean',
    'yura-05-reversible',
    'yura-06-digital',
    'yura-07-target',
    'yura-08-business',
    'yura-09-cost',
    'yura-10-risk',
    'yura-11-roadmap',
    'yura-12-closing',
  ];

  for (const slide of slides) {
    console.log(`Capturing ${slide}...`);
    await page.goto(`http://localhost:8766/slides/html/${slide}.html`, {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `outputs/slides/${slide}.png`,
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
      scale: 'device',
      type: 'png'
    });
    console.log(`  -> ${slide}.png saved`);
  }

  await browser.close();
  console.log('All 12 slides captured!');
})();
