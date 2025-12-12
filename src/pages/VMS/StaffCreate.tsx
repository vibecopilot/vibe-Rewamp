import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Calendar, Loader2, AlertCircle, Camera } from 'lucide-react';
import Webcam from 'react-webcam';
import PageTitle from '../../components/ui/PageTitle';
import FormSection from '../../components/ui/FormSection';
import FormInput from '../../components/ui/FormInput';
import FormActions from '../../components/ui/FormActions';
import { getAllUnits, getVendors, postStaff, getStaffDetails, editStaffDetails, domainPrefix } from '../../api';
import { initialSchedule, WeekSchedule } from '../../utils/initialFormData';
import { SendDateFormat } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

interface FormErrors {
  [key: string]: string;
}

interface Unit {
  id: number;
  name: string;
}

interface Vendor {
  id: number;
  company_name: string;
}

const StaffCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Dropdown data
  const [units, setUnits] = useState<Unit[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Image capture
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    unit: '',
    workType: '',
    vendorId: '',
    validFrom: '',
    validTill: '',
    status: true,
    workingSchedule: { ...initialSchedule } as WeekSchedule,
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch initial dropdown data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [unitRes, vendorRes] = await Promise.all([
          getAllUnits(),
          getVendors(),
        ]);
        setUnits(unitRes.data || []);
        setVendors(vendorRes.data || []);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch staff for edit mode
  useEffect(() => {
    const fetchStaff = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getStaffDetails(id);
        const editData = res.data;
        
        // Initialize working schedule from API data
        const apiSchedule = editData.working_schedule || {};
        const workingSchedule: WeekSchedule = {};
        daysOfWeek.forEach(day => {
          workingSchedule[day] = {
            selected: !!apiSchedule[day],
            start_time: apiSchedule[day]?.start_time || '',
            end_time: apiSchedule[day]?.end_time || '',
          };
        });

        setFormData({
          firstName: editData.firstname || '',
          lastName: editData.lastname || '',
          email: editData.email || '',
          mobile: editData.mobile_no || '',
          unit: editData.unit_id?.toString() || '',
          workType: editData.work_type || '',
          vendorId: editData.vendor_id?.toString() || '',
          validFrom: editData.valid_from ? SendDateFormat(editData.valid_from) : '',
          validTill: editData.valid_till ? SendDateFormat(editData.valid_till) : '',
          status: editData.status ?? true,
          workingSchedule,
        });

        if (editData.profile_picture?.url) {
          setCapturedImage(domainPrefix + editData.profile_picture.url);
        }
      } catch (err) {
        setError('Failed to load staff details');
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workingSchedule: {
        ...prev.workingSchedule,
        [day]: {
          ...prev.workingSchedule[day],
          selected: !prev.workingSchedule[day].selected,
        },
      },
    }));
  };

  const handleTimeChange = (day: string, type: 'start_time' | 'end_time', value: string) => {
    setFormData(prev => ({
      ...prev,
      workingSchedule: {
        ...prev.workingSchedule,
        [day]: {
          ...prev.workingSchedule[day],
          [type]: value,
        },
      },
    }));
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setShowWebcam(false);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.workType.trim()) newErrors.workType = 'Work type is required';
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
      const sendData = new FormData();
      sendData.append('staff[firstname]', formData.firstName);
      sendData.append('staff[lastname]', formData.lastName);
      sendData.append('staff[mobile_no]', formData.mobile);
      sendData.append('staff[email]', formData.email);
      sendData.append('staff[units]', formData.unit);
      sendData.append('staff[work_type]', formData.workType);
      sendData.append('staff[status]', formData.status.toString());
      sendData.append('staff[unit_id]', formData.unit);
      sendData.append('staff[vendor_id]', formData.vendorId);
      sendData.append('staff[valid_from]', formData.validFrom);
      sendData.append('staff[valid_till]', formData.validTill);

      Object.keys(formData.workingSchedule).forEach((day) => {
        sendData.append(
          `staff[working_schedule][${day}][selected]`,
          formData.workingSchedule[day].selected ? '1' : '0'
        );
        sendData.append(
          `staff[working_schedule][${day}][start_time]`,
          formData.workingSchedule[day].start_time
        );
        sendData.append(
          `staff[working_schedule][${day}][end_time]`,
          formData.workingSchedule[day].end_time
        );
      });

      if (capturedImage && !capturedImage.startsWith('http')) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        sendData.append('staff[profile_picture]', blob, 'staff_image.jpg');
      }

      if (isEditMode && id) {
        await editStaffDetails(id, sendData);
        toast.success('Staff updated successfully');
        navigate(`/vms/staff`);
      } else {
        await postStaff(sendData);
        toast.success('Staff created successfully');
        navigate('/vms/staff');
      }
    } catch (err) {
      toast.error(isEditMode ? 'Failed to update staff' : 'Failed to create staff');
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
      const sendData = new FormData();
      sendData.append('staff[firstname]', formData.firstName);
      sendData.append('staff[lastname]', formData.lastName);
      sendData.append('staff[mobile_no]', formData.mobile);
      sendData.append('staff[email]', formData.email);
      sendData.append('staff[units]', formData.unit);
      sendData.append('staff[work_type]', formData.workType);
      sendData.append('staff[status]', formData.status.toString());
      sendData.append('staff[unit_id]', formData.unit);
      sendData.append('staff[vendor_id]', formData.vendorId);
      sendData.append('staff[valid_from]', formData.validFrom);
      sendData.append('staff[valid_till]', formData.validTill);

      Object.keys(formData.workingSchedule).forEach((day) => {
        sendData.append(
          `staff[working_schedule][${day}][selected]`,
          formData.workingSchedule[day].selected ? '1' : '0'
        );
        sendData.append(
          `staff[working_schedule][${day}][start_time]`,
          formData.workingSchedule[day].start_time
        );
        sendData.append(
          `staff[working_schedule][${day}][end_time]`,
          formData.workingSchedule[day].end_time
        );
      });

      if (capturedImage && !capturedImage.startsWith('http')) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        sendData.append('staff[profile_picture]', blob, 'staff_image.jpg');
      }

      await postStaff(sendData);
      toast.success('Staff created successfully');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        unit: formData.unit,
        workType: '',
        vendorId: '',
        validFrom: '',
        validTill: '',
        status: true,
        workingSchedule: { ...initialSchedule },
      });
      setCapturedImage(null);
    } catch {
      toast.error('Failed to create staff');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageTitle
          title={isEditMode ? 'Edit Staff' : 'New Staff'}
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Staff', path: '/vms/staff' },
            { label: isEditMode ? 'Edit' : 'New Staff' }
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
          title={isEditMode ? 'Edit Staff' : 'New Staff'}
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Staff', path: '/vms/staff' },
            { label: isEditMode ? 'Edit' : 'New Staff' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/vms/staff')}
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
        title={isEditMode ? 'EDIT STAFF' : 'NEW STAFF'}
        breadcrumbs={[
          { label: 'VMS', path: '/vms' },
          { label: 'Staff', path: '/vms/staff' },
          { label: isEditMode ? 'Edit' : 'New Staff' }
        ]}
      />

      {/* Profile Picture Section */}
      <FormSection title="PROFILE PICTURE" icon={Camera}>
        <div className="flex justify-center">
          {!showWebcam ? (
            <div className="flex flex-col items-center">
              <button onClick={() => setShowWebcam(true)} type="button">
                <img
                  src={capturedImage || '/profile.png'}
                  alt="Profile"
                  className="border-4 border-border rounded-full w-32 h-32 object-cover hover:opacity-80 transition-opacity"
                />
              </button>
              <p className="text-muted-foreground text-sm mt-2">Click to capture</p>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="text-primary cursor-pointer text-sm hover:underline"
                >
                  Or upload from device
                </label>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-full w-48 h-48 object-cover"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={capture}
                  type="button"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Capture
                </button>
                <button
                  onClick={() => setShowWebcam(false)}
                  type="button"
                  className="px-4 py-2 border border-border rounded-lg hover:bg-accent"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="STAFF DETAILS" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormInput
            label="First Name"
            name="firstName"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={handleChange}
            required
            error={errors.firstName}
          />
          <FormInput
            label="Last Name"
            name="lastName"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={handleChange}
            required
            error={errors.lastName}
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
          />
          <FormInput
            label="Mobile"
            name="mobile"
            type="tel"
            placeholder="Enter mobile number"
            value={formData.mobile}
            onChange={handleChange}
            required
            error={errors.mobile}
          />
          <FormInput
            label="Unit"
            name="unit"
            type="select"
            value={formData.unit}
            onChange={handleChange}
            required
            error={errors.unit}
            options={[
              { value: '', label: 'Select Unit' },
              ...units.map(u => ({ value: u.id.toString(), label: u.name })),
            ]}
          />
          <FormInput
            label="Work Type"
            name="workType"
            placeholder="Enter work type"
            value={formData.workType}
            onChange={handleChange}
            required
            error={errors.workType}
          />
          <FormInput
            label="Supplier/Vendor"
            name="vendorId"
            type="select"
            value={formData.vendorId}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Vendor' },
              ...vendors.map(v => ({ value: v.id.toString(), label: v.company_name })),
            ]}
          />
          <FormInput
            label="Valid From"
            name="validFrom"
            type="date"
            value={formData.validFrom}
            onChange={handleChange}
          />
          <FormInput
            label="Valid Till"
            name="validTill"
            type="date"
            value={formData.validTill}
            onChange={handleChange}
          />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <label className="font-medium text-sm text-foreground">Status:</label>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${!formData.status ? 'text-foreground' : 'text-muted-foreground'}`}>Inactive</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${formData.status ? 'bg-primary' : 'bg-muted'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.status ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <span className={`text-sm ${formData.status ? 'text-foreground' : 'text-muted-foreground'}`}>Active</span>
          </div>
        </div>
      </FormSection>

      <FormSection title="WORKING SCHEDULE" icon={Calendar}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground"></th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Day</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Start Time</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">End Time</th>
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day) => (
                <tr key={day} className="border-b border-border">
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={formData.workingSchedule[day]?.selected || false}
                      onChange={() => handleCheckboxChange(day)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3 text-foreground">{day}</td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      className="px-3 py-2 border border-border rounded-lg bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground"
                      value={formData.workingSchedule[day]?.start_time || ''}
                      onChange={(e) => handleTimeChange(day, 'start_time', e.target.value)}
                      disabled={!formData.workingSchedule[day]?.selected}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      className="px-3 py-2 border border-border rounded-lg bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground"
                      value={formData.workingSchedule[day]?.end_time || ''}
                      onChange={(e) => handleTimeChange(day, 'end_time', e.target.value)}
                      disabled={!formData.workingSchedule[day]?.selected}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormSection>

      <FormActions
        onSave={handleSave}
        onSaveAndContinue={!isEditMode ? handleSaveAndContinue : undefined}
        cancelPath="/vms/staff"
        saving={saving}
        saveLabel={isEditMode ? 'Update' : 'Save'}
      />
    </div>
  );
};

export default StaffCreate;
