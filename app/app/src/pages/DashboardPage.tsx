import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '@/lib/api';
import type { DashboardSummary } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Receipt,
  Users
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await analyticsApi.getDashboardSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const todayCards = [
    {
      title: 'Purchases Today',
      value: summary.today_purchases,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/purchases'
    },
    {
      title: 'Sales Today',
      value: summary.today_sales,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/sales'
    },
    {
      title: 'Expenses Today',
      value: summary.today_expenses,
      icon: Receipt,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/expenses'
    },
  ];

  const overallCards = [
    {
      title: 'Total Purchases',
      value: summary.total_purchases,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/purchases'
    },
    {
      title: 'Total Sales',
      value: summary.total_sales,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/sales'
    },
    {
      title: 'Total Expenses',
      value: summary.total_expenses,
      icon: Receipt,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/expenses'
    },
    {
      title: 'Total Profit',
      value: summary.total_profit,
      icon: TrendingUp,
      color: summary.total_profit >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: summary.total_profit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      link: '/analytics'
    },
    {
      title: 'Amount Receivable',
      value: summary.total_receivable,
      icon: Users,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      link: '/buyers'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        {/* <h1 className="text-2xl font-bold text-gray-900">Kastbhanjan Plywood</h1> */}
        <p className="text-gray-900 text-2xl font-semibold mb-3 text-center underline ">Jemish Moradiya</p>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {todayCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{card.title}</p>
                        <p className={`text-2xl font-bold ${card.color}`}>
                          {formatCurrency(card.value)}
                        </p>
                      </div>
                      <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Overall Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Overall</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {overallCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{card.title}</p>
                        <p className={`text-xl font-bold ${card.color}`}>
                          {formatCurrency(card.value)}
                        </p>
                      </div>
                      <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/purchases/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-700">Add Purchase</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/sales/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-green-50 border-green-200">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Package className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-700">Add Sale</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/expenses/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-red-50 border-red-200">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Receipt className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-red-700">Add Expense</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/buyers/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-amber-50 border-amber-200">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Users className="w-8 h-8 text-amber-600 mb-2" />
                <span className="text-sm font-medium text-amber-700">Add Customer</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}