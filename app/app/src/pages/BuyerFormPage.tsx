import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buyersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function BuyerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    opening_balance: 0,
  });

  useEffect(() => {
    if (isEdit) {
      fetchBuyer();
    }
  }, [id]);

  const fetchBuyer = async () => {
    try {
      const response = await buyersApi.getById(Number(id));
      const buyer = response.data;
      setFormData({
        name: buyer.name,
        phone: buyer.phone || '',
        address: buyer.address || '',
        notes: buyer.notes || '',
        // Display as positive (user enters positive, we convert to negative on save)
        opening_balance: Math.abs(buyer.opening_balance),
      });
    } catch (error) {
      toast.error('Failed to fetch customer');
      navigate('/buyers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'opening_balance' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone && formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setIsSaving(true);

    // Clean up payload
    const payload: any = {
      ...formData,
      phone: formData.phone || null,
      address: formData.address || null,
      notes: formData.notes || null,
      // Opening balance is advance received, so it's negative (liability)
      opening_balance: formData.opening_balance > 0 ? -Math.abs(formData.opening_balance) : formData.opening_balance,
    };

    try {
      if (isEdit) {
        await buyersApi.update(Number(id), payload);
        toast.success('Customer updated successfully');
      } else {
        await buyersApi.create(payload);
        toast.success('Customer created successfully');
      }
      navigate('/buyers');
    } catch (error: any) {
      console.error('Submit error:', error);
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        const messages = detail.map((err: any) => {
          const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : 'Error';
          const fieldName = String(field).charAt(0).toUpperCase() + String(field).slice(1);
          return `${fieldName}: ${err.msg}`;
        }).join('\n');
        toast.error(`Validation Failed:\n${messages}`);
      } else if (typeof detail === 'string') {
        toast.error(detail);
      } else {
        toast.error('Failed to save customer');
      }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/buyers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Customer' : 'New Customer'}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opening_balance">Opening Balance - Advance Received (₹)</Label>
                <Input
                  id="opening_balance"
                  name="opening_balance"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={Math.abs(formData.opening_balance)}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500">
                  Enter advance amount received from customer (will be treated as your liability)
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Add any additional notes..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/buyers')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Spinner className="mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isEdit ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}