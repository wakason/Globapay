"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = require("./config/database");
const User_1 = require("./models/User");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
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
app.use(errorHandler_1.default);
// Initialize database connection
database_1.AppDataSource.initialize()
    .then(() => {
    console.log('Data Source has been initialized!');
    // Seed employees if provided
    const seed = async () => {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const employeesEnv = process.env.SEED_EMPLOYEES || '';
        if (!employeesEnv)
            return;
        const list = employeesEnv.split(',').map(s => s.trim()).filter(Boolean);
        for (const entry of list) {
            // Format: username:fullName:accountNumber:idNumber:password
            const parts = entry.split(':');
            if (parts.length < 5)
                continue;
            const [username, fullName, accountNumber, idNumber, password] = parts;
            const exists = await userRepo.findOne({ where: { username } });
            if (exists)
                continue;
            const u = userRepo.create({ username, fullName, accountNumber, idNumber, password, role: User_1.UserRole.EMPLOYEE });
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
