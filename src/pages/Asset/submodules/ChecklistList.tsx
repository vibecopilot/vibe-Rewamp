import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { checklistService, Checklist } from '../../services/assetSubModules.service';
import { Loader2, ClipboardList, AlertCircle, RefreshCw } from 'lucide-react';

interface ChecklistListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
}

const ChecklistList: React.FC<ChecklistListProps> = ({ viewMode, searchValue }) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await checklistService.getChecklists(pagination.page, pagination.perPage, 'routine');
      const data = response.data;
      const checklistList = Array.isArray(data) ? data : data?.checklists || data?.data || [];
      setChecklists(checklistList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || checklistList.length,
        totalPages: data.total_pages || Math.ceil((data.total || checklistList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checklists');
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => { fetchChecklists(); }, [fetchChecklists]);

  const getChecklistStatus = (checklist: Checklist): StatusType => {
    if (checklist.status?.toLowerCase() === 'active') return 'in-use';
    if (checklist.status?.toLowerCase() === 'inactive') return 'breakdown';
    return 'in-store';
  };

  const filteredChecklists = checklists.filter(checklist => 
    !searchValue || checklist.name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: TableColumn<Checklist>[] = [
    { key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => idx + 1 },
    { key: 'name', header: 'Checklist Name', sortable: true },
    { key: 'ctype', header: 'Type', render: (v) => v || 'Routine' },
    { key: 'frequency', header: 'Frequency', render: (v) => v || '-' },
    { key: 'questions_count', header: 'Questions', render: (v) => v || 0 },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getChecklistStatus(row)} /> },
    { key: 'created_at', header: 'Created', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  if (loading && checklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading checklists...</p>
      </div>
    );
  }

  if (error && checklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Checklists</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchChecklists} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (filteredChecklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <ClipboardList className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Checklists Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No checklists match "${searchValue}"` : 'No checklists created yet'}</p>
        <Link to="/asset/checklist/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Checklist</Link>
      </div>
    );
  }

  return (
    <>
      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredChecklists.map((checklist) => (
            <DataCard
              key={checklist.id}
              title={checklist.name}
              subtitle={checklist.ctype || 'Routine'}
              status={getChecklistStatus(checklist)}
              fields={[
                { label: 'Frequency', value: checklist.frequency || '-' },
                { label: 'Questions', value: checklist.questions_count?.toString() || '0' },
                { label: 'Created', value: checklist.created_at ? new Date(checklist.created_at).toLocaleDateString() : '-' },
              ]}
              viewPath={`/asset/checklist/${checklist.id}`}
              editPath={`/asset/checklist/${checklist.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filteredChecklists} selectable selectedRows={selectedRows} onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} onSelectAll={() => setSelectedRows(selectedRows.length === filteredChecklists.length ? [] : filteredChecklists.map(c => String(c.id)))} viewPath={(row) => `/asset/checklist/${row.id}`} />
      )}

      {filteredChecklists.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChecklistList;
