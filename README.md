# Expense Tracker - Professional Finance Management Application

A modern, full-stack Personal Expense Tracker web application built with PHP, JavaScript, and Supabase PostgreSQL. Designed for easy integration into a professional developer portfolio.

## 🎯 Features

### Core Features
- ✅ **User Authentication** - Secure registration, login, and session management
- ✅ **Dashboard** - Real-time financial overview with metrics and charts
- ✅ **Transaction Management** - Complete CRUD operations with filtering and search
- ✅ **Category Management** - Custom income/expense categories with icons
- ✅ **Budget Tracking** - Monthly budget limits with spending progress
- ✅ **Financial Reports** - Interactive charts and yearly summaries
- ✅ **Data Export** - Download transactions as CSV
- ✅ **Dark Mode** - Beautiful dark theme support
- ✅ **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

### Advanced Features
- Multiple payment method tracking (cash, credit card, debit, bank transfer, digital wallet)
- Transaction notes and descriptions
- Monthly and yearly financial analysis
- Category spending trends visualization
- Budget warning system for overspending
- User profile and preference management

## 🛠️ Tech Stack

### Backend
- **PHP 7.4+** - Server-side logic and API endpoints
- **Supabase PostgreSQL** - Cloud database with built-in auth and RLS
- **CORS Enabled** - Secure cross-origin requests

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern responsive design with Flexbox/Grid
- **Vanilla JavaScript (ES6+)** - No external JS framework dependencies
- **Chart.js** - Interactive financial charts

### Database
- **Supabase PostgreSQL** - Managed database with authentication
- **Row Level Security** - Ensure data isolation
- **Proper Indexing** - Optimized queries for performance

## 📋 Prerequisites

1. **Supabase Account** - Free tier available at [supabase.com](https://supabase.com)
2. **PHP 7.4 or higher** - With cURL support
3. **Composer** - For PHP package management
4. **Node.js/npm** - Optional, for local development server

## 🚀 Installation

### 1. Clone or Download

```bash
cd "d:\Expense Tracker"
```

### 2. Install PHP Dependencies

```bash
composer install
```

If you don't have Composer installed, download it from [getcomposer.org](https://getcomposer.org).

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your Supabase credentials:

```bash
# Windows
copy .env.example .env
```

Edit `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

APP_ENV=development
APP_DEBUG=true
SESSION_TIMEOUT=3600
```

Get your Supabase credentials from:
- **SUPABASE_URL** - Settings → API → URL
- **SUPABASE_KEY** - Settings → API → anon public

### 4. Set Up Database

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the schema from `DATABASE_SCHEMA.md`
4. Run all SQL statements

### 5. Configure CORS (Supabase)

In Supabase:
1. Go to Settings → API → CORS
2. Add your local development URL (e.g., `http://localhost:8000`)

### 6. Start Local Development Server

#### Option A: PHP Built-in Server
```bash
cd public
php -S localhost:8000
```

#### Option B: Live Server Extension (VS Code)
1. Install "Live Server" extension
2. Right-click `public/index.html`
3. Select "Open with Live Server"

#### Option C: Apache/Nginx
Configure your web server to point to the `public` folder.

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:8000
```

## 📁 Project Structure

```
expense-tracker/
├── public/                    # Frontend files (served to browser)
│   ├── index.html            # Login/Register page
│   ├── dashboard.html        # Main dashboard
│   ├── transactions.html     # Transaction management
│   ├── categories.html       # Category management
│   ├── budgets.html          # Budget tracking
│   ├── reports.html          # Financial reports
│   ├── profile.html          # User profile
│   ├── css/
│   │   └── styles.css        # Responsive styling
│   └── js/
│       ├── api.js            # API client module
│       ├── auth.js           # Authentication module
│       ├── utils.js          # Utility functions
│       ├── dashboard.js      # Dashboard page logic
│       ├── transactions.js   # Transactions page logic
│       ├── categories.js     # Categories page logic
│       ├── budgets.js        # Budgets page logic
│       ├── reports.js        # Reports page logic
│       └── profile.js        # Profile page logic
├── api/                      # Backend API endpoints
│   ├── auth.php             # Authentication endpoints
│   ├── transactions.php     # Transaction CRUD
│   ├── categories.php       # Category CRUD
│   ├── budgets.php          # Budget CRUD
│   └── reports.php          # Reports/Analytics
├── config/                   # Configuration files
│   ├── cors.php             # CORS and security headers
│   └── db.php               # Database connection
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Environment template
├── composer.json             # PHP dependencies
├── DATABASE_SCHEMA.md        # Database schema documentation
└── README.md                 # This file
```

## 🔐 Security Features

- **Password Hashing** - bcrypt algorithm for secure password storage
- **Input Validation** - All user inputs validated and sanitized
- **SQL Injection Prevention** - Parameterized queries via Supabase API
- **XSS Protection** - HTML escaping and Content Security Headers
- **CORS Protection** - Restricted cross-origin access
- **Row Level Security** - Database-level data isolation
- **Session Management** - Secure session handling
- **HTTPS Ready** - Works with SSL/TLS encryption

## 📊 API Documentation

### Authentication Endpoints
```
POST   /api/auth.php?action=register   - Register new user
POST   /api/auth.php?action=login      - Login user
POST   /api/auth.php?action=logout     - Logout user
GET    /api/auth.php?action=profile    - Get user profile
PUT    /api/auth.php?action=profile    - Update user profile
GET    /api/auth.php?action=check      - Check authentication status
```

### Transaction Endpoints
```
POST   /api/transactions.php?action=create     - Create transaction
GET    /api/transactions.php?action=list       - List transactions
GET    /api/transactions.php?action=get&id=X  - Get transaction
PATCH  /api/transactions.php?action=update&id=X - Update transaction
DELETE /api/transactions.php?action=delete&id=X - Delete transaction
```

### Category Endpoints
```
GET    /api/categories.php?action=list         - List categories
POST   /api/categories.php?action=create       - Create category
PATCH  /api/categories.php?action=update&id=X - Update category
DELETE /api/categories.php?action=delete&id=X - Delete category
```

### Budget Endpoints
```
GET    /api/budgets.php?action=list            - List budgets
POST   /api/budgets.php?action=create          - Create budget
PATCH  /api/budgets.php?action=update&id=X    - Update budget
DELETE /api/budgets.php?action=delete&id=X    - Delete budget
```

### Reports Endpoints
```
GET    /api/reports.php?action=dashboard       - Dashboard metrics
GET    /api/reports.php?action=monthly         - Monthly analysis
GET    /api/reports.php?action=yearly          - Yearly comparison
GET    /api/reports.php?action=category-trends - Category trends
```

## 🎨 UI/UX Highlights

- **Responsive Design** - Adapts to all screen sizes
- **Modern Color Scheme** - Professional indigo/pink palette
- **Dark Mode** - Built-in dark theme toggle
- **Toast Notifications** - Non-intrusive user feedback
- **Modal Forms** - Clean form interactions
- **Data Visualization** - Chart.js powered analytics
- **Loading States** - Spinner feedback during operations
- **Keyboard Accessible** - Full keyboard navigation support

## 🧪 Testing

### Manual Testing Checklist
- [ ] Register new account
- [ ] Login with credentials
- [ ] Update profile information
- [ ] Create income/expense transaction
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Filter transactions by date range
- [ ] Filter transactions by category
- [ ] Create custom category
- [ ] Create budget
- [ ] Verify budget progress indicator
- [ ] View dashboard metrics
- [ ] View monthly chart
- [ ] View yearly report
- [ ] Export transactions as CSV
- [ ] Toggle dark mode
- [ ] Test mobile responsiveness
- [ ] Logout

## 🚀 Deployment

### Deploy to Heroku

1. Create `Procfile`:
```
web: vendor/bin/heroku-php-apache2 public/
```

2. Push to Heroku:
```bash
git init
git add .
git commit -m "Initial commit"
heroku create your-app-name
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_KEY=your-key
git push heroku main
```

### Deploy to Traditional Hosting

1. Upload files to web server
2. Set up PHP with cURL extension
3. Create `.env` file with Supabase credentials
4. Ensure `public` folder is the document root
5. Enable CORS in Supabase for your domain

### Environment for Production

```env
APP_ENV=production
APP_DEBUG=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## 📈 Performance Optimizations

- **Database Indexing** - Optimized queries with proper indexes
- **Lazy Loading** - Data loaded on demand
- **Caching** - Browser caching for static assets
- **Minification Ready** - CSS/JS can be minified for production
- **Pagination Support** - Transaction list pagination ready
- **Debounced Filters** - Prevents excessive API calls

## 🐛 Troubleshooting

### CORS Errors
- Verify `SUPABASE_URL` in `.env`
- Add your domain to Supabase CORS settings
- Check browser console for exact error

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check internet connection
- Ensure Supabase project is active
- Check table names match schema

### Session/Login Issues
- Clear browser cookies and cache
- Check PHP session settings
- Verify password meets 8-character minimum

### Chart Display Issues
- Ensure Chart.js CDN is accessible
- Check browser console for JavaScript errors
- Verify chart canvas elements exist

## 📚 Learning Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PHP Official Docs](https://www.php.net/docs.php)
- [Chart.js Docs](https://www.chartjs.org/docs/latest/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 💡 Future Enhancements

- Receipt image uploads
- Recurring transactions
- Savings goals
- Multiple wallets/accounts
- Spending streaks
- AI-powered financial insights
- Mobile app version
- Two-factor authentication
- Data backup/restore
- Budget notifications

## 📜 License

This project is provided as-is for educational and portfolio purposes.

## 👨‍💻 Author

Built as a demonstration of full-stack development skills.

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API Documentation
3. Check browser console for errors
4. Verify database schema is correct

---

**Happy tracking!** 💰📊
