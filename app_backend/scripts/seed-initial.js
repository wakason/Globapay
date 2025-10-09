require('dotenv').config();
const { AppDataSource } = require('../dist/config/database');
const { User, UserRole } = require('../dist/models/User');
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function run() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully');

        // Create test users directly using SQL to bypass encryption
        const users = [
            {
                username: 'customer1',
                fullName: 'Test Customer',
                accountNumber: '123456789012',
                idNumber: '9001015009086',
                password: await hashPassword('Customer!234'),
                role: UserRole.CUSTOMER
            },
            {
                username: 'ops_agent_1',
                fullName: 'Operations Agent One',
                accountNumber: '700000000001',
                idNumber: '8001015009087',
                password: await hashPassword('Employee!234'),
                role: UserRole.EMPLOYEE
            }
        ];

        // Use repository to save without encryption
        const repo = AppDataSource.getRepository(User);
        for (const userData of users) {
            await repo.query(
                `INSERT INTO users (username, fullName, accountNumber, idNumber, password, role, isVerified)
                 VALUES (?, ?, ?, ?, ?, ?, true)`,
                [userData.username, userData.fullName, userData.accountNumber, userData.idNumber, userData.password, userData.role]
            );
            console.log(`Created user: ${userData.username}`);
        }

        console.log('Seeding completed successfully');
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exitCode = 1;
    } finally {
        if (AppDataSource?.destroy) {
            await AppDataSource.destroy();
        }
    }
}

run();
