import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { amcService, AMC } from '../../services/assetSubModules.service';
import { Loader2, FileText, AlertCircle, RefreshCw } from 'lucide-react';

interface AMCListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
}

const AMCList: React.FC<AMCListProps> = ({ viewMode, searchValue }) => {
  const [amcs, setAmcs] = useState<AMC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchAMCs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await amcService.getAMCs(pagination.page, pagination.perPage);
      const data = response.data;
      const amcList = Array.isArray(data) ? data : data?.asset_amcs || data?.data || [];
      setAmcs(amcList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || amcList.length,
        totalPages: data.total_pages || Math.ceil((data.total || amcList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AMCs');
      setAmcs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => { fetchAMCs(); }, [fetchAMCs]);

  const getAMCStatus = (amc: AMC): StatusType => {
    const today = new Date();
    const endDate = amc.end_date ? new Date(amc.end_date) : null;
    if (endDate && endDate < today) return 'breakdown';
    if (amc.status?.toLowerCase() === 'active') return 'in-use';
    if (amc.status?.toLowerCase() === 'expired') return 'breakdown';
    return 'pending';
  };

  const filteredAMCs = amcs.filter(amc => 
    !searchValue || 
    amc.vendor_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    amc.contract_number?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: TableColumn<AMC>[] = [
    { key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => idx + 1 },
    { key: 'contract_number', header: 'Contract #', render: (v) => v || '-' },
    { key: 'vendor_name', header: 'Vendor', sortable: true, render: (v) => v || '-' },
    { key: 'amc_type', header: 'Type', render: (v) => v || '-' },
    { key: 'start_date', header: 'Start Date', render: (v) => v || '-' },
    { key: 'end_date', header: 'End Date', render: (v) => v || '-' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getAMCStatus(row)} /> },
    { key: 'amount', header: 'Amount', render: (v) => v ? `₹${v.toLocaleString()}` : '-' },
  ];

  if (loading && amcs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading AMCs...</p>
      </div>
    );
  }

  if (error && amcs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load AMCs</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchAMCs} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (filteredAMCs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No AMC Records Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No AMCs match "${searchValue}"` : 'No AMC contracts added yet'}</p>
        <Link to="/asset/amc/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add AMC</Link>
      </div>
    );
  }

  return (
    <>
      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAMCs.map((amc) => (
            <DataCard
              key={amc.id}
              title={amc.vendor_name || `AMC #${amc.id}`}
              subtitle={amc.contract_number || '-'}
              status={getAMCStatus(amc)}
              fields={[
                { label: 'Type', value: amc.amc_type || '-' },
                { label: 'Start', value: amc.start_date || '-' },
                { label: 'End', value: amc.end_date || '-' },
                { label: 'Amount', value: amc.amount ? `₹${amc.amount.toLocaleString()}` : '-' },
              ]}
              viewPath={`/asset/amc/${amc.id}`}
              editPath={`/asset/amc/${amc.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filteredAMCs} selectable selectedRows={selectedRows} onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} onSelectAll={() => setSelectedRows(selectedRows.length === filteredAMCs.length ? [] : filteredAMCs.map(a => String(a.id)))} viewPath={(row) => `/asset/amc/${row.id}`} />
      )}

      {filteredAMCs.length > 0 && (
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

export default AMCList;
