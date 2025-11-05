import 'reflect-metadata';
import { MigrationDataSource } from '../src/config/migration-data-source';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Complete database reset for development
 * WARNING: This will drop all tables and data!
 * 
 * Usage: npm run db:reset
 * 
 * This script will:
 * 1. Drop all tables
 * 2. Run all migrations from scratch
 * 3. Seed initial data
 */
async function resetDatabase() {
    // Safety check: only allow in development
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ ERROR: Cannot run db:reset in production!');
        console.error('   This would delete all production data.');
        process.exit(1);
    }

    try {
        console.log('⚠️  WARNING: This will DELETE ALL DATA in the database!');
        console.log('   Database: ' + (process.env.DB_NAME || 'payment_portal'));
        console.log('   Environment: ' + (process.env.NODE_ENV || 'development'));
        console.log('');

        // Give a moment to cancel if run accidentally
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('🔄 Connecting to database...');
        await MigrationDataSource.initialize();
        console.log('✅ Database connected\n');

        // Step 1: Drop all tables
        console.log('🗑️  Step 1/3: Dropping all tables...');
        await MigrationDataSource.dropDatabase();
        await MigrationDataSource.synchronize();
        console.log('✅ All tables dropped\n');

        // Destroy and reinitialize connection
        await MigrationDataSource.destroy();
        await MigrationDataSource.initialize();

        // Step 2: Run migrations
        console.log('📊 Step 2/3: Running migrations...');
        const migrations = await MigrationDataSource.runMigrations();
        console.log(`✅ Ran ${migrations.length} migration(s)\n`);

        await MigrationDataSource.destroy();

        // Step 3: Seed initial data
        console.log('🌱 Step 3/3: Seeding initial data...');
        execSync('npm run seed:initial', { stdio: 'inherit' });

        console.log('\n🎉 Database reset completed successfully!');
        console.log('\n📋 You can now log in with:');
        console.log('   Customer: customer1 / Customer!234');
        console.log('   Employee: ops_agent_1 / Employee!234\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database reset failed:', error);
        if (MigrationDataSource.isInitialized) {
            await MigrationDataSource.destroy();
        }
        process.exit(1);
    }
}

resetDatabase();

