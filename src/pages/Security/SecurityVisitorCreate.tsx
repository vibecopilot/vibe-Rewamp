import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTitle from '../../components/ui/PageTitle';
import { vmsService, Visitor } from '../../services/vms.service';
import { commonService, Site } from '../../services/common.service';
import { getItemInLocalStorage } from '../../utils/localStorage';

interface AdditionalVisitor {
  id: string;
  name: string;
  mobile: string;
  passValidFrom: string;
  passValidTo: string;
}

interface FormData {
  visitorType: 'guest' | 'support_staff';
  visitFrequency: 'once' | 'frequently';
  name: string;
  mobile: string;
  hostId: string;
  passNumber: string;
  comingFrom: string;
  vehicleNumber: string;
  parkingSlot: string;
  expectedDate: string;
  expectedTime: string;
  purpose: string;
  skipHostApproval: boolean;
  goodsInwards: boolean;
  license: boolean;
  consignment: boolean;
  photo: string | null;
}

const SecurityVisitorCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [showAdditionalVisitors, setShowAdditionalVisitors] = useState(false);
  const [additionalVisitors, setAdditionalVisitors] = useState<AdditionalVisitor[]>([]);

  // Dropdown data
  const [hosts, setHosts] = useState<{ id: number; firstname: string; lastname: string }[]>([]);
  const [parkingSlots, setParkingSlots] = useState<{ id: number; name: string }[]>([]);
  const [purposes, setPurposes] = useState<{ id: number; name: string }[]>([]);

  const [formData, setFormData] = useState<FormData>({
    visitorType: 'guest',
    visitFrequency: 'once',
    name: '',
    mobile: '',
    hostId: '',
    passNumber: '',
    comingFrom: '',
    vehicleNumber: '',
    parkingSlot: '',
    expectedDate: '',
    expectedTime: '',
    purpose: '',
    skipHostApproval: false,
    goodsInwards: false,
    license: false,
    consignment: false,
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
        
        // Mock parking slots
        setParkingSlots([
          { id: 1, name: 'Slot A1' },
          { id: 2, name: 'Slot A2' },
          { id: 3, name: 'Slot B1' },
          { id: 4, name: 'Slot B2' },
        ]);
      } catch (err) {
        console.error('Failed to fetch dropdown data:', err);
      }
    };
    fetchData();
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
          visitorType: visitor.user_type === 'support_staff' ? 'support_staff' : 'guest',
          visitFrequency: 'once',
          name: visitor.name || '',
          mobile: visitor.contact_no || '',
          hostId: '',
          passNumber: '',
          comingFrom: visitor.company_name || '',
          vehicleNumber: '',
          parkingSlot: '',
          expectedDate: visitor.expected_date || '',
          expectedTime: visitor.expected_time || '',
          purpose: visitor.purpose || '',
          skipHostApproval: false,
          goodsInwards: false,
          license: false,
          consignment: false,
          photo: visitor.photo_url || null,
        });
      } catch (err) {
        setError('Failed to load visitor details');
      } finally {
        setLoading(false);
      }
    };
    fetchVisitor();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  const addAdditionalVisitor = () => {
    setAdditionalVisitors(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', mobile: '', passValidFrom: '', passValidTo: '' },
    ]);
  };

  const removeAdditionalVisitor = (id: string) => {
    setAdditionalVisitors(prev => prev.filter(v => v.id !== id));
  };

  const updateAdditionalVisitor = (id: string, field: string, value: string) => {
    setAdditionalVisitors(prev => 
      prev.map(v => v.id === id ? { ...v, [field]: value } : v)
    );
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
          expected_date: formData.expectedDate,
          expected_time: formData.expectedTime,
          host_id: formData.hostId ? parseInt(formData.hostId) : undefined,
          user_type: formData.visitorType,
          vehicle_number: formData.vehicleNumber,
        },
      };

      if (isEditMode && id) {
        await vmsService.updateVisitor(id, payload);
        toast.success('Visitor updated successfully');
        navigate(`/security/visitors/${id}`);
      } else {
        await vmsService.createVisitor(payload);
        toast.success('Visitor created successfully');
        navigate('/security/visitors');
      }
    } catch (err) {
      toast.error(isEditMode ? 'Failed to update visitor' : 'Failed to create visitor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
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
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/security/visitors')}
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
          { label: 'Security', path: '/security' },
          { label: 'Visitors', path: '/security/visitors' },
          { label: isEditMode ? 'Edit' : 'New Visitor' },
        ]}
      />

      {/* Form Card with Gradient Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-primary p-4">
          <h2 className="text-lg font-semibold text-primary-foreground uppercase tracking-wide">
            {isEditMode ? 'Edit Visitor' : 'New Visitor'}
          </h2>
        </div>

        <div className="p-6">
          {/* Photo Upload */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-muted border-4 border-border flex items-center justify-center overflow-hidden">
                {formData.photo ? (
                  <img src={formData.photo} alt="Visitor" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visitor Type & Frequency */}
          <div className="flex flex-wrap gap-8 mb-8">
            <div>
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visitorType"
                    value="support_staff"
                    checked={formData.visitorType === 'support_staff'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-foreground">Support Staff</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Visiting Frequency</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visitFrequency"
                    value="once"
                    checked={formData.visitFrequency === 'once'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-foreground">Once</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visitFrequency"
                    value="frequently"
                    checked={formData.visitFrequency === 'frequently'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-foreground">Frequently</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Row 1 */}
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

            {/* Row 2 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Pass Number</label>
              <input
                type="text"
                name="passNumber"
                placeholder="Enter Pass Number"
                value={formData.passNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
              <label className="block text-sm font-medium text-foreground mb-1">Vehicle Number</label>
              <input
                type="text"
                name="vehicleNumber"
                placeholder="Enter Vehicle Number"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Select Parking Slot</label>
              <select
                name="parkingSlot"
                value={formData.parkingSlot}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Slot</option>
                {parkingSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>{slot.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Expected Date</label>
              <input
                type="date"
                name="expectedDate"
                value={formData.expectedDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Expected Time</label>
              <input
                type="time"
                name="expectedTime"
                value={formData.expectedTime}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Visit Purpose - Full Width */}
          <div className="mb-6">
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

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6 mb-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="skipHostApproval"
                checked={formData.skipHostApproval}
                onChange={handleChange}
                className="w-4 h-4 rounded text-primary"
              />
              <span className="text-sm text-foreground">Skip Host Approval</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="goodsInwards"
                checked={formData.goodsInwards}
                onChange={handleChange}
                className="w-4 h-4 rounded text-primary"
              />
              <span className="text-sm text-foreground">Goods Inwards</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="license"
                checked={formData.license}
                onChange={handleChange}
                className="w-4 h-4 rounded text-primary"
              />
              <span className="text-sm text-foreground">License</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="consignment"
                checked={formData.consignment}
                onChange={handleChange}
                className="w-4 h-4 rounded text-primary"
              />
              <span className="text-sm text-foreground">Consignment</span>
            </label>
          </div>

          {/* Additional Visitors Section */}
          <div className="border border-border rounded-lg mb-8">
            <div
              className="flex items-center justify-between p-4 cursor-pointer bg-muted/30"
              onClick={() => setShowAdditionalVisitors(!showAdditionalVisitors)}
            >
              <h3 className="text-sm font-semibold text-foreground uppercase">Additional Visitor(s)</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addAdditionalVisitor();
                  setShowAdditionalVisitors(true);
                }}
                className="px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                + Add Visitor
              </button>
            </div>
            
            {showAdditionalVisitors && additionalVisitors.length > 0 && (
              <div className="p-4 space-y-4">
                {additionalVisitors.map((visitor, index) => (
                  <div key={visitor.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/20 rounded-lg relative">
                    <button
                      type="button"
                      onClick={() => removeAdditionalVisitor(visitor.id)}
                      className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Name</label>
                      <input
                        type="text"
                        placeholder="Enter Visitor Name"
                        value={visitor.name}
                        onChange={(e) => updateAdditionalVisitor(visitor.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Mobile</label>
                      <input
                        type="tel"
                        placeholder="Enter Mobile Number"
                        value={visitor.mobile}
                        onChange={(e) => updateAdditionalVisitor(visitor.id, 'mobile', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Pass Valid From</label>
                      <input
                        type="date"
                        value={visitor.passValidFrom}
                        onChange={(e) => updateAdditionalVisitor(visitor.id, 'passValidFrom', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Pass Valid To</label>
                      <input
                        type="date"
                        value={visitor.passValidTo}
                        onChange={(e) => updateAdditionalVisitor(visitor.id, 'passValidTo', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default SecurityVisitorCreate;
