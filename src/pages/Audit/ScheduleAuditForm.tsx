import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { getAssignedTo, getVendors, getVendorCategory } from '../../api';

const scheduleTypes = ['Asset', 'Services', 'Vendor', 'Training', 'Compliance'];
const checklistTypes = ['Individual', 'Asset Group'];
const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'One Time'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const scanTypes = ['QR Code', 'NFC', 'Manual'];

interface FormData {
  schedule_for: string;
  activity_name: string;
  description: string;
  allow_observations: boolean;
  checklist_type: string;
  assign_to: string;
  scan_type: string;
  plan_duration: string;
  priority: string;
  email_trigger_rule: string;
  supervisors: string;
  category_id: string;
  lock_overdue_task: string;
  frequency: string;
  start_from: string;
  end_at: string;
  supplier_id: string;
  create_new: boolean;
  create_task: boolean;
  weightage: boolean;
}

const ScheduleAuditForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    schedule_for: 'Asset',
    activity_name: '',
    description: '',
    allow_observations: false,
    checklist_type: 'Individual',
    assign_to: '',
    scan_type: '',
    plan_duration: '',
    priority: 'Medium',
    email_trigger_rule: '',
    supervisors: '',
    category_id: '',
    lock_overdue_task: '',
    frequency: 'Daily',
    start_from: '',
    end_at: '',
    supplier_id: '',
    create_new: true,
    create_task: false,
    weightage: false,
  });

  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [usersRes, categoriesRes, suppliersRes] = await Promise.all([
        getAssignedTo(),
        getVendorCategory(),
        getVendors()
      ]);
      setAssignedUsers(Array.isArray(usersRes?.data) ? usersRes.data : []);
      setCategories(Array.isArray(categoriesRes?.data) ? categoriesRes.data : []);
      setSuppliers(Array.isArray(suppliersRes?.data) ? suppliersRes.data : []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleScheduleTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, schedule_for: type }));
  };

  const handleChecklistTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, checklist_type: type }));
  };

  const addTask = () => {
    setTasks(prev => [...prev, { id: Date.now(), name: '' }]);
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
      toast.success('Audit scheduled successfully');
      navigate('/audit/operational/scheduled');
    } catch (error) {
      console.error('Error scheduling audit:', error);
      toast.error('Failed to schedule audit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Schedule Audit"
        breadcrumbs={[
          { label: 'FM Module', path: '/audit' },
          { label: 'Audit', path: '/audit' },
          { label: 'Schedule Audit' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        {/* Toggle Section */}
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

        {/* Basic Info Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Basic Info</h2>
          </div>

          {/* Schedule For Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">Schedule For</label>
            <div className="flex flex-wrap gap-2">
              {scheduleTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleScheduleTypeChange(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    formData.schedule_for === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Task</h2>
            </div>
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
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id} className="p-4 border border-border rounded-lg">
                  <input
                    type="text"
                    placeholder={`Task ${index + 1}`}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Schedule</h2>
          </div>

          {/* Checklist Type Radio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">Checklist Type</label>
            <div className="flex gap-4">
              {checklistTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="checklist_type"
                    checked={formData.checklist_type === type}
                    onChange={() => handleChecklistTypeChange(type)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Assign To</label>
              <select
                name="assign_to"
                value={formData.assign_to}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {assignedUsers.map((user) => (
                  <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Scan Type</label>
              <select
                name="scan_type"
                value={formData.scan_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {scanTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Plan Duration</label>
              <select
                name="plan_duration"
                value={formData.plan_duration}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Trigger Rule</label>
              <select
                name="email_trigger_rule"
                value={formData.email_trigger_rule}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="on_create">On Create</option>
                <option value="on_complete">On Complete</option>
                <option value="on_overdue">On Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Supervisors</label>
              <select
                name="supervisors"
                value={formData.supervisors}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {assignedUsers.map((user) => (
                  <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Lock Overdue Task</label>
              <select
                name="lock_overdue_task"
                value={formData.lock_overdue_task}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {frequencies.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start From</label>
              <input
                type="date"
                name="start_from"
                value={formData.start_from}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End At</label>
              <input
                type="date"
                name="end_at"
                value={formData.end_at}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Supplier</label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.vendor_name || s.company_name}</option>
                ))}
              </select>
            </div>
          </div>
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

export default ScheduleAuditForm;