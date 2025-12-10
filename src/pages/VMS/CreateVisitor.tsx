import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings, Loader2, AlertCircle } from 'lucide-react';
import PageTitle from '../../components/ui/PageTitle';
import FormSection from '../../components/ui/FormSection';
import FormInput from '../../components/ui/FormInput';
import FormActions from '../../components/ui/FormActions';
import { vmsService, Visitor } from '../../services/vms.service';
import { commonService, Site } from '../../services/common.service';
import toast from 'react-hot-toast';

interface FormErrors {
  [key: string]: string;
}

const CreateVisitor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Dropdown data
  const [sites, setSites] = useState<Site[]>([]);
  const [buildings, setBuildings] = useState<{ id: number; building_name: string }[]>([]);
  const [hosts, setHosts] = useState<{ id: number; firstname: string; lastname: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_no: '',
    company_name: '',
    id_type: '',
    id_number: '',
    purpose: '',
    host_id: '',
    site_id: '',
    building_id: '',
    expected_date: '',
    expected_time: '',
    user_type: '',
    vehicle_number: '',
    notes: '',
  });

  // Fetch initial dropdown data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [sitesRes, categoriesRes] = await Promise.all([
          commonService.getSites(),
          vmsService.getCategories(),
        ]);
        setSites(sitesRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch visitor for edit mode
  useEffect(() => {
    const fetchVisitor = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await vmsService.getVisitorById(id);
        const visitor: Visitor = response.data;
        setFormData({
          name: visitor.name || '',
          email: visitor.email || '',
          contact_no: visitor.contact_no || '',
          company_name: visitor.company_name || '',
          id_type: '',
          id_number: '',
          purpose: visitor.purpose || '',
          host_id: '',
          site_id: '',
          building_id: '',
          expected_date: visitor.expected_date || '',
          expected_time: visitor.expected_time || '',
          user_type: visitor.user_type || '',
          vehicle_number: '',
          notes: '',
        });
      } catch (err) {
        setError('Failed to load visitor details');
      } finally {
        setLoading(false);
      }
    };
    fetchVisitor();
  }, [id]);

  // Fetch buildings when site changes
  useEffect(() => {
    const fetchBuildings = async () => {
      if (!formData.site_id) {
        setBuildings([]);
        return;
      }
      try {
        const response = await commonService.getBuildings(formData.site_id);
        setBuildings(response.data || []);
      } catch {
        setBuildings([]);
      }
    };
    fetchBuildings();
  }, [formData.site_id]);

  // Fetch hosts when site changes
  useEffect(() => {
    const fetchHosts = async () => {
      if (!formData.site_id) {
        setHosts([]);
        return;
      }
      try {
        const response = await vmsService.getHosts(formData.site_id);
        setHosts(response.data || []);
      } catch {
        setHosts([]);
      }
    };
    fetchHosts();
  }, [formData.site_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Visitor name is required';
    if (!formData.contact_no.trim()) {
      newErrors.contact_no = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.contact_no.replace(/\D/g, ''))) {
      newErrors.contact_no = 'Enter a valid 10-digit phone number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        visitor: {
          name: formData.name,
          contact_no: formData.contact_no,
          email: formData.email || undefined,
          company_name: formData.company_name || undefined,
          purpose: formData.purpose,
          expected_date: formData.expected_date || undefined,
          expected_time: formData.expected_time || undefined,
          site_id: formData.site_id ? parseInt(formData.site_id) : undefined,
          building_id: formData.building_id ? parseInt(formData.building_id) : undefined,
          host_id: formData.host_id ? parseInt(formData.host_id) : undefined,
          user_type: formData.user_type || undefined,
        }
      };

      if (isEditMode && id) {
        await vmsService.updateVisitor(id, payload);
        toast.success('Visitor updated successfully');
        navigate(`/vms/visitors/${id}`);
      } else {
        await vmsService.createVisitor(payload);
        toast.success('Visitor created successfully');
        navigate('/vms/visitors');
      }
    } catch (err) {
      toast.error(isEditMode ? 'Failed to update visitor' : 'Failed to create visitor');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        visitor: {
          name: formData.name,
          contact_no: formData.contact_no,
          email: formData.email || undefined,
          company_name: formData.company_name || undefined,
          purpose: formData.purpose,
          expected_date: formData.expected_date || undefined,
          expected_time: formData.expected_time || undefined,
          site_id: formData.site_id ? parseInt(formData.site_id) : undefined,
          building_id: formData.building_id ? parseInt(formData.building_id) : undefined,
          host_id: formData.host_id ? parseInt(formData.host_id) : undefined,
          user_type: formData.user_type || undefined,
        }
      };
      
      await vmsService.createVisitor(payload);
      toast.success('Visitor created successfully');
      setFormData({
        name: '',
        email: '',
        contact_no: '',
        company_name: '',
        id_type: '',
        id_number: '',
        purpose: '',
        host_id: '',
        site_id: formData.site_id,
        building_id: formData.building_id,
        expected_date: '',
        expected_time: '',
        user_type: '',
        vehicle_number: '',
        notes: '',
      });
    } catch {
      toast.error('Failed to create visitor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageTitle
          title={isEditMode ? 'Edit Visitor' : 'New Visitor'}
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Visitors', path: '/vms/visitors' },
            { label: isEditMode ? 'Edit' : 'New Visitor' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageTitle
          title={isEditMode ? 'Edit Visitor' : 'New Visitor'}
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Visitors', path: '/vms/visitors' },
            { label: isEditMode ? 'Edit' : 'New Visitor' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/vms/visitors')}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageTitle
        title={isEditMode ? 'EDIT VISITOR' : 'NEW VISITOR'}
        breadcrumbs={[
          { label: 'VMS', path: '/vms' },
          { label: 'Visitors', path: '/vms/visitors' },
          { label: isEditMode ? 'Edit' : 'New Visitor' }
        ]}
      />

      <FormSection title="VISITOR DETAILS" icon={Settings}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormInput
            label="Visitor Name"
            name="name"
            placeholder="Enter visitor name"
            value={formData.name}
            onChange={handleChange}
            required
            error={errors.name}
          />
          <FormInput
            label="Phone Number"
            name="contact_no"
            type="tel"
            placeholder="Enter phone number"
            value={formData.contact_no}
            onChange={handleChange}
            required
            error={errors.contact_no}
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <FormInput
            label="Company"
            name="company_name"
            placeholder="Enter company name"
            value={formData.company_name}
            onChange={handleChange}
          />
          <FormInput
            label="Visitor Type"
            name="user_type"
            type="select"
            value={formData.user_type}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Type' },
              ...categories.map((cat) => ({ value: cat.name, label: cat.name })),
            ]}
          />
          <FormInput
            label="ID Type"
            name="id_type"
            type="select"
            value={formData.id_type}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select ID Type' },
              { value: 'aadhar', label: 'Aadhar Card' },
              { value: 'passport', label: 'Passport' },
              { value: 'driving', label: 'Driving License' },
              { value: 'pan', label: 'PAN Card' },
            ]}
          />
          <FormInput
            label="ID Number"
            name="id_number"
            placeholder="Enter ID number"
            value={formData.id_number}
            onChange={handleChange}
            disabled={!formData.id_type}
          />
        </div>
      </FormSection>

      <FormSection title="VISIT DETAILS" icon={Settings}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormInput
            label="Purpose of Visit"
            name="purpose"
            type="select"
            value={formData.purpose}
            onChange={handleChange}
            required
            error={errors.purpose}
            options={[
              { value: '', label: 'Select Purpose' },
              { value: 'meeting', label: 'Meeting' },
              { value: 'interview', label: 'Interview' },
              { value: 'delivery', label: 'Delivery' },
              { value: 'vendor', label: 'Vendor Meeting' },
              { value: 'personal', label: 'Personal Visit' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <FormInput
            label="Site"
            name="site_id"
            type="select"
            value={formData.site_id}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Site' },
              ...sites.map((site) => ({ value: site.id.toString(), label: site.site_name })),
            ]}
          />
          <FormInput
            label="Building"
            name="building_id"
            type="select"
            value={formData.building_id}
            onChange={handleChange}
            disabled={!formData.site_id}
            options={[
              { value: '', label: 'Select Building' },
              ...buildings.map((b) => ({ value: b.id.toString(), label: b.building_name })),
            ]}
          />
          <FormInput
            label="Host"
            name="host_id"
            type="select"
            value={formData.host_id}
            onChange={handleChange}
            disabled={!formData.site_id}
            options={[
              { value: '', label: 'Select Host' },
              ...hosts.map((h) => ({
                value: h.id.toString(),
                label: `${h.firstname || ''} ${h.lastname || ''}`.trim() || `Host ${h.id}`,
              })),
            ]}
          />
          <FormInput
            label="Expected Date"
            name="expected_date"
            type="date"
            value={formData.expected_date}
            onChange={handleChange}
          />
          <FormInput
            label="Expected Time"
            name="expected_time"
            type="time"
            value={formData.expected_time}
            onChange={handleChange}
          />
          <FormInput
            label="Vehicle Number"
            name="vehicle_number"
            placeholder="Enter vehicle number (if any)"
            value={formData.vehicle_number}
            onChange={handleChange}
          />
        </div>
        <div className="mt-6">
          <FormInput
            label="Notes"
            name="notes"
            type="textarea"
            placeholder="Enter any additional notes..."
            value={formData.notes}
            onChange={handleChange}
            rows={4}
          />
        </div>
      </FormSection>

      <FormActions
        onSave={handleSave}
        onSaveAndContinue={!isEditMode ? handleSaveAndContinue : undefined}
        cancelPath="/vms/visitors"
        saving={saving}
        saveLabel={isEditMode ? 'Update' : 'Save'}
      />
    </div>
  );
};

export default CreateVisitor;
