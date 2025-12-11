import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { serviceDeskService, Ticket } from '../../services/serviceDesk.service';
import { 
  Loader2, Edit, Clock, User, Building, MapPin, Tag, 
  FileText, MessageSquare, AlertTriangle, CheckCircle,
  Calendar, ArrowLeft, Download, ExternalLink
} from 'lucide-react';
import { BiAngry, BiSad, BiSmile, BiHappy } from 'react-icons/bi';
import { MdOutlineSentimentNeutral } from 'react-icons/md';

interface TicketDetail extends Ticket {
  text?: string;
  heading?: string;
  site_name?: string;
  issue_type?: string;
  issue_type_id?: string;
  category_type?: string;
  category_type_id?: number;
  sub_category?: string;
  sub_category_id?: number;
  responsible_person?: string;
  impact?: string;
  root_cause?: string;
  corrective_action?: string;
  proactive_reactive?: string;
  correction?: string;
  rating?: number;
  documents?: { document: string }[];
  complaint_logs?: {
    id: number;
    log_by?: string;
    log_status?: string;
    log_comment?: string;
    priority?: string;
    created_at?: string;
    documents?: { document: string }[];
  }[];
  escalations?: {
    id: number;
    level?: string;
    esc_to?: string;
    esc_on?: string;
  }[];
}

const TicketView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const domainPrefix = "https://admin.vibecopilot.ai";

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await serviceDeskService.getTicketById(id);
      setTicket(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ticket details');
    } finally {
      setLoading(false);
    }
  };

  const getTicketStatus = (ticket: TicketDetail): StatusType => {
    const status = ticket.status?.toLowerCase() || ticket.complaint_status?.name?.toLowerCase();
    if (status?.includes('open') || status?.includes('new')) return 'pending';
    if (status?.includes('progress') || status?.includes('assigned')) return 'maintenance';
    if (status?.includes('resolved') || status?.includes('closed')) return 'checked-out';
    return 'pending';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'p1':
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'p2':
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'p3':
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return '-';
    const created = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - created.getTime()) / 60000);
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  const ratingIcons = [
    { icon: <BiAngry size={24} />, color: 'text-red-500', label: 'Terrible' },
    { icon: <BiSad size={24} />, color: 'text-orange-500', label: 'Poor' },
    { icon: <MdOutlineSentimentNeutral size={24} />, color: 'text-gray-500', label: 'Neutral' },
    { icon: <BiSmile size={24} />, color: 'text-blue-500', label: 'Good' },
    { icon: <BiHappy size={24} />, color: 'text-green-500', label: 'Excellent' },
  ];

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Ticket</h3>
        <p className="text-muted-foreground mb-4">{error || 'Ticket not found'}</p>
        <button onClick={() => navigate('/service-desk')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Breadcrumb items={[
        { label: 'Service Desk', path: '/service-desk' },
        { label: `Ticket #${ticket.ticket_number || id}` }
      ]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/service-desk')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{ticket.heading || ticket.title || 'Ticket Details'}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground">#{ticket.ticket_number}</span>
              <StatusBadge status={getTicketStatus(ticket)} />
              {ticket.priority && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          to={`/service-desk/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Ticket
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info Card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Ticket Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem icon={<Tag className="w-4 h-4" />} label="Category" value={ticket.category_type || ticket.helpdesk_category?.name || '-'} />
                <InfoItem icon={<Tag className="w-4 h-4" />} label="Sub Category" value={ticket.sub_category || '-'} />
                <InfoItem icon={<AlertTriangle className="w-4 h-4" />} label="Issue Type" value={ticket.issue_type || '-'} />
                <InfoItem icon={<Building className="w-4 h-4" />} label="Building" value={ticket.building_name || '-'} />
                <InfoItem icon={<MapPin className="w-4 h-4" />} label="Floor" value={ticket.floor_name || '-'} />
                <InfoItem icon={<MapPin className="w-4 h-4" />} label="Unit" value={ticket.unit_name || '-'} />
                <InfoItem icon={<User className="w-4 h-4" />} label="Assigned To" value={ticket.assigned_to || 'Unassigned'} />
                <InfoItem icon={<User className="w-4 h-4" />} label="Site Owner" value={ticket.responsible_person || '-'} />
                <InfoItem icon={<Clock className="w-4 h-4" />} label="Total Time" value={getTimeAgo(ticket.created_at)} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Description
              </h2>
            </div>
            <div className="p-6">
              <p className="text-foreground whitespace-pre-wrap">{ticket.text || ticket.description || 'No description provided.'}</p>
            </div>
          </div>

          {/* Additional Info */}
          {(ticket.impact || ticket.root_cause || ticket.corrective_action || ticket.correction) && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Additional Information</h2>
              </div>
              <div className="p-6 space-y-4">
                {ticket.impact && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Impact</h4>
                    <p className="text-foreground bg-muted p-3 rounded-lg">{ticket.impact}</p>
                  </div>
                )}
                {ticket.root_cause && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Root Cause</h4>
                    <p className="text-foreground bg-muted p-3 rounded-lg">{ticket.root_cause}</p>
                  </div>
                )}
                {ticket.corrective_action && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Corrective Action</h4>
                    <p className="text-foreground bg-muted p-3 rounded-lg">{ticket.corrective_action}</p>
                  </div>
                )}
                {ticket.correction && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Correction</h4>
                    <p className="text-foreground bg-muted p-3 rounded-lg">{ticket.correction}</p>
                  </div>
                )}
                {ticket.proactive_reactive && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Proactive/Reactive</h4>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">{ticket.proactive_reactive}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {ticket.documents && ticket.documents.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Attachments ({ticket.documents.length})</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ticket.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={domainPrefix + doc.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <img
                        src={domainPrefix + doc.document}
                        alt={`Attachment ${index + 1}`}
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

          {/* Activity Log */}
          {ticket.complaint_logs && ticket.complaint_logs.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Activity Log</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {ticket.complaint_logs.map((log) => (
                    <div key={log.id} className="relative pl-6 pb-4 border-l-2 border-border last:pb-0">
                      <div className="absolute -left-[5px] top-0 w-2 h-2 bg-primary rounded-full" />
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{log.log_by || 'System'}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(log.created_at)}</span>
                        </div>
                        {log.log_status && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Status changed to: <span className="font-medium text-foreground">{log.log_status}</span>
                          </p>
                        )}
                        {log.priority && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Priority: <span className="font-medium text-foreground">{log.priority}</span>
                          </p>
                        )}
                        {log.log_comment && (
                          <p className="text-sm text-foreground mt-2">{log.log_comment}</p>
                        )}
                        {log.documents && log.documents.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {log.documents.map((doc, idx) => (
                              <a
                                key={idx}
                                href={domainPrefix + doc.document}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-16 h-16 rounded-lg overflow-hidden border border-border"
                              >
                                <img src={domainPrefix + doc.document} alt="" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Escalations */}
          {ticket.escalations && ticket.escalations.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-error/10 px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-error">Escalations</h2>
              </div>
              <div className="p-6 space-y-3">
                {ticket.escalations.map((esc) => (
                  <div key={esc.id} className="flex items-center justify-between p-4 bg-error/5 border border-error/20 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Level {esc.level}</p>
                      <p className="text-sm text-muted-foreground">Escalated to: {esc.esc_to}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(esc.esc_on)}</span>
                  </div>
                ))}
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
                <StatusBadge status={getTicketStatus(ticket)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Site</span>
                <span className="text-sm font-medium text-foreground">{ticket.site_name || '-'}</span>
              </div>
              {ticket.rating && ticket.rating >= 1 && ticket.rating <= 5 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className={`flex items-center gap-1 ${ratingIcons[ticket.rating - 1].color}`}>
                    {ratingIcons[ticket.rating - 1].icon}
                    <span className="text-sm">{ratingIcons[ticket.rating - 1].label}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Timeline
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium text-foreground">Created</p>
                  <p className="text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
                  <p className="text-xs text-muted-foreground">by {ticket.reporter_name || ticket.created_by || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium text-foreground">Last Updated</p>
                  <p className="text-xs text-muted-foreground">{formatDate(ticket.updated_at)}</p>
                </div>
              </div>
              {ticket.resolved_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Resolved</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ticket.resolved_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reporter Info */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Reporter
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{ticket.reporter_name || ticket.created_by || 'Unknown'}</p>
                  {ticket.reporter_email && (
                    <p className="text-sm text-muted-foreground">{ticket.reporter_email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="text-muted-foreground mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export default TicketView;
