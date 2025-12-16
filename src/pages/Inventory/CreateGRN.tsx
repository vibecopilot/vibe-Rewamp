import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, FileText, Plus, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { 
  postGRN, 
  getGRNById, 
  getVendors,
  getInventory,
  getStandardUnits
} from '../../api';

interface InventoryItem {
  id: number;
  name: string;
  code?: string;
  unit?: string;
  cost?: number;
}

interface LineItem {
  inventory_id: string;
  inventory_name: string;
  quantity: string;
  rate: string;
  unit: string;
  amount: string;
  cgst_rate: string;
  cgst_amount: string;
  sgst_rate: string;
  sgst_amount: string;
  igst_rate: string;
  igst_amount: string;
  total_amount: string;
}

interface FormData {
  vendor_id: string;
  invoice_number: string;
  invoice_date: string;
  posting_date: string;
  payment_mode: string;
  related_to: string;
  other_expenses: string;
  loading_expenses: string;
  adjustment_amount: string;
  status: string;
  description: string;
}

const CreateGRN: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    vendor_id: '',
    invoice_number: '',
    invoice_date: '',
    posting_date: '',
    payment_mode: 'Cash',
    related_to: '',
    other_expenses: '',
    loading_expenses: '',
    adjustment_amount: '',
    status: 'Pending',
    description: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([{
    inventory_id: '',
    inventory_name: '',
    quantity: '',
    rate: '',
    unit: '',
    amount: '',
    cgst_rate: '',
    cgst_amount: '',
    sgst_rate: '',
    sgst_amount: '',
    igst_rate: '',
    igst_amount: '',
    total_amount: '',
  }]);

  const [vendors, setVendors] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const paymentModes = ['Cash', 'Cheque', 'Bank Transfer', 'Credit', 'UPI', 'Card'];
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Draft'];

  useEffect(() => {
    fetchDropdowns();
    if (isEditMode && id) {
      fetchGRNDetails();
    }
  }, [id, isEditMode]);

  const fetchDropdowns = async () => {
    try {
      const [vendorsRes, inventoryRes, unitsRes] = await Promise.all([
        getVendors(),
        getInventory(),
        getStandardUnits?.() || Promise.resolve({ data: [] }),
      ]);
      setVendors(Array.isArray(vendorsRes?.data) ? vendorsRes.data : []);
      setInventoryItems(Array.isArray(inventoryRes?.data) ? inventoryRes.data : []);
      setUnits(Array.isArray(unitsRes?.data) ? unitsRes.data : []);
    } catch (error) {
      console.error('Error fetching dropdowns:', error);
    }
  };

  const fetchGRNDetails = async () => {
    try {
      const response = await getGRNById(id);
      const data = response?.data;
      if (data) {
        setFormData({
          vendor_id: data.vendor_id?.toString() || '',
          invoice_number: data.invoice_number || '',
          invoice_date: data.invoice_date ? data.invoice_date.split('T')[0] : '',
          posting_date: data.posting_date ? data.posting_date.split('T')[0] : '',
          payment_mode: data.payment_mode || 'Cash',
          related_to: data.related_to || '',
          other_expenses: data.other_expenses?.toString() || '',
          loading_expenses: data.loading_expenses?.toString() || '',
          adjustment_amount: data.adjustment_amount?.toString() || '',
          status: data.status || 'Pending',
          description: data.description || '',
        });

        if (Array.isArray(data.inventory_details) && data.inventory_details.length > 0) {
          setLineItems(data.inventory_details.map((item: any) => ({
            inventory_id: item.inventory_id?.toString() || '',
            inventory_name: item.inventory_name || '',
            quantity: item.quantity?.toString() || '',
            rate: item.rate?.toString() || '',
            unit: item.unit || '',
            amount: item.amount?.toString() || '',
            cgst_rate: item.cgst_rate?.toString() || '',
            cgst_amount: item.cgst_amount?.toString() || '',
            sgst_rate: item.sgst_rate?.toString() || '',
            sgst_amount: item.sgst_amount?.toString() || '',
            igst_rate: item.igst_rate?.toString() || '',
            igst_amount: item.igst_amount?.toString() || '',
            total_amount: item.total_amount?.toString() || '',
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching GRN details:', error);
      toast.error('Failed to fetch GRN details');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-calculate amounts
      if (field === 'quantity' || field === 'rate') {
        const qty = parseFloat(field === 'quantity' ? value : updated[index].quantity) || 0;
        const rate = parseFloat(field === 'rate' ? value : updated[index].rate) || 0;
        const amount = qty * rate;
        updated[index].amount = amount.toFixed(2);

        // Recalculate taxes
        const cgstRate = parseFloat(updated[index].cgst_rate) || 0;
        const sgstRate = parseFloat(updated[index].sgst_rate) || 0;
        const igstRate = parseFloat(updated[index].igst_rate) || 0;
        updated[index].cgst_amount = ((amount * cgstRate) / 100).toFixed(2);
        updated[index].sgst_amount = ((amount * sgstRate) / 100).toFixed(2);
        updated[index].igst_amount = ((amount * igstRate) / 100).toFixed(2);
        updated[index].total_amount = (
          amount + 
          parseFloat(updated[index].cgst_amount) + 
          parseFloat(updated[index].sgst_amount) + 
          parseFloat(updated[index].igst_amount)
        ).toFixed(2);
      }

      // Calculate tax amounts when rates change
      if (['cgst_rate', 'sgst_rate', 'igst_rate'].includes(field)) {
        const amount = parseFloat(updated[index].amount) || 0;
        if (field === 'cgst_rate') {
          updated[index].cgst_amount = ((amount * parseFloat(value)) / 100).toFixed(2);
        }
        if (field === 'sgst_rate') {
          updated[index].sgst_amount = ((amount * parseFloat(value)) / 100).toFixed(2);
        }
        if (field === 'igst_rate') {
          updated[index].igst_amount = ((amount * parseFloat(value)) / 100).toFixed(2);
        }
        updated[index].total_amount = (
          amount + 
          parseFloat(updated[index].cgst_amount || '0') + 
          parseFloat(updated[index].sgst_amount || '0') + 
          parseFloat(updated[index].igst_amount || '0')
        ).toFixed(2);
      }

      // Auto-fill inventory details when selecting inventory item
      if (field === 'inventory_id' && value) {
        const selectedItem = inventoryItems.find(item => item.id.toString() === value);
        if (selectedItem) {
          updated[index].inventory_name = selectedItem.name || '';
          updated[index].unit = selectedItem.unit || '';
          updated[index].rate = selectedItem.cost?.toString() || '';
        }
      }

      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, {
      inventory_id: '',
      inventory_name: '',
      quantity: '',
      rate: '',
      unit: '',
      amount: '',
      cgst_rate: '',
      cgst_amount: '',
      sgst_rate: '',
      sgst_amount: '',
      igst_rate: '',
      igst_amount: '',
      total_amount: '',
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = useCallback(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalCgst = lineItems.reduce((sum, item) => sum + (parseFloat(item.cgst_amount) || 0), 0);
    const totalSgst = lineItems.reduce((sum, item) => sum + (parseFloat(item.sgst_amount) || 0), 0);
    const totalIgst = lineItems.reduce((sum, item) => sum + (parseFloat(item.igst_amount) || 0), 0);
    const totalTax = totalCgst + totalSgst + totalIgst;
    const otherExp = parseFloat(formData.other_expenses) || 0;
    const loadingExp = parseFloat(formData.loading_expenses) || 0;
    const adjustment = parseFloat(formData.adjustment_amount) || 0;
    const grandTotal = subtotal + totalTax + otherExp + loadingExp + adjustment;

    return { subtotal, totalCgst, totalSgst, totalIgst, totalTax, grandTotal };
  }, [lineItems, formData.other_expenses, formData.loading_expenses, formData.adjustment_amount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendor_id) {
      toast.error('Please select a vendor');
      return;
    }
    if (lineItems.every(item => !item.inventory_id)) {
      toast.error('Please add at least one inventory item');
      return;
    }

    setLoading(true);
    try {
      const totals = calculateTotals();
      const payload = {
        grn_detail: {
          vendor_id: parseInt(formData.vendor_id),
          invoice_number: formData.invoice_number,
          invoice_date: formData.invoice_date,
          posting_date: formData.posting_date,
          payment_mode: formData.payment_mode,
          related_to: formData.related_to,
          other_expenses: parseFloat(formData.other_expenses) || 0,
          loading_expenses: parseFloat(formData.loading_expenses) || 0,
          adjustment_amount: parseFloat(formData.adjustment_amount) || 0,
          status: formData.status,
          description: formData.description,
          invoice_amount: totals.grandTotal,
          inventory_details_attributes: lineItems
            .filter(item => item.inventory_id)
            .map(item => ({
              inventory_id: parseInt(item.inventory_id),
              inventory_name: item.inventory_name,
              quantity: parseFloat(item.quantity) || 0,
              rate: parseFloat(item.rate) || 0,
              unit: item.unit,
              amount: parseFloat(item.amount) || 0,
              cgst_rate: parseFloat(item.cgst_rate) || 0,
              cgst_amount: parseFloat(item.cgst_amount) || 0,
              sgst_rate: parseFloat(item.sgst_rate) || 0,
              sgst_amount: parseFloat(item.sgst_amount) || 0,
              igst_rate: parseFloat(item.igst_rate) || 0,
              igst_amount: parseFloat(item.igst_amount) || 0,
              total_amount: parseFloat(item.total_amount) || 0,
            })),
        }
      };

      await postGRN(payload);
      toast.success(isEditMode ? 'GRN updated successfully' : 'GRN created successfully');
      navigate('/inventory/grn');
    } catch (error) {
      console.error('Error saving GRN:', error);
      toast.error(isEditMode ? 'Failed to update GRN' : 'Failed to create GRN');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="p-6">
      <PageHeader
        title={isEditMode ? 'Edit GRN' : 'Add GRN'}
        breadcrumbs={[
          { label: 'FM Module', path: '/inventory/grn' },
          { label: 'Inventory', path: '/inventory/grn' },
          { label: 'GRN', path: '/inventory/grn' },
          { label: isEditMode ? 'Edit' : 'Add' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">GRN Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Vendor *</label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor: any) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendor_name || vendor.company_name || vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Invoice Number</label>
              <input
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter invoice number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Invoice Date</label>
              <input
                type="date"
                name="invoice_date"
                value={formData.invoice_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Posting Date</label>
              <input
                type="date"
                name="posting_date"
                value={formData.posting_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Payment Mode</label>
              <select
                name="payment_mode"
                value={formData.payment_mode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {paymentModes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Related To</label>
              <input
                type="text"
                name="related_to"
                value={formData.related_to}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter related to"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Enter description"
              />
            </div>
          </div>
        </div>

        {/* Inventory Items Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Inventory Items</h2>
            </div>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">Item *</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">Qty</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">Unit</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">Rate</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">Amount</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">CGST %</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">CGST Amt</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">SGST %</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">SGST Amt</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">IGST %</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">IGST Amt</th>
                  <th className="p-3 text-left text-sm font-medium text-foreground border border-border">Total</th>
                  <th className="p-3 text-center text-sm font-medium text-foreground border border-border w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2 border border-border">
                      <select
                        value={item.inventory_id}
                        onChange={(e) => handleLineItemChange(index, 'inventory_id', e.target.value)}
                        className="w-full px-2 py-1.5 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
                      >
                        <option value="">Select Item</option>
                        {inventoryItems.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} {inv.code ? `(${inv.code})` : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border border-border">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary w-20"
                        placeholder="0"
                        min="0"
                      />
                    </td>
                    <td className="p-2 border border-border">
                      <select
                        value={item.unit}
                        onChange={(e) => handleLineItemChange(index, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-[80px]"
                      >
                        <option value="">Unit</option>
                        {units.map((u: any) => (
                          <option key={u.id || u.name} value={u.name || u.unit_name}>
                            {u.name || u.unit_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border border-border">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                        className="w-full px-2 py-1.5 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary w-24"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-2 border border-border">
                      <input
                        type="text"
                        value={item.amount}
                        readOnly
                        className="w-full px-2 py-1.5 border border-border rounded bg-muted text-foreground text-sm w-24"
                      />
                    </td>
                    <td className="p-2 border border-border">
                      <input
                        type="number"
                        value={item.cgst_rate}
                        onChange={(e) => handleLineItemChange(index, 'cgst_rate', e.target.value)}
                        className="w-full px-2 py-1.5 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary w-16"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-2 border border-border">
                      <input
                        type="text"
                        value={item.cgst_amount}
                        readOnly
                        className="w-full px-2 py-1.5 border border-border rounded bg-muted text-foreground text-sm w-20"
                      />
                    </td>
                    <td className="p-2 border border-border">
                      <input
                        type="number"
                        value={item.sgst_rate}
                        onChange={(e) => handleLineItemChange(index, 'sgst_rate', e.target.value)}
                        className="w-full px-2 py-1.5 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary w-16"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-2 border border-border">
                      <input
                        type="text"
                        value={item.sgst_amount}
                        readOnly
                        className="w-full px-2 py-1.5 border border-border rounded bg-muted text-foreground text-sm w-20"
                      />
                    </td>
                    <td className="p-2 border border-border">
                      <input
                        type="number"
                        value={item.igst_rate}
                        onChange={(e) => handleLineItemChange(index, 'igst_rate', e.target.value)}
                        className="w-full px-2 py-1.5 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary w-16"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-2 border border-border">
                      <input
                        type="text"
                        value={item.igst_amount}
                        readOnly
                        className="w-full px-2 py-1.5 border border-border rounded bg-muted text-foreground text-sm w-20"
                      />
                    </td>
                    <td className="p-2 border border-border">
                      <input
                        type="text"
                        value={item.total_amount}
                        readOnly
                        className="w-full px-2 py-1.5 border border-border rounded bg-muted text-foreground text-sm font-medium w-24"
                      />
                    </td>
                    <td className="p-2 border border-border text-center">
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses & Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Additional Expenses */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Additional Expenses</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Other Expenses</label>
                <input
                  type="number"
                  name="other_expenses"
                  value={formData.other_expenses}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Loading Expenses</label>
                <input
                  type="number"
                  name="loading_expenses"
                  value={formData.loading_expenses}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Adjustment Amount</label>
                <input
                  type="number"
                  name="adjustment_amount"
                  value={formData.adjustment_amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total CGST:</span>
                <span className="text-foreground">₹{totals.totalCgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total SGST:</span>
                <span className="text-foreground">₹{totals.totalSgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total IGST:</span>
                <span className="text-foreground">₹{totals.totalIgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Other Expenses:</span>
                <span className="text-foreground">₹{(parseFloat(formData.other_expenses) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Loading Expenses:</span>
                <span className="text-foreground">₹{(parseFloat(formData.loading_expenses) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Adjustment:</span>
                <span className="text-foreground">₹{(parseFloat(formData.adjustment_amount) || 0).toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-foreground">Grand Total:</span>
                  <span className="text-primary">₹{totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
          </div>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG, DOC (Max 10MB)
              </p>
            </label>
            {attachments.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {attachments.map((file, index) => (
                  <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm text-foreground">
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/inventory/grn')}
            className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <span className="animate-spin">⟳</span>}
            {isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGRN;
