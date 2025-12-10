import { test, expect } from '@playwright/test';

test('Load app on 3G network with saved state -- version 2 (space)', async ({ page, context }) => {
  test.setTimeout(300000); // 5 minutes
  
  // Set localStorage BEFORE loading page
  await context.addInitScript(() => {
    localStorage.setItem('accordionStates', '{"0":false,"1":false,"2":false,"3":false,"4":false,"5":false,"6":true,"7":false,"8":false,"9":false,"10":false}');
    localStorage.setItem('bgColor', '#2600ff');
    localStorage.setItem('bgHeight', '128');
    localStorage.setItem('bgWidth', '126');
    localStorage.setItem('cubeViewState', '{"cubeRotation":{"x":-34.5,"y":34.5},"zoom2D":1,"panOffset":{"x":0,"y":0},"cubeSize":402.7442861326503}');
    localStorage.setItem('panelHidden', 'true');
    localStorage.setItem('panelWidth', '350');
    localStorage.setItem('selectedBackground', 'space.png');
    localStorage.setItem('selectedTexture', '13-earth.json');
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

  const images = requests.filter(r => r.type === 'image');
  console.log(`\n\nIMAGE REQUESTS (${images.length} total):`);
  images.forEach(r => {
    const url = r.url.split('/').slice(-2).join('/');
    console.log(`  ${r.time}ms - ${url}`);
  });

  await page.screenshot({ path: '3g-test-with-state.png' });
  console.log('\nScreenshot: 3g-test-with-state.png');
  
  expect(true).toBe(true);
});
