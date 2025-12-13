import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Edit, ArrowLeft, FileText, DollarSign, User, Calendar, File } from 'lucide-react';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { getOtherBillsDetails } from '../../api';
import { dateFormatSTD } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

interface BillDetails {
  id: number;
  description?: string;
  vendor_name?: string;
  supplier_name?: string;
  vendor_id?: number;
  bill_date?: string;
  invoice_number?: string;
  related_to?: string;
  base_amount?: number;
  deduction?: number;
  deduction_remarks?: string;
  amount?: number;
  tds_rate?: number;
  tds_percentage?: number;
  tds_amount?: number;
  retention_percentage?: number;
  retention_amount?: number;
  payment_tenure?: number;
  additional_expenses?: number;
  cgst_rate?: number;
  cgst_amount?: number;
  sgst_rate?: number;
  sgst_amount?: number;
  igst_rate?: number;
  igst_amount?: number;
  tcs_rate?: number;
  tcs_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  payable_amount?: number;
  amount_paid?: number;
  balance_amount?: number;
  payment_status?: string;
  gst_number?: string;
  pan_number?: string;
  last_approved_by?: string;
  created_at?: string;
  created_by_name?: string;
  attachments?: { url: string; name: string }[];
}

const ViewOtherBill = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState<BillDetails | null>(null);

  useEffect(() => {
    fetchBillDetails();
  }, [id]);

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const res = await getOtherBillsDetails(id);
      setBill(res.data);
    } catch (error) {
      console.error('Error fetching bill details:', error);
      toast.error('Failed to load bill details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusColor = (status?: string) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('paid') || s.includes('completed')) return 'bg-green-100 text-green-700 border-green-200';
    if (s.includes('partial')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (s.includes('pending') || s.includes('unpaid')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Bill not found</p>
        <button
          onClick={() => navigate('/finance/other-bills')}
          className="mt-4 text-primary hover:underline"
        >
          Back to Bills
        </button>
      </div>
    );
  }

  const DetailField = ({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) => (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || '-'}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Breadcrumb items={[
        { label: 'Finance', path: '/finance/cam' },
        { label: 'Other Bills', path: '/finance/other-bills' },
        { label: `Bill #${bill.id}` }
      ]} />

      {/* Header Actions */}
      <div className="flex items-center justify-between mt-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Bill #{bill.id}</h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(bill.payment_status)}`}>
            {bill.payment_status || 'Pending'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/finance/other-bills')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => navigate(`/finance/other-bills/${bill.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetailField label="Supplier" value={bill.supplier_name || bill.vendor_name} />
              <DetailField label="Bill Date" value={bill.bill_date ? dateFormatSTD(bill.bill_date) : '-'} />
              <DetailField label="Invoice Number" value={bill.invoice_number} />
              <DetailField label="Related To" value={bill.related_to} />
              <DetailField label="GST Number" value={bill.gst_number} />
              <DetailField label="PAN Number" value={bill.pan_number} />
              <DetailField label="Description" value={bill.description} className="md:col-span-3" />
            </div>
          </div>

          {/* Amount Details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Amount Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetailField label="Base Amount" value={formatCurrency(bill.base_amount)} />
              <DetailField label="Deduction" value={formatCurrency(bill.deduction)} />
              <DetailField label="Deduction Remarks" value={bill.deduction_remarks} />
              <DetailField label="Amount" value={formatCurrency(bill.amount)} />
              <DetailField label="TDS Rate" value={`${bill.tds_rate || bill.tds_percentage || 0}%`} />
              <DetailField label="TDS Amount" value={formatCurrency(bill.tds_amount)} />
              <DetailField label="Retention (%)" value={`${bill.retention_percentage || 0}%`} />
              <DetailField label="Retention Amount" value={formatCurrency(bill.retention_amount)} />
              <DetailField label="Additional Expenses" value={formatCurrency(bill.additional_expenses)} />
            </div>
          </div>

          {/* Tax Details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tax Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetailField label="CGST Rate" value={`${bill.cgst_rate || 0}%`} />
              <DetailField label="CGST Amount" value={formatCurrency(bill.cgst_amount)} />
              <DetailField label="SGST Rate" value={`${bill.sgst_rate || 0}%`} />
              <DetailField label="SGST Amount" value={formatCurrency(bill.sgst_amount)} />
              <DetailField label="IGST Rate" value={`${bill.igst_rate || 0}%`} />
              <DetailField label="IGST Amount" value={formatCurrency(bill.igst_amount)} />
              <DetailField label="TCS Rate" value={`${bill.tcs_rate || 0}%`} />
              <DetailField label="TCS Amount" value={formatCurrency(bill.tcs_amount)} />
              <DetailField label="Tax Amount" value={formatCurrency(bill.tax_amount)} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payment Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-lg font-bold text-foreground">{formatCurrency(bill.total_amount)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Payable Amount</span>
                <span className="text-lg font-semibold text-primary">{formatCurrency(bill.payable_amount)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="text-lg font-semibold text-green-600">{formatCurrency(bill.amount_paid)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Balance Amount</span>
                <span className="text-lg font-semibold text-red-600">{formatCurrency(bill.balance_amount)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Payment Tenure</span>
                <span className="text-sm font-medium text-foreground">{bill.payment_tenure || 0} days</span>
              </div>
            </div>
          </div>

          {/* Audit Info */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Audit Information
            </h2>
            <div className="space-y-3">
              <DetailField label="Last Approved By" value={bill.last_approved_by} />
              <DetailField label="Created By" value={bill.created_by_name} />
              <DetailField label="Created On" value={bill.created_at ? dateFormatSTD(bill.created_at) : '-'} />
            </div>
          </div>

          {/* Attachments */}
          {bill.attachments && bill.attachments.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <File className="w-5 h-5 text-primary" />
                Attachments
              </h2>
              <div className="space-y-2">
                {bill.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-sm text-primary hover:underline"
                  >
                    <File className="w-4 h-4" />
                    {attachment.name || `Attachment ${index + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOtherBill;
