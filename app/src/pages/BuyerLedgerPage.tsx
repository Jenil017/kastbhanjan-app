import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buyersApi } from '@/lib/api';
import type { BuyerLedger, PaymentCreate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, Plus, Phone, MapPin, MessageCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export function BuyerLedgerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [ledger, setLedger] = useState<BuyerLedger | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [paymentData, setPaymentData] = useState<PaymentCreate>({
    date: new Date().toISOString().split('T')[0],
    buyer_id: Number(id),
    amount: 0,
    payment_method: 'Cash',
    notes: '',
  });

  useEffect(() => {
    fetchLedger();
  }, [id]);

  const fetchLedger = async () => {
    try {
      const response = await buyersApi.getLedger(Number(id));
      setLedger(response.data);
    } catch (error) {
      toast.error('Failed to fetch ledger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSaving(true);
    try {
      await buyersApi.addPayment(Number(id), paymentData);
      toast.success('Payment recorded successfully');
      setShowPaymentDialog(false);
      fetchLedger();
      setPaymentData({
        date: new Date().toISOString().split('T')[0],
        buyer_id: Number(id),
        amount: 0,
        payment_method: 'Cash',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load ledger</p>
      </div>
    );
  }

  const { buyer, entries, closing_balance } = ledger;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/buyers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Customer Khata</h1>
      </div>

      {/* Customer Info Card */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{buyer.name}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                {buyer.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {buyer.phone}
                  </div>
                )}
                {buyer.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {buyer.address}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Amount Receivable</p>
              <p className={`text-3xl font-bold ${closing_balance < 0
                ? 'text-red-600'
                : closing_balance > 0
                  ? 'text-green-600'
                  : 'text-gray-600'
                }`}>
                {closing_balance < 0
                  ? `- ${formatCurrency(Math.abs(closing_balance))}`
                  : formatCurrency(closing_balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="text-xl font-semibold text-blue-600">
              {formatCurrency(buyer.total_sales)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Payments</p>
            <p className="text-xl font-semibold text-green-600">
              {formatCurrency(buyer.total_payments)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Advance Received</p>
            <p className="text-xl font-semibold text-purple-600">
              {buyer.opening_balance < 0
                ? formatCurrency(Math.abs(buyer.opening_balance))
                : formatCurrency(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
          onClick={() => {
            if (!ledger?.buyer.phone) {
              toast.error("Customer phone number not available");
              return;
            }

            const { buyer, entries, closing_balance } = ledger;

            // Take recent 15 entries
            const recentEntries = entries.slice(0, 15);

            let message = `*Kastbhanjan Plywood - Statement*\n`;
            message += `Customer: ${buyer.name}\n`;
            message += `Date: ${new Date().toLocaleDateString('en-IN')}\n`;
            message += `------------------------\n`;
            message += `*Recent Transactions:*\n`;

            recentEntries.forEach(entry => {
              const date = new Date(entry.date).toLocaleDateString('en-IN');
              const type = entry.type === 'SALE' ? 'DR' : 'CR';
              const amount = entry.type === 'SALE' ? entry.debit : entry.credit;
              message += `${date} - ${entry.description.replace(/Sale #\d+ - /, '')} (${type}) - ₹${amount}\n`;
            });

            if (entries.length > 15) {
              message += `... (+${entries.length - 15} more)\n`;
            }

            message += `------------------------\n`;
            message += `*Outstanding Balance: ₹${closing_balance}*\n\n`;
            message += `Please pay the outstanding amount at the earliest.\nThank you!`;

            const phone = (buyer.phone || '').replace(/\D/g, '');
            // Simple logic: if 10 digits, add 91. If more, assume full number
            const finalPhone = phone.length === 10 ? `91${phone}` : phone;

            const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
          }}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp Statement
        </Button>

        <Button
          onClick={() => setShowPaymentDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ledger History</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            entry.type === 'SALE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${entry.balance < 0
                        ? 'text-red-600'
                        : entry.balance > 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                        }`}>
                        {entry.balance < 0
                          ? `- ${formatCurrency(Math.abs(entry.balance))}`
                          : formatCurrency(entry.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Add a payment received from {buyer.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayment}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="payment_date">Date *</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={paymentData.date}
                  onChange={(e) =>
                    setPaymentData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_amount">Amount (₹) *</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <select
                  id="payment_method"
                  value={paymentData.payment_method}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      payment_method: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_notes">Notes</Label>
                <textarea
                  id="payment_notes"
                  rows={2}
                  placeholder="Add notes..."
                  value={paymentData.notes}
                  onChange={(e) =>
                    setPaymentData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Spinner className="mr-2" />}
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}