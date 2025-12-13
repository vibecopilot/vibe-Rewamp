import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
    if (!formData.receiptNumber) { toast.error('Receipt Number is required'); return; }
    if (!formData.invoiceNumber) { toast.error('Invoice Number is required'); return; }
    if (!formData.paymentMode) { toast.error('Payment Mode is required'); return; }
    if (!formData.transactionChequeNumber) { toast.error('Transaction/Cheque Number is required'); return; }
    if (!formData.paymentDate) { toast.error('Payment Date is required'); return; }
    if (!formData.receiptDate) { toast.error('Receipt Date is required'); return; }

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
    <div className="w-full flex flex-col overflow-hidden">
      <div className="p-6">
        <Breadcrumb
          items={[
            { label: 'Finance', path: '/finance/cam' },
            { label: 'CAM', path: '/finance/cam/receipt-invoice' },
            { label: 'Create Invoice Receipt' },
          ]}
        />
      </div>

      <h2
        style={{ background: themeColor }}
        className="text-center text-xl font-bold my-5 p-2 rounded-full text-white mx-10"
      >
        Create Invoice Receipt
      </h2>

      <div className="flex justify-center">
        <div className="sm:border border-gray-400 p-1 md:px-10 rounded-lg w-4/5 mb-14">
          <div className="md:grid grid-cols-3 gap-5 my-3">
            <div className="flex flex-col">
              <label className="font-semibold my-2">Receipt Number</label>
              <input
                type="text"
                name="receiptNumber"
                value={formData.receiptNumber}
                onChange={handleChange}
                placeholder="Enter Receipt Number"
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Invoice Number</label>
              <select
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="border p-1 px-4 border-gray-500 rounded-md"
              >
                <option value="">Select Invoice Number</option>
                {camBilling.map((invoiceNumber, index) => (
                  <option key={index} value={invoiceNumber}>{invoiceNumber}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Payment Mode</label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="border p-1 px-4 border-gray-500 rounded-md"
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
            <div className="flex flex-col">
              <label className="font-semibold my-2">Amount Received</label>
              <input
                type="text"
                name="amountReceived"
                value={formData.amountReceived}
                onChange={handleChange}
                placeholder="Enter Amount"
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Transaction / Cheque Number</label>
              <input
                type="text"
                name="transactionChequeNumber"
                value={formData.transactionChequeNumber}
                onChange={handleChange}
                placeholder="Enter Transaction/Cheque Number"
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Enter Bank Name"
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Branch Name</label>
              <input
                type="text"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                placeholder="Enter Branch Name"
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Payment Date</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold my-2">Receipt Date</label>
              <input
                type="date"
                name="receiptDate"
                value={formData.receiptDate}
                onChange={handleChange}
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
            <div className="flex flex-col col-span-3">
              <label className="font-semibold my-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Enter Notes"
                className="border p-1 px-4 border-gray-500 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 my-5">
            <button
              onClick={() => navigate('/finance/cam/receipt-invoice')}
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

export default AddReceiptInvoice;
