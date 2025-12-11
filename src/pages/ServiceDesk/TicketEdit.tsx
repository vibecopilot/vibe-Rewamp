import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormInput from '../../components/ui/FormInput';
import { serviceDeskService, Ticket } from '../../services/serviceDesk.service';
import { getItemInLocalStorage } from '../../utils/localStorage';
import { Loader2, Save, X, Upload, FileText, ArrowLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
}

interface AssignedUser {
  id: number;
  firstname: string;
  lastname?: string;
}

interface StatusOption {
  id: number;
  name: string;
}

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
  assigned_to_id?: number;
  issue_status_id?: number;
  territory_manager_id?: number;
  impact?: string;
  root_cause?: string;
  corrective_action?: string;
  proactive_reactive?: string;
  correction?: string;
}

const TicketEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [ticketInfo, setTicketInfo] = useState<TicketDetail | null>(null);

  const [formData, setFormData] = useState({
    category_type_id: '',
    sub_category_id: '',
    heading: '',
    text: '',
    assigned_to_id: '',
    issue_status_id: '',
    priority: '',
    issue_type: '',
    comment: '',
    root_cause: '',
    impact: '',
    corrective_action: '',
    proactive_reactive: 'Reactive',
    correction: '',
    territory_manager_id: '',
  });

  useEffect(() => {
    const storedCategories = getItemInLocalStorage('categories') || [];
    const storedStatuses = getItemInLocalStorage('STATUS') || [];
    const storedUsers = getItemInLocalStorage('assignedUsers') || [];
    
    setCategories(storedCategories);
    setStatuses(storedStatuses);
    setAssignedUsers(storedUsers);
    
    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  const fetchTicketDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await serviceDeskService.getTicketById(id);
      const data = response.data;
      setTicketInfo(data);
      
      setFormData({
        category_type_id: String(data.category_type_id || ''),
        sub_category_id: String(data.sub_category_id || ''),
        heading: data.heading || '',
        text: data.text || '',
        assigned_to_id: String(data.assigned_to_id || ''),
        issue_status_id: String(data.issue_status_id || ''),
        priority: data.priority || '',
        issue_type: data.issue_type || '',
        comment: '',
        root_cause: data.root_cause || '',
        impact: data.impact || '',
        corrective_action: data.corrective_action || '',
        proactive_reactive: data.proactive_reactive || 'Reactive',
        correction: data.correction || '',
        territory_manager_id: String(data.territory_manager_id || ''),
      });

      // Fetch sub-categories if category is set
      if (data.category_type_id) {
        fetchSubCategories(data.category_type_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ticket details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId: number) => {
    try {
      // In real app, fetch from API
      // const response = await fetchSubCategories(categoryId);
      // setSubCategories(response.data.sub_categories);
      setSubCategories([]);
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    setFormData(prev => ({ ...prev, category_type_id: categoryId, sub_category_id: '' }));
    if (categoryId) {
      await fetchSubCategories(Number(categoryId));
    } else {
      setSubCategories([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category_type_id') {
      handleCategoryChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (fileList: FileList | null) => {
    if (fileList) {
      const newFiles = Array.from(fileList);
      if (files.length + newFiles.length > 4) {
        toast.error('Maximum 4 files allowed');
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.heading) {
      toast.error('Please provide a title');
      return;
    }

    setSaving(true);
    try {
      // Convert files to base64
      const base64Documents: string[] = [];
      for (const file of files) {
        const base64 = await convertFileToBase64(file);
        base64Documents.push(base64.split(',')[1]);
      }

      const updateData = {
        complaint: {
          category_type_id: formData.category_type_id,
          sub_category_id: formData.sub_category_id,
          issue_status_id: formData.issue_status_id,
          complaint_type: formData.issue_type,
          priority: formData.priority,
          assigned_to: formData.assigned_to_id,
          territory_manager_id: formData.territory_manager_id,
          root_cause: formData.root_cause,
          impact: formData.impact,
          corrective_action: formData.corrective_action,
          proactive_reactive: formData.proactive_reactive,
          correction: formData.correction,
        },
        complaint_log: {
          log_status: statuses.find(s => String(s.id) === formData.issue_status_id)?.name || '',
          complaint_status_id: formData.issue_status_id,
          priority: formData.priority,
          assigned_to: assignedUsers.find(u => String(u.id) === formData.assigned_to_id)?.firstname || '',
          comment: formData.comment,
          complaint_id: id,
          documents: base64Documents,
        },
        complaint_comment: {
          docs: base64Documents,
        },
      };

      await serviceDeskService.updateTicket(id!, updateData);
      toast.success('Ticket updated successfully');
      navigate(`/service-desk/${id}`);
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  const priorityOptions = [
    { value: 'P1', label: 'P1 - Critical' },
    { value: 'P2', label: 'P2 - High' },
    { value: 'P3', label: 'P3 - Medium' },
    { value: 'P4', label: 'P4 - Low' },
    { value: 'P5', label: 'P5 - Very Low' },
  ];

  const issueTypeOptions = [
    { value: 'Complaint', label: 'Complaint' },
    { value: 'Request', label: 'Request' },
    { value: 'Suggestion', label: 'Suggestion' },
  ];

  const proactiveReactiveOptions = [
    { value: 'Reactive', label: 'Reactive' },
    { value: 'Proactive', label: 'Proactive' },
  ];

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading ticket details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Ticket</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={() => navigate('/service-desk')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumb items={[
        { label: 'Service Desk', path: '/service-desk' },
        { label: `Ticket #${ticketInfo?.ticket_number || id}`, path: `/service-desk/${id}` },
        { label: 'Edit' }
      ]} />

      {/* Header */}
      <div className="flex items-center gap-4 mt-4 mb-6">
        <button
          onClick={() => navigate(`/service-desk/${id}`)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Ticket</h1>
          <p className="text-sm text-muted-foreground">#{ticketInfo?.ticket_number} - {ticketInfo?.heading}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Read-only Info */}
          {ticketInfo && (
            <div className="mb-8 p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Ticket Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Site:</span>
                  <p className="font-medium text-foreground">{ticketInfo.site_name || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Building:</span>
                  <p className="font-medium text-foreground">{ticketInfo.building_name || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Floor:</span>
                  <p className="font-medium text-foreground">{ticketInfo.floor_name || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Unit:</span>
                  <p className="font-medium text-foreground">{ticketInfo.unit_name || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status & Assignment */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Status & Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Status"
                name="issue_status_id"
                type="select"
                value={formData.issue_status_id}
                onChange={handleChange}
                options={statuses.map(s => ({ value: String(s.id), label: s.name }))}
                placeholder="Select Status"
              />
              <FormInput
                label="Priority"
                name="priority"
                type="select"
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
                placeholder="Select Priority"
              />
              <FormInput
                label="Issue Type"
                name="issue_type"
                type="select"
                value={formData.issue_type}
                onChange={handleChange}
                options={issueTypeOptions}
                placeholder="Select Type"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Assigned To"
                name="assigned_to_id"
                type="select"
                value={formData.assigned_to_id}
                onChange={handleChange}
                options={assignedUsers.map(u => ({ 
                  value: String(u.id), 
                  label: `${u.firstname} ${u.lastname || ''}`.trim() 
                }))}
                placeholder="Select Assignee"
              />
              <FormInput
                label="Approval Authority"
                name="territory_manager_id"
                type="select"
                value={formData.territory_manager_id}
                onChange={handleChange}
                options={assignedUsers.map(u => ({ 
                  value: String(u.id), 
                  label: `${u.firstname} ${u.lastname || ''}`.trim() 
                }))}
                placeholder="Select Approval Authority"
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Category"
                name="category_type_id"
                type="select"
                value={formData.category_type_id}
                onChange={handleChange}
                options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Category"
              />
              <FormInput
                label="Sub Category"
                name="sub_category_id"
                type="select"
                value={formData.sub_category_id}
                onChange={handleChange}
                options={subCategories.map(s => ({ value: String(s.id), label: s.name }))}
                placeholder="Select Sub Category"
                disabled={!formData.category_type_id}
              />
              <FormInput
                label="Proactive/Reactive"
                name="proactive_reactive"
                type="select"
                value={formData.proactive_reactive}
                onChange={handleChange}
                options={proactiveReactiveOptions}
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Additional Details
            </h2>
            <div className="space-y-4">
              <FormInput
                label="Impact"
                name="impact"
                type="textarea"
                value={formData.impact}
                onChange={handleChange}
                placeholder="Describe the impact..."
                rows={2}
              />
              <FormInput
                label="Root Cause"
                name="root_cause"
                type="textarea"
                value={formData.root_cause}
                onChange={handleChange}
                placeholder="Describe the root cause..."
                rows={2}
              />
              <FormInput
                label="Corrective Action"
                name="corrective_action"
                type="textarea"
                value={formData.corrective_action}
                onChange={handleChange}
                placeholder="Describe corrective actions..."
                rows={2}
              />
              <FormInput
                label="Correction"
                name="correction"
                type="textarea"
                value={formData.correction}
                onChange={handleChange}
                placeholder="Describe corrections made..."
                rows={2}
              />
            </div>
          </div>

          {/* Comment & Attachments */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Add Comment & Attachments
            </h2>
            <div className="space-y-4">
              <FormInput
                label="Comment"
                name="comment"
                type="textarea"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Add a comment for the activity log..."
                rows={3}
              />

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">Upload additional documents</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Choose Files
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm text-foreground">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-background rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-error" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => navigate(`/service-desk/${id}`)}
              className="px-6 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketEdit;
