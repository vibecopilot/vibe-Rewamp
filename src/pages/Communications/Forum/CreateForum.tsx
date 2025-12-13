import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Upload } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import FormSection from '../../../components/ui/FormSection';
import { postForum } from '../../../api/index';
import toast from 'react-hot-toast';

const CreateForum: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill title and description');
      return;
    }

    setLoading(true);
    try {
      const postData = new FormData();
      postData.append('forum[thread_title]', formData.title);
      postData.append('forum[thread_category]', formData.category);
      postData.append('forum[thread_tags]', formData.tags);
      postData.append('forum[thread_description]', formData.description);

      if (attachment) {
        postData.append('attachfiles[]', attachment);
      }

      await postForum(postData);
      toast.success('Forum created successfully');
      navigate('/crm/communications/forum');
    } catch (error) {
      console.error('Error creating forum:', error);
      toast.error('Failed to create forum');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'CRM', path: '/crm/communications' },
        { label: 'Communications', path: '/crm/communications/forum' },
        { label: 'Create Forum' }
      ]} />

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/crm/communications/forum')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Create Forum</h1>
      </div>

      <FormSection title="Forum Information" icon={MessageSquare}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Title <span className="text-destructive">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter forum title"
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Category</option>
              <option value="General">General</option>
              <option value="Discussion">Discussion</option>
              <option value="Feedback">Feedback</option>
              <option value="Support">Support</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="#tags (comma separated)"
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-foreground">Thread Description <span className="text-destructive">*</span></label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Enter forum description"
            className="w-full mt-2 px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-foreground">Forum Profile Picture</label>
          <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="forum-image"
            />
            <label htmlFor="forum-image" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {attachment ? attachment.name : 'Click to upload image'}
              </p>
            </label>
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => navigate('/crm/communications/forum')}
          className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Forum'}
        </button>
      </div>
    </div>
  );
};

export default CreateForum;
