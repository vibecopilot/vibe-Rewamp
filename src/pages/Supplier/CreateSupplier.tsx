import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, MapPin, Landmark, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { getVendorsDetails, postVendors, EditVendors, getVendorsType, getVendorCategory } from '../../api';
import { stateCityModal } from '../../utils/stateCityModal';

interface SupplierFormData {
  company_name: string;
  vendor_name: string;
  primary_phone: string;
  secondary_phone: string;
  primary_email: string;
  secondary_email: string;
  pan: string;
  supplier_type_id: string;
  category_id: string;
  website: string;
  gst_number: string;
  address_line_1: string;
  address_line_2: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  account_name: string;
  account_number: string;
  bank_branch_name: string;
  ifsc_code: string;
  attachment: File | null;
  status: string;
}

interface SelectOption {
  id: number;
  name: string;
}

const CreateSupplier: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<SupplierFormData>({
    company_name: '',
    vendor_name: '',
    primary_phone: '',
    secondary_phone: '',
    primary_email: '',
    secondary_email: '',
    pan: '',
    supplier_type_id: '',
    category_id: '',
    website: '',
    gst_number: '',
    address_line_1: '',
    address_line_2: '',
    district: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    account_name: '',
    account_number: '',
    bank_branch_name: '',
    ifsc_code: '',
    attachment: null,
    status: 'Active',
  });

  const [supplierTypes, setSupplierTypes] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  useEffect(() => {
    fetchDropdownData();
    if (isEditMode && id) {
      fetchSupplierDetails();
    }
  }, [id, isEditMode]);

  const fetchDropdownData = async () => {
    try {
      const [typesRes, categoriesRes] = await Promise.all([
        getVendorsType(),
        getVendorCategory()
      ]);
      setSupplierTypes(Array.isArray(typesRes?.data) ? typesRes.data : []);
      setCategories(Array.isArray(categoriesRes?.data) ? categoriesRes.data : []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchSupplierDetails = async () => {
    try {
      const response = await getVendorsDetails(id);
      const supplier = response.data;
      setFormData({
        company_name: supplier.company_name || '',
        vendor_name: supplier.vendor_name || '',
        primary_phone: supplier.mobile || supplier.primary_phone || '',
        secondary_phone: supplier.secondary_phone || '',
        primary_email: supplier.email || supplier.primary_email || '',
        secondary_email: supplier.secondary_email || '',
        pan: supplier.pan || '',
        supplier_type_id: supplier.supplier_type_id?.toString() || supplier.vendor_supplier_id?.toString() || '',
        category_id: supplier.category_id?.toString() || '',
        website: supplier.website || supplier.website_url || '',
        gst_number: supplier.gst_number || '',
        address_line_1: supplier.address_line_1 || supplier.address || '',
        address_line_2: supplier.address_line_2 || '',
        district: supplier.district || '',
        city: supplier.city || '',
        state: supplier.state || '',
        pincode: supplier.pincode || '',
        country: supplier.country || 'India',
        account_name: supplier.account_name || '',
        account_number: supplier.account_number || '',
        bank_branch_name: supplier.bank_branch_name || '',
        ifsc_code: supplier.ifsc_code || '',
        attachment: null,
        status: supplier.status || 'Active',
      });
    } catch (error) {
      console.error('Error fetching supplier:', error);
      toast.error('Failed to fetch supplier details');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'state' ? { city: '' } : {}),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, attachment: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_name || !formData.vendor_name || !formData.primary_phone || !formData.primary_email || !formData.secondary_email) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Map form fields to API expected fields
      submitData.append('vendor_name', formData.vendor_name);
      submitData.append('company_name', formData.company_name);
      submitData.append('mobile', formData.primary_phone);
      submitData.append('secondary_phone', formData.secondary_phone);
      submitData.append('email', formData.primary_email);
      submitData.append('secondary_email', formData.secondary_email);
      submitData.append('pan', formData.pan);
      submitData.append('vendor_supplier_id', formData.supplier_type_id);
      submitData.append('category_id', formData.category_id);
      submitData.append('website_url', formData.website);
      submitData.append('gst_number', formData.gst_number);
      submitData.append('address', formData.address_line_1);
      submitData.append('address_line_2', formData.address_line_2);
      submitData.append('district', formData.district);
      submitData.append('city', formData.city);
      submitData.append('state', formData.state);
      submitData.append('pincode', formData.pincode);
      submitData.append('country', formData.country);
      submitData.append('account_name', formData.account_name);
      submitData.append('account_number', formData.account_number);
      submitData.append('bank_branch_name', formData.bank_branch_name);
      submitData.append('ifsc_code', formData.ifsc_code);
      submitData.append('status', formData.status);

      if (formData.attachment) {
        submitData.append('attachment', formData.attachment);
      }

      if (isEditMode) {
        await EditVendors(id, submitData);
        toast.success('Supplier updated successfully');
      } else {
        await postVendors(submitData);
        toast.success('Supplier created successfully');
      }
      navigate('/supplier');
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast.error(isEditMode ? 'Failed to update supplier' : 'Failed to create supplier');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="p-6">
      <PageHeader
        title={isEditMode ? 'Edit Supplier' : 'Add Supplier'}
        breadcrumbs={[
          { label: 'FM Module', path: '/supplier' },
          { label: 'Supplier/Vendor', path: '/supplier' },
          { label: isEditMode ? 'Edit Supplier' : 'Add Supplier' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        {/* Company Details Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Company Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Vendor Name *</label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Vendor Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Primary Phone *</label>
              <input
                type="tel"
                name="primary_phone"
                value={formData.primary_phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Primary Phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Secondary Phone</label>
              <input
                type="tel"
                name="secondary_phone"
                value={formData.secondary_phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Secondary Phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Primary Email *</label>
              <input
                type="email"
                name="primary_email"
                value={formData.primary_email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Primary Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Secondary Email *</label>
              <input
                type="email"
                name="secondary_email"
                value={formData.secondary_email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Secondary Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">PAN</label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter PAN Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Supplier Type</label>
              <select
                name="supplier_type_id"
                value={formData.supplier_type_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Supplier Type</option>
                {Array.isArray(supplierTypes) && supplierTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) && categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">GST Number</label>
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter GST Number"
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address Line 1</label>
              <input
                type="text"
                name="address_line_1"
                value={formData.address_line_1}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Address Line 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address Line 2</label>
              <input
                type="text"
                name="address_line_2"
                value={formData.address_line_2}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Address Line 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter District"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select State</option>
                {Object.keys(stateCityModal).map((state) => (
                  <option key={state} value={state}>{state.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!formData.state}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="">Select City</option>
                {formData.state && stateCityModal[formData.state]?.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Pin Code</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Pin Code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Enter Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Country"
              />
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Landmark className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Bank Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Account Name</label>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Account Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Account Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bank & Branch Name</label>
              <input
                type="text"
                name="bank_branch_name"
                value={formData.bank_branch_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Bank & Branch Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">IFSC Code</label>
              <input
                type="text"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter IFSC Code"
              />
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              id="attachment"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
            <label htmlFor="attachment" className="cursor-pointer">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {formData.attachment 
                  ? formData.attachment.name 
                  : 'Click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, JPG, PNG accepted</p>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/supplier')}
            className="px-8 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSupplier;