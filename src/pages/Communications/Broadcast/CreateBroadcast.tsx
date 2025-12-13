import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Megaphone, Upload, ArrowLeft, Save } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { getBroadcastDetails, postBroadCast, editBroadcastDetails, getGroups, getAssignedTo } from '../../../api/index';
import toast from 'react-hot-toast';

interface FormData {
  notice_title: string;
  notice_discription: string;
  expiry_date: string;
  is_important: boolean;
  share_with: 'all' | 'individuals' | 'groups';
  attachments: File[];
  selected_users: number[];
  selected_groups: number[];
}

const CreateBroadcast: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState<FormData>({
    notice_title: '',
    notice_discription: '',
    expiry_date: '',
    is_important: false,
    share_with: 'all',
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
      fetchBroadcastDetails();
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

  const fetchBroadcastDetails = async () => {
    try {
      setLoading(true);
      const res = await getBroadcastDetails(id);
      const data = res.data;
      setFormData({
        notice_title: data.notice_title || '',
        notice_discription: data.notice_discription || '',
        expiry_date: data.expiry_date || '',
        is_important: data.is_important || false,
        share_with: data.share_with || 'all',
        attachments: [],
        selected_users: data.selected_users || [],
        selected_groups: data.selected_groups || [],
      });
    } catch (error) {
      console.error('Error fetching broadcast details:', error);
      toast.error('Failed to load broadcast details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    
    if (!formData.notice_title) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append('notice[notice_title]', formData.notice_title);
      payload.append('notice[notice_discription]', formData.notice_discription);
      payload.append('notice[expiry_date]', formData.expiry_date);
      payload.append('notice[is_important]', String(formData.is_important));

      formData.attachments.forEach((file) => {
        payload.append('notice[attachments][]', file);
      });

      if (isEdit) {
        await editBroadcastDetails(id, payload);
        toast.success('Broadcast updated successfully');
      } else {
        await postBroadCast(payload);
        toast.success('Broadcast created successfully');
      }
      navigate('/crm/communications/broadcast');
    } catch (error) {
      console.error('Error saving broadcast:', error);
      toast.error('Failed to save broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'CRM', path: '/crm/communications' },
        { label: 'Communications', path: '/crm/communications/broadcast' },
        { label: 'Broadcast', path: '/crm/communications/broadcast' },
        { label: isEdit ? 'Edit Broadcast' : 'Create Broadcast' }
      ]} />

      <div className="bg-card border border-border rounded-xl p-6 mt-4">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          {isEdit ? 'Edit Broadcast' : 'Create Broadcast'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Communication Info Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4 pb-2 border-b border-border">
              Communication Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                <input
                  type="text"
                  name="notice_title"
                  value={formData.notice_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  name="notice_discription"
                  value={formData.notice_discription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Expire On</label>
                <input
                  type="datetime-local"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_important"
                checked={formData.is_important}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">Mark as Important</span>
            </label>
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

          {/* Attachments Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Attachments</label>
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
              onClick={() => navigate('/crm/communications/broadcast')}
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

export default CreateBroadcast;
