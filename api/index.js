// Vercel serverless entrypoint. Requires the tsc-compiled Nest app
// (produced by `npm run build` -> `dist/main.js`) and reuses one cached
// Nest application instance across warm invocations of this function.
let cachedApp;

async function getApp() {
  if (!cachedApp) {
    const { createApp } = require('../dist/main');
    const app = await createApp();
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

module.exports = async (req, res) => {
  const app = await getApp();
  const instance = app.getHttpAdapter().getInstance();
  instance(req, res);
};
