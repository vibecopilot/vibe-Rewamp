import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Save, Upload, FileText, X, AlertTriangle, FileIcon } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FormInput from '../../components/ui/FormInput';
import { getIncidentTags, getIncidentSubTag, postIncidents, getIncidentData, updateIncidents } from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';
import toast from 'react-hot-toast';

interface Tag {
  id: number;
  name: string;
}

interface Building {
  id: number;
  name: string;
}

const CreateIncident: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);
  const [files, setFiles] = useState<File[]>([]);

  // Dropdown options
  const [primaryCategories, setPrimaryCategories] = useState<Tag[]>([]);
  const [categoryForIncident, setCategoryForIncident] = useState<Tag[]>([]);
  const [secondaryCategories, setSecondaryCategories] = useState<Tag[]>([]);
  const [secondaryCategories2, setSecondaryCategories2] = useState<Tag[]>([]);
  const [severityOptions, setSeverityOptions] = useState<Tag[]>([]);
  const [incidentLevelOptions, setIncidentLevelOptions] = useState<Tag[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [nearMissOptions, setNearMissOptions] = useState<Tag[]>([]);
  const [probabilityOptions, setProbabilityOptions] = useState<Tag[]>([]);
  const [injuryCategories, setInjuryCategories] = useState<Tag[]>([]);
  const [injurySubCategories, setInjurySubCategories] = useState<Tag[]>([]);
  const [injurySubCategories2, setInjurySubCategories2] = useState<Tag[]>([]);
  const [injurySubCategories3, setInjurySubCategories3] = useState<Tag[]>([]);

  const [formData, setFormData] = useState({
    time_and_date: '',
    time: '',
    primary_incident_category_id: '',
    incident_category_id: '',
    secondary_category_id: '',
    secondary_category_2_id: '',
    severity_id: '',
    incident_level_id: '',
    building_id: '',
    near_miss_id: '',
    injury_category_id: '',
    injury_sub_category_id: '',
    injury_sub_category_2_id: '',
    injury_sub_category_3_id: '',
    probability_id: '',
    description: '',
    support_required: false,
    facts_confirmed: false,
  });

  useEffect(() => {
    fetchDropdownData();
    if (isEdit) {
      fetchIncidentDetails();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      // Helper to ensure array
      const ensureArray = (data: any) => Array.isArray(data) ? data : (data?.data || data?.tags || []);

      // Fetch primary categories
      const primaryRes = await getIncidentTags('primary_category');
      setPrimaryCategories(ensureArray(primaryRes.data));

      // Fetch severity options
      const severityRes = await getIncidentTags('severity');
      setSeverityOptions(ensureArray(severityRes.data));

      // Fetch incident level options
      const levelRes = await getIncidentTags('incident_level');
      setIncidentLevelOptions(ensureArray(levelRes.data));

      // Fetch near miss options
      const nearMissRes = await getIncidentTags('near_miss');
      setNearMissOptions(ensureArray(nearMissRes.data));

      // Fetch probability options
      const probRes = await getIncidentTags('probability');
      setProbabilityOptions(ensureArray(probRes.data));

      // Fetch injury categories
      const injuryRes = await getIncidentTags('injury_category');
      setInjuryCategories(ensureArray(injuryRes.data));

      // Get buildings from localStorage
      const storedBuildings = getItemInLocalStorage('Building');
      setBuildings(Array.isArray(storedBuildings) ? storedBuildings : []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchIncidentDetails = async () => {
    try {
      setFetchingData(true);
      const res = await getIncidentData(id);
      const data = res.data;
      
      setFormData({
        time_and_date: data.time_and_date?.split('T')[0] || '',
        time: data.time_and_date?.split('T')[1]?.substring(0, 5) || '',
        primary_incident_category_id: String(data.primary_incident_category_id || ''),
        incident_category_id: String(data.incident_category_id || ''),
        secondary_category_id: String(data.secondary_category_id || ''),
        secondary_category_2_id: String(data.secondary_category_2_id || ''),
        severity_id: String(data.severity_id || ''),
        incident_level_id: String(data.incident_level_id || ''),
        building_id: String(data.building_id || ''),
        near_miss_id: String(data.near_miss_id || ''),
        injury_category_id: String(data.injury_category_id || ''),
        injury_sub_category_id: String(data.injury_sub_category_id || ''),
        injury_sub_category_2_id: String(data.injury_sub_category_2_id || ''),
        injury_sub_category_3_id: String(data.injury_sub_category_3_id || ''),
        probability_id: String(data.probability_id || ''),
        description: data.description || '',
        support_required: data.support_required || false,
        facts_confirmed: true,
      });
    } catch (error) {
      console.error('Error fetching incident details:', error);
      toast.error('Failed to load incident details');
    } finally {
      setFetchingData(false);
    }
  };

  // Helper to ensure array from API response
  const ensureArray = (data: any) => Array.isArray(data) ? data : (data?.data || data?.tags || []);

  // Handle category change to load subcategories
  const handlePrimaryCategoryChange = async (value: string) => {
    setFormData(prev => ({ ...prev, primary_incident_category_id: value, incident_category_id: '', secondary_category_id: '', secondary_category_2_id: '' }));
    if (value) {
      try {
        const res = await getIncidentSubTag(value);
        setCategoryForIncident(ensureArray(res.data));
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setCategoryForIncident([]);
      }
    } else {
      setCategoryForIncident([]);
    }
  };

  const handleCategoryForIncidentChange = async (value: string) => {
    setFormData(prev => ({ ...prev, incident_category_id: value, secondary_category_id: '', secondary_category_2_id: '' }));
    if (value) {
      try {
        const res = await getIncidentSubTag(value);
        setSecondaryCategories(ensureArray(res.data));
      } catch (error) {
        console.error('Error fetching secondary categories:', error);
        setSecondaryCategories([]);
      }
    } else {
      setSecondaryCategories([]);
    }
  };

  const handleSecondaryCategoryChange = async (value: string) => {
    setFormData(prev => ({ ...prev, secondary_category_id: value, secondary_category_2_id: '' }));
    if (value) {
      try {
        const res = await getIncidentSubTag(value);
        setSecondaryCategories2(ensureArray(res.data));
      } catch (error) {
        console.error('Error fetching secondary categories 2:', error);
        setSecondaryCategories2([]);
      }
    } else {
      setSecondaryCategories2([]);
    }
  };

  const handleInjuryCategoryChange = async (value: string) => {
    setFormData(prev => ({ ...prev, injury_category_id: value, injury_sub_category_id: '', injury_sub_category_2_id: '', injury_sub_category_3_id: '' }));
    if (value) {
      try {
        const res = await getIncidentSubTag(value);
        setInjurySubCategories(ensureArray(res.data));
      } catch (error) {
        console.error('Error fetching injury subcategories:', error);
        setInjurySubCategories([]);
      }
    } else {
      setInjurySubCategories([]);
    }
  };

  const handleInjurySubCategoryChange = async (value: string) => {
    setFormData(prev => ({ ...prev, injury_sub_category_id: value, injury_sub_category_2_id: '', injury_sub_category_3_id: '' }));
    if (value) {
      try {
        const res = await getIncidentSubTag(value);
        setInjurySubCategories2(ensureArray(res.data));
      } catch (error) {
        console.error('Error fetching injury subcategories 2:', error);
        setInjurySubCategories2([]);
      }
    } else {
      setInjurySubCategories2([]);
    }
  };

  const handleInjurySubCategory2Change = async (value: string) => {
    setFormData(prev => ({ ...prev, injury_sub_category_2_id: value, injury_sub_category_3_id: '' }));
    if (value) {
      try {
        const res = await getIncidentSubTag(value);
        setInjurySubCategories3(ensureArray(res.data));
      } catch (error) {
        console.error('Error fetching injury subcategories 3:', error);
        setInjurySubCategories3([]);
      }
    } else {
      setInjurySubCategories3([]);
    }
  };
        console.error('Error fetching injury subcategories 3:', error);
      }
    } else {
      setInjurySubCategories3([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'primary_incident_category_id') {
      handlePrimaryCategoryChange(value);
    } else if (name === 'incident_category_id') {
      handleCategoryForIncidentChange(value);
    } else if (name === 'secondary_category_id') {
      handleSecondaryCategoryChange(value);
    } else if (name === 'injury_category_id') {
      handleInjuryCategoryChange(value);
    } else if (name === 'injury_sub_category_id') {
      handleInjurySubCategoryChange(value);
    } else if (name === 'injury_sub_category_2_id') {
      handleInjurySubCategory2Change(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (fileList: FileList | null) => {
    if (fileList) {
      const newFiles = Array.from(fileList);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description) {
      toast.error('Please provide a description');
      return;
    }

    if (!formData.facts_confirmed) {
      toast.error('Please confirm that all facts are correctly stated');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();

      // Combine date and time
      const dateTime = formData.time_and_date && formData.time 
        ? `${formData.time_and_date}T${formData.time}:00` 
        : formData.time_and_date;

      submitData.append('incident[time_and_date]', dateTime);
      submitData.append('incident[description]', formData.description);
      submitData.append('incident[support_required]', String(formData.support_required));

      if (formData.primary_incident_category_id) {
        submitData.append('incident[primary_incident_category_id]', formData.primary_incident_category_id);
      }
      if (formData.incident_category_id) {
        submitData.append('incident[incident_category_id]', formData.incident_category_id);
      }
      if (formData.secondary_category_id) {
        submitData.append('incident[secondary_category_id]', formData.secondary_category_id);
      }
      if (formData.secondary_category_2_id) {
        submitData.append('incident[secondary_category_2_id]', formData.secondary_category_2_id);
      }
      if (formData.severity_id) {
        submitData.append('incident[severity_id]', formData.severity_id);
      }
      if (formData.incident_level_id) {
        submitData.append('incident[incident_level_id]', formData.incident_level_id);
      }
      if (formData.building_id) {
        submitData.append('incident[building_id]', formData.building_id);
      }
      if (formData.near_miss_id) {
        submitData.append('incident[near_miss_id]', formData.near_miss_id);
      }
      if (formData.injury_category_id) {
        submitData.append('incident[injury_category_id]', formData.injury_category_id);
      }
      if (formData.injury_sub_category_id) {
        submitData.append('incident[injury_sub_category_id]', formData.injury_sub_category_id);
      }
      if (formData.injury_sub_category_2_id) {
        submitData.append('incident[injury_sub_category_2_id]', formData.injury_sub_category_2_id);
      }
      if (formData.injury_sub_category_3_id) {
        submitData.append('incident[injury_sub_category_3_id]', formData.injury_sub_category_3_id);
      }
      if (formData.probability_id) {
        submitData.append('incident[probability_id]', formData.probability_id);
      }

      files.forEach((file) => {
        submitData.append('attachments[]', file);
      });

      if (isEdit) {
        await updateIncidents(id, submitData);
        toast.success('Incident updated successfully');
      } else {
        await postIncidents(submitData);
        toast.success('Incident created successfully');
      }
      navigate('/incident');
    } catch (error) {
      console.error('Error saving incident:', error);
      toast.error(isEdit ? 'Failed to update incident' : 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumb items={[
        { label: 'Safety', path: '/incident' },
        { label: 'Incident Management', path: '/incident' },
        { label: isEdit ? 'Edit Incident' : 'Add Incident' }
      ]} />

      <div className="bg-card border border-border rounded-xl shadow-sm mt-4">
        <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-xl">
          <h1 className="text-xl font-semibold">{isEdit ? 'Edit Incident' : 'Add Incidents'}</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Fill in the details to {isEdit ? 'update the' : 'report a new'} incident</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Details Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                <AlertTriangle className="w-4 h-4" />
              </span>
              Details
            </h2>
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormInput
                label="Time & Date"
                name="time_and_date"
                type="date"
                value={formData.time_and_date}
                onChange={handleChange}
                placeholder="dd-mm-yyyy"
              />
              <FormInput
                label="Time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="--:--"
              />
              <FormInput
                label="Select The Incident Primary Category"
                name="primary_incident_category_id"
                type="select"
                value={formData.primary_incident_category_id}
                onChange={handleChange}
                options={primaryCategories.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Primary Category"
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormInput
                label="Select The Category For The Incident"
                name="incident_category_id"
                type="select"
                value={formData.incident_category_id}
                onChange={handleChange}
                options={categoryForIncident.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Category"
                disabled={!formData.primary_incident_category_id}
              />
              <FormInput
                label="Select The Secondary Category"
                name="secondary_category_id"
                type="select"
                value={formData.secondary_category_id}
                onChange={handleChange}
                options={secondaryCategories.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Secondary Category"
                disabled={!formData.incident_category_id}
              />
              <FormInput
                label="Severity"
                name="severity_id"
                type="select"
                value={formData.severity_id}
                onChange={handleChange}
                options={severityOptions.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Severity"
              />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormInput
                label="Incident Level"
                name="incident_level_id"
                type="select"
                value={formData.incident_level_id}
                onChange={handleChange}
                options={incidentLevelOptions.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Incident Level"
              />
              <FormInput
                label="Building"
                name="building_id"
                type="select"
                value={formData.building_id}
                onChange={handleChange}
                options={buildings.map(b => ({ value: String(b.id), label: b.name }))}
                placeholder="Select Building"
              />
              <FormInput
                label="Select Near Miss / Good Catch Incident"
                name="near_miss_id"
                type="select"
                value={formData.near_miss_id}
                onChange={handleChange}
                options={nearMissOptions.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Option"
              />
            </div>

            {/* Row 4 - Injury categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormInput
                label="Select The Category For The Incident"
                name="injury_category_id"
                type="select"
                value={formData.injury_category_id}
                onChange={handleChange}
                options={injuryCategories.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Injury Category"
              />
              <FormInput
                label="Select The Secondary Category For The Incident"
                name="injury_sub_category_id"
                type="select"
                value={formData.injury_sub_category_id}
                onChange={handleChange}
                options={injurySubCategories.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Secondary Category"
                disabled={!formData.injury_category_id}
              />
              <FormInput
                label="Select The Secondary Category For The Incident"
                name="injury_sub_category_2_id"
                type="select"
                value={formData.injury_sub_category_2_id}
                onChange={handleChange}
                options={injurySubCategories2.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Secondary Category"
                disabled={!formData.injury_sub_category_id}
              />
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormInput
                label="Select The Secondary Category For The Incident"
                name="injury_sub_category_3_id"
                type="select"
                value={formData.injury_sub_category_3_id}
                onChange={handleChange}
                options={injurySubCategories3.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Secondary Category"
                disabled={!formData.injury_sub_category_2_id}
              />
              <FormInput
                label="Probability"
                name="probability_id"
                type="select"
                value={formData.probability_id}
                onChange={handleChange}
                options={probabilityOptions.map(c => ({ value: String(c.id), label: c.name }))}
                placeholder="Select Probability"
              />
              <div></div>
            </div>

            {/* Row 6 - Description */}
            <div className="mb-4">
              <FormInput
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the incident in detail..."
                rows={4}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="support_required"
                  checked={formData.support_required}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Support required</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="facts_confirmed"
                  checked={formData.facts_confirmed}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">I have correctly stated all the facts related to the incident</span>
              </label>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                <FileIcon className="w-4 h-4" />
              </span>
              Attachments
            </h2>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop files here or click to browse</p>
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
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
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
              onClick={() => navigate('/incident')}
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
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Update Incident' : 'Create Incident'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIncident;
