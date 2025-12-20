import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTitle from '../../components/ui/PageTitle';
import { vmsService } from '../../services/vms.service';
import { getItemInLocalStorage } from '../../utils/localStorage';

interface FormData {
  visitorType: 'guest';
  name: string;
  mobile: string;
  hostId: string;
  comingFrom: string;
  purpose: string;
  photo: string | null;
}

const SecuritySelfRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [hosts, setHosts] = useState<{ id: number; firstname: string; lastname: string }[]>([]);
  const [purposes, setPurposes] = useState<{ id: number; name: string }[]>([]);

  const [formData, setFormData] = useState<FormData>({
    visitorType: 'guest',
    name: '',
    mobile: '',
    hostId: '',
    comingFrom: '',
    purpose: '',
    photo: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const siteId = getItemInLocalStorage<string>('SITEID') || '';
        const [hostsRes, categoriesRes] = await Promise.all([
          vmsService.getHosts(siteId),
          vmsService.getCategories(),
        ]);
        
        const hostsData = hostsRes.data;
        setHosts(Array.isArray(hostsData) ? hostsData : hostsData?.hosts || hostsData?.users || hostsData?.data || []);
        
        const categoriesData = categoriesRes.data;
        const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || categoriesData?.data || [];
        setPurposes(categories.map((c: any) => ({ id: c.id, name: c.name || c.purpose })));
      } catch (err) {
        console.error('Failed to fetch dropdown data:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Visitor name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.hostId) newErrors.hostId = 'Please select a host';
    if (!formData.purpose) newErrors.purpose = 'Please select a purpose';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        visitor: {
          name: formData.name,
          contact_no: formData.mobile,
          company_name: formData.comingFrom,
          purpose: formData.purpose,
          host_id: formData.hostId ? parseInt(formData.hostId) : undefined,
          user_type: 'self_registered',
        },
      };

      await vmsService.createVisitor(payload);
      toast.success('Self-registration submitted successfully');
      navigate('/security/visitors');
    } catch (err) {
      toast.error('Failed to submit registration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageTitle
        title="SELF REGISTRATION"
        breadcrumbs={[
          { label: 'Security', path: '/security' },
          { label: 'Visitors', path: '/security/visitors' },
          { label: 'Self Registration' },
        ]}
      />

      {/* Form Card with Gradient Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-primary p-4">
          <h2 className="text-lg font-semibold text-primary-foreground uppercase tracking-wide">
            Self Registration
          </h2>
        </div>

        <div className="p-6">
          {/* Photo Upload */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-muted border-4 border-primary/30 flex items-center justify-center overflow-hidden">
                {formData.photo ? (
                  <img src={formData.photo} alt="Visitor" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Visitor Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Visitor Type</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visitorType"
                  value="guest"
                  checked={formData.visitorType === 'guest'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-foreground">Guest</span>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Visitor Name <span className="text-destructive">*</span></label>
              <input
                type="text"
                name="name"
                placeholder="Enter Visitor Name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? 'border-destructive' : 'border-border'}`}
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mobile Number <span className="text-destructive">*</span></label>
              <input
                type="tel"
                name="mobile"
                placeholder="Enter Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary ${errors.mobile ? 'border-destructive' : 'border-border'}`}
              />
              {errors.mobile && <p className="text-xs text-destructive mt-1">{errors.mobile}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Host <span className="text-destructive">*</span></label>
              <select
                name="hostId"
                value={formData.hostId}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary ${errors.hostId ? 'border-destructive' : 'border-border'}`}
              >
                <option value="">Select Person to meet</option>
                {hosts.map(host => (
                  <option key={host.id} value={host.id}>
                    {`${host.firstname || ''} ${host.lastname || ''}`.trim() || `Host ${host.id}`}
                  </option>
                ))}
              </select>
              {errors.hostId && <p className="text-xs text-destructive mt-1">{errors.hostId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Coming From</label>
              <input
                type="text"
                name="comingFrom"
                placeholder="Enter Origin"
                value={formData.comingFrom}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Visit Purpose <span className="text-destructive">*</span></label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary ${errors.purpose ? 'border-destructive' : 'border-border'}`}
              >
                <option value="">Select Purpose</option>
                <option value="meeting">Meeting</option>
                <option value="interview">Interview</option>
                <option value="delivery">Delivery</option>
                <option value="vendor">Vendor Meeting</option>
                <option value="personal">Personal Visit</option>
                <option value="other">Other</option>
                {purposes.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              {errors.purpose && <p className="text-xs text-destructive mt-1">{errors.purpose}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-3 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySelfRegistration;
