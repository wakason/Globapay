import 'reflect-metadata';
import { MigrationDataSource } from '../src/config/migration-data-source';

/**
 * Show migration status
 * Usage: ts-node scripts/migration-status.ts
 */
async function showMigrationStatus() {
    try {
        console.log('🔄 Connecting to database...');
        await MigrationDataSource.initialize();
        console.log('✅ Database connected\n');

        const migrations = await MigrationDataSource.showMigrations();
        
        console.log('📊 Migration Status:\n');
        console.log(migrations ? 'Check console output above for details' : 'No migrations found');

        await MigrationDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to show migration status:', error);
        if (MigrationDataSource.isInitialized) {
            await MigrationDataSource.destroy();
        }
        process.exit(1);
    }
}

showMigrationStatus();

