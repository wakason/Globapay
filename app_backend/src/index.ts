import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
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
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

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

// Initialize database connection
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
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error during Data Source initialization:', error);
        process.exit(1);
    });
