import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, FileText, Upload, ArrowLeft, Save, Users } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { getEventsDetails, postEvents, editEventDetails, getGroups, getAssignedTo } from '../../../api/index';
import toast from 'react-hot-toast';

interface FormData {
  event_name: string;
  venue: string;
  start_date_time: string;
  end_date_time: string;
  discription: string;
  is_important: boolean;
  send_email: boolean;
  share_with: 'all' | 'individuals' | 'groups';
  rsvp: boolean;
  attachments: File[];
  selected_users: number[];
  selected_groups: number[];
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState<FormData>({
    event_name: '',
    venue: '',
    start_date_time: '',
    end_date_time: '',
    discription: '',
    is_important: false,
    send_email: false,
    share_with: 'all',
    rsvp: false,
    attachments: [],
    selected_users: [],
    selected_groups: [],
  });

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    fetchDropdownData();
    if (isEdit) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [usersRes, groupsRes] = await Promise.all([
        getAssignedTo(),
        getGroups()
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await getEventsDetails(id);
      const data = res.data;
      setFormData({
        event_name: data.event_name || '',
        venue: data.venue || '',
        start_date_time: data.start_date_time || '',
        end_date_time: data.end_date_time || '',
        discription: data.discription || '',
        is_important: data.is_important || false,
        send_email: data.send_email || false,
        share_with: data.share_with || 'all',
        rsvp: data.rsvp || false,
        attachments: [],
        selected_users: data.selected_users || [],
        selected_groups: data.selected_groups || [],
      });
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, attachments: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.event_name || !formData.venue) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append('event[event_name]', formData.event_name);
      payload.append('event[venue]', formData.venue);
      payload.append('event[start_date_time]', formData.start_date_time);
      payload.append('event[end_date_time]', formData.end_date_time);
      payload.append('event[discription]', formData.discription);
      payload.append('event[is_important]', String(formData.is_important));
      payload.append('event[send_email]', String(formData.send_email));
      payload.append('event[rsvp]', String(formData.rsvp));

      formData.attachments.forEach((file) => {
        payload.append('event[attachments][]', file);
      });

      if (isEdit) {
        await editEventDetails(id, payload);
        toast.success('Event updated successfully');
      } else {
        await postEvents(payload);
        toast.success('Event created successfully');
      }
      navigate('/crm/communications/events');
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'CRM', path: '/crm/communications' },
        { label: 'Communications', path: '/crm/communications/events' },
        { label: 'Events', path: '/crm/communications/events' },
        { label: isEdit ? 'Edit Event' : 'Create Event' }
      ]} />

      <div className="bg-card border border-border rounded-xl p-6 mt-4">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {isEdit ? 'Edit Event' : 'Create Event'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Event Info Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4 pb-2 border-b border-border">
              Event Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                <input
                  type="text"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Venue *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="start_date_time"
                  value={formData.start_date_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  name="end_date_time"
                  value={formData.end_date_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  name="discription"
                  value={formData.discription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_important"
                  checked={formData.is_important}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-foreground">Important</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="send_email"
                  checked={formData.send_email}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-foreground">Send Email</span>
              </label>
            </div>
          </div>

          {/* Share With Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Share With</label>
            <div className="flex gap-2">
              {(['all', 'individuals', 'groups'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({ ...formData, share_with: option })}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    formData.share_with === option
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* RSVP Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">RSVP</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rsvp"
                  checked={formData.rsvp === true}
                  onChange={() => setFormData({ ...formData, rsvp: true })}
                  className="w-4 h-4 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-foreground">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rsvp"
                  checked={formData.rsvp === false}
                  onChange={() => setFormData({ ...formData, rsvp: false })}
                  className="w-4 h-4 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-foreground">No</span>
              </label>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Upload Attachments</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-primary hover:text-primary/80 text-sm"
              >
                Click to upload files
              </label>
              {formData.attachments.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {formData.attachments.length} file(s) selected
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/crm/communications/events')}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
