import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import type { MonthlyStats, ProductSalesStats, TopBuyerStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, DollarSign, Users, Package, RefreshCw } from 'lucide-react';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export function AnalyticsPage() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [productSales, setProductSales] = useState<ProductSalesStats[]>([]);
  const [topBuyers, setTopBuyers] = useState<TopBuyerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [monthlyRes, productRes, buyersRes] = await Promise.all([
        analyticsApi.getMonthlyStats(12),
        analyticsApi.getProductSales(),
        analyticsApi.getTopBuyers(10),
      ]);
      setMonthlyStats(monthlyRes.data);
      setProductSales(productRes.data);
      setTopBuyers(buyersRes.data);

      if (silent) {
        console.log('Analytics data refreshed');
      }
    } catch (error) {
      if (!silent) {
        toast.error('Failed to fetch analytics');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchAnalytics();
    toast.success('Analytics refreshed');
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Business insights and reports</p>
        </div>
        <Button
          onClick={handleManualRefresh}
          variant="outline"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Monthly Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Overview
          </CardTitle>  
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="purchases" name="Purchases" fill="#3b82f6" />
                <Bar dataKey="sales" name="Sales" fill="#10b981" />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Profit Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Monthly Profit/Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Profit/Loss"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Sales Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Sales by Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productSales.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No product sales data</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productSales}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ product_name, percent }) =>
                        `${product_name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_amount"
                      nameKey="product_name"
                    >
                      {productSales.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Product Sales Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {productSales.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {product.product_name}
                      </td>
                      <td className="text-right py-2">
                        {product.total_quantity.toLocaleString()}
                      </td>
                      <td className="text-right py-2 font-medium">
                        {formatCurrency(product.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Buyers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Buyers by Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topBuyers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No outstanding amounts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topBuyers.map((buyer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{buyer.buyer_name}</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(buyer.outstanding_amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Sales (12 months)</p>
            <p className="text-xl font-semibold text-green-600">
              {formatCurrency(monthlyStats.reduce((sum, m) => sum + m.sales, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Purchases (12 months)</p>
            <p className="text-xl font-semibold text-blue-600">
              {formatCurrency(monthlyStats.reduce((sum, m) => sum + m.purchases, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Expenses (12 months)</p>
            <p className="text-xl font-semibold text-red-600">
              {formatCurrency(monthlyStats.reduce((sum, m) => sum + m.expenses, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Net Profit (12 months)</p>
            <p className={`text-xl font-semibold ${monthlyStats.reduce((sum, m) => sum + m.profit, 0) >= 0
                ? 'text-green-600'
                : 'text-red-600'
              }`}>
              {formatCurrency(monthlyStats.reduce((sum, m) => sum + m.profit, 0))}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}