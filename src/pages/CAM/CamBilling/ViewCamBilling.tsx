import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaDownload, FaRegFileAlt } from 'react-icons/fa';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Table from '@/components/table/Table';
import {
  domainPrefix,
  getAddressSetupDetails,
  getCamBillingDataDetails,
  getCamBillInvoiceDownload,
  getCamLogo,
  downloadReceiptInvoice,
} from '@/api';
import { toWords } from 'number-to-words';
import toast from 'react-hot-toast';
import RecallInvoiceModal from '@/containers/modals/RecallInvoiceModal';
import CAMBillInvoiceReceivePaymentModal from '@/containers/modals/CAMBillInvoiceReceivePaymentModal';

const ViewCamBilling: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const themeColor = useSelector((state: any) => state.theme.color);
  const [recallModal, setRecallModal] = useState(false);
  const [receivePayment, setReceivePayment] = useState(false);
  const [camBilling, setCamBilling] = useState<any>({});
  const [camBillingAllData, setCamBillingAllData] = useState<any>({});
  const [invoiceReceipt, setInvoiceReceipt] = useState<any[]>([]);
  const [addressInvoice, setAddressInvoice] = useState<any>({});
  const [receiver, setReceiver] = useState<any>({});
  const [logo, setLogo] = useState<any>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);
  const [receivePaymentDetails, setReceivePaymentDetails] = useState<any[]>([]);

  const fetchAddressSetupDetails = async (addressId: number) => {
    try {
      const response = await getAddressSetupDetails(addressId);
      setAddressInvoice(response.data);
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const fetchCamBilling = async () => {
    try {
      const response = await getCamBillingDataDetails(id);
      setCamBillingAllData(response.data);
      setCamBilling(response.data);
      if (response.data.invoice_address_id) {
        fetchAddressSetupDetails(response.data.invoice_address_id);
      }
      setReceiver(response.data.reciever_details || {});
      setInvoiceReceipt(response.data.invoice_receipts || []);
      setReceivePaymentDetails(response.data.payments || []);
      setTotalAmount(response.data.total_amount || 0);
      setTotalAmountPaid(
        (response.data.payments || []).reduce((sum: number, item: any) => sum + (item.total_amount || 0), 0)
      );
    } catch (err) {
      console.error('Failed to fetch CAM Billing data:', err);
    }
  };

  const fetchLogo = async () => {
    try {
      const response = await getCamLogo();
      setLogo(response.data);
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  useEffect(() => {
    fetchCamBilling();
    fetchLogo();
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await getCamBillInvoiceDownload(id);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cam_invoice_file.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CAM Billing Invoice downloaded successfully');
    } catch (error) {
      toast.error('Error downloading invoice');
    }
  };

  const downloadReceipt = async (receiptId: number) => {
    try {
      const response = await downloadReceiptInvoice(receiptId);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'receipt_invoice_file.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Error downloading receipt');
    }
  };

  const getStatusBadge = () => {
    if (totalAmountPaid === 0) {
      return <button className="bg-black text-white p-2 px-5 w-fit rounded-md">Unpaid</button>;
    } else if (totalAmountPaid < totalAmount) {
      return <button className="bg-yellow-500 text-white p-2 px-5 w-fit rounded-md">Partial Paid</button>;
    } else if (totalAmountPaid > totalAmount) {
      return <button className="bg-blue-500 text-white p-2 px-5 w-fit rounded-md">Paid Extra</button>;
    }
    return <button className="bg-green-500 text-white p-2 px-5 w-fit rounded-md">Paid</button>;
  };

  const columnsPaymentDetails = [
    { name: 'Previous Amount Due', selector: (row: any) => row.due_amount, sortable: true },
    { name: 'Current Charges', selector: (row: any) => row.total_charge, sortable: true },
    { name: 'Interest Amt on previous dues', selector: (row: any) => row.due_amount_interst, sortable: true },
    { name: 'Total Amount Due', selector: (row: any) => row.total_amount, sortable: true },
    { name: 'Due Date', selector: (row: any) => row.due_date, sortable: true },
  ];

  const columnsReceipts = [
    { name: 'Receipt No.', selector: (row: any) => row.receipt_number, sortable: true },
    { name: 'Invoice No.', selector: (row: any) => row.invoice_number, sortable: true },
    { name: 'Customer Name', selector: (row: any) => row.customer_name, sortable: true },
    { name: 'Amount Received', selector: (row: any) => row.amount_received, sortable: true },
    { name: 'Payment Mode', selector: (row: any) => row.payment_mode, sortable: true },
    { name: 'Transaction No.', selector: (row: any) => row.transaction_or_cheque_number, sortable: true },
    { name: 'Payment Date', selector: (row: any) => row.payment_date, sortable: true },
    { name: 'Receipt Date', selector: (row: any) => row.receipt_date, sortable: true },
    {
      name: 'Attachments',
      cell: (row: any) => (
        <button onClick={() => downloadReceipt(row.id)}>
          <FaRegFileAlt className="cursor-pointer" />
        </button>
      ),
    },
  ];

  const columnsTransaction = [
    { name: 'Date', selector: (row: any) => row.created_at, sortable: true },
    { name: 'Amount', selector: (row: any) => row.total_amount, sortable: true },
    { name: 'Payment Mode', selector: (row: any) => row.payment_method, sortable: true },
    { name: 'Transaction No.', selector: (row: any) => row.transaction_id, sortable: true },
    { name: 'Payment Date', selector: (row: any) => row.paymen_date, sortable: true },
    {
      name: 'Images',
      cell: (row: any) => (
        <button onClick={() => window.open(`${domainPrefix}${row.image_url}`, '_blank')}>
          <FaRegFileAlt className="cursor-pointer" />
        </button>
      ),
    },
  ];

  const amount = camBilling.total_amount || 0;
  const amountInWords = Number.isFinite(amount) ? toWords(amount) : 'Invalid Amount';

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <div className="p-6">
        <Breadcrumb
          items={[
            { label: 'Finance', path: '/finance/cam' },
            { label: 'CAM', path: '/finance/cam/billing' },
            { label: 'CAM Billing Details' },
          ]}
        />
      </div>

      <h2
        style={{ background: themeColor }}
        className="text-center text-xl font-bold my-5 p-2 rounded-full text-white mx-10"
      >
        CAM Billing Details
      </h2>

      <div className="flex justify-end mx-5">
        <div className="md:flex grid grid-cols-2 sm:flex-row flex-col gap-2">
          <button
            className="font-semibold text-white px-4 p-1 flex gap-2 items-center justify-center rounded-md"
            style={{ background: themeColor }}
            onClick={() => setRecallModal(true)}
          >
            Recall
          </button>
          <Link
            to={`/finance/cam/billing/${id}/create-receipt`}
            style={{ background: themeColor }}
            className="px-4 py-2 font-medium text-white rounded-md flex gap-2 items-center justify-center"
          >
            Create Invoice Receipt
          </Link>
          <button
            className="font-semibold text-white px-4 p-1 flex gap-2 items-center justify-center rounded-md"
            style={{ background: themeColor }}
            onClick={() => setReceivePayment(true)}
          >
            Receive Payment
          </button>
          <button
            onClick={handleDownload}
            className="font-semibold text-white px-4 p-1 flex gap-2 items-center justify-center rounded-md"
            style={{ background: themeColor }}
          >
            <FaDownload />
            Download Invoice
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 mx-5 my-5">
        <div className="space-y-2">
          {getStatusBadge()}
          <div>
            {logo?.logo_url ? (
              <img
                src={`${domainPrefix}${logo.logo_url}`}
                className="w-60 h-40 rounded-md"
                alt="Invoice Logo"
              />
            ) : (
              <p>No image available</p>
            )}
          </div>
        </div>
        <div className="my-5">
          <h2 className="font-bold text-lg">{addressInvoice.title}</h2>
          <p className="font-normal">{addressInvoice.address}</p>
          <p className="font-normal">Tel: {addressInvoice.phone_number}</p>
          <p className="font-normal">Fax: {addressInvoice.fax_number}</p>
          <p className="font-normal">E-mail: {addressInvoice.email_address}</p>
        </div>
      </div>

      <div className="mx-5">
        <h2 className="border-b text-xl border-black font-semibold">Tax Invoice</h2>
        <div className="my-5 md:px-5 text-sm font-medium grid gap-4 md:grid-cols-2 md:divide-x-2 divide-black">
          <div className="space-y-2 px-5">
            <div className="grid grid-cols-2">
              <p>GSTIN:</p>
              <p className="text-sm font-normal">{addressInvoice.gst_number}</p>
            </div>
            <div className="grid grid-cols-2">
              <p>PAN:</p>
              <p className="text-sm font-normal">{addressInvoice.pan_number}</p>
            </div>
            <div className="grid grid-cols-2">
              <p>Invoice No:</p>
              <p className="text-sm font-normal">{camBillingAllData.invoice_number}</p>
            </div>
          </div>
          <div className="space-y-2 px-5">
            <div className="grid grid-cols-2">
              <p>Date of Supply:</p>
              <p className="text-sm font-normal">{camBillingAllData.supply_date}</p>
            </div>
            <div className="grid grid-cols-2">
              <p>Billing Period:</p>
              <p className="text-sm font-normal">
                {camBillingAllData.bill_period_start_date} to {camBillingAllData.bill_period_end_date}
              </p>
            </div>
            <div className="grid grid-cols-2">
              <p>Place of Supply:</p>
              <p className="text-sm font-normal">{addressInvoice.state}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-5">
        <h2 className="border-b text-xl border-black font-semibold">Details of Receiver of supply:</h2>
        <div className="my-5 md:px-5 text-sm font-medium grid gap-4 md:grid-cols-2 md:divide-x-2 divide-black">
          <div className="space-y-2 px-5">
            <div className="grid grid-cols-2">
              <p>Name:</p>
              <p className="text-sm font-normal">{receiver?.firstname} {receiver?.lastname}</p>
            </div>
            <div className="grid grid-cols-2">
              <p>Address:</p>
              <p className="text-sm font-normal">{receiver?.user_address}</p>
            </div>
            <div className="grid grid-cols-2">
              <p>PAN:</p>
              <p className="text-sm font-normal">{receiver?.pan_number}</p>
            </div>
          </div>
          <div className="space-y-2 px-5">
            <div className="grid grid-cols-2">
              <p>GSTIN:</p>
              <p className="text-sm font-normal">{receiver?.gst_number}</p>
            </div>
            <div className="grid grid-cols-2">
              <p>State:</p>
              <p className="text-sm font-normal">{receiver?.state}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-5 my-5">
        <h2 className="mb-2 text-lg text-gray-950 font-semibold">Payment Details</h2>
        <Table columns={columnsPaymentDetails} data={[camBillingAllData]} />
      </div>

      {invoiceReceipt.length > 0 && (
        <div className="mx-5 my-5">
          <h2 className="mb-2 text-lg text-gray-950 font-semibold">Invoice Receipts</h2>
          <Table columns={columnsReceipts} data={invoiceReceipt} />
        </div>
      )}

      {receivePaymentDetails.length > 0 && (
        <div className="mx-5 my-5">
          <h2 className="mb-2 text-lg text-gray-950 font-semibold">Payment Transactions</h2>
          <Table columns={columnsTransaction} data={receivePaymentDetails} />
        </div>
      )}

      <div className="mx-5 my-5">
        <p className="text-lg font-semibold">Total Amount: ₹{totalAmount}</p>
        <p className="text-muted-foreground">Amount in words: {amountInWords}</p>
      </div>

      <div className="flex justify-start mx-5 my-5">
        <button
          onClick={() => navigate('/finance/cam/billing')}
          className="p-2 px-6 border-2 rounded-md font-medium"
        >
          Back
        </button>
      </div>

      {recallModal && (
        <RecallInvoiceModal onclose={() => setRecallModal(false)} fetchCamBilling={fetchCamBilling} />
      )}
      {receivePayment && (
        <CAMBillInvoiceReceivePaymentModal onclose={() => setReceivePayment(false)} fetchCamBilling={fetchCamBilling} />
      )}
    </div>
  );
};

export default ViewCamBilling;
