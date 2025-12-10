import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageTitle from '../../components/ui/PageTitle';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { serviceDeskService, Ticket } from '../../services/serviceDesk.service';
import { Loader2, Ticket as TicketIcon, AlertCircle, RefreshCw } from 'lucide-react';

const TicketList: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceDeskService.getTickets(pagination.page, pagination.perPage);
      const data = response.data;
      const ticketList = Array.isArray(data) ? data : data?.complaints || data?.data || [];
      setTickets(ticketList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || ticketList.length,
        totalPages: data.total_pages || Math.ceil((data.total || ticketList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const getTicketStatus = (ticket: Ticket): StatusType => {
    const status = ticket.status?.toLowerCase() || ticket.complaint_status?.name?.toLowerCase();
    if (status?.includes('open') || status?.includes('new')) return 'pending';
    if (status?.includes('progress') || status?.includes('assigned')) return 'in-progress';
    if (status?.includes('resolved') || status?.includes('closed')) return 'checked-out';
    return 'pending';
  };

  const getPriorityType = (priority?: string): StatusType => {
    if (priority?.toLowerCase() === 'high' || priority?.toLowerCase() === 'critical') return 'breakdown';
    if (priority?.toLowerCase() === 'medium') return 'maintenance';
    return 'in-store';
  };

  const columns: TableColumn<Ticket>[] = [
    { key: 'id', header: 'S.No', width: '80px', render: (_, __, idx) => (idx || 0) + 1 },
    { key: 'ticket_number', header: 'Ticket #', render: (v) => v || '-' },
    { key: 'title', header: 'Subject', sortable: true, render: (v) => v || '-' },
    { key: 'category', header: 'Category', render: (_, row) => row.helpdesk_category?.name || row.category || '-' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getTicketStatus(row)} /> },
    { key: 'priority', header: 'Priority', render: (v) => v ? <StatusBadge status={getPriorityType(v)} /> : '-' },
    { key: 'assigned_to', header: 'Assigned To', render: (v) => v || 'Unassigned' },
    { key: 'created_at', header: 'Created', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  if (loading && tickets.length === 0) {
    return (
      <div className="p-6">
        <PageTitle title="Service Desk" breadcrumbs={[{ label: 'Service Desk', path: '/service-desk' }, { label: 'Tickets' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <div className="p-6">
        <PageTitle title="Service Desk" breadcrumbs={[{ label: 'Service Desk', path: '/service-desk' }, { label: 'Tickets' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Tickets</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchTickets} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle title="Service Desk" breadcrumbs={[{ label: 'Service Desk', path: '/service-desk' }, { label: 'Tickets' }]} />

      <ListToolbar
        searchPlaceholder="Search tickets..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode="table"
        onViewModeChange={() => {}}
        onFilter={() => {}}
        onExport={() => {}}
        onAdd={() => navigate('/service-desk/create')}
        addLabel="Create Ticket"
      />

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}

      {!loading && tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <TicketIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tickets Found</h3>
          <p className="text-muted-foreground mb-4">No support tickets have been created yet</p>
          <Link to="/service-desk/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Create Ticket</Link>
        </div>
      )}

      {tickets.length > 0 && (
        <DataTable columns={columns} data={tickets} selectable selectedRows={selectedRows} onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} onSelectAll={() => setSelectedRows(selectedRows.length === tickets.length ? [] : tickets.map(t => String(t.id)))} viewPath={(row) => `/service-desk/${row.id}`} />
      )}

      {tickets.length > 0 && (
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

export default TicketList;
