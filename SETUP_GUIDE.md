# Expense Tracker - Setup Guide

## Quick Start

### 1. Prerequisites
- PHP 7.4 or higher
- Composer
- Supabase Account (free at supabase.com)
- Web browser

### 2. Clone/Download Project
```bash
cd "d:\Expense Tracker"
```

### 3. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name and region
4. Create a strong password for the database
5. Wait for project creation (about 2 minutes)

### 4. Get Supabase Credentials
From Supabase Dashboard:
1. Click "Settings" (bottom left)
2. Click "API"
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`
   - **service_role secret** → `SUPABASE_JWT_SECRET`

### 5. Configure Environment
```bash
# Copy template
copy .env.example .env

# Edit .env with your credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### 6. Set Up Database

In Supabase Dashboard:
1. Click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Copy ALL SQL from `DATABASE_SCHEMA.md`
4. Paste into the editor
5. Click "Run" button
6. Wait for all statements to execute (should see green checkmarks)

### 7. Configure CORS

In Supabase:
1. Go to Settings → API
2. Find "CORS" section
3. Add your local URL: `http://localhost:8000`
4. Click "Add"

### 8. Install Dependencies
```bash
composer install
```

### 9. Start Development Server

**Option A: PHP Built-in (Recommended)**
```bash
cd public
php -S localhost:8000
```

**Option B: Use PowerShell Script**
```powershell
cd public
php -S localhost:8000
```

**Option C: Visual Studio Code**
- Install "Live Server" extension
- Right-click `public/index.html`
- Select "Open with Live Server"

### 10. Open Application
```
http://localhost:8000
```

### 11. Create Account
1. Click "Register" tab
2. Enter email, name, password (min 8 characters)
3. Click "Register"
4. You're automatically logged in!

### 12. Start Using
- Go to Transactions to add your first transaction
- Create categories
- Set monthly budgets
- View reports and charts

## Troubleshooting

### PHP Not Found
```bash
# Add PHP to PATH or use full path
"C:\Program Files\PHP\php.exe" -S localhost:8000
```

### Composer Not Found
Download from: https://getcomposer.org/download/

### CORS Error
- Check `SUPABASE_URL` is correct in `.env`
- Verify you added `http://localhost:8000` to CORS in Supabase
- Wait 30 seconds for settings to apply

### Database Error
- Check SQL schema was fully executed
- Verify table names in Supabase match schema
- Try running schema again

### Login Issues
- Clear browser cookies (Ctrl+Shift+Delete)
- Check password is at least 8 characters
- Verify user was created in Supabase `users` table

## File Locations

```
d:\Expense Tracker\
├── public/              ← Open http://localhost:8000 (frontend)
├── api/                 ← Backend PHP APIs
├── config/              ← Database and CORS config
├── .env                 ← Your credentials (KEEP SECRET)
├── .env.example         ← Template (safe to share)
├── composer.json        ← PHP dependencies
├── DATABASE_SCHEMA.md   ← SQL schema
├── README.md            ← Full documentation
└── setup.bat            ← Windows setup script
```

## Development Tips

### Hot Reload
PHP built-in server doesn't auto-reload. Just refresh the browser (F5).

### View Logs
Check browser console (F12 → Console tab) for JavaScript errors.

### Database Debugging
Use Supabase dashboard to view tables and data:
- Click "SQL Editor"
- Run: `SELECT * FROM transactions LIMIT 10;`

### API Testing
Test endpoints with curl:
```bash
curl -X GET http://localhost:8000/api/auth.php?action=check \
  -H "Content-Type: application/json"
```

## Security Notes

- **.env file is SECRET** - Never commit to git
- Passwords are hashed with bcrypt
- All data is isolated per user
- Enable RLS (Row Level Security) in Supabase
- Never hardcode credentials in code

## Performance Tips

- Database indexes are included in schema
- APIs support pagination (limit/offset)
- Charts load only when needed
- Consider caching for monthly reports

## Next Steps

1. ✅ Application is running
2. 📚 Read full [README.md](README.md)
3. 🗄️ Review [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
4. 🚀 Deploy to Heroku or traditional hosting
5. 📊 Customize for your needs

## Support

- Check troubleshooting section above
- Review API documentation in README.md
- Check browser console for errors (F12)
- Verify Supabase credentials

Happy expense tracking! 💰📊
