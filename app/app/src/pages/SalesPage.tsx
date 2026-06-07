import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { salesApi } from '@/lib/api';
import type { Sale } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Download, Edit, Trash2, Eye } from 'lucide-react';
import { formatCurrency, formatDate, downloadCSV } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

const paymentTypeColors = {
  Paid: 'bg-green-100 text-green-800',
  Partial: 'bg-amber-100 text-amber-800',
  Credit: 'bg-red-100 text-red-800',
};

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sales.filter(
        (s) =>
          s.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.payment_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSales(filtered);
    } else {
      setFilteredSales(sales);
    }
  }, [searchTerm, sales]);

  const fetchSales = async () => {
    try {
      const response = await salesApi.getAll();
      setSales(response.data);
      setFilteredSales(response.data);
    } catch (error) {
      toast.error('Failed to fetch sales');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await salesApi.delete(deleteId);
      toast.success('Sale deleted successfully');
      fetchSales();
    } catch (error) {
      toast.error('Failed to delete sale');
    } finally {
      setDeleteId(null);
    }
  };

  const handleExport = () => {
    const exportData = filteredSales.map((s) => ({
      Date: formatDate(s.date),
      Buyer: s.buyer.name,
      'Payment Type': s.payment_type,
      'Total Amount': s.total_amount,
      'Payment Received': s.payment_received_now,
      Balance: s.total_amount - s.payment_received_now,
      Notes: s.notes || '',
    }));
    downloadCSV(exportData, `sales_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Exported to CSV');
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-500">Manage product sales</p>
        </div>
        <Link to="/sales/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Sale
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by buyer or payment type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sale.buyer.name}</p>
                          {sale.buyer.phone && (
                            <p className="text-sm text-gray-500">{sale.buyer.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentTypeColors[sale.payment_type]}>
                          {sale.payment_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(sale.total_amount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(sale.payment_received_now)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewSale(sale)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Link to={`/sales/edit/${sale.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(sale.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Sale Dialog */}
      <Dialog open={!!viewSale} onOpenChange={() => setViewSale(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
          </DialogHeader>
          {viewSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(viewSale.date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Buyer</p>
                  <p className="font-medium">{viewSale.buyer.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Type</p>
                  <Badge className={paymentTypeColors[viewSale.payment_type]}>
                    {viewSale.payment_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">{formatCurrency(viewSale.total_amount)}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 mb-2">Products</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {viewSale.sale_items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.product_type?.name} - {item.quantity} {item.unit}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {viewSale.notes && (
                <div>
                  <p className="text-gray-500">Notes</p>
                  <p className="text-sm">{viewSale.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sale</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sale? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}