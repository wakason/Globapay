# Database Migrations - Quick Reference

## 📚 Common Commands

### View Status
```bash
npm run migration:show
```

### Run All Pending Migrations
```bash
npm run migration:run
```

### Rollback Last Migration
```bash
npm run migration:revert
```

### Generate Migration from Model Changes
```bash
npm run migration:generate -- src/migrations/YourMigrationName
```

### Create Empty Migration
```bash
npm run migration:create -- src/migrations/YourMigrationName
```

### Seed Initial Data
```bash
npm run seed:initial
```

### Reset Database (Dev Only)
```bash
npm run db:reset
```

---

## 🚀 Quick Workflows

### Starting Fresh (New Developer)
```bash
cd app_backend
npm install
npm run db:setup  # Runs migrations + seeds data
```

### After Pulling New Code
```bash
npm install          # Get new dependencies
npm run migration:run  # Apply any new migrations
```

### Making Schema Changes
```bash
# 1. Edit entity models in src/models/
# 2. Generate migration
npm run migration:generate -- src/migrations/DescribeYourChange

# 3. Review generated migration file
# 4. Test it
npm run migration:run

# 5. If something went wrong
npm run migration:revert
```

### Deploying to Production
```bash
# 1. Backup first!
mysqldump -u root -p payment_portal > backup.sql

# 2. Run migrations
npm run migration:run

# 3. Verify
npm run migration:show

# 4. Deploy code
npm run build
pm2 restart globapay-backend
```

---

## ⚠️ Important Rules

### ✅ DO
- Test migrations in development first
- Backup production before migrations
- Review generated migrations
- Commit migrations with your code
- Keep migrations small and focused

### ❌ DON'T
- Never edit a migration after it's deployed
- Never delete a run migration
- Never use `db:reset` in production
- Never skip testing in dev environment
- Never use `synchronize: true` in production

---

## 🐛 Quick Troubleshooting

### Migration Won't Run
```bash
# Check status
npm run migration:show

# Rebuild TypeScript
npm run build

# Try again
npm run migration:run
```

### Need to Undo a Migration
```bash
npm run migration:revert
```

### Database Connection Issues
```bash
# Check .env file has:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=payment_portal
```

### Start Over (Dev Only)
```bash
npm run db:reset
```

---

## 📁 File Locations

- **Migration Config**: `src/config/migration-data-source.ts`
- **Migrations**: `src/migrations/`
- **Scripts**: `scripts/`
- **Entity Models**: `src/models/`

---

## 🔗 See Also

- [Full Migration Guide](./MIGRATIONS.md)
- [TypeORM Documentation](https://typeorm.io/migrations)

---

**Need Help?** Check `docs/MIGRATIONS.md` for detailed documentation.

