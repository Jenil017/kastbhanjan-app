# Kastbhanjan Playwood Management System - Frontend

React-based frontend for the wooden scrap trading business management system.

## Features

- Mobile-first responsive design
- JWT Authentication
- Dashboard with summary cards
- Purchase, Sales, Customer Khata, and Expense management
- Analytics with charts
- CSV export functionality

## Tech Stack

- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State Management**: React Context

## Project Structure

```
src/
├── components/          # Reusable components
│   └── Layout.tsx       # Main layout with navigation
├── pages/               # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PurchasesPage.tsx
│   ├── PurchaseFormPage.tsx
│   ├── SalesPage.tsx
│   ├── SaleFormPage.tsx
│   ├── BuyersPage.tsx
│   ├── BuyerFormPage.tsx
│   ├── BuyerLedgerPage.tsx
│   ├── ExpensesPage.tsx
│   ├── ExpenseFormPage.tsx
│   └── AnalyticsPage.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx      # Authentication context
│   └── useToast.tsx     # Toast notifications
├── lib/                 # Utilities
│   ├── utils.ts         # Helper functions
│   └── api.ts           # API client
├── types/               # TypeScript types
│   └── index.ts
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Configure API URL

Update `.env` file with your backend API URL:

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

The built files will be in the `dist/` directory.

## Default Login Credentials

- **Email**: admin@kastbhanjan.com
- **Password**: admin123

## Features

### Dashboard
- Today's purchases, sales, and expenses
- Overall business statistics
- Quick action buttons

### Purchases
- Add/edit/delete scrap purchases
- Track seller details, transport costs
- Search and filter
- Export to CSV

### Sales
- Multi-product sales
- Payment type tracking (Paid, Partial, Credit)
- Customer selection
- View sale details

### Customer Khata (Ledger)
- Customer profiles
- Full transaction history
- Running balance calculation
- Record payments
- Outstanding amount tracking

### Expenses
- Categorized expense tracking
- Search and filter by category
- Export to CSV

### Analytics
- Monthly charts (purchases, sales, expenses)
- Profit/loss trends
- Product sales pie chart
- Top buyers by outstanding amount

## Mobile Design

The application is optimized for mobile use with:
- Bottom navigation bar
- Touch-friendly buttons
- Responsive tables
- Mobile-optimized forms

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |

## License

MIT License