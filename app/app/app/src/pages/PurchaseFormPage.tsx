import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { purchasesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function PurchaseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    seller_name: '',
    seller_phone: '',
    pickup_location: '',
    scrap_type: '',
    transport_service: '',
    transport_cost: 0,
    quantity: 0,
    unit: 'kg',
    price_per_unit: 0,
    actual_paid_amount: 0,
    notes: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchPurchase();
    }
  }, [id]);

  const fetchPurchase = async () => {
    try {
      const response = await purchasesApi.getById(Number(id));
      const purchase = response.data;
      setFormData({
        date: purchase.date,
        seller_name: purchase.seller_name,
        seller_phone: purchase.seller_phone || '',
        pickup_location: purchase.pickup_location || '',
        scrap_type: purchase.scrap_type,
        transport_service: purchase.transport_service || '',
        transport_cost: purchase.transport_cost,
        quantity: purchase.quantity,
        unit: purchase.unit,
        price_per_unit: purchase.price_per_unit,
        actual_paid_amount: purchase.actual_paid_amount || 0,
        notes: purchase.notes || '',
      });
    } catch (error) {
      toast.error('Failed to fetch purchase');
      navigate('/purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'seller_phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price_per_unit' || name === 'transport_cost' || name === 'actual_paid_amount'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const calculateTotal = () => {
    return (formData.quantity * formData.price_per_unit) + formData.transport_cost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.seller_phone && formData.seller_phone.length !== 10) {
      toast.error('Seller phone number must be exactly 10 digits');
      return;
    }

    setIsSaving(true);

    try {
      // Clean up payload: convert empty strings to null to avoid Pydantic validation errors
      const payload: any = {
        ...formData,
        date: formData.date || null,
        seller_phone: formData.seller_phone || null,
        pickup_location: formData.pickup_location || null,
        transport_service: formData.transport_service || null,
        notes: formData.notes || null,
        // Ensure numeric fields are numbers
        transport_cost: Number(formData.transport_cost) || 0,
        quantity: Number(formData.quantity) || 0,
        price_per_unit: Number(formData.price_per_unit) || 0,
        actual_paid_amount: formData.actual_paid_amount > 0 ? Number(formData.actual_paid_amount) : null,
      };

      if (isEdit) {
        await purchasesApi.update(Number(id), payload);
        toast.success('Purchase updated successfully');
      } else {
        await purchasesApi.create(payload);
        toast.success('Purchase created successfully');
      }
      navigate('/purchases');
    } catch (error: any) {
      console.error('Submit error:', error);
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        // Handle Pydantic validation errors (array of objects)
        const messages = detail.map((err: any) => {
          const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : 'Error';
          // Capitalize field name for better readability
          const fieldName = String(field).charAt(0).toUpperCase() + String(field).slice(1);
          return `${fieldName}: ${err.msg}`;
        }).join('\n');
        toast.error(`Validation Failed:\n${messages}`);
      } else if (typeof detail === 'string') {
        toast.error(detail);
      } else {
        toast.error('Failed to save purchase');
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
        <Button variant="outline" onClick={() => navigate('/purchases')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Purchase' : 'New Purchase'}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seller_name">Seller Name *</Label>
                <Input
                  id="seller_name"
                  name="seller_name"
                  placeholder="Enter seller name"
                  value={formData.seller_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seller_phone">Seller Phone</Label>
                <Input
                  id="seller_phone"
                  name="seller_phone"
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  value={formData.seller_phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup_location">Pickup Location</Label>
                <Input
                  id="pickup_location"
                  name="pickup_location"
                  placeholder="Enter pickup location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="scrap_type">Scrap Type *</Label>
                <Input
                  id="scrap_type"
                  name="scrap_type"
                  placeholder="Enter scrap type"
                  value={formData.scrap_type}
                  onChange={handleChange}
                  required
                />
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="transport_service">Transport Service</Label>
                <Input
                  id="transport_service"
                  name="transport_service"
                  placeholder="e.g., Porter, Truck"
                  value={formData.transport_service}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transport_cost">Transport Cost (₹)</Label>
                <Input
                  id="transport_cost"
                  name="transport_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={formData.transport_cost}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="kg">kg</option>
                    <option value="ton">ton</option>
                    <option value="piece">piece</option>
                    <option value="bundle">bundle</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_per_unit">Price per Unit (₹) *</Label>
                <Input
                  id="price_per_unit"
                  name="price_per_unit"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={formData.price_per_unit}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Total Cost (Calculated)</Label>
                <div className="h-10 px-3 rounded-md border border-input bg-gray-50 flex items-center text-lg font-semibold text-amber-700">
                  ₹{calculateTotal().toLocaleString('en-IN')}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual_paid_amount">Actual Paid Amount (₹)</Label>
                <Input
                  id="actual_paid_amount"
                  name="actual_paid_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter if different from calculated (e.g., with discount)"
                  value={formData.actual_paid_amount || ''}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500">
                  Optional: Enter actual amount paid if different from calculated total (for discounts)
                </p>
              </div>
            </div>

            <div className="space-y-2">
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

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/purchases')}
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