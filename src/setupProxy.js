const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.sowntra.com',
      changeOrigin: true,
      secure: false, // Set to true if you want to verify SSL certificates
      onProxyReq: (proxyReq, req, res) => {
        // Log proxied requests for easier debugging
        console.log(`[Proxy] ${req.method} ${req.url} -> https://api.sowntra.com${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err);
      }
    })
  );
};

