import { test, expect } from '@playwright/test';

test('Load app on 3G network with saved state', async ({ page, context }) => {
  test.setTimeout(300000); // 5 minutes
  
  // Set localStorage BEFORE loading page
  await context.addInitScript(() => {
    localStorage.setItem('accordionStates', '{"0":true,"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true,"8":true,"9":true,"10":true}');
    localStorage.setItem('bgColor', '#ff0000');
    localStorage.setItem('bgHeight', '100');
    localStorage.setItem('bgWidth', '100');
    localStorage.setItem('cubeViewState', '{"cubeRotation":{"x":-41,"y":-38},"zoom2D":1,"panOffset":{"x":0,"y":0},"cubeSize":350}');
    localStorage.setItem('panelWidth', '350');
    localStorage.setItem('renderThrottle', 'false');
    localStorage.setItem('selectedBackground', 'wengang-zhai-HCIr35bwff0-unsplash.jpg');
    localStorage.setItem('selectedTexture', '12-rubiks-anticlock.json');
    localStorage.setItem('textScale', '100');
    localStorage.setItem('uiScale', '100');
    localStorage.setItem('viewMode', 'perspective');
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
      type: request.resourceType()
    });
  });

  console.log('Loading http://localhost:4173/ with 3G throttling (WITH SAVED STATE)...');
  
  await page.goto('http://localhost:4173/', { timeout: 0 });
  await page.waitForLoadState('networkidle', { timeout: 0 });
  
  const loadTime = Date.now() - startTime;

  console.log(`\n✓ Page fully loaded in ${(loadTime / 1000).toFixed(2)}s`);
  console.log(`Total requests: ${requests.length}`);
  
  const byType = {};
  requests.forEach(r => {
    byType[r.type] = (byType[r.type] || 0) + 1;
  });
  console.log('\nRequests by type:', byType);

  const examples = requests.filter(r => r.url.includes('examples/'));
  console.log(`\nExample texture files: ${examples.length}`);
  examples.forEach(r => console.log(`  ${r.time}ms - ${r.url.split('/').pop()}`));
  
  if (examples.length > 0) {
    const firstExample = Math.min(...examples.map(r => r.time));
    const lastExample = Math.max(...examples.map(r => r.time));
    console.log(`\nExamples loaded from ${firstExample}ms to ${lastExample}ms (${lastExample - firstExample}ms span)`);
  }

  await page.screenshot({ path: '3g-test-with-state.png' });
  console.log('\nScreenshot: 3g-test-with-state.png');
  
  expect(true).toBe(true);
});
