import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Download, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../components/list/ListToolbar';
import DataTable from '../../components/table/DataTable';
import PageHeader from '../../components/layout/PageHeader';
import { getVendors, removeVendor } from '../../api';
import { useViewMode } from '../../hooks/useViewMode';

interface Supplier {
  id: number;
  vendor_name: string;
  company_name: string;
  mobile: string;
  email: string;
  gst_number: string;
  pan: string;
  status: string;
  website: string;
  address_line_1: string;
  city: string;
  state: string;
  created_at: string;
}

const SupplierList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredData, setFilteredData] = useState<Supplier[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVendors();
      const data = Array.isArray(response?.data) ? response.data : [];
      setSuppliers(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to fetch suppliers');
      setSuppliers([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const dataToFilter = Array.isArray(suppliers) ? suppliers : [];
    const filtered = dataToFilter.filter((item) =>
      item.company_name?.toLowerCase().includes(value.toLowerCase()) ||
      item.vendor_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleExport = () => {
    const dataToExport = Array.isArray(filteredData) ? filteredData : [];
    const csvContent = [
      ['Vendor Name', 'Company Name', 'Mobile', 'Email', 'GSTIN', 'PAN', 'Status'].join(','),
      ...dataToExport.map(s => [
        s.vendor_name || '',
        s.company_name || '',
        s.mobile || '',
        s.email || '',
        s.gst_number || '',
        s.pan || '',
        s.status || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suppliers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  const columns = [
    {
      name: 'ACTION',
      width: '100px',
      cell: (row: Supplier) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/supplier/${row.id}`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/supplier/${row.id}/edit`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
    { name: 'VENDOR NAME', selector: (row: Supplier) => row.vendor_name || '-', sortable: true },
    { name: 'COMPANY NAME', selector: (row: Supplier) => row.company_name || '-', sortable: true },
    { name: 'MOBILE NUMBER', selector: (row: Supplier) => row.mobile || '-', sortable: true },
    { name: 'EMAIL', selector: (row: Supplier) => row.email || '-', sortable: true },
    { name: 'GSTIN NUMBER', selector: (row: Supplier) => row.gst_number || '-', sortable: true },
    { name: 'PAN NUMBER', selector: (row: Supplier) => row.pan || '-', sortable: true },
    { 
      name: 'STATUS', 
      cell: (row: Supplier) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.status === 'Active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {row.status || 'N/A'}
        </span>
      ),
      sortable: true 
    },
  ];

  // Grid view card component
  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{supplier.vendor_name || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">{supplier.company_name || '-'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          supplier.status === 'Active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {supplier.status || 'N/A'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Phone: {supplier.mobile || '-'}</p>
        <p>Email: {supplier.email || '-'}</p>
        <p>GSTIN: {supplier.gst_number || '-'}</p>
        <p>PAN: {supplier.pan || '-'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/supplier/${supplier.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="View"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => navigate(`/supplier/${supplier.id}/edit`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
      </div>
    </div>
  );

  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  return (
    <div className="p-6">
      <PageHeader
        title=""
        breadcrumbs={[
          { label: 'FM Module', path: '/supplier' },
          { label: 'Supplier/Vendor' },
        ]}
      />

      <ListToolbar
        searchPlaceholder="Search By Company name"
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle
        showAddButton
        addButtonLabel="Add"
        onAddClick={() => navigate('/supplier/create')}
        showFilter={false}
        showExport
        onExportClick={handleExport}
      />

      {viewMode === 'grid' ? (
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : safeFilteredData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No suppliers found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {safeFilteredData.slice(0, recordsPerPage).map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={safeFilteredData}
          loading={loading}
          pagination
          paginationPerPage={recordsPerPage}
        />
      )}
    </div>
  );
};

export default SupplierList;