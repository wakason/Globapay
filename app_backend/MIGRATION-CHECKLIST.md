# ✅ Database Migration Implementation Checklist

Use this checklist to verify your migration system is set up correctly.

## Initial Setup

### 1. Install Dependencies
```bash
cd app_backend
npm install
```
- [ ] All dependencies installed without errors

### 2. Environment Configuration
```bash
# Check .env file has these variables:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=payment_portal
JWT_SECRET=<at-least-32-chars>
FIELD_ENCRYPTION_KEY=<exactly-32-chars>
```
- [ ] `.env` file exists
- [ ] All database variables set
- [ ] Encryption keys configured

### 3. Database Exists
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS payment_portal;"
```
- [ ] Database created

### 4. Run Initial Setup
```bash
npm run db:setup
```
- [ ] Migrations ran successfully
- [ ] Seed data created
- [ ] Test accounts available

### 5. Verify Tables
```bash
npm run migration:show
```
Expected output:
```
✓ InitialSchema1699000000000
```
- [ ] Migration shows as completed

### 6. Test Login
```bash
# Start the server
npm run dev

# In another terminal, test login:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"Customer!234"}'
```
- [ ] Server starts without errors
- [ ] Login returns JWT token

---

## Development Workflow

### Making Schema Changes
- [ ] Modify entity in `src/models/`
- [ ] Generate migration: `npm run migration:generate -- src/migrations/YourChange`
- [ ] Review generated SQL
- [ ] Test migration: `npm run migration:run`
- [ ] If issues, rollback: `npm run migration:revert`
- [ ] Commit migration file with code changes

### Pulling New Code
- [ ] Run `git pull`
- [ ] Run `npm install`
- [ ] Run `npm run migration:run`
- [ ] Continue development

---

## Production Deployment

### Pre-Deployment
- [ ] All migrations tested in development
- [ ] Backup created: `mysqldump -u root -p payment_portal > backup.sql`
- [ ] Rollback plan documented
- [ ] Team notified

### Deployment
- [ ] Pull code: `git checkout <version>`
- [ ] Install: `npm install --production`
- [ ] Run migrations: `npm run migration:run`
- [ ] Verify: `npm run migration:show`
- [ ] Build: `npm run build`
- [ ] Restart: `pm2 restart globapay-backend`

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Logs checked for errors
- [ ] Metrics monitored
- [ ] Stakeholders notified

---

## Troubleshooting

### Common Issues

#### ❌ "Cannot connect to database"
```bash
# Check MySQL is running
# Verify .env credentials
mysql -u root -p payment_portal
```
- [ ] Fixed

#### ❌ "Migration already exists"
```bash
# Check migration status
npm run migration:show
# If needed, revert
npm run migration:revert
```
- [ ] Fixed

#### ❌ "Table already exists"
```bash
# Drop and recreate (DEV ONLY!)
npm run db:reset
```
- [ ] Fixed

---

## Documentation Read

- [ ] Read `docs/MIGRATION-QUICK-REFERENCE.md`
- [ ] Read `docs/MIGRATIONS.md` (at least sections 1-5)
- [ ] Bookmarked `docs/PRODUCTION-DEPLOYMENT.md` for later

---

## Team Onboarding

- [ ] Explained migration concept to team
- [ ] Demonstrated `npm run migration:generate`
- [ ] Practiced rollback procedure
- [ ] Reviewed deployment process

---

## Ready for Production? ✅

All items checked? You're ready to use migrations in production!

### Quick Commands to Remember

```bash
# View status
npm run migration:show

# Run pending
npm run migration:run

# Rollback
npm run migration:revert

# Reset (dev only)
npm run db:reset
```

---

## Next Steps

1. **Delete old sync-based code**: Remove any references to `synchronize: true`
2. **Update CI/CD**: Add migration step to deployment pipeline
3. **Train team**: Ensure everyone knows the migration workflow
4. **Monitor**: Watch for migration-related issues in production

---

## Support

- 📚 Documentation: `app_backend/docs/`
- 💬 Questions: Ask the development team
- 🐛 Issues: Check troubleshooting section in `MIGRATIONS.md`

---

**Status**: ✅ All implemented and ready to use!

