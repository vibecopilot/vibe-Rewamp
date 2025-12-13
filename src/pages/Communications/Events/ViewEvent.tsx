import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, FileText, ArrowLeft, Edit, Users, Clock } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { getEventsDetails } from '../../../api/index';
import { dateFormatSTD } from '../../../utils/dateUtils';
import toast from 'react-hot-toast';

interface EventDetails {
  id: number;
  event_name?: string;
  venue?: string;
  discription?: string;
  start_date_time?: string;
  end_date_time?: string;
  created_by?: string;
  created_at?: string;
  is_important?: boolean;
  rsvp?: boolean;
  scheduledOn?: string;
  scheduledTime?: string;
  bookingStatus?: string;
}

const ViewEvent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await getEventsDetails(id);
      setEvent(res.data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
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

  if (!event) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'CRM', path: '/crm/communications' },
        { label: 'Communications', path: '/crm/communications/events' },
        { label: 'Events', path: '/crm/communications/events' },
        { label: 'View Event' }
      ]} />

      <div className="bg-card border border-border rounded-xl p-6 mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Event Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/crm/communications/events')}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <Link
              to={`/crm/communications/events/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Event Title</label>
            <p className="text-foreground">{event.event_name || '-'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Venue</label>
            <p className="text-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {event.venue || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Created By</label>
            <p className="text-foreground flex items-center gap-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              {event.created_by || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Start Date & Time</label>
            <p className="text-foreground flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {event.start_date_time ? dateFormatSTD(event.start_date_time) : '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">End Date & Time</label>
            <p className="text-foreground flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {event.end_date_time ? dateFormatSTD(event.end_date_time) : '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Event Type</label>
            <p className="text-foreground">{event.scheduledOn || '-'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <p className="text-foreground">{event.scheduledTime || '-'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Expired</label>
            <p className="text-foreground">{event.bookingStatus || '-'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Created On</label>
            <p className="text-foreground">{event.created_at ? dateFormatSTD(event.created_at) : '-'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Important</label>
            <p className="text-foreground">{event.is_important ? 'Yes' : 'No'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">RSVP</label>
            <p className="text-foreground">{event.rsvp ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {event.discription && (
          <div className="mt-6 pt-6 border-t border-border">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-foreground mt-1 whitespace-pre-wrap">{event.discription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewEvent;
