import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/layout/PageHeader';
import { getVendors, createInbound, getInboundDetail, editInbound } from '../../../api';
import { stateCityModal } from '../../../utils/stateCityModal';

interface InboundFormData {
  vendor_id: string;
  receiving_date: string;
  receipant_name: string;
  sender: string;
  mobile_number: string;
  awb_number: string;
  company: string;
  company_address_1: string;
  company_address_2: string;
  state: string;
  city: string;
  pincode: string;
  unit: string;
  department_id: string;
  collect_on: string;
  entity: string;
  mail_inbound_type: string;
}

interface Vendor {
  id: number;
  vendor_name: string;
}

const CreateInboundPackage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<InboundFormData>({
    vendor_id: '',
    receiving_date: '',
    receipant_name: '',
    sender: '',
    mobile_number: '',
    awb_number: '',
    company: '',
    company_address_1: '',
    company_address_2: '',
    state: '',
    city: '',
    pincode: '',
    unit: '',
    department_id: '',
    collect_on: '',
    entity: '',
    mail_inbound_type: '',
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchVendors();
    if (isEditMode && id) {
      fetchInboundDetails();
    } else {
      setFetching(false);
    }
  }, [id, isEditMode]);

  const fetchVendors = async () => {
    try {
      const response = await getVendors();
      const data = Array.isArray(response?.data) ? response.data : [];
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    }
  };

  const fetchInboundDetails = async () => {
    try {
      const response = await getInboundDetail(id);
      const pkg = response.data;
      setFormData({
        vendor_id: pkg.vendor_id?.toString() || '',
        receiving_date: pkg.receiving_date?.split('T')[0] || '',
        receipant_name: pkg.receipant_name || '',
        sender: pkg.sender || '',
        mobile_number: pkg.mobile_number || '',
        awb_number: pkg.awb_number || '',
        company: pkg.company || '',
        company_address_1: pkg.company_address_1 || '',
        company_address_2: pkg.company_address_2 || '',
        state: pkg.state || '',
        city: pkg.city || '',
        pincode: pkg.pincode || '',
        unit: pkg.unit || '',
        department_id: pkg.department_id || '',
        collect_on: pkg.collect_on?.split('T')[0] || '',
        entity: pkg.entity || '',
        mail_inbound_type: pkg.mail_inbound_type || '',
      });
    } catch (error) {
      console.error('Error fetching inbound details:', error);
      toast.error('Failed to fetch package details');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'state' ? { city: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        await editInbound(id, formData);
        toast.success('Package updated successfully');
      } else {
        await createInbound(formData);
        toast.success('Inbound package created successfully');
      }
      navigate('/mail-room/inbound');
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error(isEditMode ? 'Failed to update package' : 'Failed to create package');
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
        title={isEditMode ? 'Edit Inbound Package' : 'Create New Inbound Package'}
        breadcrumbs={[
          { label: 'FM Module', path: '/mail-room' },
          { label: 'Mail Room', path: '/mail-room' },
          { label: 'Inbound', path: '/mail-room/inbound' },
          { label: isEditMode ? 'Edit Package' : 'Create Package' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        {/* Vendor & Date Selection */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Vendor *</label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Vendor</option>
                {Array.isArray(vendors) && vendors.length > 0 ? (
                  vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.vendor_name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No vendors available
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Receiving Date *</label>
              <input
                type="date"
                name="receiving_date"
                value={formData.receiving_date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Package Details Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Package Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Recipient</label>
              <input
                type="text"
                name="receipant_name"
                value={formData.receipant_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Recipient Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sender</label>
              <input
                type="text"
                name="sender"
                value={formData.sender}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Sender Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mobile</label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Mobile Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">AWB Number</label>
              <input
                type="text"
                name="awb_number"
                value={formData.awb_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="AWB Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address Line 1</label>
              <input
                type="text"
                name="company_address_1"
                value={formData.company_address_1}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Address Line 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address Line 2</label>
              <input
                type="text"
                name="company_address_2"
                value={formData.company_address_2}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Address Line 2"
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
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City</label>
              <select
                name="city"
                value={formData.city}
                disabled={!formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="">Select City</option>
                {formData.state &&
                  (stateCityModal as Record<string, string[]>)[formData.state]?.map((city: string) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
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
                placeholder="Pin Code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Unit</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Unit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Department ID</label>
              <input
                type="text"
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Department ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Collected On</label>
              <input
                type="date"
                name="collect_on"
                value={formData.collect_on}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Entity</label>
              <input
                type="text"
                name="entity"
                value={formData.entity}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Entity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Package Type</label>
              <input
                type="text"
                name="mail_inbound_type"
                value={formData.mail_inbound_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Package Type"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/mail-room/inbound')}
            className="px-6 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            Go Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Package' : 'Create Package'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInboundPackage;
