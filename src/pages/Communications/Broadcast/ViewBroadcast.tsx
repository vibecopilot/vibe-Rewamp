import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Megaphone, ArrowLeft, Edit, Clock, User } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { getBroadcastDetails } from '../../../api/index';
import { dateFormatSTD } from '../../../utils/dateUtils';
import toast from 'react-hot-toast';

interface BroadcastDetails {
  id: number;
  notice_title?: string;
  type?: string;
  notice_discription?: string;
  CreatedBy?: string;
  expiry_date?: string;
  created_at?: string;
  status?: string;
  is_important?: boolean;
}

const ViewBroadcast: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [broadcast, setBroadcast] = useState<BroadcastDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBroadcastDetails();
    }
  }, [id]);

  const fetchBroadcastDetails = async () => {
    try {
      setLoading(true);
      const res = await getBroadcastDetails(id);
      setBroadcast(res.data);
    } catch (error) {
      console.error('Error fetching broadcast details:', error);
      toast.error('Failed to load broadcast details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!broadcast) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Broadcast not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'CRM', path: '/crm/communications' },
        { label: 'Communications', path: '/crm/communications/broadcast' },
        { label: 'Broadcast', path: '/crm/communications/broadcast' },
        { label: 'View Broadcast' }
      ]} />

      <div className="bg-card border border-border rounded-xl p-6 mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Broadcast Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/crm/communications/broadcast')}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <Link
              to={`/crm/communications/broadcast/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Title</label>
            <p className="text-foreground">{broadcast.notice_title || '-'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <p className="text-foreground">{broadcast.type || '-'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <p>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(broadcast.status)}`}>
                {broadcast.status || '-'}
              </span>
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Created By</label>
            <p className="text-foreground flex items-center gap-1">
              <User className="w-4 h-4 text-muted-foreground" />
              {broadcast.CreatedBy || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
            <p className="text-foreground flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {broadcast.expiry_date ? dateFormatSTD(broadcast.expiry_date) : '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Created On</label>
            <p className="text-foreground flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {broadcast.created_at ? dateFormatSTD(broadcast.created_at) : '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Important</label>
            <p className="text-foreground">{broadcast.is_important ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {broadcast.notice_discription && (
          <div className="mt-6 pt-6 border-t border-border">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-foreground mt-1 whitespace-pre-wrap">{broadcast.notice_discription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBroadcast;
