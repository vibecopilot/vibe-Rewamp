import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { vmsService, Visitor, VisitorFilters } from '../../services/vms.service';
import { Loader2, Users, AlertCircle, RefreshCw } from 'lucide-react';

const VisitorList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getPerPage = (mode: 'grid' | 'table') => mode === 'grid' ? 12 : 10;
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: getPerPage('grid'),
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<VisitorFilters>({});

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage: getPerPage(viewMode), page: 1 }));
  }, [viewMode]);

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vmsService.getVisitors(
        pagination.page,
        pagination.perPage,
        { ...filters, search: searchValue }
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
  }, [pagination.page, pagination.perPage, filters, searchValue]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPagination(prev => ({ ...prev, page: 1 }));
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

  const getHostName = (visitor: Visitor): string => {
    if (visitor.host?.user) {
      const { firstname, lastname } = visitor.host.user;
      return [firstname, lastname].filter(Boolean).join(' ') || 'N/A';
    }
    return 'N/A';
  };

  const columns: TableColumn<Visitor>[] = [
    { key: 'id', header: 'Serial No', sortable: true, width: '100px', render: (_, __, index) => (index || 0) + 1 },
    { key: 'name', header: 'Visitor Name', sortable: true },
    { key: 'contact_no', header: 'Phone' },
    { key: 'company_name', header: 'Company', render: (value) => value || '-' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (_, row) => <StatusBadge status={getVisitorStatus(row)} showDropdown />
    },
    { key: 'host', header: 'Host', sortable: true, render: (_, row) => getHostName(row) },
    { key: 'expected_date', header: 'Expected Date', render: (value) => value || '-' },
  ];

  // Loading state
  if (loading && visitors.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading visitors...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && visitors.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
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
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'VMS', path: '/vms' }, { label: 'Visitors' }]} />

      <ListToolbar
        searchPlaceholder="Search by Name, Phone, or Company..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => console.log('Filter clicked')}
        onExport={() => console.log('Export clicked')}
        onAdd={() => navigate('/vms/visitors/create')}
        addLabel="Add Visitor"
        showQrCode
        onQrCode={() => console.log('QR Code clicked')}
      />

      {/* Loading overlay */}
      {loading && visitors.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {/* Empty state */}
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
            + Add Visitor
          </Link>
        </div>
      )}

      {viewMode === 'grid' && visitors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visitors.map((visitor) => (
            <DataCard
              key={visitor.id}
              title={visitor.name}
              subtitle={visitor.contact_no}
              status={getVisitorStatus(visitor)}
              fields={[
                { label: 'Company', value: visitor.company_name || '-' },
                { label: 'Host', value: getHostName(visitor) },
                { label: 'Expected', value: visitor.expected_date || '-' },
                { label: 'Purpose', value: visitor.purpose || '-' },
              ]}
              viewPath={`/vms/visitors/${visitor.id}`}
              editPath={`/vms/visitors/${visitor.id}/edit`}
            />
          ))}
        </div>
      ) : visitors.length > 0 && (
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

      {/* Pagination */}
      {visitors.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          {/* Records info */}
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
            {pagination.total} records
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            {/* First page */}
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              title="First page"
            >
              «
            </button>
            
            {/* Previous */}
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹ Prev
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-2">
              {(() => {
                const pages: (number | string)[] = [];
                const totalPages = pagination.totalPages || 1;
                const currentPage = pagination.page;
                
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (currentPage <= 3) {
                    pages.push(1, 2, 3, 4, '...', totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                  }
                }
                
                return pages.map((page, idx) => (
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page: page as number }))}
                      className={`min-w-[36px] h-9 text-sm rounded-md border transition-colors ${
                        pagination.page === page
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ));
              })()}
            </div>

            {/* Next */}
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next ›
            </button>

            {/* Last page */}
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))}
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              title="Last page"
            >
              »
            </button>
          </div>

          {/* Per page selector */}
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
    </div>
  );
};

export default VisitorList;
