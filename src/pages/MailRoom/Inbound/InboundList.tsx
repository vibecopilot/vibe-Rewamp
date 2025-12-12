import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getinbound, deleteInbound } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface InboundPackage {
  id: number;
  vendor_id: number;
  vendor_name: string;
  receipant_name: string;
  mobile_number: string;
  mail_inbound_type: string;
  unit: string;
  department_id: string;
  entity: string;
  sender: string;
  company: string;
  receiving_date: string;
  collect_on: string;
}

const InboundList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [packages, setPackages] = useState<InboundPackage[]>([]);
  const [filteredData, setFilteredData] = useState<InboundPackage[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInboundPackages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getinbound();
      setPackages(response.data || []);
      setFilteredData(response.data || []);
    } catch (error) {
      console.error('Error fetching inbound packages:', error);
      toast.error('Failed to fetch inbound packages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInboundPackages();
  }, [fetchInboundPackages]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = packages.filter((item) =>
      item.vendor_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleRemovePackage = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this package?')) return;
    try {
      await deleteInbound(id);
      toast.success('Package deleted successfully');
      fetchInboundPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete the package');
    }
  };

  const columns = [
    {
      name: 'VIEW',
      width: '80px',
      cell: (row: InboundPackage) => (
        <button
          onClick={() => navigate(`/mail-room/inbound/${row.id}`)}
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Eye size={16} />
        </button>
      ),
    },
    { name: 'ID', selector: (row: InboundPackage) => row.id, sortable: true, width: '80px' },
    { name: 'VENDOR ID', selector: (row: InboundPackage) => row.vendor_id || '-', sortable: true, width: '100px' },
    { name: 'RECIPIENT', selector: (row: InboundPackage) => row.receipant_name || '-', sortable: true },
    { name: 'PHONE NO', selector: (row: InboundPackage) => row.mobile_number || '-', sortable: true },
    { name: 'PACKAGE TYPE', selector: (row: InboundPackage) => row.mail_inbound_type || '-', sortable: true },
    { name: 'UNIT', selector: (row: InboundPackage) => row.unit || '-', sortable: true },
    { name: 'DEPARTMENT', selector: (row: InboundPackage) => row.department_id || '-', sortable: true },
    { name: 'ENTITY', selector: (row: InboundPackage) => row.entity || '-', sortable: true },
    { name: 'SENDER', selector: (row: InboundPackage) => row.sender || '-', sortable: true },
    { name: 'COMPANY', selector: (row: InboundPackage) => row.company || '-', sortable: true },
    { 
      name: 'RECEIVED ON', 
      selector: (row: InboundPackage) => row.receiving_date ? new Date(row.receiving_date).toLocaleDateString() : '-', 
      sortable: true 
    },
    { 
      name: 'COLLECTED ON', 
      selector: (row: InboundPackage) => row.collect_on ? new Date(row.collect_on).toLocaleDateString() : '-', 
      sortable: true 
    },
    {
      name: 'INBOUND PACKAGE',
      width: '140px',
      cell: (row: InboundPackage) => (
        <button
          onClick={() => handleRemovePackage(row.id)}
          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  // Grid view card component
  const PackageCard = ({ pkg }: { pkg: InboundPackage }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{pkg.receipant_name || 'Unknown Recipient'}</h3>
          <p className="text-sm text-muted-foreground">ID: {pkg.id}</p>
        </div>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {pkg.mail_inbound_type || 'Package'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Vendor: {pkg.vendor_name || '-'}</p>
        <p>Sender: {pkg.sender || '-'}</p>
        <p>Company: {pkg.company || '-'}</p>
        <p>Received: {pkg.receiving_date ? new Date(pkg.receiving_date).toLocaleDateString() : '-'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/mail-room/inbound/${pkg.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => handleRemovePackage(pkg.id)}
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
        searchPlaceholder="Search By Vendor name"
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={true}
        showAddButton={true}
        addButtonLabel="Add Record"
        onAddClick={() => navigate('/mail-room/inbound/create')}
        showFilter={false}
        showExport={false}
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">No packages found</div>
          ) : (
            filteredData.slice(0, recordsPerPage).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
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

export default InboundList;
