import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getRoutineTask } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface ScheduledAudit {
  id: number;
  activity_name: string;
  task_name: string;
  assigned_to: string;
  assigned_to_name: string;
  created_at: string;
  status: string;
}

const statusFilters = ['All', 'Open', 'Closed', 'Pending', 'Completed'];

const VendorScheduledList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [data, setData] = useState<ScheduledAudit[]>([]);
  const [filteredData, setFilteredData] = useState<ScheduledAudit[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRoutineTask();
      const items = Array.isArray(response?.data) ? response.data : [];
      setData(items);
      setFilteredData(items);
    } catch (error) {
      console.error('Error fetching vendor scheduled audits:', error);
      toast.error('Failed to fetch vendor scheduled audits');
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
        item.activity_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.task_name?.toLowerCase().includes(search.toLowerCase())
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
      ['ID', 'Activity', 'Task', 'Assigned To', 'Created On', 'Status'].join(','),
      ...dataToExport.map(item => [
        item.id,
        item.activity_name || '',
        item.task_name || '',
        item.assigned_to_name || '',
        item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
        item.status || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor_scheduled_audits.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  const columns = [
    {
      name: 'ACTION',
      width: '100px',
      cell: (row: ScheduledAudit) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/audit/vendor/scheduled/${row.id}`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/audit/vendor/scheduled/${row.id}/edit`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
    { name: 'ID', selector: (row: ScheduledAudit) => row.id, sortable: true, width: '80px' },
    { name: 'ACTIVITY', selector: (row: ScheduledAudit) => row.activity_name || '-', sortable: true },
    { name: 'TASK', selector: (row: ScheduledAudit) => row.task_name || '-', sortable: true },
    { name: 'ASSIGNED TO', selector: (row: ScheduledAudit) => row.assigned_to_name || '-', sortable: true },
    { name: 'CREATED ON', selector: (row: ScheduledAudit) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-', sortable: true },
  ];

  const AuditCard = ({ item }: { item: ScheduledAudit }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{item.activity_name || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">ID: {item.id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
          item.status === 'Open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {item.status || 'N/A'}
        </span>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>Task: {item.task_name || '-'}</p>
        <p>Assigned To: {item.assigned_to_name || '-'}</p>
        <p>Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/audit/vendor/scheduled/${item.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="View"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => navigate(`/audit/vendor/scheduled/${item.id}/edit`)}
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
        showAddButton
        addButtonLabel="Add"
        onAddClick={() => navigate('/audit/schedule')}
        showFilter={false}
        showExport
        onExportClick={handleExport}
      />

      {viewMode === 'grid' ? (
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : safeFilteredData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No vendor scheduled audits found</div>
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

export default VendorScheduledList;