# Fix for Prepared Statement Error

You're experiencing a common issue with Prisma and Supabase's connection pooling (pgbouncer). 

## Quick Fix

1. Open your `.env` file in the `teeup` directory

2. Find your `DATABASE_URL` line. It should look something like:
   ```
   DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

3. Add `?pgbouncer=true` to the end of your DATABASE_URL:
   ```
   DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

4. Save the file

5. Restart your development server:
   ```bash
   # Stop the server (Ctrl+C) then:
   npm run dev
   ```

## Alternative Solution (If the above doesn't work)

If you have both DATABASE_URL and DIRECT_URL in your `.env`:

1. Temporarily swap them - use DIRECT_URL as your DATABASE_URL
2. The DIRECT_URL doesn't use pgbouncer, so it won't have this issue
3. Note: This is fine for development but use the pooled connection for production

## Why This Happens

- Supabase uses pgbouncer for connection pooling
- pgbouncer doesn't support prepared statements well
- Prisma uses prepared statements by default
- The `?pgbouncer=true` parameter tells Prisma to use simple queries instead 