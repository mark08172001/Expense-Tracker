# Expense Tracker - Quick Reference Guide

## Application Overview

### What It Does
- Tracks personal income and expenses
- Categorizes transactions
- Monitors monthly budgets
- Generates financial reports
- Visualizes spending patterns

### Key Pages

| Page | Purpose | Features |
|------|---------|----------|
| **Login** | Authentication | Register, Login, Session Management |
| **Dashboard** | Overview | Total income/expenses, Recent transactions, Charts |
| **Transactions** | CRUD | Add, Edit, Delete, Filter, Export |
| **Categories** | Organization | Create custom categories with icons |
| **Budgets** | Planning | Set monthly limits, Track spending |
| **Reports** | Analysis | Monthly trends, Yearly comparison, Category trends |
| **Profile** | Settings | Update info, Change password, Preferences |

## User Workflows

### Adding a Transaction
1. Go to Transactions page
2. Click "+ New Transaction"
3. Fill form:
   - Amount (required)
   - Type (Income/Expense)
   - Category (pick from list)
   - Date (when it happened)
   - Payment method (optional)
   - Notes (optional)
4. Click "Add Transaction"

### Creating a Budget
1. Go to Budgets page
2. Click "+ New Budget"
3. Select category (only expenses)
4. Enter monthly limit (e.g., $500)
5. Select month
6. Click "Create Budget"
7. Spending tracked automatically

### Viewing Reports
1. Go to Reports page
2. Select month to analyze
3. View three chart types:
   - Monthly Analysis (current month breakdown)
   - Yearly Comparison (income vs expenses by year)
   - Category Trends (one category over 12 months)

## API Quick Reference

### Making Requests
All requests go to `/api/[endpoint].php?action=[action]`

Example:
```
POST /api/transactions.php?action=create
Headers: Content-Type: application/json
Body: {
  "amount": 50.00,
  "type": "expense",
  "categoryId": 1,
  "date": "2024-01-15"
}
```

### Response Format
Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

Error:
```json
{
  "error": "Error message",
  "code": 400
}
```

## Database Quick Reference

### Users Table
- `id` - Primary key
- `email` - Unique login
- `full_name` - Display name
- `password_hash` - Bcrypt hashed password
- `created_at` - Registration date

### Categories Table
- `id` - Primary key
- `user_id` - Owner
- `name` - Category name
- `type` - "income" or "expense"
- `icon` - Emoji icon

### Transactions Table
- `id` - Primary key
- `user_id` - Owner
- `category_id` - Foreign key
- `amount` - Numeric value
- `transaction_type` - "income" or "expense"
- `payment_method` - How it was paid
- `transaction_date` - When it happened
- `notes` - Description

### Budgets Table
- `id` - Primary key
- `user_id` - Owner
- `category_id` - Which category
- `monthly_limit` - Budget amount
- `month` - "YYYY-MM" format

## Frontend File Structure

```
js/
├── api.js           - All API calls
├── auth.js          - User authentication
├── utils.js         - Helper functions
├── dashboard.js     - Dashboard logic
├── transactions.js  - Transaction page
├── categories.js    - Category page
├── budgets.js       - Budget page
├── reports.js       - Reports page
└── profile.js       - Profile page
```

## Important Functions

### API Module
```javascript
API.auth.login(email, password)
API.transactions.create(data)
API.transactions.list(filters)
API.categories.list(type)
API.budgets.list(month)
API.reports.dashboard(month)
```

### Utils Module
```javascript
Utils.formatCurrency(amount)
Utils.formatDate(date, format)
Utils.showToast(message, type)
Utils.toggleDarkMode()
Utils.getMonthDateRange()
```

### Auth Module
```javascript
Auth.init()
Auth.login(email, password)
Auth.logout()
Auth.isAuthenticated()
Auth.getUser()
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Login not working** | Clear cookies, check password (8+ chars) |
| **Can't see transactions** | Check start/end dates in filters |
| **CORS errors** | Add domain to Supabase CORS settings |
| **Charts not showing** | Check browser console for errors |
| **Budget not updating** | Refresh page after adding transaction |

## Performance Metrics

- Page load: < 2s
- API response: < 500ms
- Dashboard render: < 1s
- Chart generation: < 2s

## Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ HTTPS ready (use with SSL in production)
- ✅ SQL injection protected (parameterized)
- ✅ XSS protected (HTML escaped)
- ✅ CSRF tokens ready for forms
- ✅ Session isolation per user
- ✅ Row Level Security enabled

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate form fields |
| `Enter` | Submit form |
| `Escape` | Close modal |
| `F12` | Open developer tools |

## Development Commands

```bash
# Install dependencies
composer install

# Start development server
cd public && php -S localhost:8000

# View PHP version
php -v

# Check Composer version
composer --version
```

## Environment Variables

```env
SUPABASE_URL=        # Your project URL
SUPABASE_KEY=        # Anon public key
SUPABASE_JWT_SECRET= # Service role secret
APP_ENV=             # development or production
APP_DEBUG=           # true or false
SESSION_TIMEOUT=     # Seconds (default 3600)
```

## Deployment Checklist

- [ ] Update `.env` with production credentials
- [ ] Set `APP_DEBUG=false`
- [ ] Set `APP_ENV=production`
- [ ] Configure SSL certificate
- [ ] Update CORS settings
- [ ] Test all features
- [ ] Backup database
- [ ] Set up monitoring
- [ ] Document custom changes

## Future Enhancement Ideas

- [ ] Email notifications for budget alerts
- [ ] Recurring transactions
- [ ] Receipt image uploads
- [ ] Savings goals
- [ ] Multiple wallets
- [ ] Transaction templates
- [ ] Financial forecasting
- [ ] Mobile app
- [ ] Two-factor authentication
- [ ] Data import/export

## Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [PHP Manual](https://www.php.net/manual/)
- [Chart.js Docs](https://www.chartjs.org/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [REST API Best Practices](https://restfulapi.net/)

## Getting Help

1. Check browser console (F12)
2. Check PHP error log
3. Review documentation in README.md
4. Check Supabase dashboard
5. Verify .env configuration

---

Last Updated: 2024
Version: 1.0
