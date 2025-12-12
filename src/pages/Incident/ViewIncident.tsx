import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Edit, ArrowLeft, AlertTriangle, Clock, User, Building, FileText, MessageSquare, Download, ExternalLink } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { getIncidentData } from '../../api';
import { dateFormatSTD } from '../../utils/dateUtils';

interface IncidentDetail {
  id: number;
  status?: string;
  time_and_date?: string;
  description?: string;
  rca?: string;
  incident_level?: string;
  primary_incident_category?: string;
  primary_incident_sub_category?: string;
  secondary_incident_category?: string;
  building_name?: string;
  site_name?: string;
  created_by_name?: string;
  support_required?: boolean;
  first_aid_provided_employee?: boolean;
  sent_medical_treatment?: boolean;
  property_damage?: boolean;
  severity?: string;
  probability?: string;
  near_miss?: string;
  attachments?: { name: string; url: string }[];
  incident_injuries?: { id: number; injury_type: string; name?: string }[];
  update_logs?: { id: number; log_by?: string; log_status?: string; log_comment?: string; created_at?: string }[];
}

const ViewIncident: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const domainPrefix = "https://admin.vibecopilot.ai";

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  const fetchIncidentDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getIncidentData(id);
      setIncident(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incident details');
    } finally {
      setLoading(false);
    }
  };

  const getIncidentStatus = (incident: IncidentDetail): StatusType => {
    const status = incident.status?.toLowerCase();
    if (status?.includes('open') || status?.includes('new')) return 'pending';
    if (status?.includes('progress')) return 'maintenance';
    if (status?.includes('resolved') || status?.includes('closed')) return 'checked-out';
    return 'pending';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading incident details...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Incident</h3>
        <p className="text-muted-foreground mb-4">{error || 'Incident not found'}</p>
        <button onClick={() => navigate('/incident')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Breadcrumb items={[
        { label: 'Safety', path: '/incident' },
        { label: 'Incident Management', path: '/incident' },
        { label: `Incident #${incident.id}` }
      ]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/incident')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Incident #{incident.id}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={getIncidentStatus(incident)} />
              {incident.incident_level && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full border bg-yellow-100 text-yellow-700 border-yellow-200">
                  {incident.incident_level}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          to={`/incident/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Incident
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Basic Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Status" value={incident.status || 'Open'} />
                <InfoItem label="Incident Date and Time" value={incident.time_and_date ? dateFormatSTD(incident.time_and_date) : '-'} />
                <InfoItem label="Reported By" value={incident.created_by_name || '-'} />
                <InfoItem label="Level" value={incident.incident_level || '-'} />
                <InfoItem label="Primary Category" value={incident.primary_incident_category || '-'} />
                <InfoItem label="Secondary Category" value={incident.secondary_incident_category || '-'} />
                <InfoItem label="Building" value={incident.building_name || '-'} />
                <InfoItem label="Site" value={incident.site_name || '-'} />
                <InfoItem label="Severity" value={incident.severity || '-'} />
                <InfoItem label="Probability" value={incident.probability || '-'} />
                <InfoItem label="Support Required" value={incident.support_required ? 'Yes' : 'No'} />
                <InfoItem label="First Aid Provided" value={incident.first_aid_provided_employee ? 'Yes' : 'No'} />
                <InfoItem label="Sent for Medical Treatment" value={incident.sent_medical_treatment ? 'Yes' : 'No'} />
                <InfoItem label="Property Damage" value={incident.property_damage ? 'Yes' : 'No'} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Description Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-foreground bg-muted p-3 rounded-lg">{incident.description || 'No description provided.'}</p>
              </div>
              {incident.rca && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">RCA</h4>
                  <p className="text-foreground bg-muted p-3 rounded-lg">{incident.rca}</p>
                </div>
              )}
            </div>
          </div>

          {/* Injuries */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">
                Injuries - {incident.incident_injuries?.length || 0}
              </h2>
            </div>
            <div className="p-6">
              {incident.incident_injuries && incident.incident_injuries.length > 0 ? (
                <div className="space-y-2">
                  {incident.incident_injuries.map((injury) => (
                    <div key={injury.id} className="p-3 bg-muted rounded-lg flex justify-between items-center">
                      <span className="text-foreground">{injury.injury_type}</span>
                      {injury.name && <span className="text-muted-foreground text-sm">{injury.name}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No injuries recorded</p>
              )}
            </div>
          </div>

          {/* Attachments */}
          {incident.attachments && incident.attachments.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Attachments ({incident.attachments.length})</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {incident.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={domainPrefix + attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <img
                        src={domainPrefix + attachment.url}
                        alt={attachment.name || `Attachment ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Update Logs */}
          {incident.update_logs && incident.update_logs.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Update Logs</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {incident.update_logs.map((log) => (
                    <div key={log.id} className="relative pl-6 pb-4 border-l-2 border-border last:pb-0">
                      <div className="absolute -left-[5px] top-0 w-2 h-2 bg-primary rounded-full" />
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{log.log_by || 'System'}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(log.created_at)}</span>
                        </div>
                        {log.log_status && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Status: <span className="font-medium text-foreground">{log.log_status}</span>
                          </p>
                        )}
                        {log.log_comment && (
                          <p className="text-sm text-foreground mt-2">{log.log_comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Quick Info</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={getIncidentStatus(incident)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level</span>
                <span className="text-sm font-medium text-foreground">{incident.incident_level || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Severity</span>
                <span className="text-sm font-medium text-foreground">{incident.severity || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Building</span>
                <span className="text-sm font-medium text-foreground">{incident.building_name || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Site</span>
                <span className="text-sm font-medium text-foreground">{incident.site_name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Timeline
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm text-foreground">Incident Reported</p>
                  <p className="text-xs text-muted-foreground">{incident.time_and_date ? formatDate(incident.time_and_date) : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Info Item Component
const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export default ViewIncident;
