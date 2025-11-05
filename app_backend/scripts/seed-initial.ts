import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { User, UserRole } from '../src/models/User';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seed initial data for GloBaPay
 * Creates test customers and employees
 * 
 * Run: npm run seed:initial
 */
async function seedInitialData() {
    try {
        console.log('🌱 Starting database seeding...');

        // Initialize database connection
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Database connection established');
        }

        const userRepository = AppDataSource.getRepository(User);

        // In development, we'll just skip existing users rather than clearing
        // (clearing would fail due to foreign key constraints)

        // Create test customer accounts
        const customers = [
            {
                username: 'customer1',
                fullName: 'John Doe',
                accountNumber: '1234567890',
                idNumber: '9001015009087',
                password: 'Customer!234',
                role: UserRole.CUSTOMER,
            },
            {
                username: 'customer2',
                fullName: 'Jane Smith',
                accountNumber: '0987654321',
                idNumber: '8505205009088',
                password: 'Customer!234',
                role: UserRole.CUSTOMER,
            },
            {
                username: 'customer3',
                fullName: 'Alice Johnson',
                accountNumber: '5555555555',
                idNumber: '9212125009089',
                password: 'Customer!234',
                role: UserRole.CUSTOMER,
            },
        ];

        console.log('👤 Creating customer accounts...');
        for (const customerData of customers) {
            const existingUser = await userRepository.findOne({
                where: { username: customerData.username },
            });

            if (existingUser) {
                console.log(`   ⏭️  Customer ${customerData.username} already exists, skipping...`);
                continue;
            }

            const user = userRepository.create(customerData);
            await user.hashPassword();
            await userRepository.save(user);
            console.log(`   ✅ Created customer: ${customerData.username} (${customerData.fullName})`);
        }

        // Create test employee accounts
        const employees = [
            {
                username: 'ops_agent_1',
                fullName: 'Sarah Williams',
                accountNumber: 'EMP001',
                idNumber: '8803035009090',
                password: 'Employee!234',
                role: UserRole.EMPLOYEE,
            },
            {
                username: 'ops_agent_2',
                fullName: 'Michael Brown',
                accountNumber: 'EMP002',
                idNumber: '9507075009091',
                password: 'Employee!234',
                role: UserRole.EMPLOYEE,
            },
            {
                username: 'ops_manager',
                fullName: 'Linda Martinez',
                accountNumber: 'EMP003',
                idNumber: '7912125009092',
                password: 'Manager!234',
                role: UserRole.EMPLOYEE,
            },
        ];

        console.log('👨‍💼 Creating employee accounts...');
        for (const employeeData of employees) {
            const existingUser = await userRepository.findOne({
                where: { username: employeeData.username },
            });

            if (existingUser) {
                console.log(`   ⏭️  Employee ${employeeData.username} already exists, skipping...`);
                continue;
            }

            const user = userRepository.create(employeeData);
            await user.hashPassword();
            await userRepository.save(user);
            console.log(`   ✅ Created employee: ${employeeData.username} (${employeeData.fullName})`);
        }

        console.log('\n🎉 Seeding completed successfully!\n');
        console.log('📋 Test Accounts:');
        console.log('   CUSTOMERS:');
        console.log('   - Username: customer1, Password: Customer!234');
        console.log('   - Username: customer2, Password: Customer!234');
        console.log('   - Username: customer3, Password: Customer!234');
        console.log('\n   EMPLOYEES:');
        console.log('   - Username: ops_agent_1, Password: Employee!234');
        console.log('   - Username: ops_agent_2, Password: Employee!234');
        console.log('   - Username: ops_manager, Password: Manager!234');
        console.log('');

        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(1);
    }
}

// Run seeding
seedInitialData();

