const fs = require('fs');
const path = require('path');
const https = require('https');

// SSL certificate configuration for development
const sslConfig = {
    key: fs.readFileSync(path.join(__dirname, '../certificates/localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certificates/localhost.pem')),
};

module.exports = function configureSsl(app) {
    // Force HTTPS
    app.use((req, res, next) => {
        if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(['https://', req.get('Host'), req.url].join(''));
        }
        next();
    });

    // Set security headers
    app.use((req, res, next) => {
        // HSTS (HTTP Strict Transport Security) - force HTTPS
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');
        
        // XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Content Security Policy
        res.setHeader('Content-Security-Policy', `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval';
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: https:;
            font-src 'self' data:;
            connect-src 'self' https://api.yourbank.com;
        `.replace(/\s+/g, ' ').trim());

        next();
    });

    // Create HTTPS server
    const httpsServer = https.createServer(sslConfig, app);
    
    return httpsServer;
};
