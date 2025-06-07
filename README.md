# TeeUp - Golf Tee Time Booking App ⛳

A simple, mobile-first web application for coordinating golf tee times with friends. No authentication required - just enter your name and start booking!

## Features

- 📅 **4-Week Calendar View** - See current week plus next 3 weeks
- 👥 **Up to 8 Golfers per Day** - First come, first served
- 📱 **Mobile-First Design** - Swipe between weeks, tap to book
- 💾 **Offline Support** - Works without internet, syncs when connected
- 🚀 **Real-time Updates** - See when others sign up instantly
- 🔐 **No Login Required** - Just use your first name and last initial

## Tech Stack

- **Frontend**: Next.js 14+, React 18+, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand with persistence
- **PWA**: Progressive Web App with offline support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   cd teeup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your database**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/teeup?schema=public"
   ```
   
   Replace with your actual database credentials. You can use:
   - Local PostgreSQL installation
   - [Supabase](https://supabase.com) (free tier available)
   - [Vercel Postgres](https://vercel.com/postgres)
   - [Neon](https://neon.tech) (free tier available)

4. **Run database migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

## Database Setup Options

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database: `createdb teeup`
3. Use the connection string format above

### Option 2: Supabase (Recommended for beginners)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use the "Direct connection" one)
5. Replace `[YOUR-PASSWORD]` with your database password

### Option 3: Vercel Postgres

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel link` to connect your project
3. Run `vercel env pull` to get environment variables
4. The DATABASE_URL will be automatically added

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your project on [Vercel](https://vercel.com)
3. Add your `DATABASE_URL` environment variable
4. Deploy!

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Usage

1. **First Visit**: Enter your first name and last initial (e.g., "John S")
2. **Book Tee Times**: Tap any available day to sign up
3. **Cancel Booking**: Tap a day you're signed up for to cancel
4. **Navigate Weeks**: Swipe left/right or use arrow buttons
5. **View Participants**: See who else is signed up for each day

## Troubleshooting

### Common Issues

1. **"Cannot connect to database"**
   - Check your DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify your credentials

2. **"Prisma Client not generated"**
   - Run `npx prisma generate`

3. **"Maximum golfers reached"**
   - The app limits to 8 unique golfers total
   - Use an existing name/initial combination

4. **Offline mode not working**
   - Ensure you've visited the site once while online
   - Check if service workers are enabled in your browser

## Development

### Useful Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio to view/edit data
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Project Structure

```
teeup/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── page.tsx          # Main page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── Calendar.tsx      # Main calendar view
│   ├── DayCard.tsx       # Individual day component
│   ├── GolferBadge.tsx   # Name display component
│   └── NameInput.tsx     # User identification form
├── lib/                   # Utilities and helpers
│   ├── prisma.ts         # Prisma client singleton
│   ├── store.ts          # Zustand store
│   └── utils.ts          # Helper functions
├── prisma/               # Database files
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Seed data
└── public/               # Static files
    └── manifest.json     # PWA manifest
```

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT License - feel free to use this for your own golf group!

---

Made with ❤️ for golfers who just want to play
