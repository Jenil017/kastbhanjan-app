# Kastbhanjan Playwood Management System - Setup Guide

Complete setup instructions for the wooden scrap trading business management system.

## System Requirements

- Python 3.9+
- Node.js 18+
- PostgreSQL 12+

## Project Structure

```
/mnt/okcomputer/output/
├── kastbhanjan-backend/     # FastAPI Backend
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── database.py
│   ├── seed_data.py
│   ├── requirements.txt
│   ├── .env
│   └── routers/
│       ├── auth.py
│       ├── purchases.py
│       ├── sales.py
│       ├── buyers.py
│       ├── expenses.py
│       ├── product_types.py
│       └── analytics.py
│
└── app/                     # React Frontend
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── hooks/
    │   ├── lib/
    │   └── types/
    ├── package.json
    └── .env
```

## Backend Setup

### 1. Install Python Dependencies

```bash
cd /mnt/okcomputer/output/kastbhanjan-backend
pip install -r requirements.txt
```

### 2. Setup PostgreSQL Database

```bash
# Create database
sudo -u postgres createdb kastbhanjan

# Or using psql
psql -U postgres -c "CREATE DATABASE kastbhanjan;"
```

### 3. Configure Environment Variables

Edit `.env` file:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/kastbhanjan
SECRET_KEY=your-super-secret-key-change-this-in-production
```

### 4. Run the Backend Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd /mnt/okcomputer/output/app
npm install
```

### 2. Configure API URL

Edit `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Production files will be in `dist/` directory.

## Default Login Credentials

- **Email**: admin@kastbhanjan.com
- **Password**: admin123

**Important**: Change the default password after first login!

## Features Overview

### 1. Dashboard
- Today's purchases, sales, and expenses
- Overall business statistics
- Quick action buttons
- Profit/loss summary

### 2. Purchases (Buying Side)
- Track scrap purchases from sellers
- Record seller details, transport costs
- Calculate total purchase cost automatically
- Search and filter purchases
- Export to CSV

### 3. Sales (Selling Side)
- Multi-product sales
- Payment type tracking (Paid, Partial, Credit)
- Customer selection
- Automatic total calculation
- View sale details

### 4. Customer Khata (Ledger)
- Customer profiles with contact info
- Full transaction history
- Running balance calculation
- Record payments (Cash, Bank, UPI, Cheque)
- Outstanding amount tracking
- Digital KhataBook experience

### 5. Expenses
- Categorized expense tracking:
  - Rent
  - Electricity
  - Water
  - Labour
  - Transport
  - Tax
  - Other
- Search and filter by category
- Export to CSV

### 6. Analytics
- Monthly charts (purchases, sales, expenses)
- Profit/loss trend line chart
- Product sales pie chart
- Top buyers by outstanding amount
- 12-month summary statistics

## Product Types (Default)

The system comes with these default product types:
- Ply
- Lafa
- Jalav
- Sheet
- Chavi
- Khili

You can add more product types through the API.

## Mobile-First Design

The application is optimized for mobile use:
- Bottom navigation bar for quick access
- Touch-friendly large buttons
- Responsive tables with horizontal scroll
- Mobile-optimized forms
- Collapsible sidebar on desktop

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Purchases
- `GET /api/purchases` - List all purchases
- `POST /api/purchases` - Create purchase
- `GET /api/purchases/{id}` - Get purchase details
- `PUT /api/purchases/{id}` - Update purchase
- `DELETE /api/purchases/{id}` - Delete purchase

### Sales
- `GET /api/sales` - List all sales
- `POST /api/sales` - Create sale with items
- `GET /api/sales/{id}` - Get sale details
- `PUT /api/sales/{id}` - Update sale
- `DELETE /api/sales/{id}` - Delete sale

### Buyers (Customers)
- `GET /api/buyers` - List all buyers
- `POST /api/buyers` - Create buyer
- `GET /api/buyers/{id}` - Get buyer details
- `PUT /api/buyers/{id}` - Update buyer
- `DELETE /api/buyers/{id}` - Delete buyer
- `GET /api/buyers/{id}/ledger` - Get buyer ledger
- `POST /api/buyers/{id}/payments` - Add payment

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/{id}` - Get expense details
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Analytics
- `GET /api/analytics/dashboard-summary` - Dashboard stats
- `GET /api/analytics/monthly-stats` - Monthly data
- `GET /api/analytics/product-sales` - Sales by product
- `GET /api/analytics/top-buyers` - Top buyers

## Database Schema

### Tables

1. **users** - Admin users
   - id, email, hashed_password, full_name, is_active, is_admin

2. **buyers** - Customer information
   - id, name, phone, address, notes, opening_balance

3. **product_types** - Master product types
   - id, name, description

4. **purchases** - Scrap purchase records
   - id, date, seller_name, seller_phone, pickup_location, scrap_type
   - transport_service, transport_cost, quantity, unit, price_per_unit
   - total_purchase_cost, notes

5. **sales** - Sale transactions
   - id, date, buyer_id, payment_type, payment_received_now
   - total_amount, notes

6. **sale_items** - Individual items in a sale
   - id, sale_id, product_type_id, quantity, unit, price_per_unit, total_price

7. **payments** - Customer payments
   - id, date, buyer_id, amount, payment_method, notes

8. **expenses** - Business expenses
   - id, date, category, amount, description

## Troubleshooting

### Backend Issues

1. **Database connection error**
   - Check PostgreSQL is running: `sudo service postgresql status`
   - Verify DATABASE_URL in .env file
   - Ensure database exists: `psql -l | grep kastbhanjan`

2. **Port already in use**
   - Change port: `uvicorn main:app --port 8001`
   - Or kill existing process: `lsof -ti:8000 | xargs kill -9`

### Frontend Issues

1. **API not connecting**
   - Check VITE_API_URL in .env file
   - Ensure backend is running
   - Check for CORS errors in browser console

2. **Build errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version` (should be 18+)

## Production Deployment

### Backend

1. Use a production WSGI server like Gunicorn:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

2. Use environment variables for sensitive data

3. Set up PostgreSQL with proper credentials

### Frontend

1. Build the application:
```bash
npm run build
```

2. Serve the `dist/` folder using Nginx or any static file server

3. Configure API proxy in Nginx:
```nginx
location /api {
    proxy_pass http://localhost:8000;
}
```

## Support

For issues or questions, please refer to the README files in each project directory:
- `/mnt/okcomputer/output/kastbhanjan-backend/README.md`
- `/mnt/okcomputer/output/app/README.md`