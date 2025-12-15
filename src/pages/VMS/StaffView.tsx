import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Clock, User, Phone, Mail, Briefcase, Loader2, AlertCircle, RefreshCw, QrCode, Calendar, FileText } from 'lucide-react';
import PageTitle from '../../components/ui/PageTitle';
import StatusBadge from '../../components/ui/StatusBadge';
import { getStaffDetails, domainPrefix } from '../../api';
import { dateFormat } from '../../utils/dateUtils';

interface StaffDocument {
  id: number;
  document: string;
}

interface WorkingSchedule {
  [day: string]: {
    start_time: string;
    end_time: string;
  };
}

interface StaffDetails {
  id: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  mobile_no?: string;
  unit_name?: string;
  work_type?: string;
  staff_id?: string;
  vendor_name?: string;
  status?: boolean;
  valid_from?: string;
  valid_till?: string;
  created_at?: string;
  updated_at?: string;
  profile_picture?: { url: string };
  qr_code_image_url?: string;
  working_schedule?: WorkingSchedule;
  staff_documents?: StaffDocument[];
}

const StaffView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getStaffDetails(id);
      setStaff(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [id]);

  const isImage = (filePath: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const extension = filePath.split('.').pop()?.split('?')[0].toLowerCase() || '';
    return imageExtensions.includes(extension);
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop()?.split('?')[0] || 'Document';
  };

  const scheduleArray = staff?.working_schedule
    ? Object.keys(staff.working_schedule).map((day) => ({
        day,
        start_time: staff.working_schedule![day].start_time,
        end_time: staff.working_schedule![day].end_time,
      }))
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageTitle
          title="Staff Details"
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Staff', path: '/vms/staff' },
            { label: 'View' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading staff details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !staff) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageTitle
          title="Staff Details"
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Staff', path: '/vms/staff' },
            { label: 'View' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Staff</h3>
          <p className="text-muted-foreground mb-4">{error || 'Staff not found'}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchStaff}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={() => navigate('/vms/staff')}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fullName = [staff.firstname, staff.lastname].filter(Boolean).join(' ') || 'N/A';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageTitle
        title={fullName}
        breadcrumbs={[
          { label: 'VMS', path: '/vms' },
          { label: 'Staff', path: '/vms/staff' },
          { label: fullName }
        ]}
        actions={
          <button
            onClick={() => navigate(`/vms/staff/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
              <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {staff.profile_picture?.url ? (
                  <img
                    src={domainPrefix + staff.profile_picture.url}
                    alt={fullName}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(domainPrefix + staff.profile_picture!.url, '_blank')}
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{fullName}</h2>
                <p className="text-sm text-muted-foreground">ID: {staff.id}</p>
              </div>
            </div>
            <StatusBadge status={staff.status ? 'active' : 'inactive'} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{staff.mobile_no || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{staff.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{staff.work_type || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Staff Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Staff ID</span>
                  <span className="text-foreground font-medium">{staff.staff_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit</span>
                  <span className="text-foreground font-medium">{staff.unit_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Supplier</span>
                  <span className="text-foreground font-medium">{staff.vendor_name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Working Schedule */}
          {scheduleArray.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Working Schedule</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {scheduleArray.map((schedule) => (
                  <div key={schedule.day} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground capitalize">{schedule.day}</p>
                    <p className="text-sm text-foreground">{schedule.start_time} - {schedule.end_time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {staff.staff_documents && staff.staff_documents.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Attachments</h3>
              <div className="flex flex-wrap gap-4">
                {staff.staff_documents.map((doc) => (
                  <div key={doc.id} className="relative">
                    {isImage(doc.document) ? (
                      <img
                        src={domainPrefix + doc.document}
                        alt="Attachment"
                        className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(domainPrefix + doc.document, '_blank')}
                      />
                    ) : (
                      <a
                        href={domainPrefix + doc.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center w-24 h-24 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <FileText className="w-8 h-8 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground text-center px-1 truncate w-full">
                          {getFileName(doc.document)}
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side Info */}
        <div className="space-y-4">
          {/* Validity Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Validity</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valid From</span>
                <span className="text-foreground font-medium">{dateFormat(staff.valid_from) || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valid Till</span>
                <span className="text-foreground font-medium">{dateFormat(staff.valid_till) || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Timing Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Timestamps</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground font-medium">{dateFormat(staff.created_at) || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Updated</span>
                <span className="text-foreground font-medium">{dateFormat(staff.updated_at) || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          {staff.qr_code_image_url && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">QR Code</h3>
              </div>
              <div className="flex justify-center">
                <img
                  src={domainPrefix + staff.qr_code_image_url}
                  alt="QR Code"
                  className="w-32 h-32 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(domainPrefix + staff.qr_code_image_url!, '_blank')}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffView;
