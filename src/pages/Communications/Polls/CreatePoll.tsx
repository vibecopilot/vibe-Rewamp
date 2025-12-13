import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, BarChart3 } from 'lucide-react';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import FormSection from '../../../components/ui/FormSection';
import { getAssignedTo, postPolls } from '../../../api/index';
import toast from 'react-hot-toast';

const CreatePoll: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>([]);
  const [pollInput, setPollInput] = useState('');
  const [assignedToOptions, setAssignedToOptions] = useState<any[]>([]);
  const [selectedTargetGroups, setSelectedTargetGroups] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    visibility: ''
  });

  useEffect(() => {
    const fetchAssignedTo = async () => {
      try {
        const res = await getAssignedTo();
        const users = res.data?.map((u: any) => ({
          value: u.id,
          label: `${u.firstname} ${u.lastname}`
        })) || [];
        setAssignedToOptions(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchAssignedTo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (pollInput.trim() && pollOptions.length < 5) {
      setPollOptions([...pollOptions, pollInput.trim()]);
      setPollInput('');
    } else if (pollOptions.length >= 5) {
      toast.error('Maximum 5 options allowed');
    }
  };

  const handleRemoveOption = (index: number) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handleTargetGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setSelectedTargetGroups(selectedValues);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.start_date || !formData.end_date || pollOptions.length === 0) {
      toast.error('Please fill all required fields and add at least one option');
      return;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const startDate = new Date(formData.start_date);
    
    if (startDate < currentDate) {
      toast.error('Start date must be equal or greater than current date');
      return;
    }

    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append('poll[title]', formData.title);
      sendData.append('poll[description]', formData.description);
      sendData.append('poll[start_date]', formData.start_date);
      sendData.append('poll[end_date]', formData.end_date);
      sendData.append('poll[start_time]', formData.start_time);
      sendData.append('poll[end_time]', formData.end_time);
      sendData.append('poll[visibility]', formData.visibility);

      selectedTargetGroups.forEach((group) => {
        sendData.append('poll[target_groups]', group.toString());
      });

      pollOptions.forEach((option, index) => {
        sendData.append(`poll[poll_options_attributes][${index + 1}][content]`, option);
      });

      await postPolls(sendData);
      toast.success('Poll created successfully');
      navigate('/crm/communications/polls');
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'CRM', path: '/crm/communications' },
        { label: 'Communications', path: '/crm/communications/polls' },
        { label: 'Create Poll' }
      ]} />

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/crm/communications/polls')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Create Poll</h1>
      </div>

      <FormSection title="Poll Information" icon={BarChart3}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Poll Title <span className="text-destructive">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter poll title"
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Poll Options <span className="text-destructive">*</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pollInput}
                onChange={(e) => setPollInput(e.target.value)}
                placeholder="Enter option"
                disabled={pollOptions.length >= 5}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              <button
                onClick={handleAddOption}
                disabled={pollOptions.length >= 5}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Visibility</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Visibility</option>
              <option value="Public">Public</option>
              <option value="Restricted">Restricted</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Start Date <span className="text-destructive">*</span></label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Start Time</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">End Date <span className="text-destructive">*</span></label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">End Time</label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Target Groups/Roles</label>
            <select
              multiple
              value={selectedTargetGroups.map(String)}
              onChange={handleTargetGroupChange}
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
            >
              {assignedToOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple</p>
          </div>
        </div>

        {pollOptions.length > 0 && (
          <div className="mt-4 p-3 border border-border rounded-lg bg-muted/30">
            <p className="text-sm font-medium text-foreground mb-2">Added Options:</p>
            <div className="flex flex-wrap gap-2">
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                  <span>{option}</span>
                  <button onClick={() => handleRemoveOption(index)} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="text-sm font-medium text-foreground">Poll Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Enter poll description"
            className="w-full mt-2 px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>
      </FormSection>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => navigate('/crm/communications/polls')}
          className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Poll'}
        </button>
      </div>
    </div>
  );
};

export default CreatePoll;
