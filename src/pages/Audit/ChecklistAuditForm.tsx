import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';

const forTypes = ['Asset', 'Services', 'Vendor', 'Training'];
const inputTypes = ['Text', 'Number', 'Dropdown', 'Checkbox', 'Date', 'File Upload', 'Rating'];

interface TaskItem {
  id: number;
  group: string;
  subgroup: string;
  task: string;
  input_type: string;
  mandatory: boolean;
  reading: boolean;
  help_text: boolean;
}

interface FormData {
  for_type: string;
  create_new: boolean;
  create_task: boolean;
  weightage: boolean;
  activity_name: string;
  description: string;
  allow_observations: boolean;
}

const ChecklistAuditForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    for_type: 'Asset',
    create_new: true,
    create_task: false,
    weightage: false,
    activity_name: '',
    description: '',
    allow_observations: false,
  });

  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleForTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, for_type: type }));
  };

  const addTask = () => {
    setTasks(prev => [...prev, {
      id: Date.now(),
      group: '',
      subgroup: '',
      task: '',
      input_type: 'Text',
      mandatory: false,
      reading: false,
      help_text: false,
    }]);
  };

  const updateTask = (id: number, field: keyof TaskItem, value: any) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const removeTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.activity_name) {
      toast.error('Please enter activity name');
      return;
    }

    setLoading(true);
    try {
      // API call would go here
      toast.success('Checklist created successfully');
      navigate('/audit/operational/checklists');
    } catch (error) {
      console.error('Error creating checklist:', error);
      toast.error('Failed to create checklist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Checklist Audit"
        breadcrumbs={[
          { label: 'FM Module', path: '/audit' },
          { label: 'Audit', path: '/audit' },
          { label: 'Checklist Audit' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        {/* Basic Info Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Basic Info</h2>
          </div>

          {/* For Type Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">For</label>
            <div className="flex flex-wrap gap-2">
              {forTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleForTypeChange(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    formData.for_type === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="create_new"
                checked={formData.create_new}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Create New</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="create_task"
                checked={formData.create_task}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Create Task</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="weightage"
                checked={formData.weightage}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Weightage</span>
            </label>
          </div>
        </div>

        {/* Activity Name Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Activity Name</h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Activity Name *</label>
              <input
                type="text"
                name="activity_name"
                value={formData.activity_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Activity Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Enter Description"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="allow_observations"
                checked={formData.allow_observations}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Allow Observations</span>
            </label>
          </div>
        </div>

        {/* Task Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Task</h2>
            <button
              type="button"
              onClick={addTask}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tasks added yet. Click "Add Section" to add tasks.</p>
          ) : (
            <div className="space-y-6">
              {tasks.map((task, index) => (
                <div key={task.id} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-foreground">Task {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Group</label>
                      <select
                        value={task.group}
                        onChange={(e) => updateTask(task.id, 'group', e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Group</option>
                        <option value="general">General</option>
                        <option value="safety">Safety</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">SubGroup</label>
                      <select
                        value={task.subgroup}
                        onChange={(e) => updateTask(task.id, 'subgroup', e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select SubGroup</option>
                        <option value="sub1">SubGroup 1</option>
                        <option value="sub2">SubGroup 2</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Task</label>
                      <input
                        type="text"
                        value={task.task}
                        onChange={(e) => updateTask(task.id, 'task', e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter Task"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Input Type</label>
                      <select
                        value={task.input_type}
                        onChange={(e) => updateTask(task.id, 'input_type', e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {inputTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.mandatory}
                        onChange={(e) => updateTask(task.id, 'mandatory', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Mandatory</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.reading}
                        onChange={(e) => updateTask(task.id, 'reading', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Reading</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.help_text}
                        onChange={(e) => updateTask(task.id, 'help_text', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Help Text</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChecklistAuditForm;