const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Emulate 3G network
  await context.route('**/*', route => {
    setTimeout(() => route.continue(), Math.random() * 100); // Add latency
  });
  
  await page.emulate({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  });

  // Set 3G throttling
  const client = await context.newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 750 * 1024 / 8, // 750 kbps
    uploadThroughput: 250 * 1024 / 8,   // 250 kbps
    latency: 100, // 100ms
  });

  const requests = [];
  const startTime = Date.now();

  page.on('request', request => {
    requests.push({
      time: Date.now() - startTime,
      url: request.url(),
      method: request.method(),
      type: request.resourceType()
    });
  });

  page.on('response', async response => {
    const request = response.request();
    const timing = response.timing();
    console.log(`[${Date.now() - startTime}ms] ${response.status()} ${request.url().split('/').pop()} (${timing ? Math.round(timing.responseEnd) : '?'}ms)`);
  });

  console.log('Loading http://localhost:8000 with 3G throttling...\n');
  await page.goto('http://localhost:8000');

  // Wait for cube to be visible
  await page.waitForSelector('#cube-3d-wrapper', { timeout: 120000 });
  const loadTime = Date.now() - startTime;

  console.log(`\n✓ Cube loaded in ${(loadTime / 1000).toFixed(2)}s`);
  console.log(`\nTotal requests: ${requests.length}`);
  
  // Group by type
  const byType = {};
  requests.forEach(r => {
    byType[r.type] = (byType[r.type] || 0) + 1;
  });
  console.log('\nRequests by type:', byType);

  // Show example files
  const examples = requests.filter(r => r.url.includes('examples/'));
  console.log(`\nExample texture files loaded: ${examples.length}`);
  examples.forEach(r => console.log(`  - ${r.url.split('/').pop()} at ${r.time}ms`));

  await page.screenshot({ path: '3g-test.png' });
  console.log('\nScreenshot saved: 3g-test.png');

  await browser.close();
})();
