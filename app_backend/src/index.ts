import 'reflect-metadata';
import express from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
// Optional HPP protection; keeping import via require to avoid TS types
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hpp = require('hpp');
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './config/database';
import { User, UserRole } from './models/User';
import authRoutes from './routes/auth.routes';
import paymentRoutes from './routes/payment.routes';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
// Add explicit HSTS to reinforce HTTPS usage
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    next();
});
// CORS allowlist support via env CORS_ORIGINS (comma-separated)
const corsOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'https://localhost:3000,https://localhost:5001')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS origin not allowed'));
    },
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Per-route brute-force protection for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts. Please try again later.' }
});
app.use('/api/auth/login', loginLimiter);

// Enforce JSON content-type for API write operations
app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.path.startsWith('/api')) {
        const ct = (req.headers['content-type'] || '').toString();
        if (!ct.includes('application/json')) {
            return res.status(415).json({ message: 'Content-Type must be application/json' });
        }
    }
    next();
});

// Middleware
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(hpp());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    const requiredEnv = [
        'JWT_SECRET',
        'FIELD_ENCRYPTION_KEY',
        'DB_HOST',
        'DB_PORT',
        'DB_USER',
        'DB_NAME'
    ];
    const missing = requiredEnv.filter((k) => !process.env[k] || process.env[k] === '');
    res.json({
        status: 'ok',
        nodeEnv: process.env.NODE_ENV || 'unknown',
        db: {
            host: process.env.DB_HOST,
            name: process.env.DB_NAME
        },
        missingEnv: missing
    });
});

// Error handling
app.use(errorHandler);

async function startServer() {
    const port = Number(process.env.PORT) || 5000;
    try {
        const certDir = path.join(__dirname, '..', '..', 'certificates');
        const keyPath = path.join(certDir, 'localhost-key.pem');
        const certPath = path.join(certDir, 'localhost.pem');
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            const credentials = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath)
            };
            const httpsServer = https.createServer(credentials, app);
            httpsServer.listen(port, () => {
                console.log(`HTTPS server running on https://localhost:${port}`);
            });
        } else {
            app.listen(port, () => {
                console.log(`HTTP server running on http://localhost:${port} (certificates not found)`);
            });
        }
    } catch (err) {
        console.error('Failed to start HTTPS server, falling back to HTTP:', err);
        app.listen(port, () => {
            console.log(`HTTP server running on http://localhost:${port}`);
        });
    }
}

// Initialize database connection unless explicitly skipped (e.g., CI security scans)
if (process.env.SKIP_DB_INIT === '1') {
    console.warn('SKIP_DB_INIT=1 set; starting server without database connection.');
    startServer();
} else {
    AppDataSource.initialize()
        .then(() => {
            console.log('Data Source has been initialized!');
            // Seed employees if provided
            const seed = async () => {
                const userRepo = AppDataSource.getRepository(User);
                const employeesEnv = process.env.SEED_EMPLOYEES || '';
                if (!employeesEnv) return;
                const list = employeesEnv.split(',').map(s => s.trim()).filter(Boolean);
                for (const entry of list) {
                    // Format: username:fullName:accountNumber:idNumber:password
                    const parts = entry.split(':');
                    if (parts.length < 5) continue;
                    const [username, fullName, accountNumber, idNumber, password] = parts;
                    const exists = await userRepo.findOne({ where: { username } });
                    if (exists) continue;
                    const u = userRepo.create({ username, fullName, accountNumber, idNumber, password, role: UserRole.EMPLOYEE });
                    await u.hashPassword();
                    await userRepo.save(u);
                    console.log(`Seeded employee ${username}`);
                }
            };
            seed().catch(err => console.error('Seeding employees failed', err));
            // Start server
            startServer();
        })
        .catch((error) => {
            console.error('Error during Data Source initialization:', error);
            process.exit(1);
        });
}
