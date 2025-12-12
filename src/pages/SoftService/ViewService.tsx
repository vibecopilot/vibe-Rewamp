import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormSection from '../../components/ui/FormSection';
import FormGrid from '../../components/ui/FormGrid';
import { getSoftServicesDetails } from '../../api';
import { Loader2, Wrench, AlertCircle, RefreshCw, Edit2, ArrowLeft } from 'lucide-react';

interface ServiceDetails {
  id: number;
  name: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  group_name?: string;
  sub_group_name?: string;
  latitude?: string;
  longitude?: string;
  cron_day?: string;
  cron_hour?: string;
  cron_minute?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  attachments?: any[];
}

const ViewService: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getSoftServicesDetails(id);
      setService(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getDayLabel = (day?: string) => {
    const days: Record<string, string> = {
      '*': 'Every day',
      '0': 'Sunday',
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday',
    };
    return days[day || '*'] || day;
  };

  if (loading) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Service', path: '/soft-services' }, { label: 'View' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Service', path: '/soft-services' }, { label: 'View' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Service</h3>
          <p className="text-muted-foreground mb-4">{error || 'Service not found'}</p>
          <button onClick={fetchServiceDetails} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Service', path: '/soft-services' }, { label: service.name }]} />

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6 mb-4">
        <button
          onClick={() => navigate('/soft-services')}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <Link
          to={`/soft-services/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <FormSection title="Service Details" icon={<Wrench className="w-5 h-5" />}>
          <FormGrid columns={3}>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Service Name</label>
              <p className="text-foreground font-medium">{service.name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Building</label>
              <p className="text-foreground font-medium">{service.building_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Floor</label>
              <p className="text-foreground font-medium">{service.floor_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Unit</label>
              <p className="text-foreground font-medium">{service.unit_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Service Group</label>
              <p className="text-foreground font-medium">{service.group_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Service SubGroup</label>
              <p className="text-foreground font-medium">{service.sub_group_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Latitude</label>
              <p className="text-foreground font-medium">{service.latitude || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Longitude</label>
              <p className="text-foreground font-medium">{service.longitude || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Created By</label>
              <p className="text-foreground font-medium">{service.created_by || '-'}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Created On</label>
              <p className="text-foreground font-medium">{formatDate(service.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Updated On</label>
              <p className="text-foreground font-medium">{formatDate(service.updated_at)}</p>
            </div>
          </FormGrid>
        </FormSection>

        <FormSection title="Cron Setting" icon={<Wrench className="w-5 h-5" />}>
          <div className="flex items-center gap-2 text-foreground">
            <span>Every</span>
            <span className="px-3 py-1 bg-accent rounded-md font-medium">{getDayLabel(service.cron_day)}</span>
            <span>at</span>
            <span className="px-3 py-1 bg-accent rounded-md font-medium">{service.cron_hour || '0'}</span>
            <span>:</span>
            <span className="px-3 py-1 bg-accent rounded-md font-medium">{service.cron_minute || '0'}</span>
          </div>
        </FormSection>

        {service.attachments && service.attachments.length > 0 && (
          <FormSection title="Attachments" icon={<Wrench className="w-5 h-5" />}>
            <div className="flex flex-wrap gap-2">
              {service.attachments.map((att, idx) => (
                <a 
                  key={idx} 
                  href={att.url || att.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                >
                  <span className="text-sm text-primary">{att.name || att.filename || `Attachment ${idx + 1}`}</span>
                </a>
              ))}
            </div>
          </FormSection>
        )}
      </div>
    </div>
  );
};

export default ViewService;
