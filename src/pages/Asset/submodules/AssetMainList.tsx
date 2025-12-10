import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { assetService, Asset } from '../../../services/asset.service';
import { Loader2, Package, AlertCircle, RefreshCw } from 'lucide-react';

interface AssetMainListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
  perPage?: number;
}

const AssetMainList: React.FC<AssetMainListProps> = ({ viewMode, searchValue, perPage = 10 }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });

  // Update perPage when prop changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await assetService.getAssets(pagination.page, pagination.perPage, { search: searchValue });
      const data = response.data;
      const assetList = Array.isArray(data) ? data : data?.site_assets || data?.data || [];
      setAssets(assetList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || assetList.length,
        totalPages: data.total_pages || Math.ceil((data.total || assetList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, searchValue]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const getAssetStatus = (asset: Asset): StatusType => {
    const status = asset.status?.toLowerCase();
    if (status === 'active' || status === 'in_use') return 'in-use';
    if (status === 'maintenance' || status === 'under_maintenance') return 'pending';
    if (status === 'retired' || status === 'disposed') return 'breakdown';
    return 'available';
  };

  const filteredAssets = assets.filter(asset => 
    !searchValue || 
    asset.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    asset.asset_number?.toLowerCase().includes(searchValue.toLowerCase()) ||
    asset.oem_name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: TableColumn<Asset>[] = [
    { key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => idx + 1 },
    { key: 'asset_number', header: 'Asset #', render: (v) => v || '-' },
    { key: 'name', header: 'Asset Name', sortable: true, render: (v) => v || '-' },
    { key: 'oem_name', header: 'OEM', render: (v) => v || '-' },
    { key: 'model_number', header: 'Model', render: (v) => v || '-' },
    { key: 'building_name', header: 'Location', render: (v, row) => `${v || '-'}${row.floor_name ? `, ${row.floor_name}` : ''}` },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getAssetStatus(row)} /> },
    { key: 'purchase_cost', header: 'Cost', render: (v) => v ? `₹${v.toLocaleString()}` : '-' },
  ];

  if (loading && assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading Assets...</p>
      </div>
    );
  }

  if (error && assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Assets</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchAssets} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No assets match "${searchValue}"` : 'No assets added yet'}</p>
        <Link to="/asset/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Asset</Link>
      </div>
    );
  }

  return (
    <>
      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <DataCard
              key={asset.id}
              title={asset.name || `Asset #${asset.id}`}
              subtitle={asset.asset_number || '-'}
              status={getAssetStatus(asset)}
              fields={[
                { label: 'OEM', value: asset.oem_name || '-' },
                { label: 'Model', value: asset.model_number || '-' },
                { label: 'Location', value: asset.building_name || '-' },
                { label: 'Cost', value: asset.purchase_cost ? `₹${asset.purchase_cost.toLocaleString()}` : '-' },
              ]}
              viewPath={`/asset/${asset.id}`}
              editPath={`/asset/${asset.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filteredAssets} selectable selectedRows={selectedRows} onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} onSelectAll={() => setSelectedRows(selectedRows.length === filteredAssets.length ? [] : filteredAssets.map(a => String(a.id)))} viewPath={(row) => `/asset/${row.id}`} />
      )}

      {filteredAssets.length > 0 && (
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

export default AssetMainList;