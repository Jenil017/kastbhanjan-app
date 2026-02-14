// User Types
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// Product Type
export interface ProductType {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

// Buyer Types
export interface Buyer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  opening_balance: number;
  created_at: string;
  updated_at: string | null;
  total_sales: number;
  total_payments: number;
  outstanding_balance: number;
}

export interface BuyerCreate {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  opening_balance?: number;
}

export interface BuyerListItem {
  id: number;
  name: string;
  phone: string | null;
  outstanding_balance: number;
}

// Purchase Types
export interface Purchase {
  id: number;
  date: string;
  seller_name: string;
  seller_phone: string | null;
  pickup_location: string | null;
  scrap_type: string;
  transport_service: string | null;
  transport_cost: number;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_purchase_cost: number;
  actual_paid_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PurchaseCreate {
  date: string;
  seller_name: string;
  seller_phone?: string;
  pickup_location?: string;
  scrap_type: string;
  transport_service?: string;
  transport_cost?: number;
  quantity: number;
  unit?: string;
  price_per_unit: number;
  actual_paid_amount?: number;
  notes?: string;
}

// Sale Types
export type PaymentType = 'Paid' | 'Partial' | 'Credit';

export interface SaleItem {
  id: number;
  product_type_id: number;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_price: number;
  product_type?: ProductType;
}

export interface SaleItemCreate {
  product_type_id: number;
  quantity: number;
  unit?: string;
  price_per_unit: number;
}

export interface Sale {
  id: number;
  date: string;
  buyer_id: number;
  payment_type: PaymentType;
  payment_received_now: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  buyer: Buyer;
  sale_items: SaleItem[];
}

export interface SaleCreate {
  date: string;
  buyer_id: number;
  payment_type: PaymentType;
  payment_received_now?: number;
  notes?: string;
  sale_items: SaleItemCreate[];
}

export interface SaleListItem {
  id: number;
  date: string;
  buyer_name: string;
  payment_type: PaymentType;
  total_amount: number;
  payment_received_now: number;
}

// Payment Types
export interface Payment {
  id: number;
  date: string;
  buyer_id: number;
  amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
  buyer?: Buyer;
}

export interface PaymentCreate {
  date: string;
  buyer_id: number;
  amount: number;
  payment_method?: string;
  notes?: string;
}

// Expense Types
export type ExpenseCategory = 'Rent' | 'Electricity' | 'Water' | 'Labour' | 'Transport' | 'Tax' | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent',
  'Electricity',
  'Water',
  'Labour',
  'Transport',
  'Tax',
  'Other'
];

export interface Expense {
  id: number;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ExpenseCreate {
  date: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
}

// Ledger Types
export interface LedgerEntry {
  date: string;
  type: 'SALE' | 'PAYMENT';
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface BuyerLedger {
  buyer: Buyer;
  entries: LedgerEntry[];
  opening_balance: number;
  closing_balance: number;
}

// Analytics Types
export interface DashboardSummary {
  today_purchases: number;
  today_sales: number;
  today_expenses: number;
  total_purchases: number;
  total_sales: number;
  total_expenses: number;
  total_profit: number;
  total_receivable: number;
}

export interface MonthlyStats {
  month: string;
  purchases: number;
  sales: number;
  expenses: number;
  profit: number;
}

export interface ProductSalesStats {
  product_name: string;
  total_quantity: number;
  total_amount: number;
}

export interface TopBuyerStats {
  buyer_name: string;
  outstanding_amount: number;
}

export interface AnalyticsResponse {
  monthly_stats: MonthlyStats[];
  product_sales: ProductSalesStats[];
  top_buyers: TopBuyerStats[];
}

// Filter Types
export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

export interface PurchaseFilter extends DateRangeFilter {
  seller_name?: string;
  scrap_type?: string;
}

export interface SaleFilter extends DateRangeFilter {
  buyer_id?: number;
  payment_type?: PaymentType;
}

export interface ExpenseFilter extends DateRangeFilter {
  category?: ExpenseCategory;
}