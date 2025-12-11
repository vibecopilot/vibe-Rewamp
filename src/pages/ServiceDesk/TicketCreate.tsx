import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormInput from '../../components/ui/FormInput';
import { serviceDeskService } from '../../services/serviceDesk.service';
import { getItemInLocalStorage } from '../../utils/localStorage';
import { Loader2, Save, X, Upload, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
}

interface Building {
  id: number;
  name: string;
}

interface Floor {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  name: string;
}

interface AssignedUser {
  id: number;
  firstname: string;
  lastname?: string;
}

const TicketCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    issue_type_id: '',
    complaint_type: '',
    category_type_id: '',
    sub_category_id: '',
    building_name: '',
    floor_name: '',
    unit_id: '',
    heading: '',
    text: '',
    priority: '',
    assigned_to: '',
    complaint_mode_id: '',
  });

  useEffect(() => {
    const storedCategories = getItemInLocalStorage('categories') || [];
    const storedBuildings = getItemInLocalStorage('Building') || [];
    setCategories(storedCategories);
    setBuildings(storedBuildings);
    fetchAssignedUsers();
  }, []);

  const fetchAssignedUsers = async () => {
    try {
      const response = await fetch('/api/assigned_users');
      // Fallback to localStorage if API fails
      const users = getItemInLocalStorage('assignedUsers') || [];
      setAssignedUsers(users);
    } catch (error) {
      console.error('Error fetching assigned users:', error);
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    setFormData(prev => ({ ...prev, category_type_id: categoryId, sub_category_id: '' }));
    if (categoryId) {
      try {
        // Fetch sub-categories based on category
        const category = categories.find(c => c.id === Number(categoryId));
        if (category) {
          // Mock sub-categories - in real app, fetch from API
          setSubCategories([]);
        }
      } catch (error) {
        console.error('Error fetching sub-categories:', error);
      }
    } else {
      setSubCategories([]);
    }
  };

  const handleBuildingChange = async (buildingId: string) => {
    setFormData(prev => ({ ...prev, building_name: buildingId, floor_name: '', unit_id: '' }));
    if (buildingId) {
      try {
        // Fetch floors based on building
        const storedFloors = getItemInLocalStorage('Floors') || [];
        setFloors(storedFloors.filter((f: Floor & { building_id?: number }) => f.building_id === Number(buildingId)));
      } catch (error) {
        console.error('Error fetching floors:', error);
      }
    } else {
      setFloors([]);
      setUnits([]);
    }
  };

  const handleFloorChange = async (floorId: string) => {
    setFormData(prev => ({ ...prev, floor_name: floorId, unit_id: '' }));
    if (floorId) {
      try {
        // Fetch units based on floor
        const storedUnits = getItemInLocalStorage('Units') || [];
        setUnits(storedUnits.filter((u: Unit & { floor_id?: number }) => u.floor_id === Number(floorId)));
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    } else {
      setUnits([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category_type_id') {
      handleCategoryChange(value);
    } else if (name === 'building_name') {
      handleBuildingChange(value);
    } else if (name === 'floor_name') {
      handleFloorChange(value);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.heading) {
      toast.error('Please provide a title');
      return;
    }
    if (!formData.category_type_id) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(`complaints[${key}]`, value);
        }
      });
      
      submitData.append('complaints[of_phase]', 'pms');
      
      files.forEach((file) => {
        submitData.append('documents[]', file);
      });

      await serviceDeskService.createTicket(submitData);
      toast.success('Ticket created successfully');
      navigate('/service-desk');
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
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
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Common Area', label: 'Common Area' },
  ];

  const complaintTypeOptions = [
    { value: 'Complaint', label: 'Complaint' },
    { value: 'Request', label: 'Request' },
    { value: 'Suggestion', label: 'Suggestion' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumb items={[
        { label: 'Service Desk', path: '/service-desk' },
        { label: 'Create Ticket' }
      ]} />

      <div className="bg-card border border-border rounded-xl shadow-sm mt-4">
        <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-xl">
          <h1 className="text-xl font-semibold">Create New Ticket</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Fill in the details to submit a new support ticket</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Related To"
                name="issue_type_id"
                type="select"
                value={formData.issue_type_id}
                onChange={handleChange}
                options={issueTypeOptions}
                placeholder="Select Area"
              />
              <FormInput
                label="Type"
                name="complaint_type"
                type="select"
                value={formData.complaint_type}
                onChange={handleChange}
                options={complaintTypeOptions}
                placeholder="Select Type"
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
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Location Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Building"
                name="building_name"
                type="select"
                value={formData.building_name}
                onChange={handleChange}
                options={buildings.map(b => ({ value: String(b.id), label: b.name }))}
                placeholder="Select Building"
              />
              <FormInput
                label="Floor"
                name="floor_name"
                type="select"
                value={formData.floor_name}
                onChange={handleChange}
                options={floors.map(f => ({ value: String(f.id), label: f.name }))}
                placeholder="Select Floor"
                disabled={!formData.building_name}
              />
              <FormInput
                label="Unit"
                name="unit_id"
                type="select"
                value={formData.unit_id}
                onChange={handleChange}
                options={units.map(u => ({ value: String(u.id), label: u.name }))}
                placeholder="Select Unit"
                disabled={!formData.floor_name}
              />
            </div>
          </div>

          {/* Category Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Category & Assignment
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
                required
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
                label="Assign To"
                name="assigned_to"
                type="select"
                value={formData.assigned_to}
                onChange={handleChange}
                options={assignedUsers.map(u => ({ 
                  value: String(u.id), 
                  label: `${u.firstname} ${u.lastname || ''}`.trim() 
                }))}
                placeholder="Select Assignee"
              />
            </div>
          </div>

          {/* Ticket Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Ticket Details
            </h2>
            <div className="space-y-4">
              <FormInput
                label="Title"
                name="heading"
                type="text"
                value={formData.heading}
                onChange={handleChange}
                placeholder="Enter ticket title"
                required
              />
              <FormInput
                label="Description"
                name="text"
                type="textarea"
                value={formData.text}
                onChange={handleChange}
                placeholder="Describe your issue in detail..."
                rows={4}
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">5</span>
              Attachments
            </h2>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mb-4">Maximum 4 files allowed</p>
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
              <div className="mt-4 space-y-2">
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/service-desk')}
              className="px-6 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketCreate;
