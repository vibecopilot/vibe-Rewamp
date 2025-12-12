import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/layout/PageHeader';
import { getOutboundDetail } from '../../../api';

const ViewOutbound: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getOutboundDetail(id).then(res => setPkg(res.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!pkg) return <div className="p-6 text-center text-muted-foreground">Not found</div>;

  const DetailRow = ({ label, value }: { label: string; value: any }) => <div className="py-3 border-b border-border"><p className="text-sm text-muted-foreground mb-1">{label}</p><p className="text-foreground font-medium">{value || '-'}</p></div>;

  return (
    <div className="p-6">
      <PageHeader title="Outbound Package Details" breadcrumbs={[{ label: 'FM Module', path: '/mail-room' }, { label: 'Mail Room', path: '/mail-room' }, { label: 'Outbound', path: '/mail-room/outbound' }, { label: 'View' }]} />
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-primary/10 rounded-lg"><Package className="w-5 h-5 text-primary" /></div><h2 className="text-lg font-semibold text-foreground">Package ID: {pkg.id}</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8">
          <DetailRow label="Recipient" value={pkg.recipient_name} />
          <DetailRow label="Recipient Email" value={pkg.recipient_email_id} />
          <DetailRow label="AWB Number" value={pkg.awb_number} />
          <DetailRow label="Entity" value={pkg.entity} />
          <DetailRow label="Unit" value={pkg.unit} />
          <DetailRow label="Package Type" value={pkg.mail_outbound_type} />
          <DetailRow label="Sender ID" value={pkg.sender_id} />
          <DetailRow label="Mobile" value={pkg.mobile_number} />
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <button onClick={() => navigate('/mail-room/outbound')} className="px-6 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent">Back</button>
        <button onClick={() => navigate(`/mail-room/outbound/${id}/edit`)} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Edit</button>
      </div>
    </div>
  );
};
export default ViewOutbound;
