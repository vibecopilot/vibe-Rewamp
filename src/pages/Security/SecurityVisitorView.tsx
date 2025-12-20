import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, User, ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';
import PageTitle from '../../components/ui/PageTitle';
import { vmsService, Visitor } from '../../services/vms.service';

const SecurityVisitorView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisitor = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await vmsService.getVisitorById(id);
        setVisitor(response.data);
      } catch (err) {
        setError('Failed to load visitor details');
      } finally {
        setLoading(false);
      }
    };
    fetchVisitor();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading visitor details...</p>
        </div>
      </div>
    );
  }

  if (error || !visitor) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-muted-foreground mb-4">{error || 'Visitor not found'}</p>
          <button
            onClick={() => navigate('/security/visitors')}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const getStatusClass = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'IN': return 'bg-green-100 text-green-700';
      case 'OUT': return 'bg-red-100 text-red-700';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageTitle
        title="VISITOR DETAILS"
        breadcrumbs={[
          { label: 'Security', path: '/security' },
          { label: 'Visitors', path: '/security/visitors' },
          { label: 'Details' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/security/visitors')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <Link
              to={`/security/visitors/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        }
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header with photo and status */}
        <div className="bg-primary p-6 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden border-4 border-primary-foreground/30">
            {visitor.photo_url ? (
              <img src={visitor.photo_url} alt={visitor.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-primary-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary-foreground">{visitor.name || 'Unknown'}</h2>
            <p className="text-primary-foreground/70">{visitor.contact_no}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(visitor.visitor_in_out || visitor.status || '')}`}>
              {visitor.visitor_in_out || visitor.status || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Visitor Type</label>
              <p className="text-foreground">{visitor.user_type || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
              <p className="text-foreground">{visitor.email || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Company</label>
              <p className="text-foreground">{visitor.company_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Purpose</label>
              <p className="text-foreground">{visitor.purpose || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Host</label>
              <p className="text-foreground">
                {visitor.host?.user ? `${visitor.host.user.firstname || ''} ${visitor.host.user.lastname || ''}`.trim() : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Expected Date</label>
              <p className="text-foreground">
                {visitor.expected_date ? format(new Date(visitor.expected_date), 'dd MMM yyyy') : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Expected Time</label>
              <p className="text-foreground">{visitor.expected_time || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Check In</label>
              <p className="text-foreground">
                {visitor.check_in_time ? format(new Date(visitor.check_in_time), 'dd MMM yyyy HH:mm') : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Check Out</label>
              <p className="text-foreground">
                {visitor.check_out_time ? format(new Date(visitor.check_out_time), 'dd MMM yyyy HH:mm') : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Site</label>
              <p className="text-foreground">{visitor.site_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Building</label>
              <p className="text-foreground">{visitor.building_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Unit</label>
              <p className="text-foreground">{visitor.unit_name || '-'}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-8 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {visitor.created_at ? format(new Date(visitor.created_at), 'dd MMM yyyy HH:mm') : '-'}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {visitor.updated_at ? format(new Date(visitor.updated_at), 'dd MMM yyyy HH:mm') : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityVisitorView;
