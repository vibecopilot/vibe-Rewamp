import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Trash2, Plus, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Breadcrumb from '@/components/ui/Breadcrumb';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { postCamBill, getFloors, getUnits, getAddressSetup } from '@/api';
import { getItemInLocalStorage } from '@/utils/localStorage';
import toast from 'react-hot-toast';

interface ChargeField {
  description: string;
  sacHsnCode: string;
  qty: string;
  unit: string;
  rate: string;
  totalValue: number;
  percentage: number;
  discount: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  total: number;
}

const AddCamBilling: React.FC = () => {
  const buildings = getItemInLocalStorage('Building') || [];
  const navigate = useNavigate();
  const themeColor = useSelector((state: any) => state.theme.color);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<[Date | null, Date | null]>([null, null]);
  const [invoiceAdd, setInvoiceAdd] = useState<any[]>([]);
  const [previousDueAmount, setPreviousDueAmount] = useState<number>(0);
  const [previousDueAmountInterest, setPreviousDueAmountInterest] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    invoice_type: '',
    invoiceAddress: '',
    invoice_number: '',
    dueDate: '',
    dateSupply: '',
    block: '',
    floor_name: '',
    flat: '',
    notes: '',
  });

  const [fields, setFields] = useState<ChargeField[]>([
    {
      description: '',
      sacHsnCode: '',
      qty: '',
      unit: '',
      rate: '',
      totalValue: 0,
      percentage: 0,
      discount: 0,
      taxableValue: 0,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: 0,
      igstAmount: 0,
      total: 0,
    },
  ]);

  useEffect(() => {
    const fetchAddressSetup = async () => {
      try {
        const response = await getAddressSetup();
        setInvoiceAdd(response.data);
      } catch (err) {
        console.error('Failed to fetch Address Setup data:', err);
      }
    };
    fetchAddressSetup();
  }, []);

  const handleAdd = () => {
    setFields([
      ...fields,
      {
        description: '',
        sacHsnCode: '',
        qty: '',
        unit: '',
        rate: '',
        totalValue: 0,
        percentage: 0,
        discount: 0,
        taxableValue: 0,
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: 0,
        igstAmount: 0,
        total: 0,
      },
    ]);
  };

  const handleRemove = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  const handleChargeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    const updatedFields = [...fields];
    const camBilling = updatedFields[index];

    (camBilling as any)[name] = value;

    // Calculate totalValue when qty or rate changes
    if (name === 'qty' || name === 'rate') {
      const qty = name === 'qty' ? parseFloat(value) || 0 : parseFloat(camBilling.qty) || 0;
      const rate = name === 'rate' ? parseFloat(value) || 0 : parseFloat(camBilling.rate) || 0;
      camBilling.totalValue = qty * rate;
      camBilling.taxableValue = camBilling.totalValue;

      if (camBilling.discount) {
        camBilling.taxableValue = camBilling.totalValue - camBilling.discount;
      }
      if (camBilling.percentage) {
        camBilling.discount = (camBilling.percentage / 100) * camBilling.totalValue;
        camBilling.taxableValue = camBilling.totalValue - camBilling.discount;
      }
    }

    // Handle discount
    if (name === 'discount') {
      const discount = value ? parseFloat(value) : 0;
      camBilling.discount = discount;
      camBilling.percentage = camBilling.totalValue > 0 ? (discount / camBilling.totalValue) * 100 : 0;
      camBilling.taxableValue = camBilling.totalValue - discount;
    }

    // Handle percentage
    if (name === 'percentage') {
      const percentage = value ? parseFloat(value) : 0;
      camBilling.percentage = percentage;
      camBilling.discount = (percentage / 100) * camBilling.totalValue;
      camBilling.taxableValue = camBilling.totalValue - camBilling.discount;
    }

    // Calculate CGST
    if (name === 'cgstRate') {
      const rateValue = parseFloat(value) || 0;
      camBilling.cgstRate = rateValue;
      camBilling.cgstAmount = (camBilling.taxableValue * rateValue) / 100;
      camBilling.sgstRate = rateValue;
      camBilling.sgstAmount = (camBilling.taxableValue * rateValue) / 100;
    }

    // Calculate SGST
    if (name === 'sgstRate') {
      const rateValue = parseFloat(value) || 0;
      camBilling.sgstRate = rateValue;
      camBilling.sgstAmount = (camBilling.taxableValue * rateValue) / 100;
      camBilling.cgstRate = rateValue;
      camBilling.cgstAmount = (camBilling.taxableValue * rateValue) / 100;
    }

    // Calculate IGST
    if (name === 'igstRate') {
      const rateValue = parseFloat(value) || 0;
      camBilling.igstRate = rateValue;
      camBilling.igstAmount = (camBilling.taxableValue * rateValue) / 100;
    }

    // Calculate total
    camBilling.total =
      (camBilling.taxableValue || 0) +
      (camBilling.cgstAmount || 0) +
      (camBilling.sgstAmount || 0) +
      (camBilling.igstAmount || 0);

    setFields(updatedFields);
  };

  const handleFormChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'block') {
      try {
        const response = await getFloors(Number(value));
        setFloors(response.data.map((item: any) => ({ name: item.name, id: item.id })));
      } catch (error) {
        console.error('Error fetching floors:', error);
      }
      setFormData((prev) => ({ ...prev, block: value, floor_name: '', flat: '' }));
    } else if (name === 'floor_name') {
      try {
        const response = await getUnits(Number(value));
        setUnits(response.data.map((item: any) => ({ name: item.name, id: item.id })));
      } catch (error) {
        console.error('Error fetching units:', error);
      }
      setFormData((prev) => ({ ...prev, floor_name: value, flat: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setBillingPeriod(dates);
  };

  const totalAmount =
    fields.reduce((sum, field) => sum + (field.total || 0), 0) +
    previousDueAmount +
    previousDueAmountInterest;

  const handleSubmit = async () => {
    if (!formData.invoice_type) {
      toast.error('Invoice Type is required');
      return;
    }
    if (!formData.invoiceAddress) {
      toast.error('Invoice Address is required');
      return;
    }
    if (!formData.invoice_number) {
      toast.error('Invoice Number is required');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Due Date is required');
      return;
    }
    if (!formData.block) {
      toast.error('Block is required');
      return;
    }
    if (!formData.floor_name) {
      toast.error('Floor is required');
      return;
    }
    if (!formData.flat) {
      toast.error('Flat is required');
      return;
    }

    const sendData = new FormData();
    sendData.append('cam_bill[invoice_type]', formData.invoice_type);
    sendData.append('cam_bill[invoice_address_id]', formData.invoiceAddress);
    sendData.append('cam_bill[invoice_number]', formData.invoice_number);
    sendData.append('cam_bill[due_date]', formData.dueDate);
    sendData.append('cam_bill[supply_date]', formData.dateSupply);
    sendData.append('cam_bill[building_id]', formData.block);
    sendData.append('cam_bill[floor_id]', formData.floor_name);
    sendData.append('cam_bill[unit_id]', formData.flat);
    sendData.append('cam_bill[due_amount]', String(previousDueAmount));
    sendData.append('cam_bill[due_amount_interst]', String(previousDueAmountInterest));
    sendData.append('cam_bill[note]', formData.notes);

    if (billingPeriod[0] && billingPeriod[1]) {
      sendData.append('cam_bill[bill_period_start_date]', billingPeriod[0].toISOString().split('T')[0]);
      sendData.append('cam_bill[bill_period_end_date]', billingPeriod[1].toISOString().split('T')[0]);
    } else {
      sendData.append('cam_bill[bill_period_start_date]', '');
      sendData.append('cam_bill[bill_period_end_date]', '');
    }

    fields.forEach((item) => {
      sendData.append('cam_bill[cam_bill_charges_attributes][][description]', item.description);
      sendData.append('cam_bill[cam_bill_charges_attributes][][hsn_id]', item.sacHsnCode);
      sendData.append('cam_bill[cam_bill_charges_attributes][][quantity]', item.qty);
      sendData.append('cam_bill[cam_bill_charges_attributes][][unit]', item.unit);
      sendData.append('cam_bill[cam_bill_charges_attributes][][rate]', item.rate);
      sendData.append('cam_bill[cam_bill_charges_attributes][][total_value]', String(item.totalValue));
      sendData.append('cam_bill[cam_bill_charges_attributes][][discount_percent]', String(item.percentage));
      sendData.append('cam_bill[cam_bill_charges_attributes][][discount_amount]', String(item.discount));
      sendData.append('cam_bill[cam_bill_charges_attributes][][taxable_value]', String(item.taxableValue));
      sendData.append('cam_bill[cam_bill_charges_attributes][][cgst_rate]', String(item.cgstRate));
      sendData.append('cam_bill[cam_bill_charges_attributes][][cgst_amount]', String(item.cgstAmount));
      sendData.append('cam_bill[cam_bill_charges_attributes][][sgst_rate]', String(item.sgstRate));
      sendData.append('cam_bill[cam_bill_charges_attributes][][sgst_amount]', String(item.sgstAmount));
      sendData.append('cam_bill[cam_bill_charges_attributes][][igst_rate]', String(item.igstRate));
      sendData.append('cam_bill[cam_bill_charges_attributes][][igst_amount]', String(item.igstAmount));
      sendData.append('cam_bill[cam_bill_charges_attributes][][total]', String(item.total));
    });

    try {
      await postCamBill(sendData);
      toast.success('CAM Bill Added Successfully');
      navigate('/finance/cam/billing');
    } catch (error) {
      console.log(error);
      toast.error('Failed to add CAM Bill');
    }
  };

  const isFlatDisabled = !formData.block || !formData.floor_name || !units.length;

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Finance', path: '/finance/cam' },
          { label: 'CAM', path: '/finance/cam/billing' },
          { label: 'Add CAM Billing' },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 border-b">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Add CAM Billing</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Invoice Type</Label>
              <select
                name="invoice_type"
                value={formData.invoice_type}
                onChange={handleFormChange}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Select Invoice Type</option>
                <option value="cam">CAM</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Invoice Address</Label>
              <select
                name="invoiceAddress"
                value={formData.invoiceAddress}
                onChange={handleFormChange}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Select Address</option>
                {invoiceAdd.map((address) => (
                  <option key={address.id} value={address.id}>{address.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleFormChange}
                placeholder="Enter Invoice Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Supply</Label>
              <Input
                type="date"
                name="dateSupply"
                value={formData.dateSupply}
                onChange={handleFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Billing Period</Label>
              <DatePicker
                selectsRange
                startDate={billingPeriod[0]}
                endDate={billingPeriod[1]}
                onChange={handleDateChange}
                placeholderText="Select Billing Period"
                className="w-full p-2 border border-border rounded-md bg-background"
                isClearable
              />
            </div>
            <div className="space-y-2">
              <Label>Block</Label>
              <select
                name="block"
                value={formData.block}
                onChange={handleFormChange}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Select Building</option>
                {buildings?.map((building: any) => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Floor</Label>
              <select
                name="floor_name"
                value={formData.floor_name}
                onChange={handleFormChange}
                disabled={!floors.length}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Select Floor</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>{floor.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Flat</Label>
              <select
                name="flat"
                value={formData.flat}
                onChange={handleFormChange}
                disabled={isFlatDisabled}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Select Flat</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Previous Due Amount</Label>
              <Input
                type="number"
                value={previousDueAmount}
                onChange={(e) => setPreviousDueAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter Previous Due Amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Previous Due Amount Interest</Label>
              <Input
                type="number"
                value={previousDueAmountInterest}
                onChange={(e) => setPreviousDueAmountInterest(parseFloat(e.target.value) || 0)}
                placeholder="Enter Interest"
              />
            </div>
          </div>

          {/* Charges Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Charges</h3>
            {fields.map((field, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      name="description"
                      value={field.description}
                      onChange={(e) => handleChargeChange(e, index)}
                      placeholder="Enter Description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SAC/HSN Code</Label>
                    <Input
                      name="sacHsnCode"
                      value={field.sacHsnCode}
                      onChange={(e) => handleChargeChange(e, index)}
                      placeholder="Enter SAC/HSN Code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      name="qty"
                      value={field.qty}
                      onChange={(e) => handleChargeChange(e, index)}
                      placeholder="Enter Qty"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      name="unit"
                      value={field.unit}
                      onChange={(e) => handleChargeChange(e, index)}
                      placeholder="Enter Unit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate</Label>
                    <Input
                      type="number"
                      name="rate"
                      value={field.rate}
                      onChange={(e) => handleChargeChange(e, index)}
                      placeholder="Enter Rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Value</Label>
                    <Input
                      type="number"
                      name="totalValue"
                      value={field.totalValue}
                      readOnly
                      placeholder="Total Value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      name="percentage"
                      value={field.percentage}
                      onChange={(e) => handleChargeChange(e, index)}
                      placeholder="Enter %"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Amount</Label>
                    <Input
                      type="number"
                      name="discount"
                      value={field.discount}
                      onChange={(e) => handleChargeChange(e, index)}
                      placeholder="Enter Amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taxable Value</Label>
                    <Input
                      type="number"
                      name="taxableValue"
                      value={field.taxableValue}
                      readOnly
                      placeholder="Taxable Value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CGST Rate</Label>
                    <Input
                      type="number"
                      name="cgstRate"
                      value={field.cgstRate}
                      onChange={(e) => handleChargeChange(e, index)}
                      placeholder="CGST Rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CGST Amount</Label>
                    <Input
                      type="number"
                      name="cgstAmount"
                      value={field.cgstAmount}
                      readOnly
                      placeholder="CGST Amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SGST Rate</Label>
                    <Input
                      type="number"
                      name="sgstRate"
                      value={field.sgstRate}
                      onChange={(e) => handleChargeChange(e, index)}
                      placeholder="SGST Rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SGST Amount</Label>
                    <Input
                      type="number"
                      name="sgstAmount"
                      value={field.sgstAmount}
                      readOnly
                      placeholder="SGST Amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IGST Rate</Label>
                    <Input
                      type="number"
                      name="igstRate"
                      value={field.igstRate}
                      onChange={(e) => handleChargeChange(e, index)}
                      placeholder="IGST Rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IGST Amount</Label>
                    <Input
                      type="number"
                      name="igstAmount"
                      value={field.igstAmount}
                      readOnly
                      placeholder="IGST Amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total</Label>
                    <Input
                      type="number"
                      name="total"
                      value={field.total}
                      readOnly
                      placeholder="Total"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <Button onClick={handleAdd} style={{ background: themeColor }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Charge
              </Button>
              <div className="text-lg font-semibold">
                Total Amount: ₹{totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              placeholder="Enter extra notes"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/finance/cam/billing')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} style={{ background: themeColor }}>
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCamBilling;
