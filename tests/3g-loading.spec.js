import { test, expect } from '@playwright/test';

test('Load app on 3G network', async ({ page, context }) => {
  test.setTimeout(300000); // 5 minutes
  
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
      type: request.resourceType()
    });
  });

  console.log('Loading http://localhost:4173/ with 3G throttling...');
  
  // Just load the page, don't wait for anything specific
  await page.goto('http://localhost:4173/', { timeout: 0 });
  
  // Wait for network to be idle (all resources loaded)
  await page.waitForLoadState('networkidle', { timeout: 0 });
  
  const loadTime = Date.now() - startTime;

  console.log(`\n✓ Page fully loaded in ${(loadTime / 1000).toFixed(2)}s`);
  console.log(`Total requests: ${requests.length}`);
  
  // Group by type
  const byType = {};
  requests.forEach(r => {
    byType[r.type] = (byType[r.type] || 0) + 1;
  });
  console.log('\nRequests by type:', byType);

  // Show example files
  const examples = requests.filter(r => r.url.includes('examples/'));
  console.log(`\nExample texture files: ${examples.length}`);
  examples.forEach(r => console.log(`  ${r.time}ms - ${r.url.split('/').pop()}`));
  
  if (examples.length > 0) {
    const firstExample = Math.min(...examples.map(r => r.time));
    const lastExample = Math.max(...examples.map(r => r.time));
    console.log(`\nExamples loaded from ${firstExample}ms to ${lastExample}ms (${lastExample - firstExample}ms span)`);
  }

  await page.screenshot({ path: '3g-test.png' });
  console.log('\nScreenshot: 3g-test.png');
  
  expect(true).toBe(true);
});
