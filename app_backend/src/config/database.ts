import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { PaymentMethod } from '../models/PaymentMethod';
import { AuditLog } from '../models/AuditLog';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'payment_portal',
    // IMPORTANT: Never use synchronize in production
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Transaction, PaymentMethod, AuditLog],
    migrations: [path.join(__dirname, '../migrations/**/*{.ts,.js}')],
    subscribers: [],
    // Connection pool settings
    extra: {
        connectionLimit: parseInt(process.env.DB_POOL_SIZE || '10'),
        waitForConnections: true,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    },
    // Connection timeout settings
    connectTimeout: 10000,
    acquireTimeout: 10000,
    // Migration settings
    migrationsRun: process.env.RUN_MIGRATIONS_ON_STARTUP === 'true',
    migrationsTableName: 'migrations_history',
});
