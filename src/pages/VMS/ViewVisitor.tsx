import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Clock, Building, User, Phone, Mail, Briefcase, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import PageTitle from '../../components/ui/PageTitle';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { vmsService, Visitor } from '../../services/vms.service';
import toast from 'react-hot-toast';

const ViewVisitor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVisitor = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await vmsService.getVisitorById(id);
      setVisitor(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch visitor details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitor();
  }, [id]);

  const handleCheckIn = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await vmsService.checkInOut(id, { action: 'check_in' });
      toast.success('Visitor checked in successfully');
      fetchVisitor();
    } catch {
      toast.error('Failed to check in visitor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await vmsService.checkInOut(id, { action: 'check_out' });
      toast.success('Visitor checked out successfully');
      fetchVisitor();
    } catch {
      toast.error('Failed to check out visitor');
    } finally {
      setActionLoading(false);
    }
  };

  const getVisitorStatus = (): StatusType => {
    if (!visitor) return 'pending';
    if (visitor.check_out_time) return 'checked-out';
    if (visitor.check_in_time) return 'checked-in';
    if (visitor.status === 'approved') return 'approved';
    if (visitor.status === 'rejected') return 'rejected';
    return 'pending';
  };

  const getHostName = (): string => {
    if (visitor?.host?.user) {
      const { firstname, lastname } = visitor.host.user;
      return [firstname, lastname].filter(Boolean).join(' ') || 'N/A';
    }
    return 'N/A';
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageTitle
          title="Visitor Details"
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Visitors', path: '/vms/visitors' },
            { label: 'View' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading visitor details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !visitor) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageTitle
          title="Visitor Details"
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Visitors', path: '/vms/visitors' },
            { label: 'View' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Visitor</h3>
          <p className="text-muted-foreground mb-4">{error || 'Visitor not found'}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchVisitor}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={() => navigate('/vms/visitors')}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canCheckIn = !visitor.check_in_time && visitor.status === 'approved';
  const canCheckOut = visitor.check_in_time && !visitor.check_out_time;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageTitle
        title={visitor.name}
        breadcrumbs={[
          { label: 'VMS', path: '/vms' },
          { label: 'Visitors', path: '/vms/visitors' },
          { label: visitor.name }
        ]}
        actions={
          <button
            onClick={() => navigate(`/vms/visitors/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{visitor.name}</h2>
                <p className="text-sm text-muted-foreground">ID: {visitor.id}</p>
              </div>
            </div>
            <StatusBadge status={getVisitorStatus()} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{visitor.contact_no}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{visitor.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{visitor.company_name || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Visit Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purpose</span>
                  <span className="text-foreground font-medium">{visitor.purpose || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Host</span>
                  <span className="text-foreground font-medium">{getHostName()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="text-foreground font-medium">{visitor.user_type || 'Visitor'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Site</span>
                <span className="text-foreground font-medium">{visitor.site_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Building</span>
                <span className="text-foreground font-medium">{visitor.building_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit</span>
                <span className="text-foreground font-medium">{visitor.unit_name || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Info */}
        <div className="space-y-4">
          {/* Timing Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Timing</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected Date</span>
                <span className="text-foreground font-medium">{visitor.expected_date || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected Time</span>
                <span className="text-foreground font-medium">{visitor.expected_time || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Check In</span>
                <span className="text-foreground font-medium">{visitor.check_in_time || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Check Out</span>
                <span className="text-foreground font-medium">{visitor.check_out_time || '-'}</span>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Location</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Site</span>
                <span className="text-foreground font-medium">{visitor.site_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Building</span>
                <span className="text-foreground font-medium">{visitor.building_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit</span>
                <span className="text-foreground font-medium">{visitor.unit_name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            {canCheckIn && (
              <button 
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full px-4 py-2.5 text-sm font-medium bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Check In Visitor'}
              </button>
            )}
            {canCheckOut && (
              <button 
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="w-full px-4 py-2.5 text-sm font-medium bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Check Out Visitor'}
              </button>
            )}
            <button className="w-full px-4 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
              Print Badge
            </button>
            <button className="w-full px-4 py-2.5 text-sm font-medium text-error border border-error rounded-lg hover:bg-error hover:text-white transition-colors">
              Blacklist Visitor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVisitor;
