import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import { 
  postInventory, 
  editInventory, 
  getInventoryDetails, 
  getStockGroupsList, 
  getAssetSubGroups,
  getStandardUnits,
  getSacHsnCodes
} from '../../api';

interface FormData {
  item_type: string;
  criticality: string;
  min_order_level: string;
  unit: string;
  expiry_date: string;
  category: string;
  asset_id: string;
  name: string;
  code: string;
  serial_number: string;
  group_id: string;
  sub_group_id: string;
  quantity: string;
  min_stock_level: string;
  cost: string;
  sac_hsn_code: string;
  sgst_rate: string;
  cgst_rate: string;
  igst_rate: string;
}

const CreateMaster: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    item_type: 'Spares',
    criticality: 'Critical',
    min_order_level: '',
    unit: '',
    expiry_date: '',
    category: '',
    asset_id: '',
    name: '',
    code: '',
    serial_number: '',
    group_id: '',
    sub_group_id: '',
    quantity: '',
    min_stock_level: '',
    cost: '',
    sac_hsn_code: '',
    sgst_rate: '',
    cgst_rate: '',
    igst_rate: '',
  });

  const [groups, setGroups] = useState<any[]>([]);
  const [subGroups, setSubGroups] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sacCodes, setSacCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [groupsRes, unitsRes, sacRes] = await Promise.all([
          getStockGroupsList(),
          getStandardUnits?.() || Promise.resolve({ data: [] }),
          getSacHsnCodes?.() || Promise.resolve({ data: [] }),
        ]);
        setGroups(Array.isArray(groupsRes?.data) ? groupsRes.data : []);
        setUnits(Array.isArray(unitsRes?.data) ? unitsRes.data : []);
        // Static categories for inventory
        setCategories([
          { id: 1, name: 'Electrical' },
          { id: 2, name: 'Mechanical' },
          { id: 3, name: 'Plumbing' },
          { id: 4, name: 'HVAC' },
          { id: 5, name: 'Civil' },
          { id: 6, name: 'Safety' },
          { id: 7, name: 'IT Equipment' },
          { id: 8, name: 'Office Supplies' },
        ]);
        setSacCodes(Array.isArray(sacRes?.data) ? sacRes.data : []);
      } catch (error) {
        console.error('Error fetching dropdowns:', error);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchDetails = async () => {
        try {
          const response = await getInventoryDetails(id);
          const data = response?.data;
          if (data) {
            setFormData({
              item_type: data.item_type || 'Spares',
              criticality: data.criticality || 'Critical',
              min_order_level: data.min_order_level?.toString() || '',
              unit: data.unit || '',
              expiry_date: data.expiry_date ? data.expiry_date.split('T')[0] : '',
              category: data.category || '',
              asset_id: data.asset_id?.toString() || '',
              name: data.name || '',
              code: data.code || '',
              serial_number: data.serial_number || '',
              group_id: data.group_id?.toString() || '',
              sub_group_id: data.sub_group_id?.toString() || '',
              quantity: data.quantity?.toString() || '',
              min_stock_level: data.min_stock_level?.toString() || '',
              cost: data.cost?.toString() || '',
              sac_hsn_code: data.sac_hsn_code || '',
              sgst_rate: data.sgst_rate?.toString() || '',
              cgst_rate: data.cgst_rate?.toString() || '',
              igst_rate: data.igst_rate?.toString() || '',
            });
            if (data.group_id) {
              fetchSubGroups(data.group_id);
            }
          }
        } catch (error) {
          console.error('Error fetching master details:', error);
          toast.error('Failed to fetch details');
        }
      };
      fetchDetails();
    }
  }, [id, isEditMode]);

  const fetchSubGroups = async (groupId: string | number) => {
    try {
      const response = await getAssetSubGroups(groupId);
      setSubGroups(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching sub groups:', error);
      setSubGroups([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'group_id' && value) {
      fetchSubGroups(value);
      setFormData(prev => ({ ...prev, sub_group_id: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        item: {
          ...formData,
          min_order_level: formData.min_order_level ? Number(formData.min_order_level) : null,
          quantity: formData.quantity ? Number(formData.quantity) : null,
          min_stock_level: formData.min_stock_level ? Number(formData.min_stock_level) : null,
          cost: formData.cost ? Number(formData.cost) : null,
          sgst_rate: formData.sgst_rate ? Number(formData.sgst_rate) : null,
          cgst_rate: formData.cgst_rate ? Number(formData.cgst_rate) : null,
          igst_rate: formData.igst_rate ? Number(formData.igst_rate) : null,
        }
      };

      if (isEditMode && id) {
        await editInventory(id, payload);
        toast.success('Master updated successfully');
      } else {
        await postInventory(payload);
        toast.success('Master created successfully');
      }
      navigate('/inventory/masters');
    } catch (error) {
      console.error('Error saving master:', error);
      toast.error(isEditMode ? 'Failed to update master' : 'Failed to create master');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title={isEditMode ? 'Edit Masters' : 'Add Masters'}
        breadcrumbs={[
          { label: 'FM Module', path: '/inventory/masters' },
          { label: 'Inventory', path: '/inventory/masters' },
          { label: 'Masters', path: '/inventory/masters' },
          { label: isEditMode ? 'Edit' : 'Add' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Basic Info</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Inventory Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="item_type"
                    value="Spares"
                    checked={formData.item_type === 'Spares'}
                    onChange={handleChange}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">Spares</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="item_type"
                    value="Consumable"
                    checked={formData.item_type === 'Consumable'}
                    onChange={handleChange}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">Consumable</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Criticality</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="criticality"
                    value="Critical"
                    checked={formData.criticality === 'Critical'}
                    onChange={handleChange}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">Critical</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="criticality"
                    value="Non Critical"
                    checked={formData.criticality === 'Non Critical'}
                    onChange={handleChange}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">Non Critical</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Min. Order Level</label>
              <input
                type="number"
                name="min_order_level"
                value={formData.min_order_level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter min order level"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Unit</option>
                {units.map((unit: any) => (
                  <option key={unit.id || unit.name} value={unit.name || unit.unit_name}>
                    {unit.name || unit.unit_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id || cat.name} value={cat.name || cat.category_name}>
                    {cat.name || cat.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tax Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Tax Section</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Serial Number</label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter serial number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Group</label>
              <select
                name="group_id"
                value={formData.group_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Group</option>
                {groups.map((group: any) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Subgroup</label>
              <select
                name="sub_group_id"
                value={formData.sub_group_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Subgroup</option>
                {subGroups.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Min. Stock Level</label>
              <input
                type="number"
                name="min_stock_level"
                value={formData.min_stock_level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter min stock level"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cost</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter cost"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">SAC/HSN Code</label>
              <select
                name="sac_hsn_code"
                value={formData.sac_hsn_code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select SAC/HSN Code</option>
                {sacCodes.map((code: any) => (
                  <option key={code.id || code.code} value={code.code || code.name}>
                    {code.code || code.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">SGST Rate</label>
              <input
                type="number"
                name="sgst_rate"
                value={formData.sgst_rate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter SGST rate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">CGST Rate</label>
              <input
                type="number"
                name="cgst_rate"
                value={formData.cgst_rate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter CGST rate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">IGST Rate</label>
              <input
                type="number"
                name="igst_rate"
                value={formData.igst_rate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter IGST rate"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/inventory/masters')}
            className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMaster;
