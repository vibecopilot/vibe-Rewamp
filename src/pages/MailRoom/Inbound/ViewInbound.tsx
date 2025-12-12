import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/layout/PageHeader';
import { getInboundDetail, editInbound } from '../../../api';

interface InboundData {
  id: number;
  vendor_id: number;
  vendor_name: string;
  receipant_name: string;
  mobile_number: string;
  mail_inbound_type: string;
  unit: string;
  department_id: string;
  entity: string;
  sender: string;
  company: string;
  company_address_1: string;
  company_address_2: string;
  awb_number: string;
  receiving_date: string;
  collect_on: string;
  mark_as_collected: boolean;
}

const ViewInbound: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pkg, setPkg] = useState<InboundData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInboundDetails();
  }, [id]);

  const fetchInboundDetails = async () => {
    try {
      const response = await getInboundDetail(id);
      setPkg(response.data);
    } catch (error) {
      console.error('Error fetching package:', error);
      toast.error('Failed to fetch package details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCollected = async () => {
    if (!pkg) return;
    try {
      await editInbound(id, {
        mark_as_collected: !pkg.mark_as_collected,
        vendor_id: pkg.vendor_id,
      });
      toast.success('Package status updated successfully');
      fetchInboundDetails();
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Failed to update package status');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  if (!pkg) {
    return <div className="p-6 text-center text-muted-foreground">Package not found</div>;
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
        title="Inbound Package Details"
        breadcrumbs={[
          { label: 'FM Module', path: '/mail-room' },
          { label: 'Mail Room', path: '/mail-room' },
          { label: 'Inbound', path: '/mail-room/inbound' },
          { label: 'View Package' },
        ]}
      />

      {/* Mark as Collected Button */}
      <div className="mb-6">
        <button
          onClick={handleMarkCollected}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-colors ${
            pkg.mark_as_collected
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-border hover:border-primary'
          }`}
        >
          <Check size={18} />
          {pkg.mark_as_collected ? 'Unmark Collected' : 'Mark As Collected'}
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Package ID: {pkg.id}</h2>
            <p className="text-sm text-muted-foreground">No. of Package: {pkg.unit}</p>
          </div>
        </div>

        <h3 className="font-semibold text-foreground border-b border-border pb-2 mb-4">Package Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8">
          <DetailRow label="Department" value={pkg.department_id} />
          <DetailRow label="Collected On" value={pkg.collect_on ? new Date(pkg.collect_on).toLocaleDateString() : '-'} />
          <DetailRow label="AWB Number" value={pkg.awb_number} />
          <DetailRow label="Recipient Name" value={pkg.receipant_name} />
          <DetailRow label="Received On" value={pkg.receiving_date ? new Date(pkg.receiving_date).toLocaleDateString() : '-'} />
          <DetailRow label="Entity" value={pkg.entity} />
        </div>

        <h3 className="font-semibold text-foreground border-b border-border pb-2 mb-4 mt-8">Sender Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8">
          <DetailRow label="Sender Name" value={pkg.sender} />
          <DetailRow label="Company" value={pkg.company} />
          <DetailRow label="Address 1" value={pkg.company_address_1} />
          <DetailRow label="Address 2" value={pkg.company_address_2} />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate('/mail-room/inbound')}
          className="px-6 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => navigate(`/mail-room/inbound/${id}/edit`)}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default ViewInbound;
