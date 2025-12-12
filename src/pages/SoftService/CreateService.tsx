import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormSection from '../../components/ui/FormSection';
import FormInput from '../../components/ui/FormInput';
import FormGrid from '../../components/ui/FormGrid';
import { 
  postSoftServices, 
  EditSoftServices, 
  getSoftServicesDetails,
  getBuildings,
  getFloors,
  getUnits,
  getGenericGroup
} from '../../api';
import { Loader2, Wrench, Save, ChevronDown, ChevronUp, Paperclip, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';

interface ServiceFormData {
  name: string;
  building_id: string;
  floor_id: string;
  unit_id: string;
  group_id: string;
  sub_group_id: string;
  latitude: string;
  longitude: string;
  cron_day: string;
  cron_hour: string;
  cron_minute: string;
  attachments: File[];
}

const CreateService: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    building_id: '',
    floor_id: '',
    unit_id: '',
    group_id: '',
    sub_group_id: '',
    latitude: '',
    longitude: '',
    cron_day: '*',
    cron_hour: '0',
    cron_minute: '0',
    attachments: [],
  });

  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subGroups, setSubGroups] = useState<any[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);

  const dayOptions = [
    { value: '*', label: 'Every day' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '0', label: 'Sunday' },
  ];

  useEffect(() => {
    fetchDropdownData();
    if (isEdit && id) {
      fetchServiceDetails(id);
    }
  }, [id, isEdit]);

  const fetchDropdownData = async () => {
    try {
      const [buildingRes, groupsRes] = await Promise.all([
        getBuildings(),
        getGenericGroup(),
      ]);
      
      setBuildings(buildingRes.data || []);
      setGroups(groupsRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchServiceDetails = async (serviceId: string) => {
    setLoading(true);
    try {
      const response = await getSoftServicesDetails(serviceId);
      const data = response.data;
      
      setFormData({
        name: data.name || '',
        building_id: data.building_id?.toString() || '',
        floor_id: data.floor_id?.toString() || '',
        unit_id: data.unit_id?.toString() || '',
        group_id: data.group_id?.toString() || '',
        sub_group_id: data.sub_group_id?.toString() || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        cron_day: data.cron_day || '*',
        cron_hour: data.cron_hour?.toString() || '0',
        cron_minute: data.cron_minute?.toString() || '0',
        attachments: [],
      });
      
      if (data.building_id) {
        await fetchFloors(data.building_id.toString());
      }
      if (data.floor_id) {
        await fetchUnits(data.floor_id.toString());
      }
      if (data.group_id) {
        await fetchSubGroups(data.group_id.toString());
      }
      
      setExistingAttachments(data.attachments || []);
    } catch (error) {
      toast.error('Failed to fetch service details');
      navigate('/soft-services');
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async (buildingId: string) => {
    try {
      const response = await getFloors(buildingId);
      setFloors(response.data || []);
    } catch (error) {
      console.error('Error fetching floors:', error);
    }
  };

  const fetchUnits = async (floorId: string) => {
    try {
      const response = await getUnits(floorId);
      setUnits(response.data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchSubGroups = async (groupId: string) => {
    try {
      // Fetch sub-groups based on parent group
      const response = await getGenericGroup();
      const allGroups = response.data || [];
      const filtered = allGroups.filter((g: any) => g.parent_id?.toString() === groupId);
      setSubGroups(filtered);
    } catch (error) {
      console.error('Error fetching sub-groups:', error);
    }
  };

  const handleBuildingChange = async (value: string) => {
    setFormData(prev => ({ ...prev, building_id: value, floor_id: '', unit_id: '' }));
    setFloors([]);
    setUnits([]);
    if (value) {
      await fetchFloors(value);
    }
  };

  const handleFloorChange = async (value: string) => {
    setFormData(prev => ({ ...prev, floor_id: value, unit_id: '' }));
    setUnits([]);
    if (value) {
      await fetchUnits(value);
    }
  };

  const handleGroupChange = async (value: string) => {
    setFormData(prev => ({ ...prev, group_id: value, sub_group_id: '' }));
    setSubGroups([]);
    if (value) {
      await fetchSubGroups(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files!)],
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const clearCron = () => {
    setFormData(prev => ({
      ...prev,
      cron_day: '*',
      cron_hour: '0',
      cron_minute: '0',
    }));
  };

  const handleSubmit = async (showDetails = false) => {
    if (!formData.name) {
      toast.error('Service name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('soft_service[name]', formData.name);
      if (formData.building_id) payload.append('soft_service[building_id]', formData.building_id);
      if (formData.floor_id) payload.append('soft_service[floor_id]', formData.floor_id);
      if (formData.unit_id) payload.append('soft_service[unit_id]', formData.unit_id);
      if (formData.group_id) payload.append('soft_service[group_id]', formData.group_id);
      if (formData.sub_group_id) payload.append('soft_service[sub_group_id]', formData.sub_group_id);
      if (formData.latitude) payload.append('soft_service[latitude]', formData.latitude);
      if (formData.longitude) payload.append('soft_service[longitude]', formData.longitude);
      payload.append('soft_service[cron_day]', formData.cron_day);
      payload.append('soft_service[cron_hour]', formData.cron_hour);
      payload.append('soft_service[cron_minute]', formData.cron_minute);
      
      formData.attachments.forEach((file, index) => {
        payload.append(`soft_service[attachments][]`, file);
      });

      if (isEdit && id) {
        await EditSoftServices(payload, id);
        toast.success('Service updated successfully');
      } else {
        const response = await postSoftServices(payload);
        toast.success('Service created successfully');
        if (showDetails && response.data?.id) {
          navigate(`/soft-services/${response.data.id}`);
          return;
        }
      }
      
      if (showDetails && id) {
        navigate(`/soft-services/${id}`);
      } else {
        navigate('/soft-services');
      }
    } catch (error) {
      toast.error(isEdit ? 'Failed to update service' : 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb 
        items={[
          { label: 'FM Module' }, 
          { label: 'Soft Services', path: '/soft-services' }, 
          { label: 'Service', path: '/soft-services' },
          { label: isEdit ? 'Edit Service' : 'Create Service' }
        ]} 
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden mt-6">
        <FormSection title={isEdit ? 'Edit Service' : 'Create Service'} icon={<Wrench className="w-5 h-5" />}>
          <FormGrid columns={3}>
            <FormInput
              label="Service Name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter service name"
            />
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Select Building</label>
              <select
                value={formData.building_id}
                onChange={(e) => handleBuildingChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Building</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name || b.building_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Select Floor</label>
              <select
                value={formData.floor_id}
                onChange={(e) => handleFloorChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!formData.building_id}
              >
                <option value="">Select Floor</option>
                {floors.map((f) => (
                  <option key={f.id} value={f.id}>{f.name || f.floor_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Select Unit</label>
              <select
                value={formData.unit_id}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_id: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!formData.floor_id}
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.unit_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Service Groups</label>
              <select
                value={formData.group_id}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Group</option>
                {groups.filter(g => !g.parent_id).map((g) => (
                  <option key={g.id} value={g.id}>{g.name || g.info_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Service SubGroups</label>
              <select
                value={formData.sub_group_id}
                onChange={(e) => setFormData(prev => ({ ...prev, sub_group_id: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!formData.group_id}
              >
                <option value="">Select SubGroup</option>
                {subGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name || g.info_name}</option>
                ))}
              </select>
            </div>

            <FormInput
              label="Latitude"
              value={formData.latitude}
              onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
              placeholder="Enter latitude"
            />

            <FormInput
              label="Longitude"
              value={formData.longitude}
              onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
              placeholder="Enter longitude"
            />
          </FormGrid>
        </FormSection>

        {/* Cron Setting */}
        <FormSection title="Cron Setting" icon={<Wrench className="w-5 h-5" />}>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-foreground">Every</span>
            <select
              value={formData.cron_day}
              onChange={(e) => setFormData(prev => ({ ...prev, cron_day: e.target.value }))}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              {dayOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="text-sm text-foreground">at</span>
            <input
              type="number"
              min="0"
              max="23"
              value={formData.cron_hour}
              onChange={(e) => setFormData(prev => ({ ...prev, cron_hour: e.target.value }))}
              className="w-16 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-center"
            />
            <span className="text-sm text-foreground">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={formData.cron_minute}
              onChange={(e) => setFormData(prev => ({ ...prev, cron_minute: e.target.value }))}
              className="w-16 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-center"
            />
            <button
              type="button"
              onClick={clearCron}
              className="px-4 py-2 text-sm text-destructive border border-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              Clear
            </button>
          </div>
        </FormSection>

        {/* Attachments */}
        <FormSection title="Attachments" icon={<Paperclip className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm">Choose Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            
            {(formData.attachments.length > 0 || existingAttachments.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {existingAttachments.map((att, idx) => (
                  <div key={`existing-${idx}`} className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg">
                    <span className="text-sm">{att.name || att.filename || 'Attachment'}</span>
                  </div>
                ))}
                {formData.attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg">
                    <span className="text-sm">{file.name}</span>
                    <button onClick={() => removeAttachment(idx)} className="text-destructive hover:text-destructive/80">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="p-6 border-t border-border">
          <div className="flex justify-center">
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save & Show Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateService;
