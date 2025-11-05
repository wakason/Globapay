import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * DataSource configuration specifically for TypeORM CLI migrations
 * This file is used by migration commands: generate, create, run, revert
 */
export const MigrationDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'payment_portal',
    
    // Entity paths for migration generation
    entities: [path.join(__dirname, '../models/**/*{.ts,.js}')],
    
    // Migration paths
    migrations: [path.join(__dirname, '../migrations/**/*{.ts,.js}')],
    
    // Where to output generated migrations
    // Note: TypeORM CLI will use this directory
    migrationsTableName: 'migrations_history',
    
    // Enable logging during migrations
    logging: true,
    
    // Never use synchronize with migrations
    synchronize: false,
});

// Export as default for TypeORM CLI
export default MigrationDataSource;

