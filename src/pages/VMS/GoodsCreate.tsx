import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Loader2 } from 'lucide-react';
import Select from 'react-select';
import PageTitle from '../../components/ui/PageTitle';
import FormSection from '../../components/ui/FormSection';
import FormInput from '../../components/ui/FormInput';
import FormActions from '../../components/ui/FormActions';
import { getExpectedVisitor, getStaff, postGoods } from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';

interface FormErrors {
  [key: string]: string;
}

interface SelectOption {
  value: number;
  label: string;
}

const GoodsCreate: React.FC = () => {
  const navigate = useNavigate();
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  // Dropdown data
  const [visitors, setVisitors] = useState<SelectOption[]>([]);
  const [staff, setStaff] = useState<SelectOption[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<SelectOption | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<SelectOption | null>(null);

  // Form state
  const [type, setType] = useState<'visitor' | 'staff'>('visitor');
  const [ward, setWard] = useState<'in' | 'out'>('in');
  const [formData, setFormData] = useState({
    noOfGoods: '',
    goodsName: '',
    vehicleNumber: '',
    description: '',
  });

  const userId = getItemInLocalStorage<string>('UserId');

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitorRes, staffRes] = await Promise.all([
          getExpectedVisitor(),
          getStaff(),
        ]);
        
        const visitorData = (visitorRes.data || []).map((visitor: { id: number; name: string }) => ({
          value: visitor.id,
          label: visitor.name,
        }));
        setVisitors(visitorData);

        const staffData = (staffRes.data || []).map((s: { id: number; firstname: string; lastname: string }) => ({
          value: s.id,
          label: `${s.firstname} ${s.lastname}`.trim(),
        }));
        setStaff(staffData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (type === 'visitor' && !selectedVisitor) {
      newErrors.visitor = 'Please select a visitor';
    }
    if (type === 'staff' && !selectedStaff) {
      newErrors.staff = 'Please select a staff member';
    }
    if (!formData.noOfGoods.trim()) {
      newErrors.noOfGoods = 'Number of goods is required';
    }
    
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
      const postData = new FormData();
      
      if (type === 'visitor' && selectedVisitor) {
        postData.append('goods_in_out[visitor_id]', selectedVisitor.value.toString());
      }
      if (type === 'staff' && selectedStaff) {
        postData.append('goods_in_out[staff_id]', selectedStaff.value.toString());
      }
      
      postData.append('goods_in_out[no_of_goods]', formData.noOfGoods);
      postData.append('goods_in_out[description]', formData.description);
      postData.append('goods_in_out[ward_type]', ward);
      postData.append('goods_in_out[vehicle_no]', formData.vehicleNumber);
      postData.append('goods_in_out[person_name]', formData.goodsName);
      postData.append('goods_in_out[created_by_id]', userId || '');

      await postGoods(postData);
      toast.success('Goods added successfully');
      navigate('/vms/goods-in-out');
    } catch (err) {
      toast.error('Failed to add goods');
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
      const postData = new FormData();
      
      if (type === 'visitor' && selectedVisitor) {
        postData.append('goods_in_out[visitor_id]', selectedVisitor.value.toString());
      }
      if (type === 'staff' && selectedStaff) {
        postData.append('goods_in_out[staff_id]', selectedStaff.value.toString());
      }
      
      postData.append('goods_in_out[no_of_goods]', formData.noOfGoods);
      postData.append('goods_in_out[description]', formData.description);
      postData.append('goods_in_out[ward_type]', ward);
      postData.append('goods_in_out[vehicle_no]', formData.vehicleNumber);
      postData.append('goods_in_out[person_name]', formData.goodsName);
      postData.append('goods_in_out[created_by_id]', userId || '');

      await postGoods(postData);
      toast.success('Goods added successfully');
      
      // Reset form
      setFormData({
        noOfGoods: '',
        goodsName: '',
        vehicleNumber: '',
        description: '',
      });
      setSelectedVisitor(null);
      setSelectedStaff(null);
    } catch {
      toast.error('Failed to add goods');
    } finally {
      setSaving(false);
    }
  };

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--background))',
      borderColor: 'hsl(var(--border))',
      minHeight: '42px',
      '&:hover': {
        borderColor: 'hsl(var(--primary))',
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
    }),
    option: (base: any, state: { isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
      color: 'hsl(var(--foreground))',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'hsl(var(--foreground))',
    }),
    input: (base: any) => ({
      ...base,
      color: 'hsl(var(--foreground))',
    }),
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageTitle
          title="ADD GOODS"
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Goods In/Out', path: '/vms/goods-in-out' },
            { label: 'Add Goods' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageTitle
        title="ADD GOODS"
        breadcrumbs={[
          { label: 'VMS', path: '/vms' },
          { label: 'Goods In/Out', path: '/vms/goods-in-out' },
          { label: 'Add Goods' }
        ]}
      />

      <FormSection title="GOODS DETAILS" icon={Package}>
        {/* Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium text-sm text-foreground min-w-[80px]">Type:</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('visitor')}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  type === 'visitor' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border text-foreground hover:bg-accent'
                }`}
              >
                Visitor
              </button>
              <button
                type="button"
                onClick={() => setType('staff')}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  type === 'staff' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border text-foreground hover:bg-accent'
                }`}
              >
                Staff
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="font-medium text-sm text-foreground min-w-[120px]">Inward/Outward:</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWard('in')}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  ward === 'in' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border text-foreground hover:bg-accent'
                }`}
              >
                Inward
              </button>
              <button
                type="button"
                onClick={() => setWard('out')}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  ward === 'out' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border text-foreground hover:bg-accent'
                }`}
              >
                Outward
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {type === 'visitor' ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Select Visitor <span className="text-destructive">*</span>
              </label>
              <Select
                options={visitors}
                value={selectedVisitor}
                onChange={(option) => setSelectedVisitor(option)}
                placeholder="Select Visitor"
                noOptionsMessage={() => 'No visitors available'}
                styles={selectStyles}
                isClearable
              />
              {errors.visitor && (
                <p className="text-xs text-destructive mt-1">{errors.visitor}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Select Staff <span className="text-destructive">*</span>
              </label>
              <Select
                options={staff}
                value={selectedStaff}
                onChange={(option) => setSelectedStaff(option)}
                placeholder="Select Staff"
                noOptionsMessage={() => 'No staff available'}
                styles={selectStyles}
                isClearable
              />
              {errors.staff && (
                <p className="text-xs text-destructive mt-1">{errors.staff}</p>
              )}
            </div>
          )}

          <FormInput
            label="No. of Goods"
            name="noOfGoods"
            placeholder="Enter number"
            value={formData.noOfGoods}
            onChange={handleChange}
            required
            error={errors.noOfGoods}
          />

          <FormInput
            label="Goods Name"
            name="goodsName"
            placeholder="Enter goods name"
            value={formData.goodsName}
            onChange={handleChange}
          />

          <FormInput
            label="Vehicle Number"
            name="vehicleNumber"
            placeholder="Enter vehicle number"
            value={formData.vehicleNumber}
            onChange={handleChange}
          />
        </div>

        <div className="mt-6">
          <FormInput
            label="Description"
            name="description"
            type="textarea"
            placeholder="Enter description..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
      </FormSection>

      <FormActions
        onSave={handleSave}
        onSaveAndContinue={handleSaveAndContinue}
        cancelPath="/vms/goods-in-out"
        saving={saving}
        saveLabel="Save"
      />
    </div>
  );
};

export default GoodsCreate;
