import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { vmsService, Visitor, VisitorFilters } from '../../services/vms.service';
import { Loader2, Users, AlertCircle, RefreshCw, Eye, Edit2 } from 'lucide-react';
import DataCard from '../../components/ui/DataCard';

type SubTab = 'all' | 'in' | 'out' | 'approvals' | 'history' | 'logs' | 'self-registration';

const VMSVisitors: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derive active tab from URL path
  const getTabFromPath = (): SubTab => {
    const path = location.pathname;
    if (path.includes('/in')) return 'in';
    if (path.includes('/out')) return 'out';
    if (path.includes('/approvals')) return 'approvals';
    if (path.includes('/history')) return 'history';
    if (path.includes('/logs')) return 'logs';
    if (path.includes('/self-registration')) return 'self-registration';
    return 'all';
  };

  const activeTab = getTabFromPath();
  const [visitorType, setVisitorType] = useState<'expected' | 'unexpected'>('expected');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 12,
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

  // Tab changes are now handled via URL navigation

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
      {/* Single line toolbar with all controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Add New Visitor Button */}
        <button
          onClick={() => navigate('/vms/visitors/create')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Add New Visitor
        </button>

        {/* Expected/Unexpected Toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          <button
            onClick={() => setVisitorType('expected')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              visitorType === 'expected'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Expected
          </button>
          <button
            onClick={() => setVisitorType('unexpected')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              visitorType === 'unexpected'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unexpected
          </button>
        </div>

        {/* Search, Filter, View Toggle - all in one toolbar */}
        <div className="flex-1">
          <ListToolbar
            searchPlaceholder="Search using Visitor name, Host, vehicle number"
            searchValue={searchValue}
            onSearchChange={handleSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilter={() => console.log('Filter clicked')}
            showViewToggle={true}
          />
        </div>
      </div>

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

      {visitors.length > 0 && viewMode === 'table' && (
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

      {visitors.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visitors.map((visitor) => (
            <DataCard
              key={visitor.id}
              title={visitor.name || 'Unknown'}
              subtitle={visitor.contact_no || '-'}
              fields={[
                { label: 'Type', value: visitor.user_type || 'Guest' },
                { label: 'Purpose', value: visitor.purpose || '-' },
                { label: 'From', value: visitor.company_name || '-' },
                { label: 'Expected', value: visitor.expected_date || '-' },
              ]}
              viewPath={`/vms/visitors/${visitor.id}`}
              editPath={`/vms/visitors/${visitor.id}/edit`}
            />
          ))}
        </div>
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
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default VMSVisitors;
