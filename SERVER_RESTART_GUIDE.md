# Server Restart Guide for TeeUp

## Quick Start

1. **Navigate to the correct directory:**
   ```bash
   cd /Users/erniefernandez/Library/Mobile\ Documents/com~apple~CloudDocs/EF\ Coding\ Playground/TeeUp/teeup
   ```
   Or if you're in the TeeUp root directory:
   ```bash
   cd teeup
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Local: http://localhost:3000
   - Network: Check the terminal output for the network URL

## Common Issues and Solutions

### Issue: "localhost refused to connect"
This means the server isn't running. Follow these steps:

1. **Check current directory:**
   ```bash
   pwd
   ```
   Should show: `.../TeeUp/teeup` (NOT just `.../TeeUp`)

2. **Kill any existing processes on port 3000:**
   ```bash
   lsof -i :3000
   ```
   If something is running:
   ```bash
   kill -9 <PID>
   ```

3. **Restart the server:**
   ```bash
   npm run dev
   ```

### Issue: "vite: command not found"
You're in the wrong directory. The project uses Next.js, not Vite.
- Make sure you're in the `teeup` subdirectory, not the parent TeeUp directory

### Issue: Server crashes or stops
1. Press `Ctrl+C` to stop the server completely
2. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```
3. Restart:
   ```bash
   npm run dev
   ```

## Verifying Server is Running

After starting the server, you should see:
```
▲ Next.js 15.3.3 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
- Environments: .env

✓ Starting...
✓ Ready in XXXms
```

## Quick Commands Reference

```bash
# From anywhere, navigate and start server
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/EF\ Coding\ Playground/TeeUp/teeup && npm run dev

# Check if server is running
curl -I http://localhost:3000

# Find and kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Full restart sequence
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/EF\ Coding\ Playground/TeeUp/teeup
rm -rf .next
npm run dev
```

## Environment Variables
Make sure you have a `.env` file in the `teeup` directory with:
- `DATABASE_URL` - Your Supabase connection string
- `DIRECT_URL` - Direct database connection (if using Supabase)

## Tips
- Always ensure you're in the `teeup` subdirectory, not the parent directory
- The server runs on port 3000 by default
- Use `Ctrl+C` to stop the server cleanly
- Check the terminal output for any error messages 