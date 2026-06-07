import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { purchasesApi } from '@/lib/api';
import type { Purchase } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
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
import { Plus, Search, Download, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate, downloadCSV } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = purchases.filter(
        (p) =>
          p.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.scrap_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPurchases(filtered);
    } else {
      setFilteredPurchases(purchases);
    }
  }, [searchTerm, purchases]);

  const fetchPurchases = async () => {
    try {
      const response = await purchasesApi.getAll();
      setPurchases(response.data);
      setFilteredPurchases(response.data);
    } catch (error) {
      toast.error('Failed to fetch purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await purchasesApi.delete(deleteId);
      toast.success('Purchase deleted successfully');
      fetchPurchases();
    } catch (error) {
      toast.error('Failed to delete purchase');
    } finally {
      setDeleteId(null);
    }
  };

  const handleExport = () => {
    const exportData = filteredPurchases.map((p) => ({
      Date: formatDate(p.date),
      'Seller Name': p.seller_name,
      'Seller Phone': p.seller_phone || '',
      '': p.scrap_type,
      Quantity: `${p.quantity} ${p.unit}`,
      'Price per Unit': p.price_per_unit,
      'Transport Cost': p.transport_cost,
      'Total Cost': p.total_purchase_cost,
      Notes: p.notes || '',
    }));
    downloadCSV(exportData, `purchases_${new Date().toISOString().split('T')[0]}.csv`);
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
          <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-500">Manage scrap purchases</p>
        </div>
        <Link to="/purchases/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Purchase
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by seller or scrap type..."
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
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No purchases found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price per kg</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{formatDate(purchase.date)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{purchase.seller_name}</p>
                          {purchase.seller_phone && (
                            <p className="text-sm text-gray-500">{purchase.seller_phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {purchase.quantity} {purchase.unit}
                      </TableCell>
                      <TableCell>
                        ₹{purchase.price_per_unit.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(purchase.transport_cost)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {purchase.actual_paid_amount
                          ? formatCurrency(purchase.actual_paid_amount)
                          : formatCurrency(purchase.total_purchase_cost)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/purchases/edit/${purchase.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(purchase.id)}
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

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this purchase? This action cannot be undone.
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