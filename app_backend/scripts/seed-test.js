require('dotenv').config();
const { AppDataSource } = require('../dist/config/database');
const { User, UserRole } = require('../dist/models/User');

async function createUser(userData) {
    const repo = AppDataSource.getRepository(User);
    try {
        // Check if user exists
        let user = await repo.findOne({ where: { username: userData.username } });
        
        if (!user) {
            user = new User();
            Object.assign(user, userData);
            await user.hashPassword();
            await repo.save(user);
            console.log(`Created user: ${userData.username}`);
        } else {
            // Update existing user
            user.password = userData.password;
            await user.hashPassword();
            await repo.save(user);
            console.log(`Updated user: ${userData.username}`);
        }
    } catch (error) {
        console.error(`Error creating/updating user ${userData.username}:`, error);
    }
}

async function run() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully');

        // Create test users
        const users = [
            {
                username: 'customer1',
                fullName: 'Test Customer',
                accountNumber: '123456789012',
                idNumber: '9001015009086',
                password: 'Customer!234',
                role: UserRole.CUSTOMER
            },
            {
                username: 'ops_agent_1',
                fullName: 'Operations Agent One',
                accountNumber: '700000000001',
                idNumber: '8001015009087',
                password: 'Employee!234',
                role: UserRole.EMPLOYEE
            }
        ];

        for (const userData of users) {
            await createUser(userData);
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
