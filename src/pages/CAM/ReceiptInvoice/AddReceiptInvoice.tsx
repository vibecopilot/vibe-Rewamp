import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getCamBillingData, postInvoiceReceipt } from '@/api';
import toast from 'react-hot-toast';

const AddReceiptInvoice: React.FC = () => {
  const navigate = useNavigate();
  const themeColor = useSelector((state: any) => state.theme.color);
  const [camBilling, setCamBilling] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    receiptNumber: '',
    invoiceNumber: '',
    paymentMode: '',
    amountReceived: '',
    transactionChequeNumber: '',
    bankName: '',
    branchName: '',
    paymentDate: '',
    receiptDate: '',
    notes: '',
  });

  useEffect(() => {
    const fetchCamBilling = async () => {
      try {
        const response = await getCamBillingData();
        const invoiceNumbers = response.data.map((item: any) => item.invoice_number);
        setCamBilling(invoiceNumbers);
      } catch (err) {
        console.error('Failed to fetch CAM Billing data:', err);
      }
    };
    fetchCamBilling();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.receiptNumber) {
      toast.error('Receipt Number is required');
      return;
    }
    if (!formData.invoiceNumber) {
      toast.error('Invoice Number is required');
      return;
    }
    if (!formData.paymentMode) {
      toast.error('Payment Mode is required');
      return;
    }
    if (!formData.transactionChequeNumber) {
      toast.error('Transaction/Cheque Number is required');
      return;
    }
    if (!formData.paymentDate) {
      toast.error('Payment Date is required');
      return;
    }
    if (!formData.receiptDate) {
      toast.error('Receipt Date is required');
      return;
    }

    const sendData = new FormData();
    sendData.append('invoice_receipt[receipt_number]', formData.receiptNumber);
    sendData.append('invoice_receipt[invoice_number]', formData.invoiceNumber);
    sendData.append('invoice_receipt[payment_mode]', formData.paymentMode);
    sendData.append('invoice_receipt[amount_received]', formData.amountReceived);
    sendData.append('invoice_receipt[transaction_or_cheque_number]', formData.transactionChequeNumber);
    sendData.append('invoice_receipt[bank_name]', formData.bankName);
    sendData.append('invoice_receipt[branch_name]', formData.branchName);
    sendData.append('invoice_receipt[payment_date]', formData.paymentDate);
    sendData.append('invoice_receipt[receipt_date]', formData.receiptDate);
    sendData.append('invoice_receipt[notes]', formData.notes);

    try {
      await postInvoiceReceipt(sendData);
      toast.success('Invoice Receipt Added Successfully');
      navigate('/finance/cam/receipt-invoice');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add Invoice Receipt');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Finance', path: '/finance/cam' },
          { label: 'CAM', path: '/finance/cam/receipt-invoice' },
          { label: 'Create Invoice Receipt' },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 border-b">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Create Invoice Receipt</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Receipt Number</Label>
              <Input
                name="receiptNumber"
                value={formData.receiptNumber}
                onChange={handleChange}
                placeholder="Enter Receipt Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <select
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Select Invoice Number</option>
                {camBilling.map((invoiceNumber, index) => (
                  <option key={index} value={invoiceNumber}>{invoiceNumber}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Select Mode</option>
                <option value="online">Online</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="credit_card">Credit Card</option>
                <option value="neft">NEFT</option>
                <option value="rtgs">RTGS</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Amount Received</Label>
              <Input
                name="amountReceived"
                value={formData.amountReceived}
                onChange={handleChange}
                placeholder="Enter Amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Transaction / Cheque Number</Label>
              <Input
                name="transactionChequeNumber"
                value={formData.transactionChequeNumber}
                onChange={handleChange}
                placeholder="Enter Transaction/Cheque Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Enter Bank Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                placeholder="Enter Branch Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Receipt Date</Label>
              <Input
                type="date"
                name="receiptDate"
                value={formData.receiptDate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Notes</Label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter Notes"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/finance/cam/receipt-invoice')}>
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

export default AddReceiptInvoice;
