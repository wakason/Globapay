# Production Deployment Guide

This guide covers deploying database migrations and application updates to production safely.

## Pre-Deployment Checklist

### Testing Requirements
- [ ] All migrations tested in development environment
- [ ] Application tested with migrated schema
- [ ] Rollback plan documented and tested
- [ ] Performance impact of migrations assessed
- [ ] Team notified of scheduled deployment

### Backup Requirements
- [ ] Full database backup created
- [ ] Backup verified and can be restored
- [ ] Backup stored in secure location
- [ ] Previous backup still available

### Documentation Requirements
- [ ] Migration changelog updated
- [ ] Release notes prepared
- [ ] Rollback procedures documented
- [ ] Team has access to deployment runbook

---

## Production Deployment Process

### Phase 1: Preparation (1 hour before)

1. **Notify stakeholders**
   ```bash
   # Send notification:
   # - Deployment window
   # - Expected duration
   # - Impact assessment
   ```

2. **Create comprehensive backup**
   ```bash
   # Create timestamped backup
   mysqldump -u root -p payment_portal > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Verify backup
   ls -lh backup_*.sql
   
   # Test restore in separate database (optional but recommended)
   mysql -u root -p payment_portal_test < backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Prepare rollback script**
   ```bash
   #!/bin/bash
   # rollback.sh
   
   echo "Rolling back deployment..."
   
   # Revert migrations
   cd /path/to/app_backend
   npm run migration:revert
   
   # Checkout previous version
   git checkout <previous-tag>
   npm install
   npm run build
   
   # Restart services
   pm2 restart globapay-backend
   
   echo "Rollback complete"
   ```

### Phase 2: Deployment (15-30 minutes)

1. **Enable maintenance mode** (optional)
   ```bash
   # If using nginx
   sudo mv /etc/nginx/sites-enabled/globapay /tmp/globapay.bak
   sudo ln -s /etc/nginx/sites-available/maintenance /etc/nginx/sites-enabled/
   sudo systemctl reload nginx
   ```

2. **Pull latest code**
   ```bash
   cd /path/to/GloBaPay
   git fetch --all
   git checkout <version-tag>
   git pull origin main
   ```

3. **Install dependencies**
   ```bash
   cd app_backend
   npm install --production
   ```

4. **Run migrations**
   ```bash
   # Check migration status
   npm run migration:show
   
   # Run pending migrations
   npm run migration:run
   
   # Verify migrations completed
   npm run migration:show
   ```

5. **Build application**
   ```bash
   npm run build
   ```

6. **Restart services**
   ```bash
   # If using PM2
   pm2 restart globapay-backend
   
   # If using systemd
   sudo systemctl restart globapay-backend
   ```

7. **Disable maintenance mode**
   ```bash
   # If using nginx
   sudo rm /etc/nginx/sites-enabled/maintenance
   sudo mv /tmp/globapay.bak /etc/nginx/sites-enabled/globapay
   sudo systemctl reload nginx
   ```

### Phase 3: Verification (10 minutes)

1. **Smoke tests**
   ```bash
   # Health check
   curl https://your-domain.com/api/health
   
   # Login test
   curl -X POST https://your-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"ops_agent_1","password":"Employee!234"}'
   ```

2. **Monitor logs**
   ```bash
   # Check application logs
   pm2 logs globapay-backend
   
   # Check for errors
   pm2 logs globapay-backend --err
   
   # Check system logs
   sudo journalctl -u globapay-backend -n 50
   ```

3. **Database verification**
   ```bash
   # Connect to database
   mysql -u root -p payment_portal
   
   # Check migration history
   SELECT * FROM migrations_history ORDER BY timestamp DESC LIMIT 5;
   
   # Verify critical tables
   SHOW TABLES;
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM transactions;
   ```

4. **Manual testing**
   - Login as customer
   - Create a test transaction
   - Login as employee
   - Verify pending transactions visible
   - Check all critical features

---

## Rollback Procedures

### Immediate Rollback (Critical Issues)

If critical issues are discovered:

1. **Revert last migration**
   ```bash
   cd /path/to/app_backend
   npm run migration:revert
   ```

2. **Checkout previous version**
   ```bash
   git checkout <previous-stable-tag>
   npm install
   npm run build
   ```

3. **Restart services**
   ```bash
   pm2 restart globapay-backend
   ```

4. **Verify rollback**
   ```bash
   curl https://your-domain.com/api/health
   npm run migration:show
   ```

### Full Database Restore (Data Corruption)

If data corruption occurs:

1. **Stop the application**
   ```bash
   pm2 stop globapay-backend
   ```

2. **Restore from backup**
   ```bash
   # Create backup of corrupted database
   mysqldump -u root -p payment_portal > corrupted_$(date +%Y%m%d_%H%M%S).sql
   
   # Drop and recreate database
   mysql -u root -p -e "DROP DATABASE payment_portal; CREATE DATABASE payment_portal;"
   
   # Restore from backup
   mysql -u root -p payment_portal < backup_YYYYMMDD_HHMMSS.sql
   ```

3. **Checkout previous version**
   ```bash
   git checkout <previous-stable-tag>
   npm install
   npm run build
   ```

4. **Restart services**
   ```bash
   pm2 restart globapay-backend
   ```

---

## Zero-Downtime Deployment

For critical production systems that cannot have downtime:

### Strategy 1: Blue-Green Deployment

1. **Set up second environment** (Green)
   - Clone production database to staging
   - Deploy new version to Green environment
   - Run migrations on staging database

2. **Validate Green environment**
   - Run comprehensive tests
   - Verify all features work

3. **Switch traffic**
   - Update load balancer to point to Green
   - Monitor for issues

4. **Keep Blue running**
   - Keep old version running for quick rollback
   - Shut down after verification period

### Strategy 2: Read-Replica Migration

For migrations that don't require immediate data changes:

1. **Run migrations on read replica**
   ```bash
   # On read replica
   npm run migration:run
   ```

2. **Verify replica health**
   ```bash
   # Check replication status
   SHOW SLAVE STATUS\G
   ```

3. **Promote replica to master**
   ```bash
   # Stop writes to old master
   # Promote replica
   # Update application connection strings
   ```

---

## Migration-Specific Considerations

### Migrations That Add Columns

✅ **Safe**: Adding nullable columns
```sql
ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL;
```

⚠️ **Risky**: Adding NOT NULL columns without defaults
```sql
-- Better approach:
ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL;
UPDATE users SET email = CONCAT(username, '@example.com') WHERE email IS NULL;
ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NOT NULL;
```

### Migrations That Modify Columns

⚠️ **Risky**: Type changes that might lose data
```sql
-- Check data first!
SELECT MAX(LENGTH(description)) FROM transactions;

-- Then modify if safe
ALTER TABLE transactions MODIFY COLUMN description VARCHAR(1000);
```

### Large Data Migrations

For tables with millions of rows:

```sql
-- Use batching to avoid locking
UPDATE transactions 
SET status = 'completed' 
WHERE status = 'success' 
LIMIT 10000;

-- Run multiple times until affected rows = 0
```

### Index Creation

⚠️ **Warning**: Can lock tables on large datasets

```sql
-- Use ALGORITHM=INPLACE, LOCK=NONE for MySQL 5.6+
ALTER TABLE transactions 
ADD INDEX idx_status (status) 
ALGORITHM=INPLACE, LOCK=NONE;
```

---

## Monitoring Post-Deployment

### Key Metrics to Watch

1. **Application Health**
   - Response times
   - Error rates
   - Active connections

2. **Database Performance**
   - Query execution times
   - Connection pool utilization
   - Disk I/O

3. **Business Metrics**
   - Transaction success rate
   - Login success rate
   - API endpoint usage

### Alerting

Set up alerts for:
- Error rate > 1%
- Response time > 2 seconds
- Database connections > 80% of pool
- Disk space < 20%

---

## Post-Deployment Tasks

### Immediate (Within 1 hour)

- [ ] Verify all smoke tests pass
- [ ] Check error logs
- [ ] Monitor key metrics
- [ ] Confirm with stakeholders

### Short-term (Within 24 hours)

- [ ] Review full day of logs
- [ ] Analyze performance metrics
- [ ] Gather user feedback
- [ ] Update documentation

### Long-term (Within 1 week)

- [ ] Delete old backups (keep last 30 days)
- [ ] Review and optimize slow queries
- [ ] Plan next deployment improvements
- [ ] Conduct post-mortem if issues occurred

---

## Emergency Contacts

Document key contacts for production issues:

- **Database Administrator**: [Contact]
- **DevOps Lead**: [Contact]
- **On-Call Engineer**: [Contact]
- **Product Manager**: [Contact]

---

## Deployment Script Template

Create `scripts/deploy-production.sh`:

```bash
#!/bin/bash
set -e

echo "=========================================="
echo "  GloBaPay Production Deployment"
echo "=========================================="
echo ""

# Configuration
BACKUP_DIR="/backups/payment_portal"
APP_DIR="/var/www/GloBaPay"
VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./deploy-production.sh <version-tag>"
    exit 1
fi

echo "Deploying version: $VERSION"
echo ""

# Step 1: Backup
echo "Step 1: Creating backup..."
mkdir -p $BACKUP_DIR
mysqldump -u root -p payment_portal > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql
echo "✓ Backup created"
echo ""

# Step 2: Pull code
echo "Step 2: Pulling code..."
cd $APP_DIR
git fetch --all
git checkout $VERSION
cd app_backend
npm install --production
echo "✓ Code updated"
echo ""

# Step 3: Run migrations
echo "Step 3: Running migrations..."
npm run migration:run
echo "✓ Migrations completed"
echo ""

# Step 4: Build
echo "Step 4: Building application..."
npm run build
echo "✓ Build completed"
echo ""

# Step 5: Restart
echo "Step 5: Restarting services..."
pm2 restart globapay-backend
echo "✓ Services restarted"
echo ""

# Step 6: Health check
echo "Step 6: Running health check..."
sleep 5
curl -f https://localhost:5000/api/health || {
    echo "✗ Health check failed! Rolling back..."
    npm run migration:revert
    git checkout main
    npm run build
    pm2 restart globapay-backend
    exit 1
}
echo "✓ Health check passed"
echo ""

echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Monitor logs: pm2 logs globapay-backend"
echo "2. Check metrics dashboard"
echo "3. Perform manual smoke tests"
echo ""
```

---

## Additional Resources

- [Migration Guide](./MIGRATIONS.md)
- [Quick Reference](./MIGRATION-QUICK-REFERENCE.md)
- [TypeORM Documentation](https://typeorm.io/migrations)

---

**Remember**: Always test in staging first, always have a backup, always have a rollback plan!

