# Backup and Restore Guide

## Current Working Version Backup

A complete backup of the working version (with fixed date handling) has been created:

- **Tag**: `v1.0-working-dates` (Created June 8, 2025)
- **Backup Branch**: `backup-working-dates`
- **Commit Hash**: `b3cb00b`

## How to Restore to This Working Version

### Option 1: Restore from Tag (Recommended)
```bash
# Reset to the tagged version
git fetch --tags
git checkout v1.0-working-dates
git checkout -b restored-from-backup
git push origin restored-from-backup --force
```

### Option 2: Restore from Backup Branch
```bash
# Switch to the backup branch
git checkout backup-working-dates
git checkout -b main-restored
git push origin main-restored:main --force
```

### Option 3: Hard Reset Main Branch
```bash
# CAUTION: This will overwrite main completely
git checkout main
git reset --hard v1.0-working-dates
git push origin main --force
```

## View Backup Information

### See the backup tag details:
```bash
git show v1.0-working-dates
```

### See the backup branch:
```bash
git checkout backup-working-dates
```

### See the exact commit:
```bash
git show b3cb00b
```

## What's Included in This Backup

- ✅ Fixed date handling with UTC utilities
- ✅ Working booking/unbooking functionality
- ✅ Calendar displays starting with first full week
- ✅ Golfer management system
- ✅ All database migrations
- ✅ Documentation and test scripts

## Important Notes

1. **Never delete** the `v1.0-working-dates` tag or `backup-working-dates` branch
2. The tag is immutable - it will always point to this exact version
3. The backup branch should not be modified
4. If you need to experiment, create a new branch from the backup

## Emergency Recovery

If everything breaks and you need to get back to this working version immediately:

```bash
# Nuclear option - complete reset
git fetch --all
git checkout main
git reset --hard v1.0-working-dates
git push origin main --force
vercel --prod  # Redeploy to production
``` 