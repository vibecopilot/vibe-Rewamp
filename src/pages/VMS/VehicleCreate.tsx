import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Car, Loader2, AlertCircle } from 'lucide-react';
import Select from 'react-select';
import PageTitle from '../../components/ui/PageTitle';
import FormSection from '../../components/ui/FormSection';
import FormInput from '../../components/ui/FormInput';
import FormActions from '../../components/ui/FormActions';
import { 
  getAllUnits, 
  getParkingConfig, 
  getSetupUsers, 
  postRegisteredVehicle, 
  getRegisteredVehicleDetails,
  editRegisteredVehicleDetails 
} from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';

interface FormErrors {
  [key: string]: string;
}

interface SelectOption {
  value: number;
  label: string;
}

interface Unit {
  id: number;
  name: string;
}

interface Slot {
  id: number;
  name: string;
}

const VehicleCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const today = new Date().toISOString().split('T')[0];
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Dropdown data
  const [units, setUnits] = useState<Unit[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<SelectOption | null>(null);

  const [formData, setFormData] = useState({
    slotNumber: '',
    vehicleCategory: '',
    vehicleType: '',
    stickerNumber: '',
    registrationNumber: '',
    insuranceNumber: '',
    insuranceTill: '',
    category: '',
    vehicleNumber: '',
    unit: '',
  });

  const userId = getItemInLocalStorage<string>('UserId');

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitRes, parkingRes, userRes] = await Promise.all([
          getAllUnits(),
          getParkingConfig(),
          getSetupUsers(),
        ]);
        
        setUnits(unitRes.data || []);
        setSlots(parkingRes.data || []);
        
        const userData = (userRes.data || []).map((user: { id: number; firstname: string; lastname: string }) => ({
          value: user.id,
          label: `${user.firstname} ${user.lastname}`.trim(),
        }));
        setUsers(userData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch vehicle details for edit mode
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await getRegisteredVehicleDetails(id);
        const data = res.data;
        
        setFormData({
          slotNumber: data.slot_number?.toString() || '',
          vehicleCategory: data.vehicle_category || '',
          vehicleType: data.vehicle_type || '',
          stickerNumber: data.sticker_number || '',
          registrationNumber: data.registration_number || '',
          insuranceNumber: data.insurance_number || '',
          insuranceTill: data.insurance_valid_till || '',
          category: data.category || '',
          vehicleNumber: data.vehicle_number || '',
          unit: data.unit_id?.toString() || '',
        });

        if (data.user_id && users.length > 0) {
          const initialUser = users.find(u => u.value === data.user_id);
          setSelectedUser(initialUser || null);
        }
      } catch (err) {
        setError('Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch vehicle once users are loaded (for edit mode)
    if (isEditMode && users.length > 0) {
      fetchVehicle();
    } else if (!isEditMode) {
      setLoading(false);
    }
  }, [id, isEditMode, users]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!formData.vehicleCategory) newErrors.vehicleCategory = 'Vehicle category is required';
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
      postData.append('registered_vehicle[slot_number]', formData.slotNumber);
      postData.append('registered_vehicle[vehicle_category]', formData.vehicleCategory);
      postData.append('registered_vehicle[vehicle_type]', formData.vehicleType);
      postData.append('registered_vehicle[sticker_number]', formData.stickerNumber);
      postData.append('registered_vehicle[registration_number]', formData.registrationNumber);
      postData.append('registered_vehicle[insurance_number]', formData.insuranceNumber);
      postData.append('registered_vehicle[insurance_valid_till]', formData.insuranceTill);
      postData.append('registered_vehicle[category]', formData.category);
      postData.append('registered_vehicle[vehicle_number]', formData.vehicleNumber);
      postData.append('registered_vehicle[unit_id]', formData.unit);
      postData.append('registered_vehicle[created_by_id]', userId || '');
      
      if (selectedUser) {
        postData.append('registered_vehicle[user_id]', selectedUser.value.toString());
      }

      if (isEditMode && id) {
        await editRegisteredVehicleDetails(id, postData);
        toast.success('Vehicle updated successfully');
        navigate('/vms/registered-vehicles');
      } else {
        await postRegisteredVehicle(postData);
        toast.success('Vehicle registered successfully');
        navigate('/vms/registered-vehicles');
      }
    } catch (err) {
      toast.error(isEditMode ? 'Failed to update vehicle' : 'Failed to register vehicle');
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
      postData.append('registered_vehicle[slot_number]', formData.slotNumber);
      postData.append('registered_vehicle[vehicle_category]', formData.vehicleCategory);
      postData.append('registered_vehicle[vehicle_type]', formData.vehicleType);
      postData.append('registered_vehicle[sticker_number]', formData.stickerNumber);
      postData.append('registered_vehicle[registration_number]', formData.registrationNumber);
      postData.append('registered_vehicle[insurance_number]', formData.insuranceNumber);
      postData.append('registered_vehicle[insurance_valid_till]', formData.insuranceTill);
      postData.append('registered_vehicle[category]', formData.category);
      postData.append('registered_vehicle[vehicle_number]', formData.vehicleNumber);
      postData.append('registered_vehicle[unit_id]', formData.unit);
      postData.append('registered_vehicle[created_by_id]', userId || '');
      
      if (selectedUser) {
        postData.append('registered_vehicle[user_id]', selectedUser.value.toString());
      }

      await postRegisteredVehicle(postData);
      toast.success('Vehicle registered successfully');
      
      // Reset form
      setFormData({
        slotNumber: '',
        vehicleCategory: '',
        vehicleType: '',
        stickerNumber: '',
        registrationNumber: '',
        insuranceNumber: '',
        insuranceTill: '',
        category: '',
        vehicleNumber: '',
        unit: formData.unit,
      });
      setSelectedUser(null);
    } catch {
      toast.error('Failed to register vehicle');
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
          title={isEditMode ? 'Edit Vehicle' : 'Add Vehicle'}
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Registered Vehicles', path: '/vms/registered-vehicles' },
            { label: isEditMode ? 'Edit' : 'Add Vehicle' }
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
          title={isEditMode ? 'Edit Vehicle' : 'Add Vehicle'}
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Registered Vehicles', path: '/vms/registered-vehicles' },
            { label: isEditMode ? 'Edit' : 'Add Vehicle' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/vms/registered-vehicles')}
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
        title={isEditMode ? 'EDIT VEHICLE' : 'ADD VEHICLE'}
        breadcrumbs={[
          { label: 'VMS', path: '/vms' },
          { label: 'Registered Vehicles', path: '/vms/registered-vehicles' },
          { label: isEditMode ? 'Edit' : 'Add Vehicle' }
        ]}
      />

      <FormSection title="VEHICLE DETAILS" icon={Car}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Select User</label>
            <Select
              options={users}
              value={selectedUser}
              onChange={(option) => setSelectedUser(option)}
              placeholder="Select User"
              noOptionsMessage={() => 'No users available'}
              styles={selectStyles}
              isClearable
            />
          </div>

          <FormInput
            label="Parking Slot"
            name="slotNumber"
            type="select"
            value={formData.slotNumber}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Slot' },
              ...slots.map(s => ({ value: s.id.toString(), label: s.name })),
            ]}
          />

          <FormInput
            label="Vehicle Category"
            name="vehicleCategory"
            type="select"
            value={formData.vehicleCategory}
            onChange={handleChange}
            required
            error={errors.vehicleCategory}
            options={[
              { value: '', label: 'Select Vehicle Category' },
              { value: '2 Wheeler', label: '2 Wheeler' },
              { value: '4 Wheeler', label: '4 Wheeler' },
            ]}
          />

          <FormInput
            label="Vehicle Type"
            name="vehicleType"
            type="select"
            value={formData.vehicleType}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Vehicle Type' },
              { value: 'SUV', label: 'SUV' },
              { value: 'Sedan', label: 'Sedan' },
              { value: 'Hatchback', label: 'Hatchback' },
              { value: 'Bike', label: 'Bike' },
              { value: 'Truck', label: 'Truck' },
            ]}
          />

          <FormInput
            label="Sticker Number"
            name="stickerNumber"
            placeholder="Enter sticker number"
            value={formData.stickerNumber}
            onChange={handleChange}
          />

          <FormInput
            label="Registration Number"
            name="registrationNumber"
            placeholder="Enter registration number"
            value={formData.registrationNumber}
            onChange={handleChange}
          />

          <FormInput
            label="Insurance Number"
            name="insuranceNumber"
            placeholder="Enter insurance number"
            value={formData.insuranceNumber}
            onChange={handleChange}
          />

          <FormInput
            label="Insurance Valid Till"
            name="insuranceTill"
            type="date"
            value={formData.insuranceTill}
            onChange={handleChange}
          />

          <FormInput
            label="Category"
            name="category"
            type="select"
            value={formData.category}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Category' },
              { value: 'Owned', label: 'Owned' },
              { value: 'Staff', label: 'Staff' },
              { value: 'Leased', label: 'Leased' },
              { value: 'warehouse', label: 'Warehouse' },
              { value: 'workshop', label: 'Workshop' },
            ]}
          />

          <FormInput
            label="Vehicle Number"
            name="vehicleNumber"
            placeholder="Enter vehicle number"
            value={formData.vehicleNumber}
            onChange={handleChange}
            required
            error={errors.vehicleNumber}
          />

          <FormInput
            label="Unit"
            name="unit"
            type="select"
            value={formData.unit}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Unit' },
              ...units.map(u => ({ value: u.id.toString(), label: u.name })),
            ]}
          />
        </div>
      </FormSection>

      <FormActions
        onSave={handleSave}
        onSaveAndContinue={!isEditMode ? handleSaveAndContinue : undefined}
        cancelPath="/vms/registered-vehicles"
        saving={saving}
        saveLabel={isEditMode ? 'Update' : 'Save'}
      />
    </div>
  );
};

export default VehicleCreate;
