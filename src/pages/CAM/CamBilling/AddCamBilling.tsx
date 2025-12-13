import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RiDeleteBin5Line } from 'react-icons/ri';
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

    if (name === 'discount') {
      const discount = value ? parseFloat(value) : 0;
      camBilling.discount = discount;
      camBilling.percentage = camBilling.totalValue > 0 ? (discount / camBilling.totalValue) * 100 : 0;
      camBilling.taxableValue = camBilling.totalValue - discount;
    }

    if (name === 'percentage') {
      const percentage = value ? parseFloat(value) : 0;
      camBilling.percentage = percentage;
      camBilling.discount = (percentage / 100) * camBilling.totalValue;
      camBilling.taxableValue = camBilling.totalValue - camBilling.discount;
    }

    if (name === 'cgstRate') {
      const rateValue = parseFloat(value) || 0;
      camBilling.cgstRate = rateValue;
      camBilling.cgstAmount = (camBilling.taxableValue * rateValue) / 100;
      camBilling.sgstRate = rateValue;
      camBilling.sgstAmount = (camBilling.taxableValue * rateValue) / 100;
    }

    if (name === 'sgstRate') {
      const rateValue = parseFloat(value) || 0;
      camBilling.sgstRate = rateValue;
      camBilling.sgstAmount = (camBilling.taxableValue * rateValue) / 100;
      camBilling.cgstRate = rateValue;
      camBilling.cgstAmount = (camBilling.taxableValue * rateValue) / 100;
    }

    if (name === 'igstRate') {
      const rateValue = parseFloat(value) || 0;
      camBilling.igstRate = rateValue;
      camBilling.igstAmount = (camBilling.taxableValue * rateValue) / 100;
    }

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
    if (!formData.invoice_type) { toast.error('Invoice Type is required'); return; }
    if (!formData.invoiceAddress) { toast.error('Invoice Address is required'); return; }
    if (!formData.invoice_number) { toast.error('Invoice Number is required'); return; }
    if (!formData.dueDate) { toast.error('Due Date is required'); return; }
    if (!formData.block) { toast.error('Block is required'); return; }
    if (!formData.floor_name) { toast.error('Floor is required'); return; }
    if (!formData.flat) { toast.error('Flat is required'); return; }

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
    <div className="w-full flex flex-col overflow-hidden">
      <div className="p-6">
        <Breadcrumb
          items={[
            { label: 'Finance', path: '/finance/cam' },
            { label: 'CAM', path: '/finance/cam/billing' },
            { label: 'Add CAM Billing' },
          ]}
        />
      </div>

      <h2
        style={{ background: themeColor }}
        className="text-center text-xl font-bold my-5 p-2 rounded-full text-white mx-10"
      >
        Add CAM Billing
      </h2>

      <div className="flex justify-center">
        <div className="sm:border border-gray-400 p-1 md:px-10 rounded-lg w-4/5 mb-14">
          <div className="md:grid grid-cols-3 gap-5 my-3">
            <div className="flex flex-col">
              <label className="font-semibold my-2">Invoice Type</label>
              <select
                name="invoice_type"
                value={formData.invoice_type}
                onChange={handleFormChange}
                className="border p-1 px-4 border-gray-500 rounded-md"
              >
                <option value="">Select Invoice Type</option>
                <option value="cam">CAM</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Invoice Address</label>
              <select
                name="invoiceAddress"
                value={formData.invoiceAddress}
                onChange={handleFormChange}
                className="border p-1 px-4 border-gray-500 rounded-md"
              >
                <option value="">Select Address</option>
                {invoiceAdd.map((address) => (
                  <option key={address.id} value={address.id}>{address.title}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Invoice Number</label>
              <input
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleFormChange}
                placeholder="Enter Invoice Number"
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleFormChange}
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Date of Supply</label>
              <input
                type="date"
                name="dateSupply"
                value={formData.dateSupply}
                onChange={handleFormChange}
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Billing Period</label>
              <DatePicker
                selectsRange
                startDate={billingPeriod[0]}
                endDate={billingPeriod[1]}
                onChange={handleDateChange}
                placeholderText="Select Billing Period"
                className="border p-1 px-4 border-gray-500 rounded-md w-full"
                isClearable
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Block</label>
              <select
                name="block"
                value={formData.block}
                onChange={handleFormChange}
                className="border p-1 px-4 border-gray-500 rounded-md"
              >
                <option value="">Select Building</option>
                {buildings?.map((building: any) => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Floor</label>
              <select
                name="floor_name"
                value={formData.floor_name}
                onChange={handleFormChange}
                disabled={!floors.length}
                className="border p-1 px-4 border-gray-500 rounded-md"
              >
                <option value="">Select Floor</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>{floor.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Flat</label>
              <select
                name="flat"
                value={formData.flat}
                onChange={handleFormChange}
                disabled={isFlatDisabled}
                className="border p-1 px-4 border-gray-500 rounded-md"
              >
                <option value="">Select Flat</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Previous Due Amount</label>
              <input
                type="number"
                value={previousDueAmount}
                onChange={(e) => setPreviousDueAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter Previous Due Amount"
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Previous Due Amount Interest</label>
              <input
                type="number"
                value={previousDueAmountInterest}
                onChange={(e) => setPreviousDueAmountInterest(parseFloat(e.target.value) || 0)}
                placeholder="Enter Interest"
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
          </div>

          <h2 className="border-b border-black my-5 font-semibold text-xl">Charges</h2>

          {fields.map((field, index) => (
            <div key={index} className="md:grid grid-cols-3 gap-5 my-3 border p-5 rounded-md">
              <div className="flex flex-col">
                <label className="font-semibold my-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={field.description}
                  onChange={(e) => handleChargeChange(e, index)}
                  placeholder="Enter Description"
                  className="border p-1 px-4 border-gray-500 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">SAC/HSN Code</label>
                <input
                  type="text"
                  name="sacHsnCode"
                  value={field.sacHsnCode}
                  onChange={(e) => handleChargeChange(e, index)}
                  placeholder="Enter SAC/HSN Code"
                  className="border p-1 px-4 border-gray-500 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">Qty</label>
                <input
                  type="number"
                  name="qty"
                  value={field.qty}
                  onChange={(e) => handleChargeChange(e, index)}
                  placeholder="Enter Qty"
                  className="border p-1 px-4 border-gray-500 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">Unit</label>
                <input
                  type="text"
                  name="unit"
                  value={field.unit}
                  onChange={(e) => handleChargeChange(e, index)}
                  placeholder="Enter Unit"
                  className="border p-1 px-4 border-gray-500 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">Rate</label>
                <input
                  type="number"
                  name="rate"
                  value={field.rate}
                  onChange={(e) => handleChargeChange(e, index)}
                  placeholder="Enter Rate"
                  className="border p-1 px-4 border-gray-500 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">Total Value</label>
                <input
                  type="number"
                  value={field.totalValue}
                  readOnly
                  className="border p-1 px-4 border-gray-500 rounded-md bg-gray-100"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">Discount %</label>
                <input
                  type="number"
                  name="percentage"
                  value={field.percentage}
                  onChange={(e) => handleChargeChange(e, index)}
                  placeholder="Enter %"
                  className="border p-1 px-4 border-gray-500 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">Discount Amount</label>
                <input
                  type="number"
                  name="discount"
                  value={field.discount}
                  onChange={(e) => handleChargeChange(e, index)}
                  placeholder="Enter Amount"
                  className="border p-1 px-4 border-gray-500 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">Taxable Value</label>
                <input
                  type="number"
                  value={field.taxableValue}
                  readOnly
                  className="border p-1 px-4 border-gray-500 rounded-md bg-gray-100"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">CGST Rate</label>
                <input
                  type="number"
                  name="cgstRate"
                  value={field.cgstRate}
                  onChange={(e) => handleChargeChange(e, index)}
                  placeholder="CGST Rate"
                  className="border p-1 px-4 border-gray-500 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">CGST Amount</label>
                <input
                  type="number"
                  value={field.cgstAmount}
                  readOnly
                  className="border p-1 px-4 border-gray-500 rounded-md bg-gray-100"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">SGST Rate</label>
                <input
                  type="number"
                  name="sgstRate"
                  value={field.sgstRate}
                  onChange={(e) => handleChargeChange(e, index)}
                  placeholder="SGST Rate"
                  className="border p-1 px-4 border-gray-500 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">SGST Amount</label>
                <input
                  type="number"
                  value={field.sgstAmount}
                  readOnly
                  className="border p-1 px-4 border-gray-500 rounded-md bg-gray-100"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">IGST Rate</label>
                <input
                  type="number"
                  name="igstRate"
                  value={field.igstRate}
                  onChange={(e) => handleChargeChange(e, index)}
                  placeholder="IGST Rate"
                  className="border p-1 px-4 border-gray-500 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">IGST Amount</label>
                <input
                  type="number"
                  value={field.igstAmount}
                  readOnly
                  className="border p-1 px-4 border-gray-500 rounded-md bg-gray-100"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold my-2">Total</label>
                <input
                  type="number"
                  value={field.total}
                  readOnly
                  className="border p-1 px-4 border-gray-500 rounded-md bg-gray-100"
                />
              </div>
              <div className="flex justify-start items-center mt-8">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md"
                >
                  <RiDeleteBin5Line />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between gap-2">
            <button
              style={{ background: themeColor }}
              className="text-white p-2 px-4 rounded-md font-medium"
              onClick={handleAdd}
            >
              Add
            </button>
            <button className="bg-black text-white p-2 px-4 rounded-md font-medium">
              Total Amount: {totalAmount.toFixed(2)}
            </button>
          </div>

          <div className="md:grid grid-cols-2 gap-5 my-3">
            <div className="flex flex-col col-span-2">
              <label className="font-semibold my-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                rows={3}
                placeholder="Enter extra notes"
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 my-5">
            <button
              onClick={() => navigate('/finance/cam/billing')}
              className="p-2 px-6 border-2 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="p-2 px-6 border-2 rounded-md text-white font-medium"
              style={{ background: themeColor }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCamBilling;
