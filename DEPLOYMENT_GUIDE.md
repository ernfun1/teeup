# TeeUp Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `teeup` (or your choice)
3. Keep it **Public** or **Private** (your choice)
4. **DON'T** initialize with README, .gitignore, or license
5. Click "Create repository"
6. Copy the repository URL (looks like: `https://github.com/yourusername/teeup.git`)

### 2. Connect Your Local Repository to GitHub
Run these commands in your terminal (replace with YOUR repository URL):

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/teeup.git

# Push your code to GitHub
git push -u origin main
```

### 3. Deploy to Vercel
Since your project is already linked to Vercel, you have two options:

#### Option A: Deploy via Vercel CLI (Recommended)
```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy to production
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Your project should appear there
3. Connect it to your new GitHub repository
4. Vercel will auto-deploy on every push!

### 4. Environment Variables on Vercel
**IMPORTANT**: Add your environment variables in Vercel:

1. Go to your project on Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:
   ```
   DATABASE_URL=your_supabase_database_url_with_pgbouncer=true
   DIRECT_URL=your_supabase_direct_url (optional)
   ```

### 5. Update Your Database URL
Make sure your `DATABASE_URL` includes `?pgbouncer=true` at the end:
```
postgresql://...supabase.com:6543/postgres?pgbouncer=true
```

## 🎉 That's it!
Your app will be live at:
- Production: `https://teeup.vercel.app` (or your custom domain)
- Preview deployments on every PR

## 📝 After Deployment Checklist
- [ ] Test adding a golfer
- [ ] Test booking tee times
- [ ] Check the calendar view
- [ ] Test offline functionality
- [ ] Verify auto-save is working

## 🔧 Troubleshooting
1. **Database errors**: Make sure `?pgbouncer=true` is in your DATABASE_URL
2. **Build errors**: Check Vercel logs in the dashboard
3. **Missing golfers**: Run the add-golfers script or use Prisma Studio

## 📱 Share Your App!
Once deployed, share the URL with your golf group and start booking tee times! 