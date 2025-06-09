# Safe Development Guide for TeeUp

## 🔒 Current Working Versions (Backups)

- **v1.1-calendar-fixed** - Latest working version (June 8, 2025) ✅
- **v1.0-working-dates** - Previous working version

## 🛡️ Before Making ANY Changes

### Step 1: Always Create a Feature Branch
```bash
# Replace "my-new-feature" with a descriptive name
git checkout -b my-new-feature
```

### Step 2: Verify You're NOT on Main
```bash
git branch --show-current
# Should show "my-new-feature" NOT "main"
```

## 🚀 Making Changes Safely

1. **Make your changes on the feature branch**
2. **Test locally** at http://localhost:3000
3. **Commit often** with descriptive messages:
   ```bash
   git add -A
   git commit -m "Add feature: description of what you did"
   ```

## ✅ If Changes Work

### Merge to Main
```bash
# First, switch to main
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature
git merge my-new-feature

# Push to GitHub
git push origin main
```

## ❌ If Changes Break Something

### Option 1: Abandon Changes (Easy)
```bash
# Switch back to main
git checkout main

# Delete the broken branch
git branch -D my-new-feature
```

### Option 2: Emergency Reset to Working Version
```bash
# Make sure you're on main
git checkout main

# Reset to the last working version
git reset --hard v1.1-calendar-fixed

# Force push to GitHub (only if you pushed broken code)
git push origin main --force
```

## 📱 Quick Commands Cheat Sheet

### Check Current Status
```bash
git status                    # See what's changed
git branch --show-current     # See which branch you're on
```

### Create Backup Before Big Changes
```bash
git tag -a backup-$(date +%Y%m%d-%H%M) -m "Backup before changes"
git push origin backup-$(date +%Y%m%d-%H%M)
```

### View All Backups
```bash
git tag -l                    # List all tags
```

### Restore from Specific Backup
```bash
git checkout v1.1-calendar-fixed    # Go to specific version
git checkout -b fix-from-backup     # Create new branch from it
```

## 🎯 Golden Rules

1. **NEVER work directly on main** - Always use branches
2. **Test locally first** - Don't push until it works
3. **Commit often** - Small commits are easier to undo
4. **Tag working versions** - Create backups of good states
5. **Don't panic** - Everything can be undone in Git

## 🆘 Emergency Contact

If something goes really wrong:
```bash
# This will show you the last 20 commits
git log --oneline -20

# Find the commit ID of the last working version
# Then reset to it:
git reset --hard <commit-id>
```

Remember: **v1.1-calendar-fixed** is your safe harbor! 