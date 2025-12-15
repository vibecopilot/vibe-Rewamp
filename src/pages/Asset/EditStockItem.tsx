import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Package, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTitle from '../../components/ui/PageTitle';
import FormSection from '../../components/ui/FormSection';
import FormInput from '../../components/ui/FormInput';
import FormGrid from '../../components/ui/FormGrid';
import Button from '../../components/ui/Button';
import { stockItemService, StockItem } from '../../services/assetSubModules.service';

const EditStockItem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<StockItem | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('');
  const [minStock, setMinStock] = useState<number>(0);
  const [maxStock, setMaxStock] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const fetchItemDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await stockItemService.getStockItemById(id);
      const data = response.data;
      if (data) {
        setItem(data);
        setName(data.name || '');
        setItemCode(data.item_code || '');
        setCategory(data.category || '');
        setQuantity(data.quantity || 0);
        setUnit(data.unit || '');
        setMinStock(data.min_stock || 0);
        setMaxStock(data.max_stock || 0);
        setUnitPrice(data.unit_price || 0);
        setLocation(data.location || '');
        setDescription((data as any).description || '');
      }
    } catch (error) {
      console.error('Failed to fetch item:', error);
      toast.error('Failed to load stock item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Item name is required');
      return;
    }

    setSaving(true);
    try {
      await stockItemService.updateStockItem(id!, {
        name,
        item_code: itemCode,
        category,
        quantity,
        unit,
        min_stock: minStock,
        max_stock: maxStock,
        unit_price: unitPrice,
        location,
      });
      toast.success('Stock item updated successfully');
      navigate(`/asset/stock-items/${id}`);
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update stock item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading stock item...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Package className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Stock Item Not Found</h3>
        <Button onClick={() => navigate('/asset/stock-items')}>Back to List</Button>
      </div>
    );
  }

  const unitOptions = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'ltr', label: 'Liters' },
    { value: 'mtr', label: 'Meters' },
    { value: 'box', label: 'Box' },
    { value: 'set', label: 'Set' },
  ];

  return (
    <div className="p-6">
      <PageTitle
        title="Edit Stock Item"
        breadcrumbs={[
          { label: 'Asset', path: '/asset' },
          { label: 'Stock Items', path: '/asset/stock-items' },
          { label: item.name, path: `/asset/stock-items/${id}` },
          { label: 'Edit' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <FormSection title="Item Details" icon={Package}>
          <FormGrid columns={3}>
            <FormInput
              label="Item Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter item name"
            />
            <FormInput
              label="Item Code"
              name="item_code"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              placeholder="Enter item code"
            />
            <FormInput
              label="Category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Stock Information" icon={Package}>
          <FormGrid columns={3}>
            <FormInput
              label="Quantity"
              name="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="0"
            />
            <FormInput
              label="Unit"
              name="unit"
              type="select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              options={unitOptions}
              placeholder="Select unit"
            />
            <FormInput
              label="Unit Price (₹)"
              name="unit_price"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              placeholder="0.00"
            />
            <FormInput
              label="Minimum Stock"
              name="min_stock"
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value))}
              placeholder="0"
            />
            <FormInput
              label="Maximum Stock"
              name="max_stock"
              type="number"
              value={maxStock}
              onChange={(e) => setMaxStock(Number(e.target.value))}
              placeholder="0"
            />
            <FormInput
              label="Location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter storage location"
            />
          </FormGrid>
        </FormSection>

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/asset/stock-items/${id}`)}
          >
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditStockItem;
