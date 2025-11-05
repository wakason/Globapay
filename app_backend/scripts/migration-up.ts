import 'reflect-metadata';
import { MigrationDataSource } from '../src/config/migration-data-source';

/**
 * Run pending database migrations
 * Usage: ts-node scripts/migration-up.ts
 */
async function runMigrations() {
    try {
        console.log('🔄 Connecting to database...');
        await MigrationDataSource.initialize();
        console.log('✅ Database connected');

        console.log('📊 Running pending migrations...');
        const migrations = await MigrationDataSource.runMigrations();

        if (migrations.length === 0) {
            console.log('✨ No pending migrations. Database is up to date!');
        } else {
            console.log(`✅ Successfully ran ${migrations.length} migration(s):`);
            migrations.forEach((migration) => {
                console.log(`   - ${migration.name}`);
            });
        }

        await MigrationDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        if (MigrationDataSource.isInitialized) {
            await MigrationDataSource.destroy();
        }
        process.exit(1);
    }
}

runMigrations();

