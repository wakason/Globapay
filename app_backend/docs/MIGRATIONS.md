# Database Migrations Guide

This guide covers everything you need to know about managing database migrations in GloBaPay.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Migration Commands](#migration-commands)
- [Creating Migrations](#creating-migrations)
- [Running Migrations](#running-migrations)
- [Best Practices](#best-practices)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

GloBaPay uses **TypeORM migrations** to manage database schema changes. This provides:

- ✅ Version control for database schema
- ✅ Safe, reversible database changes
- ✅ Consistent schema across environments
- ✅ Team collaboration on schema changes
- ✅ Production-ready deployment strategy

### Why Migrations?

Previously, the application used `synchronize: true` which automatically synced the database schema from entity models. This is **dangerous in production** because:

- ❌ Can cause data loss
- ❌ No rollback capability
- ❌ No audit trail of changes
- ❌ Can't control deployment timing

With migrations, you have **full control** over when and how schema changes are applied.

---

## Quick Start

### First-Time Setup

```bash
# Navigate to backend directory
cd app_backend

# Run migrations
npm run migration:run

# Seed initial data
npm run seed:initial
```

### Development Reset

If you need to start fresh in development:

```bash
npm run db:reset
```

⚠️ **WARNING**: `db:reset` will DELETE ALL DATA. Only use in development!

---

## Migration Commands

### View Migration Status

```bash
npm run migration:show
```

Shows which migrations have been run and which are pending.

### Run Pending Migrations

```bash
npm run migration:run
```

Executes all pending migrations in order.

### Revert Last Migration

```bash
npm run migration:revert
```

Rolls back the most recently applied migration.

### Generate New Migration

```bash
npm run migration:generate -- src/migrations/YourMigrationName
```

Auto-generates a migration by comparing your entity models to the current database schema.

Example:
```bash
npm run migration:generate -- src/migrations/AddUserEmailField
```

### Create Empty Migration

```bash
npm run migration:create -- src/migrations/YourMigrationName
```

Creates an empty migration file that you can manually edit.

Example:
```bash
npm run migration:create -- src/migrations/AddIndexesToTransactions
```

---

## Creating Migrations

### Automated Generation (Recommended)

1. **Modify your entity models** in `src/models/`
2. **Generate migration** from changes:
   ```bash
   npm run migration:generate -- src/migrations/DescribeYourChanges
   ```
3. **Review the generated SQL** in the new migration file
4. **Test the migration** in development
5. **Commit the migration** to version control

### Manual Creation

For complex changes, create a manual migration:

```bash
npm run migration:create -- src/migrations/ComplexDataTransformation
```

Then edit the file:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ComplexDataTransformation1234567890 implements MigrationInterface {
    name = 'ComplexDataTransformation1234567890';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Forward migration
        await queryRunner.query(`
            -- Your SQL here
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback migration
        await queryRunner.query(`
            -- Reverse your changes
        `);
    }
}
```

### Example: Adding a New Column

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEmailToUsers1699000000001 implements MigrationInterface {
    name = 'AddEmailToUsers1699000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'email',
                type: 'varchar',
                length: '255',
                isNullable: true,
                isUnique: true,
            })
        );

        // Add index for better query performance
        await queryRunner.query(`
            CREATE INDEX IDX_users_email ON users(email)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IDX_users_email ON users`);
        await queryRunner.dropColumn('users', 'email');
    }
}
```

---

## Running Migrations

### Development

Migrations run automatically when you start the dev server if `RUN_MIGRATIONS_ON_STARTUP=true` is set in `.env`.

To manually run migrations:

```bash
npm run migration:run
```

### Production

**Never** set `RUN_MIGRATIONS_ON_STARTUP=true` in production. Instead:

1. **Backup your database** before applying migrations
2. **Run migrations manually** during deployment:
   ```bash
   npm run migration:run
   ```
3. **Verify** migrations completed successfully
4. **Start the application**

### Deployment Process

```bash
# 1. Backup database
mysqldump -u root -p payment_portal > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Build application
npm run build

# 5. Run migrations
npm run migration:run

# 6. Restart application
pm2 restart globapay-backend
```

---

## Best Practices

### DO ✅

1. **Always review generated migrations** before running them
2. **Test migrations in development** before deploying
3. **Write reversible migrations** (implement both `up()` and `down()`)
4. **Name migrations descriptively**: `AddUserEmailField`, not `Migration1`
5. **Keep migrations small and focused** on one logical change
6. **Commit migrations with the code** that requires them
7. **Backup production database** before running migrations
8. **Add indexes** for foreign keys and frequently queried columns
9. **Use transactions** for data migrations

### DON'T ❌

1. **Never edit a migration** after it's been deployed to production
2. **Never delete a migration** that's been run
3. **Don't use `synchronize: true`** in production
4. **Don't skip migration testing** in development
5. **Don't run migrations** on production without a backup
6. **Don't use `db:reset`** in production (it will fail as a safety measure)

### Data Migrations

For migrations that transform data, use transactions:

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    try {
        // Schema change
        await queryRunner.addColumn('users', /* ... */);
        
        // Data transformation
        await queryRunner.query(`
            UPDATE users 
            SET email = CONCAT(username, '@example.com')
            WHERE email IS NULL
        `);
        
        await queryRunner.commitTransaction();
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    }
}
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All migrations tested in development
- [ ] Database backup created
- [ ] Maintenance window scheduled (if needed)
- [ ] Rollback plan documented
- [ ] Team notified of deployment

### Deployment Steps

1. **Enable maintenance mode** (optional, for zero-downtime deployments)
2. **Backup database**:
   ```bash
   mysqldump -u root -p payment_portal > backup.sql
   ```
3. **Run migrations**:
   ```bash
   npm run migration:run
   ```
4. **Verify migration status**:
   ```bash
   npm run migration:show
   ```
5. **Deploy application code**
6. **Smoke test critical functionality**
7. **Disable maintenance mode**

### Rollback Procedure

If something goes wrong:

```bash
# 1. Revert the migration
npm run migration:revert

# 2. Restart application on previous version
git checkout <previous-commit>
npm install
npm run build
pm2 restart globapay-backend

# 3. Or restore from backup
mysql -u root -p payment_portal < backup.sql
```

---

## Troubleshooting

### Migration Fails

**Problem**: Migration fails partway through

**Solution**:
1. Check the error message in the console
2. If it's a SQL syntax error, fix the migration
3. If the migration partially ran, manually clean up the database
4. Fix the migration and run again

### "Migration has already been run"

**Problem**: Trying to run a migration that's already applied

**Solution**:
```bash
# Check what's been run
npm run migration:show

# If you need to re-run, first revert it
npm run migration:revert
```

### Pending Migrations Not Running

**Problem**: `npm run migration:run` says no pending migrations, but you just created one

**Solution**:
1. Ensure migration file is in `src/migrations/` directory
2. Check the migration file name follows format: `[timestamp]-[Name].ts`
3. Rebuild TypeScript: `npm run build`
4. Try again: `npm run migration:run`

### Connection Issues

**Problem**: "Cannot connect to database"

**Solution**:
1. Verify database is running: `mysql -u root -p`
2. Check `.env` file has correct credentials
3. Ensure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` are set
4. Test connection manually

### Migration Order Issues

**Problem**: Migrations run in wrong order

**Solution**: TypeORM runs migrations by timestamp in filename. Ensure your migration files have proper timestamps:
- Format: `[timestamp]-[Name].ts`
- Example: `1699000000000-InitialSchema.ts`

Never rename migration files after they've been run!

---

## Migration File Structure

```
app_backend/
├── src/
│   ├── config/
│   │   ├── database.ts              # Main database config
│   │   └── migration-data-source.ts # Migration-specific config
│   ├── migrations/
│   │   ├── 1699000000000-InitialSchema.ts
│   │   └── 1699000000001-AddEmailToUsers.ts
│   └── models/
│       ├── User.ts
│       ├── Transaction.ts
│       └── ...
└── scripts/
    ├── migration-up.ts           # Run migrations
    ├── migration-down.ts         # Revert migration
    ├── migration-status.ts       # Show status
    ├── seed-initial.ts           # Seed data
    └── db-reset.ts               # Reset database (dev only)
```

---

## Environment Variables

Add these to your `.env` file:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=payment_portal
DB_POOL_SIZE=10

# Migration Settings
RUN_MIGRATIONS_ON_STARTUP=false  # Set to true only in development
NODE_ENV=development
```

---

## Advanced Usage

### Run Migrations in Production via Script

Create a deployment script:

```bash
#!/bin/bash
# deploy.sh

set -e  # Exit on any error

echo "Starting deployment..."

# Backup
echo "Creating database backup..."
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# Deploy
echo "Running migrations..."
npm run migration:run

echo "Building application..."
npm run build

echo "Restarting service..."
pm2 restart globapay-backend

echo "Deployment complete!"
```

### Dry Run Migrations

To see what SQL will run without executing:

1. Generate the migration
2. Open the migration file and review the SQL
3. Test in a development database first

---

## Getting Help

- Review the [TypeORM Migration Documentation](https://typeorm.io/migrations)
- Check the migration files in `src/migrations/` for examples
- Run `npm run migration:show` to see current status
- Contact the development team if you're stuck

---

## Summary

✅ **Use migrations** for all schema changes  
✅ **Test in development** before deploying  
✅ **Always backup** production data before migrations  
✅ **Never edit** migrations after they're deployed  
✅ **Keep migrations small** and focused  
✅ **Commit migrations** with related code changes  

---

**Last Updated**: November 2024

