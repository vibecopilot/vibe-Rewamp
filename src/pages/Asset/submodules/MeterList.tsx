import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { meterService, Meter } from '../../../services/assetSubModules.service';
import { Loader2, Gauge, AlertCircle, RefreshCw } from 'lucide-react';

interface MeterListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
}

const MeterList: React.FC<MeterListProps> = ({ viewMode, searchValue }) => {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchMeters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await meterService.getMeters(pagination.page, pagination.perPage);
      const data = response.data;
      const meterList = Array.isArray(data) ? data : data?.site_assets || data?.data || [];
      setMeters(meterList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || meterList.length,
        totalPages: data.total_pages || Math.ceil((data.total || meterList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meters');
      setMeters([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => { fetchMeters(); }, [fetchMeters]);

  const getMeterStatus = (meter: Meter): StatusType => {
    const status = meter.status?.toLowerCase();
    if (status === 'active' || status === 'in use') return 'in-use';
    if (status === 'maintenance') return 'maintenance';
    if (status === 'inactive' || status === 'breakdown') return 'breakdown';
    return 'in-store';
  };

  const filteredMeters = meters.filter(meter => 
    !searchValue || 
    meter.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    meter.asset_number?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: TableColumn<Meter>[] = [
    { key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => idx + 1 },
    { key: 'name', header: 'Meter Name', sortable: true },
    { key: 'asset_number', header: 'Asset #', render: (v) => v || '-' },
    { key: 'meter_type', header: 'Type', render: (v) => v || '-' },
    { key: 'building_name', header: 'Building', render: (v) => v || '-' },
    { key: 'floor_name', header: 'Floor', render: (v) => v || '-' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getMeterStatus(row)} /> },
    { key: 'last_reading', header: 'Last Reading', render: (v) => v || '-' },
  ];

  if (loading && meters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading meters...</p>
      </div>
    );
  }

  if (error && meters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Meters</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchMeters} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (filteredMeters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <Gauge className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Meters Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No meters match "${searchValue}"` : 'No meter assets added yet'}</p>
        <Link to="/asset/meter/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Meter</Link>
      </div>
    );
  }

  return (
    <>
      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMeters.map((meter) => (
            <DataCard
              key={meter.id}
              title={meter.name}
              subtitle={meter.asset_number || '-'}
              status={getMeterStatus(meter)}
              fields={[
                { label: 'Type', value: meter.meter_type || '-' },
                { label: 'Building', value: meter.building_name || '-' },
                { label: 'Floor', value: meter.floor_name || '-' },
                { label: 'Last Reading', value: meter.last_reading?.toString() || '-' },
              ]}
              viewPath={`/asset/meter/${meter.id}`}
              editPath={`/asset/meter/${meter.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filteredMeters} selectable selectedRows={selectedRows} onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} onSelectAll={() => setSelectedRows(selectedRows.length === filteredMeters.length ? [] : filteredMeters.map(m => String(m.id)))} viewPath={(row) => `/asset/meter/${row.id}`} />
      )}

      {filteredMeters.length > 0 && (
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

export default MeterList;
