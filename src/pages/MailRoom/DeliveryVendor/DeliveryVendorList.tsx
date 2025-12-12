import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getVendors, removeVendor } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface Vendor {
  id: number;
  vendor_supplier_id: string;
  vendor_name: string;
  website_url: string;
  email: string;
  mobile: string;
  spoc_person: string;
  aggrement_start_date: string;
  aggremenet_end_date: string;
  status: string;
  created_at: string;
}

const DeliveryVendorList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredData, setFilteredData] = useState<Vendor[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVendors();
      setVendors(response.data || []);
      setFilteredData(response.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = vendors.filter((item) =>
      item.vendor_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleRemoveVendor = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this vendor?')) return;
    try {
      await removeVendor(id);
      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete the vendor');
    }
  };

  const columns = [
    {
      name: 'ACTION',
      width: '100px',
      cell: (row: Vendor) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/mail-room/delivery-vendor/${row.id}`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/mail-room/delivery-vendor/${row.id}/edit`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
    { name: 'ID', selector: (row: Vendor) => row.id, sortable: true, width: '80px' },
    { name: 'NAME', selector: (row: Vendor) => row.vendor_name || '-', sortable: true },
    { name: 'WEBSITE URL', selector: (row: Vendor) => row.website_url || '-', sortable: true },
    { name: 'EMAIL', selector: (row: Vendor) => row.email || '-', sortable: true },
    { name: 'PHONE', selector: (row: Vendor) => row.mobile || '-', sortable: true },
    { name: 'SPOC PERSON', selector: (row: Vendor) => row.spoc_person || '-', sortable: true },
    { name: 'AGREEMENT START', selector: (row: Vendor) => row.aggrement_start_date || '-', sortable: true },
    { name: 'AGREEMENT END DATE', selector: (row: Vendor) => row.aggremenet_end_date || '-', sortable: true },
    { name: 'STATUS', selector: (row: Vendor) => row.status || '-', sortable: true },
    { 
      name: 'CREATED ON', 
      selector: (row: Vendor) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-', 
      sortable: true 
    },
    {
      name: 'REMOVE VENDOR',
      width: '120px',
      cell: (row: Vendor) => (
        <button
          onClick={() => handleRemoveVendor(row.id)}
          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  // Grid view card component
  const VendorCard = ({ vendor }: { vendor: Vendor }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{vendor.vendor_name}</h3>
          <p className="text-sm text-muted-foreground">ID: {vendor.id}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          vendor.status === 'Active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {vendor.status || 'N/A'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Email: {vendor.email || '-'}</p>
        <p>Phone: {vendor.mobile || '-'}</p>
        <p>SPOC: {vendor.spoc_person || '-'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/mail-room/delivery-vendor/${vendor.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => navigate(`/mail-room/delivery-vendor/${vendor.id}/edit`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => handleRemoveVendor(vendor.id)}
          className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <ListToolbar
        searchPlaceholder="Search by Vendor name..."
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={true}
        showAddButton={true}
        addButtonLabel="Add Vendor"
        onAddClick={() => navigate('/mail-room/delivery-vendor/create')}
        showFilter={false}
        showExport={false}
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">No vendors found</div>
          ) : (
            filteredData.slice(0, recordsPerPage).map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          loading={loading}
          pagination
          paginationPerPage={recordsPerPage}
        />
      )}
    </div>
  );
};

export default DeliveryVendorList;
