import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, ListChecks } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getChecklist } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface AuditChecklist {
  id: number;
  activity_name: string;
  name: string;
  status: string;
  created_at: string;
}

const statusFilters = ['All', 'Open', 'Closed', 'Pending', 'Completed'];

const ChecklistsList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [data, setData] = useState<AuditChecklist[]>([]);
  const [filteredData, setFilteredData] = useState<AuditChecklist[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getChecklist();
      const items = Array.isArray(response?.data) ? response.data : [];
      setData(items);
      setFilteredData(items);
    } catch (error) {
      console.error('Error fetching checklists:', error);
      toast.error('Failed to fetch checklists');
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
        item.name?.toLowerCase().includes(search.toLowerCase())
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
      ['ID', 'Activity'].join(','),
      ...dataToExport.map(item => [
        item.id,
        item.activity_name || item.name || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_checklists.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  const columns = [
    {
      name: 'ACTION',
      width: '100px',
      cell: (row: AuditChecklist) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/audit/operational/checklists/${row.id}`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/audit/operational/checklists/${row.id}/edit`)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
    { name: 'ID', selector: (row: AuditChecklist) => row.id, sortable: true, width: '80px' },
    { name: 'ACTIVITY', selector: (row: AuditChecklist) => row.activity_name || row.name || '-', sortable: true },
  ];

  const ChecklistCard = ({ item }: { item: AuditChecklist }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{item.activity_name || item.name || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">ID: {item.id}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button
          onClick={() => navigate(`/audit/operational/checklists/${item.id}`)}
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title="View"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => navigate(`/audit/operational/checklists/${item.id}/edit`)}
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
        searchPlaceholder="Search checklists..."
        searchValue={searchText}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle
        showAddButton
        addButtonLabel="Add"
        onAddClick={() => navigate('/audit/checklist')}
        showFilter={false}
        showExport
        onExportClick={handleExport}
      />

      {viewMode === 'grid' ? (
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : safeFilteredData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No checklists found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {safeFilteredData.slice(0, recordsPerPage).map((item) => (
                <ChecklistCard key={item.id} item={item} />
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

export default ChecklistsList;