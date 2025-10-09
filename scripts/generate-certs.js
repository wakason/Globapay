const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function generateCertificates() {
    try {
        // Create certificates directory if it doesn't exist
        const certDir = path.join(__dirname, '..', 'certificates');
        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir);
        }

        // Generate self-signed certificate using OpenSSL
        const configPath = path.join(__dirname, 'openssl.cnf');
        const openSslCommands = [
            // Generate private key
            `openssl genrsa -out "${path.join(certDir, 'localhost-key.pem')}" 2048`,
            
            // Generate self-signed certificate
            `openssl req -x509 -new -nodes -key "${path.join(certDir, 'localhost-key.pem')}" -sha256 -days 365 -out "${path.join(certDir, 'localhost.pem')}" -config "${configPath}"`
        ];

        // Execute OpenSSL commands
        openSslCommands.forEach(command => {
            execSync(command, { stdio: 'inherit' });
        });

        // Clean up CSR file
        const csrFile = path.join(certDir, 'localhost.csr');
        if (fs.existsSync(csrFile)) {
            fs.unlinkSync(csrFile);
        }

        console.log('SSL certificates generated successfully in the certificates directory.');
    } catch (error) {
        console.error('Error generating certificates:', error.message);
        process.exit(1);
    }
}

generateCertificates();
