import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { fitoutService, FitoutRequest } from '../../services/fitout.service';
import { Loader2, HardHat, AlertCircle, RefreshCw } from 'lucide-react';

const FitoutList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [requests, setRequests] = useState<FitoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getPerPage = (mode: 'grid' | 'table') => mode === 'grid' ? 12 : 10;
  const [pagination, setPagination] = useState({ page: 1, perPage: getPerPage('grid'), total: 0, totalPages: 0 });

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage: getPerPage(viewMode), page: 1 }));
  }, [viewMode]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fitoutService.getRequests(pagination.page, pagination.perPage);
      const data = response.data;
      const requestList = Array.isArray(data) ? data : data?.fitout_requests || data?.data || [];
      setRequests(requestList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || requestList.length,
        totalPages: data.total_pages || Math.ceil((data.total || requestList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fitout requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const getRequestStatus = (request: FitoutRequest): StatusType => {
    const status = request.status?.toLowerCase() || request.fitout_status?.name?.toLowerCase();
    if (status?.includes('approved') || status?.includes('completed')) return 'approved';
    if (status?.includes('rejected')) return 'rejected';
    if (status?.includes('progress')) return 'maintenance';
    return 'pending';
  };

  const columns: TableColumn<FitoutRequest>[] = [
    { key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => idx + 1 },
    { key: 'request_number', header: 'Request #', render: (v) => v || '-' },
    { key: 'title', header: 'Title', sortable: true, render: (v) => v || '-' },
    { key: 'unit_name', header: 'Unit', render: (v) => v || '-' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getRequestStatus(row)} /> },
    { key: 'start_date', header: 'Start Date', render: (v) => v || '-' },
    { key: 'end_date', header: 'End Date', render: (v) => v || '-' },
  ];

  if (loading && requests.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading fitout requests...</p>
        </div>
      </div>
    );
  }

  if (error && requests.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Requests</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchRequests} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'Fitout', path: '/fitout' }, { label: 'Requests' }]} />

      <ListToolbar
        searchPlaceholder="Search requests..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => {}}
        onExport={() => {}}
        onAdd={() => navigate('/fitout/create')}
        addLabel="New Request"
      />

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}

      {!loading && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <HardHat className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Fitout Requests</h3>
          <p className="text-muted-foreground mb-4">Submit a new fitout request to get started</p>
          <Link to="/fitout/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ New Request</Link>
        </div>
      )}

      {viewMode === 'grid' && requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {requests.map((request) => (
            <DataCard
              key={request.id}
              title={request.title || `Request #${request.request_number}`}
              subtitle={request.request_number || '-'}
              status={getRequestStatus(request)}
              fields={[
                { label: 'Unit', value: request.unit_name || '-' },
                { label: 'Start Date', value: request.start_date || '-' },
                { label: 'End Date', value: request.end_date || '-' },
              ]}
              viewPath={`/fitout/${request.id}`}
              editPath={`/fitout/${request.id}/edit`}
            />
          ))}
        </div>
      ) : requests.length > 0 && (
        <DataTable columns={columns} data={requests} selectable selectedRows={selectedRows} onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} onSelectAll={() => setSelectedRows(selectedRows.length === requests.length ? [] : requests.map(r => String(r.id)))} viewPath={(row) => `/fitout/${row.id}`} />
      )}

      {requests.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
          <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default FitoutList;