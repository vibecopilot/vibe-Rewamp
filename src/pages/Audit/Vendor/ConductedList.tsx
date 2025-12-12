import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getVendors } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface VendorConductedAudit {
  id: number;
  vendor_name: string;
  audit_name: string;
  date_time: string;
  conducted_by: string;
  conducted_by_name: string;
  total_score: number;
  evaluation_score: number;
  percentage: number;
  status: string;
}

const statusFilters = ['All', 'Open', 'Closed', 'Pending', 'Completed'];

const VendorConductedList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [data, setData] = useState<VendorConductedAudit[]>([]);
  const [filteredData, setFilteredData] = useState<VendorConductedAudit[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVendors();
      const items = Array.isArray(response?.data) ? response.data : [];
      // Map vendor data to audit format
      const mappedData = items.map((v: any) => ({
        id: v.id,
        vendor_name: v.vendor_name || v.company_name,
        audit_name: v.audit_name || 'Vendor Audit',
        date_time: v.created_at,
        conducted_by_name: v.spoc_person || '-',
        total_score: v.total_score || 0,
        evaluation_score: v.evaluation_score || 0,
        percentage: v.percentage || 0,
        status: v.status || 'Active',
      }));
      setData(mappedData);
      setFilteredData(mappedData);
    } catch (error) {
      console.error('Error fetching vendor conducted audits:', error);
      toast.error('Failed to fetch vendor conducted audits');
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, activeFilter);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilters(searchText, filter);
  };

  const applyFilters = (search: string, filter: string) => {
    let filtered = Array.isArray(data) ? data : [];
    
    if (search) {
      filtered = filtered.filter((item) =>
        item.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.audit_name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (filter !== 'All') {
      filtered = filtered.filter((item) => 
        item.status?.toLowerCase() === filter.toLowerCase()
      );
    }
    
    setFilteredData(filtered);
  };

  const handleExport = () => {
    const dataToExport = Array.isArray(filteredData) ? filteredData : [];
    const csvContent = [
      ['ID', 'Vendor Name', 'Audit Name', 'Date & Time', 'Conducted By', 'Total Score', 'Evaluation Score', '%'].join(','),
      ...dataToExport.map(item => [
        item.id,
        item.vendor_name || '',
        item.audit_name || '',
        item.date_time ? new Date(item.date_time).toLocaleString() : '',
        item.conducted_by_name || '',
        item.total_score || '',
        item.evaluation_score || '',
        item.percentage || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor_conducted_audits.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  const columns = [
    {
      name: 'REPORT',
      width: '80px',
      cell: (row: VendorConductedAudit) => (
        <button
          onClick={() => navigate(`/audit/vendor/conducted/${row.id}`)}
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="View Report"
        >
          <Eye size={16} />
        </button>
      ),
    },
    { name: 'ID', selector: (row: VendorConductedAudit) => row.id, sortable: true, width: '80px' },
    { name: 'VENDOR NAME', selector: (row: VendorConductedAudit) => row.vendor_name || '-', sortable: true },
    { name: 'AUDIT NAME', selector: (row: VendorConductedAudit) => row.audit_name || '-', sortable: true },
    { name: 'DATE & TIME', selector: (row: VendorConductedAudit) => row.date_time ? new Date(row.date_time).toLocaleString() : '-', sortable: true },
    { name: 'CONDUCTED BY', selector: (row: VendorConductedAudit) => row.conducted_by_name || '-', sortable: true },
    { name: 'TOTAL SCORE', selector: (row: VendorConductedAudit) => row.total_score || '-', sortable: true },
    { name: 'EVALUATION SCORE', selector: (row: VendorConductedAudit) => row.evaluation_score || '-', sortable: true },
    { name: '%', selector: (row: VendorConductedAudit) => row.percentage ? `${row.percentage}%` : '-', sortable: true },
  ];

  const AuditCard = ({ item }: { item: VendorConductedAudit }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{item.vendor_name || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">{item.audit_name}</p>
          </div>
        </div>
        {item.percentage > 0 && (
          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
            {item.percentage}%
          </span>
        )}
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Conducted By: {item.conducted_by_name || '-'}</p>
        <p>Date: {item.date_time ? new Date(item.date_time).toLocaleDateString() : '-'}</p>
        <div className="flex gap-4">
          <p>Total: {item.total_score || '-'}</p>
          <p>Eval: {item.evaluation_score || '-'}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/audit/vendor/conducted/${item.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="View"
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );

  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  return (
    <div>
      {/* Status Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              activeFilter === filter
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <ListToolbar
        searchPlaceholder="Search audits..."
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle
        showAddButton={false}
        showFilter={false}
        showExport
        onExportClick={handleExport}
      />

      {viewMode === 'grid' ? (
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : safeFilteredData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No vendor conducted audits found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {safeFilteredData.slice(0, recordsPerPage).map((item) => (
                <AuditCard key={item.id} item={item} />
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

export default VendorConductedList;