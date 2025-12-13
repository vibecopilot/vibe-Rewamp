import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Breadcrumb from '@/components/ui/Breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceiveInvoice = async () => {
      setLoading(true);
      try {
        const response = await getReceiveInvoiceData(id);
        setReceiptInvoice(response.data);
        setPaymentDetails([response.data]);
      } catch (error) {
        console.error('Failed to fetch Receipt Invoice data:', error);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Finance', path: '/finance/cam' },
          { label: 'CAM', path: '/finance/cam/receipt-invoice' },
          { label: 'Receipt Invoice Details' },
        ]}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={() => navigate('/finance/cam/receipt-invoice')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleDownload} style={{ background: themeColor }}>
          <Download className="h-4 w-4 mr-2" />
          Download Receipt
        </Button>
      </div>

      {/* Receipt Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="border rounded-lg">
            {/* Header Section */}
            <div className="grid md:grid-cols-3 divide-x border-b">
              <div className="col-span-2 p-5">
                <p className="text-lg font-medium mb-1">Received With Thanks From:</p>
                <p className="text-muted-foreground">
                  {receiptInvoice?.customer_name || 'Customer'}
                </p>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Receipt:</span>
                  <span>{receiptInvoice?.receipt_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{receiptInvoice?.receipt_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Rs:</span>
                  <span>{receiptInvoice?.amount_received}</span>
                </div>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="p-5 border-b">
              <h2 className="font-medium">
                The sum of rupees: <span className="text-muted-foreground">{amountInWords}</span>
              </h2>
            </div>

            {/* Payment Details */}
            <div className="grid md:grid-cols-3 divide-x border-b">
              <div className="p-5 space-y-2">
                <div className="flex">
                  <span className="font-medium w-32">By:</span>
                  <span>{receiptInvoice?.payment_mode}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Bank & Branch:</span>
                  <span>{receiptInvoice?.bank_name} {receiptInvoice?.branch_name}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex">
                  <span className="font-medium w-20">No:</span>
                  <span>{receiptInvoice?.transaction_or_cheque_number}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex">
                  <span className="font-medium w-20">Date:</span>
                  <span>{receiptInvoice?.payment_date}</span>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="grid md:grid-cols-4 divide-x">
              <div className="col-span-3 p-5 space-y-4">
                <div className="border-b pb-3">
                  <p className="font-medium">In Respect of:</p>
                  <p className="text-muted-foreground">
                    {receiptInvoice?.unit_name || 'Property Details'}
                  </p>
                </div>
                <div className="border-b pb-3">
                  <p className="font-medium">Towards:</p>
                  <p className="text-muted-foreground">{receiptInvoice?.notes || '-'}</p>
                </div>
                <div>
                  <h2 className="text-lg font-medium">
                    Amount: Rs. {receiptInvoice?.amount_received}
                  </h2>
                </div>
              </div>
              <div className="p-5 flex flex-col items-center justify-center">
                {logo?.logo_url ? (
                  <img
                    src={`${domainPrefix}${logo.logo_url}`}
                    className="w-40 h-28 rounded-md object-contain"
                    alt="Invoice Logo"
                  />
                ) : (
                  <div className="w-40 h-28 bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No logo</p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  For Company Limited
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Transaction Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentDetails.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>{payment.payment_date}</TableCell>
                  <TableCell>{payment.amount_received}</TableCell>
                  <TableCell>{payment.payment_mode}</TableCell>
                  <TableCell>{payment.transaction_or_cheque_number}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewReceiptInvoice;
