import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { ppmActivityService, PPMActivity } from '../../../services/assetSubModules.service';
import { Loader2, Activity, AlertCircle, RefreshCw } from 'lucide-react';

interface PPMActivityListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
  perPage?: number;
}

const PPMActivityList: React.FC<PPMActivityListProps> = ({ viewMode, searchValue, perPage = 10 }) => {
  const [activities, setActivities] = useState<PPMActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });

  // Update perPage when prop changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ppmActivityService.getPPMActivities(pagination.page, pagination.perPage);
      const data = response.data;
      const activityList = Array.isArray(data) ? data : data?.activities || data?.data || [];
      setActivities(activityList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || activityList.length,
        totalPages: data.total_pages || Math.ceil((data.total || activityList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PPM activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const getActivityStatus = (activity: PPMActivity): StatusType => {
    const status = activity.status?.toLowerCase();
    if (status === 'completed' || status === 'done') return 'checked-out';
    if (status === 'in_progress' || status === 'ongoing') return 'maintenance';
    if (status === 'overdue') return 'breakdown';
    return 'pending';
  };

  const filteredActivities = activities.filter(activity => 
    !searchValue || 
    activity.checklist_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    activity.asset_name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: TableColumn<PPMActivity>[] = [
    { key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => idx + 1 },
    { key: 'checklist_name', header: 'PPM Checklist', sortable: true, render: (v) => v || '-' },
    { key: 'asset_name', header: 'Asset', render: (v) => v || '-' },
    { key: 'assigned_to', header: 'Assigned To', render: (v) => v || '-' },
    { key: 'frequency', header: 'Frequency', render: (v) => v || '-' },
    { key: 'due_date', header: 'Due Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getActivityStatus(row)} /> },
  ];

  if (loading && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading PPM activities...</p>
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load PPM Activities</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchActivities} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <Activity className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No PPM Activities Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No activities match "${searchValue}"` : 'No PPM activities scheduled yet'}</p>
        <Link to="/asset/ppm-activity/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add PPM Activity</Link>
      </div>
    );
  }

  return (
    <>
      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredActivities.map((activity) => (
            <DataCard
              key={activity.id}
              title={activity.checklist_name || `Activity #${activity.id}`}
              subtitle={activity.asset_name || '-'}
              status={getActivityStatus(activity)}
              fields={[
                { label: 'Assigned To', value: activity.assigned_to || '-' },
                { label: 'Frequency', value: activity.frequency || '-' },
                { label: 'Due Date', value: activity.due_date ? new Date(activity.due_date).toLocaleDateString() : '-' },
              ]}
              viewPath={`/asset/ppm-activity/${activity.asset_id || 0}/${activity.id}`}
            />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filteredActivities} selectable selectedRows={selectedRows} onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} onSelectAll={() => setSelectedRows(selectedRows.length === filteredActivities.length ? [] : filteredActivities.map(a => String(a.id)))} viewPath={(row) => `/asset/ppm-activity/${row.asset_id || 0}/${row.id}`} />
      )}

      {filteredActivities.length > 0 && (
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
            <option value={10}>10 / page</option><option value={12}>12 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option>
          </select>
        </div>
      )}
    </>
  );
};

export default PPMActivityList;
