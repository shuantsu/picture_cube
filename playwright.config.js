export default {
  testDir: './tests',
  timeout: 180000,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
  },
};
