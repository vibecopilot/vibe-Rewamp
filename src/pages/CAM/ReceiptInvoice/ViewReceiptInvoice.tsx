import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaDownload } from 'react-icons/fa';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Table from '@/components/table/Table';
import {
  domainPrefix,
  getReceiveInvoiceData,
  getCamLogo,
  downloadReceiptInvoice,
} from '@/api';
import { toWords } from 'number-to-words';
import toast from 'react-hot-toast';

const ViewReceiptInvoice: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const themeColor = useSelector((state: any) => state.theme.color);
  const [receiptInvoice, setReceiptInvoice] = useState<any>({});
  const [paymentDetails, setPaymentDetails] = useState<any[]>([]);
  const [logo, setLogo] = useState<any>({});

  useEffect(() => {
    const fetchReceiveInvoice = async () => {
      try {
        const response = await getReceiveInvoiceData(id);
        setReceiptInvoice(response.data);
        setPaymentDetails([response.data]);
      } catch (error) {
        console.error('Failed to fetch Receipt Invoice data:', error);
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

    fetchLogo();
    fetchReceiveInvoice();
  }, [id]);

  const columnsPaymentDetails = [
    { name: 'Date', selector: (row: any) => row.payment_date, sortable: true },
    { name: 'Amount', selector: (row: any) => row.amount_received, sortable: true },
    { name: 'Payment Mode', selector: (row: any) => row.payment_mode, sortable: true },
    { name: 'Transaction Number', selector: (row: any) => row.transaction_or_cheque_number, sortable: true },
  ];

  const amount = receiptInvoice?.amount_received || 0;
  const amountInWords = Number.isFinite(amount) ? toWords(amount) : 'Invalid Amount';

  const handleDownload = async () => {
    try {
      const response = await downloadReceiptInvoice(id);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'receipt_invoice_file.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Receipt Invoice downloaded successfully');
    } catch (error) {
      toast.error('Error downloading receipt');
    }
  };

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <div className="p-6">
        <Breadcrumb
          items={[
            { label: 'Finance', path: '/finance/cam' },
            { label: 'CAM', path: '/finance/cam/receipt-invoice' },
            { label: 'Receipt Invoice Details' },
          ]}
        />
      </div>

      <h2
        style={{ background: themeColor }}
        className="text-center text-xl font-bold my-5 p-2 rounded-full text-white mx-10"
      >
        Invoice Receipt Details
      </h2>

      <div className="flex justify-end mx-10 mb-2">
        <button
          onClick={handleDownload}
          className="font-semibold text-white px-4 p-1 flex gap-2 items-center justify-center rounded-md"
          style={{ background: themeColor }}
        >
          <FaDownload />
          Download Receipt
        </button>
      </div>

      <div className="mx-10 border border-black rounded-md">
        <div className="md:px-5 text-sm font-medium grid gap-4 md:grid-cols-3 md:divide-x divide-black border-b border-black">
          <div className="space-y-2 px-5 col-span-2 my-5">
            <div className="grid grid-cols-1">
              <p className="text-lg font-medium mb-1">Received With Thanks From:</p>
              <p className="text-sm font-normal">{receiptInvoice?.customer_name || 'Customer'}</p>
            </div>
          </div>
          <div className="space-y-2 px-5 col-span-1 py-3">
            <div className="grid grid-cols-2">
              <p>Receipt:</p>
              <p className="text-sm font-normal">{receiptInvoice?.receipt_number}</p>
            </div>
            <div className="grid grid-cols-2">
              <p>Date:</p>
              <p className="text-sm font-normal">{receiptInvoice?.receipt_date}</p>
            </div>
            <div className="grid grid-cols-2">
              <p>Rs:</p>
              <p className="text-sm font-normal">{receiptInvoice?.amount_received}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 px-5 col-span-3 border-b border-black py-3">
          <h2 className="font-medium">
            The sum of rupees: <span className="text-gray-800 mx-1">{amountInWords}</span>
          </h2>
        </div>

        <div className="md:px-5 text-sm font-medium grid gap-4 md:grid-cols-3 md:divide-x divide-black border-b border-black">
          <div className="space-y-2 px-5 py-3">
            <div className="grid grid-cols-2">
              <p>By:</p>
              <p className="text-sm font-normal">{receiptInvoice?.payment_mode}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="my-2">Bank & Branch:</p>
              <p className="text-sm font-normal flex gap-2 my-2">
                {receiptInvoice?.bank_name} {receiptInvoice?.branch_name}
              </p>
            </div>
          </div>
          <div className="space-y-2 px-5 py-3">
            <div className="grid grid-cols-2">
              <p>No:</p>
              <p className="text-sm font-normal">{receiptInvoice?.transaction_or_cheque_number}</p>
            </div>
          </div>
          <div className="space-y-2 px-5 py-3">
            <div className="grid grid-cols-2">
              <p>Date:</p>
              <p className="text-sm font-normal">{receiptInvoice?.payment_date}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 md:divide-x divide-black">
          <div className="col-span-3 pb-5">
            <div className="border-b border-black px-5 py-3">
              <p>In Respect of:</p>
              <p className="font-medium">{receiptInvoice?.unit_name || 'Property Details'}</p>
            </div>
            <div className="border-b border-black px-5 py-3">
              <h2 className="text-gray-950">Towards: <span className="text-gray-600"></span></h2>
            </div>
            <div className="px-5 py-3">
              <span className="text-gray-800">{receiptInvoice?.notes}</span>
              <h2 className="text-lg font-medium">
                Amount: Rs. <span className="text-gray-800">{receiptInvoice?.amount_received}</span>
              </h2>
            </div>
          </div>
          <div className="px-5 col-span-1">
            <div className="py-5 space-y-2">
              <div className="flex justify-center">
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
              <p className="text-sm text-center">For Company Limited</p>
            </div>
          </div>
        </div>
      </div>

      <div className="my-5 mx-10">
        <h2 className="mb-2 text-lg text-gray-950 font-semibold">Payment Details</h2>
        <Table columns={columnsPaymentDetails} data={paymentDetails} />
      </div>

      <div className="flex justify-start mx-10 my-5">
        <button
          onClick={() => navigate('/finance/cam/receipt-invoice')}
          className="p-2 px-6 border-2 rounded-md font-medium"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ViewReceiptInvoice;
