import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { salesApi, buyersApi, productTypesApi } from '@/lib/api';
import type { Buyer, ProductType, PaymentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SaleItemForm {
  product_type_id: number;
  quantity: number;
  unit: string;
  price_per_unit: number;
}

export function SaleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    buyer_id: 0,
    payment_type: 'Credit' as PaymentType,
    payment_received_now: 0,
    notes: '',
  });

  const [saleItems, setSaleItems] = useState<SaleItemForm[]>([
    { product_type_id: 0, quantity: 0, unit: 'kg', price_per_unit: 0 }
  ]);

  useEffect(() => {
    fetchBuyers();
    fetchProductTypes();
    if (isEdit) {
      fetchSale();
    }
  }, [id]);

  const fetchBuyers = async () => {
    try {
      const response = await buyersApi.getAll();
      setBuyers(response.data);
    } catch (error) {
      toast.error('Failed to fetch buyers');
    }
  };

  const fetchProductTypes = async () => {
    try {
      const response = await productTypesApi.getAll();
      setProductTypes(response.data);
    } catch (error) {
      toast.error('Failed to fetch product types');
    }
  };

  const fetchSale = async () => {
    try {
      const response = await salesApi.getById(Number(id));
      const sale = response.data;
      setFormData({
        date: sale.date,
        buyer_id: sale.buyer_id,
        payment_type: sale.payment_type,
        payment_received_now: sale.payment_received_now,
        notes: sale.notes || '',
      });
      setSaleItems(sale.sale_items.map(item => ({
        product_type_id: item.product_type_id,
        quantity: item.quantity,
        unit: item.unit,
        price_per_unit: item.price_per_unit,
      })));
    } catch (error) {
      toast.error('Failed to fetch sale');
      navigate('/sales');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'buyer_id' || name === 'payment_received_now'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleItemChange = (index: number, field: keyof SaleItemForm, value: any) => {
    setSaleItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            [field]: field === 'product_type_id' || field === 'quantity' || field === 'price_per_unit'
              ? parseFloat(value) || 0
              : value,
          }
          : item
      )
    );
  };

  const addItem = () => {
    setSaleItems((prev) => [
      ...prev,
      { product_type_id: 0, quantity: 0, unit: 'kg', price_per_unit: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (saleItems.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateItemTotal = (item: SaleItemForm) => {
    return item.quantity * item.price_per_unit;
  };

  const calculateGrandTotal = () => {
    return saleItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.buyer_id === 0) {
      toast.error('Please select a buyer');
      return;
    }

    const validItems = saleItems.filter(item => item.product_type_id > 0 && item.quantity > 0 && item.price_per_unit > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid product');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        sale_items: validItems,
      };

      if (isEdit) {
        await salesApi.update(Number(id), payload);
        toast.success('Sale updated successfully');
      } else {
        await salesApi.create(payload);
        toast.success('Sale created successfully');
      }
      navigate('/sales');
    } catch (error: any) {
      console.error('Submit error:', error);
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        const messages = detail.map((err: any) => {
          const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : 'Error';
          // Capitalize field name
          const fieldName = String(field).charAt(0).toUpperCase() + String(field).slice(1);
          return `${fieldName}: ${err.msg}`;
        }).join('\n');
        toast.error(`Validation Failed:\n${messages}`);
      } else if (typeof detail === 'string') {
        toast.error(detail);
      } else {
        toast.error('Failed to save sale');
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
        <Button variant="outline" onClick={() => navigate('/sales')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Sale' : 'New Sale'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
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
                <Label htmlFor="buyer_id">Buyer *</Label>
                <Select
                  value={formData.buyer_id.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, buyer_id: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id.toString()}>
                        {buyer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_type">Payment Type *</Label>
                <Select
                  value={formData.payment_type}
                  onValueChange={(value: PaymentType) =>
                    setFormData((prev) => ({ ...prev, payment_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_received_now">Payment Received Now (₹)</Label>
                <Input
                  id="payment_received_now"
                  name="payment_received_now"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={formData.payment_received_now}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Products</h3>
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="space-y-4">
              {saleItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="md:col-span-2 space-y-2">
                    <Label>Product Type *</Label>
                    <Select
                      value={item.product_type_id.toString()}
                      onValueChange={(value) =>
                        handleItemChange(index, 'product_type_id', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map((pt) => (
                          <SelectItem key={pt.id} value={pt.id.toString()}>
                            {pt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="piece">piece</option>
                      <option value="bundle">bundle</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Price/Unit (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={item.price_per_unit}
                      onChange={(e) =>
                        handleItemChange(index, 'price_per_unit', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total</Label>
                    <div className="h-10 px-3 rounded-md border border-input bg-white flex items-center justify-between">
                      <span className="font-medium">
                        {formatCurrency(calculateItemTotal(item))}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-500">Grand Total</p>
                <p className="text-2xl font-bold text-amber-700">
                  {formatCurrency(calculateGrandTotal())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/sales')}
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
    </div>
  );
}