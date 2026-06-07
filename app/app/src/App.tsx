import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PurchasesPage } from '@/pages/PurchasesPage';
import { PurchaseFormPage } from '@/pages/PurchaseFormPage';
import { SalesPage } from '@/pages/SalesPage';
import { SaleFormPage } from '@/pages/SaleFormPage';
import { BuyersPage } from '@/pages/BuyersPage';
import { BuyerFormPage } from '@/pages/BuyerFormPage';
import { BuyerLedgerPage } from '@/pages/BuyerLedgerPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { ExpenseFormPage } from '@/pages/ExpenseFormPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { Layout } from '@/components/Layout';
import { Spinner } from '@/components/ui/spinner';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="purchases/new" element={<PurchaseFormPage />} />
        <Route path="purchases/edit/:id" element={<PurchaseFormPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="sales/new" element={<SaleFormPage />} />
        <Route path="sales/edit/:id" element={<SaleFormPage />} />
        <Route path="buyers" element={<BuyersPage />} />
        <Route path="buyers/new" element={<BuyerFormPage />} />
        <Route path="buyers/edit/:id" element={<BuyerFormPage />} />
        <Route path="buyers/:id/ledger" element={<BuyerLedgerPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="expenses/new" element={<ExpenseFormPage />} />
        <Route path="expenses/edit/:id" element={<ExpenseFormPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;