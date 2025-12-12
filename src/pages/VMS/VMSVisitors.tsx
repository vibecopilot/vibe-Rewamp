import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { vmsService, Visitor, VisitorFilters } from '../../services/vms.service';
import { Loader2, Users, AlertCircle, RefreshCw, Eye, Edit2 } from 'lucide-react';

type SubTab = 'all' | 'in' | 'out' | 'approvals' | 'history' | 'logs' | 'self-registration';

const VMSVisitors: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SubTab>('all');
  const [visitorType, setVisitorType] = useState<'expected' | 'unexpected'>('expected');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<VisitorFilters>({});

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams: VisitorFilters = { ...filters, search: searchValue };
      
      // Apply tab-specific filters
      if (activeTab === 'in') {
        filterParams.visitorInOut = 'in';
      } else if (activeTab === 'out') {
        filterParams.visitorInOut = 'out';
      }
      
      const response = await vmsService.getVisitors(
        pagination.page,
        pagination.perPage,
        filterParams
      );
      
      const data = response.data;
      if (Array.isArray(data)) {
        setVisitors(data);
        setPagination(prev => ({
          ...prev,
          total: data.length,
          totalPages: Math.ceil(data.length / prev.perPage),
        }));
      } else if (data?.visitors || data?.data) {
        const visitorList = data.visitors || data.data || [];
        setVisitors(visitorList);
        setPagination(prev => ({
          ...prev,
          total: data.total || data.total_count || visitorList.length,
          totalPages: data.total_pages || Math.ceil((data.total || visitorList.length) / prev.perPage),
        }));
      } else {
        setVisitors([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch visitors';
      setError(errorMessage);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, filters, searchValue, activeTab]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTabChange = (tab: SubTab) => {
    setActiveTab(tab);
    setSearchValue('');
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedRows([]);
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === visitors.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(visitors.map(v => String(v.id)));
    }
  };

  const getVisitorStatus = (visitor: Visitor): StatusType => {
    if (visitor.check_out_time) return 'checked-out';
    if (visitor.check_in_time) return 'checked-in';
    if (visitor.status === 'approved') return 'approved';
    if (visitor.status === 'rejected') return 'rejected';
    return 'pending';
  };

  const columns: TableColumn<Visitor>[] = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Link to={`/vms/visitors/${row.id}`} className="text-muted-foreground hover:text-primary">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/vms/visitors/${row.id}/edit`} className="text-muted-foreground hover:text-primary">
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
    { key: 'user_type', header: 'VISITOR TYPE', sortable: true, render: (value) => value || 'Guest' },
    { key: 'name', header: 'NAME', sortable: true },
    { key: 'contact_no', header: 'CONTACT NO.' },
    { key: 'purpose', header: 'PURPOSE', render: (value) => value || '-' },
    { key: 'company_name', header: 'COMING FROM', render: (value) => value || '-' },
    { key: 'expected_date', header: 'EXPECTED DATE', sortable: true, render: (value) => value || '-' },
    { key: 'expected_time', header: 'EXPECTED TIME', render: (value) => value || '-' },
  ];

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'in', label: 'Visitor In' },
    { id: 'out', label: 'Visitor Out' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'history', label: 'History' },
    { id: 'logs', label: 'Logs' },
    { id: 'self-registration', label: 'Self-Registration' },
  ];

  if (loading && visitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading visitors...</p>
      </div>
    );
  }

  if (error && visitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Visitors</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchVisitors}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-border mb-4 overflow-x-auto">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toggle Expected/Unexpected */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 bg-muted rounded-full p-1">
          <button
            onClick={() => setVisitorType('expected')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              visitorType === 'expected'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Expected visitor
          </button>
          <button
            onClick={() => setVisitorType('unexpected')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              visitorType === 'unexpected'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unexpected visitor
          </button>
        </div>
      </div>

      <ListToolbar
        searchPlaceholder="Search using Visitor name, Host, vehicle number"
        searchValue={searchValue}
        onSearchChange={handleSearch}
        onFilter={() => console.log('Filter clicked')}
        onAdd={() => navigate('/vms/visitors/create')}
        addLabel="Add New Visitor"
      />

      {loading && visitors.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {!loading && visitors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Visitors Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? `No visitors match "${searchValue}"` : 'Start by adding your first visitor'}
          </p>
          <Link
            to="/vms/visitors/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            + Add New Visitor
          </Link>
        </div>
      )}

      {visitors.length > 0 && (
        <DataTable
          columns={columns}
          data={visitors}
          selectable
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          viewPath={(row) => `/vms/visitors/${row.id}`}
        />
      )}

      {visitors.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
            {pagination.total} records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next ›
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))}
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Per page:</span>
            <select
              value={pagination.perPage}
              onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))}
              className="px-2 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default VMSVisitors;
