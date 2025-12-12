import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, MapPin, Landmark, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { getVendorsDetails } from '../../api';

interface SupplierData {
  id: number;
  vendor_name: string;
  company_name: string;
  mobile: string;
  primary_phone: string;
  secondary_phone: string;
  email: string;
  primary_email: string;
  secondary_email: string;
  pan: string;
  vendor_supplier_id: string;
  supplier_type_name: string;
  category_id: string;
  category_name: string;
  website: string;
  website_url: string;
  gst_number: string;
  address: string;
  address_line_1: string;
  address_line_2: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  account_name: string;
  account_number: string;
  bank_branch_name: string;
  ifsc_code: string;
  status: string;
  created_at: string;
  attachment_url: string;
}

const ViewSupplier: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplierDetails();
  }, [id]);

  const fetchSupplierDetails = async () => {
    try {
      const response = await getVendorsDetails(id);
      setSupplier(response.data);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      toast.error('Failed to fetch supplier details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  if (!supplier) {
    return <div className="p-6 text-center text-muted-foreground">Supplier not found</div>;
  }

  const DetailRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="py-3 border-b border-border last:border-b-0">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-foreground font-medium">{value || '-'}</p>
    </div>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Supplier Details"
        breadcrumbs={[
          { label: 'FM Module', path: '/supplier' },
          { label: 'Supplier/Vendor', path: '/supplier' },
          { label: 'View Supplier' },
        ]}
      />

      {/* Company Details Section */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Company Details</h2>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full ${
            supplier.status === 'Active' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {supplier.status || 'N/A'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
          <DetailRow label="Company Name" value={supplier.company_name} />
          <DetailRow label="Vendor Name" value={supplier.vendor_name} />
          <DetailRow label="Primary Phone" value={supplier.mobile || supplier.primary_phone} />
          <DetailRow label="Secondary Phone" value={supplier.secondary_phone} />
          <DetailRow label="Primary Email" value={supplier.email || supplier.primary_email} />
          <DetailRow label="Secondary Email" value={supplier.secondary_email} />
          <DetailRow label="PAN" value={supplier.pan} />
          <DetailRow label="Supplier Type" value={supplier.supplier_type_name || supplier.vendor_supplier_id} />
          <DetailRow label="Category" value={supplier.category_name || supplier.category_id} />
          <DetailRow label="Website" value={supplier.website || supplier.website_url} />
          <DetailRow label="GST Number" value={supplier.gst_number} />
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Address</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
          <DetailRow label="Address Line 1" value={supplier.address_line_1 || supplier.address} />
          <DetailRow label="Address Line 2" value={supplier.address_line_2} />
          <DetailRow label="District" value={supplier.district} />
          <DetailRow label="City" value={supplier.city} />
          <DetailRow label="State" value={supplier.state} />
          <DetailRow label="Pin Code" value={supplier.pincode} />
          <DetailRow label="Country" value={supplier.country} />
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Landmark className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Bank Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
          <DetailRow label="Account Name" value={supplier.account_name} />
          <DetailRow label="Account Number" value={supplier.account_number} />
          <DetailRow label="Bank & Branch Name" value={supplier.bank_branch_name} />
          <DetailRow label="IFSC Code" value={supplier.ifsc_code} />
        </div>
      </div>

      {/* Attachments Section */}
      {supplier.attachment_url && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
          </div>

          <a 
            href={supplier.attachment_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <FileText size={16} />
            View Attachment
          </a>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate('/supplier')}
          className="px-6 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => navigate(`/supplier/${id}/edit`)}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default ViewSupplier;