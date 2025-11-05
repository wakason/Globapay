import 'reflect-metadata';
import { MigrationDataSource } from '../src/config/migration-data-source';

/**
 * Revert the last database migration
 * Usage: ts-node scripts/migration-down.ts
 */
async function revertMigration() {
    try {
        console.log('🔄 Connecting to database...');
        await MigrationDataSource.initialize();
        console.log('✅ Database connected');

        console.log('⏪ Reverting last migration...');
        await MigrationDataSource.undoLastMigration();
        console.log('✅ Migration reverted successfully');

        await MigrationDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration revert failed:', error);
        if (MigrationDataSource.isInitialized) {
            await MigrationDataSource.destroy();
        }
        process.exit(1);
    }
}

revertMigration();

