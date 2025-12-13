import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Download, FileText, Receipt, CreditCard, RefreshCw } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  const fetchAddressSetupDetails = async (addressId: number) => {
    try {
      const response = await getAddressSetupDetails(addressId);
      setAddressInvoice(response.data);
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const fetchCamBilling = async () => {
    setLoading(true);
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
      return <span className="px-3 py-1.5 bg-red-500 text-white rounded-md font-medium">Unpaid</span>;
    } else if (totalAmountPaid < totalAmount) {
      return <span className="px-3 py-1.5 bg-yellow-500 text-white rounded-md font-medium">Partial Paid</span>;
    } else if (totalAmountPaid > totalAmount) {
      return <span className="px-3 py-1.5 bg-blue-500 text-white rounded-md font-medium">Paid Extra</span>;
    }
    return <span className="px-3 py-1.5 bg-green-500 text-white rounded-md font-medium">Paid</span>;
  };

  const amount = camBilling.total_amount || 0;
  const amountInWords = Number.isFinite(amount) ? toWords(amount) : 'Invalid Amount';

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
          { label: 'CAM', path: '/finance/cam/billing' },
          { label: 'CAM Billing Details' },
        ]}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={() => navigate('/finance/cam/billing')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => setRecallModal(true)} style={{ background: themeColor }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Recall
        </Button>
        <Link to={`/finance/cam/billing/${id}/create-receipt`}>
          <Button style={{ background: themeColor }}>
            <Receipt className="h-4 w-4 mr-2" />
            Create Invoice Receipt
          </Button>
        </Link>
        <Button onClick={() => setReceivePayment(true)} style={{ background: themeColor }}>
          <CreditCard className="h-4 w-4 mr-2" />
          Receive Payment
        </Button>
        <Button onClick={handleDownload} style={{ background: themeColor }}>
          <Download className="h-4 w-4 mr-2" />
          Download Invoice
        </Button>
      </div>

      {/* Invoice Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {getStatusBadge()}
              {logo?.logo_url ? (
                <img
                  src={`${domainPrefix}${logo.logo_url}`}
                  className="w-60 h-40 rounded-md object-contain"
                  alt="Invoice Logo"
                />
              ) : (
                <div className="w-60 h-40 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">No logo available</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h2 className="font-bold text-lg">{addressInvoice.title}</h2>
              <p className="text-muted-foreground">{addressInvoice.address}</p>
              <p className="text-muted-foreground">Tel: {addressInvoice.phone_number}</p>
              <p className="text-muted-foreground">Fax: {addressInvoice.fax_number}</p>
              <p className="text-muted-foreground">Email: {addressInvoice.email_address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium w-40">GSTIN:</span>
                <span>{addressInvoice.gst_number}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">PAN:</span>
                <span>{addressInvoice.pan_number}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Invoice No:</span>
                <span>{camBillingAllData.invoice_number}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium w-40">Date of Supply:</span>
                <span>{camBillingAllData.supply_date}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Billing Period:</span>
                <span>{camBillingAllData.bill_period_start_date} to {camBillingAllData.bill_period_end_date}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Place of Supply:</span>
                <span>{addressInvoice.state}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receiver Details */}
      <Card>
        <CardHeader>
          <CardTitle>Receiver Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium w-40">Name:</span>
                <span>{receiver?.firstname} {receiver?.lastname}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Address:</span>
                <span>{receiver?.user_address}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">PAN:</span>
                <span>{receiver?.pan_number}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium w-40">GSTIN:</span>
                <span>{receiver?.gst_number}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">State:</span>
                <span>{receiver?.state}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charges Table */}
      {camBilling?.charges && camBilling.charges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.N.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>SAC/HSN</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Taxable Value</TableHead>
                  <TableHead>CGST</TableHead>
                  <TableHead>SGST</TableHead>
                  <TableHead>IGST</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {camBilling.charges.map((charge: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{charge.description}</TableCell>
                    <TableCell>{charge.hsn_id}</TableCell>
                    <TableCell>{charge.quantity}</TableCell>
                    <TableCell>{charge.rate}</TableCell>
                    <TableCell>{charge.total_value}</TableCell>
                    <TableCell>{charge.discount_percent}%</TableCell>
                    <TableCell>{charge.taxable_value}</TableCell>
                    <TableCell>{charge.cgst_rate}% ({charge.cgst_amount})</TableCell>
                    <TableCell>{charge.sgst_rate}% ({charge.sgst_amount})</TableCell>
                    <TableCell>{charge.igst_rate}% ({charge.igst_amount})</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4">
              <div className="text-lg font-semibold">
                Total Amount: ₹{totalAmount}
              </div>
            </div>
            <p className="text-muted-foreground mt-2">Amount in words: {amountInWords}</p>
          </CardContent>
        </Card>
      )}

      {/* Invoice Receipts */}
      {invoiceReceipt.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No</TableHead>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Amount Received</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Transaction No</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Receipt Date</TableHead>
                  <TableHead>Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceReceipt.map((receipt: any) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{receipt.receipt_number}</TableCell>
                    <TableCell>{receipt.invoice_number}</TableCell>
                    <TableCell>{receipt.amount_received}</TableCell>
                    <TableCell>{receipt.payment_mode}</TableCell>
                    <TableCell>{receipt.transaction_or_cheque_number}</TableCell>
                    <TableCell>{receipt.payment_date}</TableCell>
                    <TableCell>{receipt.receipt_date}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => downloadReceipt(receipt.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment Transactions */}
      {receivePaymentDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Transaction No</TableHead>
                  <TableHead>Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivePaymentDetails.map((payment: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{payment.created_at}</TableCell>
                    <TableCell>{payment.total_amount}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{payment.transaction_id}</TableCell>
                    <TableCell>{payment.paymen_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
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
