import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageTitle from '../../components/ui/PageTitle';
import ListToolbar from '../../components/ui/ListToolbar';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { assetService, Asset } from '../../services/asset.service';
import { Loader2, Package, AlertCircle, RefreshCw } from 'lucide-react';

const AssetList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await assetService.getAssets(
        pagination.page,
        pagination.perPage,
        { search: searchValue }
      );
      
      const data = response.data;
      const assetList = Array.isArray(data) ? data : data?.assets || data?.data || [];
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

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getAssetStatus = (asset: Asset): StatusType => {
    const status = asset.status?.toLowerCase();
    if (status === 'in use' || status === 'active') return 'in-use';
    if (status === 'maintenance') return 'maintenance';
    if (status === 'breakdown' || status === 'inactive') return 'breakdown';
    return 'in-store';
  };

  const columns: TableColumn<Asset>[] = [
    { key: 'id', header: 'S.No', width: '80px', render: (_, __, idx) => (idx || 0) + 1 },
    { key: 'name', header: 'Asset Name', sortable: true },
    { key: 'asset_number', header: 'Asset ID', render: (v) => v || '-' },
    { key: 'oem_name', header: 'OEM', render: (v) => v || '-' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getAssetStatus(row)} /> },
    { key: 'building_name', header: 'Building', render: (v) => v || '-' },
    { key: 'floor_name', header: 'Floor', render: (v) => v || '-' },
  ];

  if (loading && assets.length === 0) {
    return (
      <div className="p-6">
        <PageTitle title="Assets" breadcrumbs={[{ label: 'Asset', path: '/asset' }, { label: 'List' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error && assets.length === 0) {
    return (
      <div className="p-6">
        <PageTitle title="Assets" breadcrumbs={[{ label: 'Asset', path: '/asset' }, { label: 'List' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Assets</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchAssets} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle title="Assets" breadcrumbs={[{ label: 'Asset', path: '/asset' }, { label: 'List' }]} />

      <ListToolbar
        searchPlaceholder="Search by Name, OEM, Building..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => {}}
        onExport={() => {}}
        onAdd={() => navigate('/asset/create')}
        addLabel="Add Asset"
        showQrCode
        onQrCode={() => {}}
      />

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}

      {!loading && assets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
          <p className="text-muted-foreground mb-4">{searchValue ? `No assets match "${searchValue}"` : 'Start by adding your first asset'}</p>
          <Link to="/asset/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Asset</Link>
        </div>
      )}

      {viewMode === 'grid' && assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <DataCard
              key={asset.id}
              title={asset.name}
              subtitle={asset.asset_number || asset.oem_name || '-'}
              status={getAssetStatus(asset)}
              fields={[
                { label: 'OEM', value: asset.oem_name || '-' },
                { label: 'Building', value: asset.building_name || '-' },
                { label: 'Floor', value: asset.floor_name || '-' },
                { label: 'Unit', value: asset.unit_name || '-' },
              ]}
              viewPath={`/asset/${asset.id}`}
              editPath={`/asset/${asset.id}/edit`}
            />
          ))}
        </div>
      ) : assets.length > 0 && (
        <DataTable columns={columns} data={assets} selectable selectedRows={selectedRows} onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} onSelectAll={() => setSelectedRows(selectedRows.length === assets.length ? [] : assets.map(a => String(a.id)))} viewPath={(row) => `/asset/${row.id}`} />
      )}

      {assets.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
          <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default AssetList;
