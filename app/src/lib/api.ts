import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  Token,
  LoginRequest,
  User,
  ProductType,
  Buyer,
  BuyerCreate,
  BuyerListItem,
  BuyerLedger,
  Purchase,
  PurchaseCreate,
  Sale,
  SaleCreate,
  Payment,
  PaymentCreate,
  Expense,
  ExpenseCreate,
  DashboardSummary,
  AnalyticsResponse,
  MonthlyStats,
  ProductSalesStats,
  TopBuyerStats,
  DateRangeFilter
} from '@/types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginRequest) => {
    // Convert to form data for OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);

    return apiClient.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  getMe: () => apiClient.get<User>('/auth/me'),
  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post('/auth/change-password', null, {
      params: { old_password: oldPassword, new_password: newPassword }
    }),
};

// Product Types API
export const productTypesApi = {
  getAll: () => apiClient.get<ProductType[]>('/product-types'),
  getById: (id: number) => apiClient.get<ProductType>(`/product-types/${id}`),
  create: (data: Partial<ProductType>) => apiClient.post<ProductType>('/product-types', data),
  update: (id: number, data: Partial<ProductType>) => apiClient.put<ProductType>(`/product-types/${id}`, data),
  delete: (id: number) => apiClient.delete(`/product-types/${id}`),
};

// Buyers API
export const buyersApi = {
  getAll: (search?: string) => apiClient.get<Buyer[]>('/buyers', {
    params: search ? { search } : {}
  }),
  getList: () => apiClient.get<BuyerListItem[]>('/buyers/list'),
  getById: (id: number) => apiClient.get<Buyer>(`/buyers/${id}`),
  create: (data: BuyerCreate) => apiClient.post<Buyer>('/buyers', data),
  update: (id: number, data: Partial<BuyerCreate>) => apiClient.put<Buyer>(`/buyers/${id}`, data),
  delete: (id: number) => apiClient.delete(`/buyers/${id}`),
  getLedger: (id: number, filters?: DateRangeFilter) => apiClient.get<BuyerLedger>(`/buyers/${id}/ledger`, {
    params: filters
  }),
  getPayments: (id: number) => apiClient.get<Payment[]>(`/buyers/${id}/payments`),
  addPayment: (id: number, data: PaymentCreate) => apiClient.post<Payment>(`/buyers/${id}/payments`, data),
};

// Purchases API
export const purchasesApi = {
  getAll: (filters?: { start_date?: string; end_date?: string; seller_name?: string; scrap_type?: string; skip?: number; limit?: number }) =>
    apiClient.get<Purchase[]>('/purchases', { params: filters }),
  getById: (id: number) => apiClient.get<Purchase>(`/purchases/${id}`),
  create: (data: PurchaseCreate) => apiClient.post<Purchase>('/purchases', data),
  update: (id: number, data: Partial<PurchaseCreate>) => apiClient.put<Purchase>(`/purchases/${id}`, data),
  delete: (id: number) => apiClient.delete(`/purchases/${id}`),
  getTodayStats: () => apiClient.get<{ today_purchases: number }>('/purchases/stats/today'),
};

// Sales API
export const salesApi = {
  getAll: (filters?: { start_date?: string; end_date?: string; buyer_id?: number; payment_type?: string; skip?: number; limit?: number }) =>
    apiClient.get<Sale[]>('/sales', { params: filters }),
  getById: (id: number) => apiClient.get<Sale>(`/sales/${id}`),
  create: (data: SaleCreate) => apiClient.post<Sale>('/sales', data),
  update: (id: number, data: Partial<SaleCreate>) => apiClient.put<Sale>(`/sales/${id}`, data),
  delete: (id: number) => apiClient.delete(`/sales/${id}`),
  getTodayStats: () => apiClient.get<{ today_sales: number }>('/sales/stats/today'),
};

// Expenses API
export const expensesApi = {
  getAll: (filters?: { start_date?: string; end_date?: string; category?: string; skip?: number; limit?: number }) =>
    apiClient.get<Expense[]>('/expenses', { params: filters }),
  getById: (id: number) => apiClient.get<Expense>(`/expenses/${id}`),
  create: (data: ExpenseCreate) => apiClient.post<Expense>('/expenses', data),
  update: (id: number, data: Partial<ExpenseCreate>) => apiClient.put<Expense>(`/expenses/${id}`, data),
  delete: (id: number) => apiClient.delete(`/expenses/${id}`),
  getTodayStats: () => apiClient.get<{ today_expenses: number }>('/expenses/stats/today'),
  getByCategory: (filters?: DateRangeFilter) => apiClient.get<{ category: string; total: number }[]>('/expenses/stats/by-category', {
    params: filters
  }),
};

// Analytics API
export const analyticsApi = {
  getDashboardSummary: () => apiClient.get<DashboardSummary>('/analytics/dashboard-summary'),
  getMonthlyStats: (months: number = 12) => apiClient.get<MonthlyStats[]>('/analytics/monthly-stats', {
    params: { months }
  }),
  getProductSales: (filters?: DateRangeFilter) => apiClient.get<ProductSalesStats[]>('/analytics/product-sales', {
    params: filters
  }),
  getTopBuyers: (limit: number = 10) => apiClient.get<TopBuyerStats[]>('/analytics/top-buyers', {
    params: { limit }
  }),
  getFullReport: (months: number = 12) => apiClient.get<AnalyticsResponse>('/analytics/full-report', {
    params: { months }
  }),
};

export default apiClient;