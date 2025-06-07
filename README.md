# TeeUp - Smart Golf Tee Time Booking App ⛳

> **Last Updated**: June 7, 2025  
> A modern, intelligent web application for coordinating golf tee times with your group. Features real-time auto-save, offline support, and a beautiful mobile-first design.

## 🚀 What's New (June 2025)

- **Real-time Auto-Save**: Changes save automatically as you select dates - no more lost bookings!
- **Offline Support**: Works without internet and syncs when reconnected
- **Golfer Management**: Add, edit, and delete golfers directly from the home page
- **Performance Optimized**: Debounced updates and batched API calls for lightning-fast performance on Vercel
- **Improved UI**: Consistent, modern button styling throughout the app
- **Smart Sync**: Intelligent conflict resolution when multiple users book simultaneously

## ✨ Features

### Core Functionality
- 📅 **4-Week Calendar View** - See current week plus next 3 weeks
- 👥 **Up to 8 Golfers per Day** - First come, first served
- 🏌️ **50 Golfer Roster** - Manage up to 50 unique golfers
- 📱 **Mobile-First Design** - Swipe between weeks, tap to book
- ⚡ **Real-time Auto-Save** - No save button needed - changes persist instantly
- 🔄 **Offline Mode** - Continue booking even without internet
- 👤 **Easy Golfer Management** - Add, edit, or remove golfers with one click

### User Experience
- **No Login Required** - Simple name-based system
- **Instant Feedback** - See save status indicators as you make changes
- **Smart Debouncing** - Multiple quick selections are batched together
- **Conflict Prevention** - Real-time updates prevent double-booking
- **Beautiful Animations** - Smooth transitions and feedback

## 🛠 Tech Stack

- **Frontend**: Next.js 15.3, React 18+, TypeScript
- **Styling**: Tailwind CSS v4 with custom animations
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Deployment**: Optimized for Vercel with Edge Functions
- **State Management**: React hooks with optimistic updates
- **Performance**: Debounced updates, request batching, offline queue

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works great)

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/teeup.git
   cd teeup
   npm install
   ```

2. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Get your database URL from Settings → Database

3. **Configure environment**
   Create `.env` file:
   ```env
   DATABASE_URL="postgresql://...supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://...supabase.com:5432/postgres"
   ```
   
   ⚠️ **Important**: Add `?pgbouncer=true` to your DATABASE_URL!

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Add initial golfers** (optional)
   ```bash
   npx tsx scripts/add-golfers.ts
   ```

## 📱 Usage Guide

### For Golfers
1. **Find yourself** in the golfer list or add yourself with the "Add Golfer" button
2. **Click your name** to select days you want to play
3. **Check/uncheck days** - changes save automatically
4. **View calendar** with "This Week" button to see who's playing when

### For Administrators
1. **Add golfers**: Click "Add Golfer" and enter their details
2. **Edit golfers**: Click the pencil icon next to any name
3. **Remove golfers**: Click the trash icon (with confirmation)
4. **Monitor capacity**: See "X/50 golfers" at the bottom

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL` (with `?pgbouncer=true`)
     - `DIRECT_URL` (optional but recommended)

3. **Deploy!** 
   - Vercel will build and deploy automatically
   - Get your URL: `https://your-app.vercel.app`

### Database Configuration

For Supabase users, ensure your connection string includes:
```
?pgbouncer=true
```

This prevents "prepared statement already exists" errors.

## 🔧 Development

### Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start              # Start production server

# Database
npx prisma studio      # Visual database editor
npx prisma generate    # Regenerate Prisma client
npx prisma migrate dev # Create new migration

# Testing
npx tsx scripts/add-golfers.ts  # Add sample golfers
```

### Project Structure

```
teeup/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── golfers/      # Golfer CRUD endpoints
│   │   └── signups/      # Booking endpoints
│   ├── golfer/[id]/book/ # Individual booking page
│   ├── calendar/         # Weekly calendar view
│   └── page.tsx         # Home page with golfer list
├── components/           # React components
│   └── GolferModal.tsx  # Add/Edit golfer modal
├── lib/                 # Utilities
│   ├── prisma.ts       # Database client
│   └── utils.ts        # Date helpers
└── scripts/            # Utility scripts
    └── add-golfers.ts  # Sample data script
```

### Performance Optimizations

1. **Debounced Saves**: 500ms delay groups rapid changes
2. **Batch Processing**: Multiple selections save together
3. **Optimistic UI**: Instant feedback, rollback on error
4. **Offline Queue**: Changes saved locally until online
5. **Connection Pooling**: pgbouncer for Supabase efficiency

## 🐛 Troubleshooting

### Common Issues

**"Prepared statement already exists"**
- Ensure `?pgbouncer=true` is in your DATABASE_URL
- Restart your development server

**"Cannot add golfer"**
- Check if you've reached the 50 golfer limit
- Verify database connection

**"Changes not saving"**
- Check browser console for errors
- Ensure you're online (or wait for reconnection)
- Hard refresh (Cmd/Ctrl + Shift + R)

**"Offline mode not working"**
- Visit the site once while online first
- Check if localStorage is enabled

## 📈 Future Enhancements

- [ ] Email notifications for weekly lineups
- [ ] Handicap tracking
- [ ] Tee time preferences
- [ ] Group chat integration
- [ ] Weather integration
- [ ] Course selection

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Use freely for your golf group!

## 🙏 Acknowledgments

- Built with Next.js and Vercel
- Database by Supabase
- Icons by Heroicons
- Inspired by golfers who just want to know who's playing

---

**Made with ❤️ and ⛳ by golfers, for golfers**

*Questions? Issues? Create a GitHub issue or reach out!*
