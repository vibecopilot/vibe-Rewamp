import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/layout/PageHeader';
import { getVendorDetails, postVendors, EditVendors } from '../../../api';

interface VendorFormData {
  vendor_supplier_id: string;
  vendor_name: string;
  website_url: string;
  address: string;
  email: string;
  mobile: string;
  spoc_person: string;
  aggrement_start_date: string;
  aggremenet_end_date: string;
  agreement_attachment: File | null;
  status: string;
}

const CreateVendor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<VendorFormData>({
    vendor_supplier_id: '',
    vendor_name: '',
    website_url: '',
    address: '',
    email: '',
    mobile: '',
    spoc_person: '',
    aggrement_start_date: '',
    aggremenet_end_date: '',
    agreement_attachment: null,
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode && id) {
      fetchVendorDetails();
    }
  }, [id, isEditMode]);

  const fetchVendorDetails = async () => {
    try {
      const response = await getVendorDetails(id);
      const vendor = response.data;
      setFormData({
        vendor_supplier_id: vendor.vendor_supplier_id || '',
        vendor_name: vendor.vendor_name || '',
        website_url: vendor.website_url || '',
        address: vendor.address || '',
        email: vendor.email || '',
        mobile: vendor.mobile || '',
        spoc_person: vendor.spoc_person || '',
        aggrement_start_date: vendor.aggrement_start_date || '',
        aggremenet_end_date: vendor.aggremenet_end_date || '',
        agreement_attachment: null,
        status: vendor.status || 'Active',
      });
    } catch (error) {
      console.error('Error fetching vendor:', error);
      toast.error('Failed to fetch vendor details');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, agreement_attachment: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitData.append(key, value as string | Blob);
        }
      });

      if (isEditMode) {
        await EditVendors(id, submitData);
        toast.success('Vendor updated successfully');
      } else {
        await postVendors(submitData);
        toast.success('Vendor created successfully');
      }
      navigate('/mail-room/delivery-vendor');
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error(isEditMode ? 'Failed to update vendor' : 'Failed to create vendor');
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
        title={isEditMode ? 'Edit Vendor' : 'Add Vendor'}
        breadcrumbs={[
          { label: 'FM Module', path: '/mail-room' },
          { label: 'Mail Room', path: '/mail-room' },
          { label: 'Delivery Vendor', path: '/mail-room/delivery-vendor' },
          { label: isEditMode ? 'Edit Vendor' : 'Add Vendor' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        {/* Vendor Details Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Vendor Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Vendor ID</label>
              <input
                type="text"
                name="vendor_supplier_id"
                value={formData.vendor_supplier_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Vendor ID"
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
              <label className="block text-sm font-medium text-foreground mb-2">Website URL</label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="vendor@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Phone Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">SPOC Person</label>
              <input
                type="text"
                name="spoc_person"
                value={formData.spoc_person}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Contact Person"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Agreement Start Date</label>
              <input
                type="date"
                name="aggrement_start_date"
                value={formData.aggrement_start_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Agreement End Date</label>
              <input
                type="date"
                name="aggremenet_end_date"
                value={formData.aggremenet_end_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-foreground mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Enter Address"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-foreground mb-2">Agreement Attachment</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="agreement_attachment"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
                <label htmlFor="agreement_attachment" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {formData.agreement_attachment 
                      ? formData.agreement_attachment.name 
                      : 'Click to upload agreement document'}
                  </p>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/mail-room/delivery-vendor')}
            className="px-6 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Vendor' : 'Save Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVendor;
