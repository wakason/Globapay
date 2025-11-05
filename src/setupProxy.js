const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');

// Create an HTTPS agent that accepts self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Use HTTP for development (avoids SSL certificate issues)
// The backend will fallback to HTTP if certificates aren't properly configured
const API_TARGET = 'http://localhost:5000';

console.log(`[Proxy] Configured to proxy /api requests to ${API_TARGET}`);

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: API_TARGET,
      changeOrigin: true,
      secure: false,
      // Disable WebSocket proxying to reduce errors (not needed for API calls)
      ws: false,
      // Log errors for debugging (but suppress WebSocket errors)
      onError: (err, req, res) => {
        // Only log non-WebSocket errors
        if (!err.message.includes('WebSocket') && !err.code?.includes('ECONNRESET')) {
          console.error('[Proxy] Error:', err.message);
        }
        if (res.writeHead && !res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify({ 
            error: 'Proxy error', 
            details: err.message
          }));
        }
      },
      // Suppress routine proxy logs (too verbose)
      logLevel: 'warn'
    })
  );
};
