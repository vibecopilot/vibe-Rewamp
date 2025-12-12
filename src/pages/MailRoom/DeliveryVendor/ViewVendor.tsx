import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/layout/PageHeader';
import { getVendorDetails } from '../../../api';

interface VendorData {
  id: number;
  vendor_supplier_id: string;
  vendor_name: string;
  website_url: string;
  address: string;
  email: string;
  mobile: string;
  spoc_person: string;
  aggrement_start_date: string;
  aggremenet_end_date: string;
  status: string;
  created_at: string;
}

const ViewVendor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      const response = await getVendorDetails(id);
      setVendor(response.data);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      toast.error('Failed to fetch vendor details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  if (!vendor) {
    return <div className="p-6 text-center text-muted-foreground">Vendor not found</div>;
  }

  const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="py-3 border-b border-border last:border-b-0">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-foreground font-medium">{value || '-'}</p>
    </div>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Vendor Details"
        breadcrumbs={[
          { label: 'FM Module', path: '/mail-room' },
          { label: 'Mail Room', path: '/mail-room' },
          { label: 'Delivery Vendor', path: '/mail-room/delivery-vendor' },
          { label: 'View Vendor' },
        ]}
      />

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Vendor Information</h2>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full ${
            vendor.status === 'Active' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {vendor.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
          <DetailRow label="Vendor ID" value={vendor.vendor_supplier_id} />
          <DetailRow label="Vendor Name" value={vendor.vendor_name} />
          <DetailRow label="Website URL" value={vendor.website_url} />
          <DetailRow label="Email" value={vendor.email} />
          <DetailRow label="Phone" value={vendor.mobile} />
          <DetailRow label="SPOC Person" value={vendor.spoc_person} />
          <DetailRow label="Agreement Start Date" value={vendor.aggrement_start_date} />
          <DetailRow label="Agreement End Date" value={vendor.aggremenet_end_date} />
          <DetailRow label="Created On" value={vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : '-'} />
          <div className="md:col-span-2 lg:col-span-3">
            <DetailRow label="Address" value={vendor.address} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate('/mail-room/delivery-vendor')}
          className="px-6 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => navigate(`/mail-room/delivery-vendor/${id}/edit`)}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default ViewVendor;
