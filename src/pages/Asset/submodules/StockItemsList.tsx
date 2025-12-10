import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { stockItemService, StockItem } from '../../services/assetSubModules.service';
import { Loader2, Package, AlertCircle, RefreshCw } from 'lucide-react';

interface StockItemsListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
}

const StockItemsList: React.FC<StockItemsListProps> = ({ viewMode, searchValue }) => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await stockItemService.getStockItems(pagination.page, pagination.perPage);
      const data = response.data;
      const itemList = Array.isArray(data) ? data : data?.items || data?.data || [];
      setItems(itemList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || itemList.length,
        totalPages: data.total_pages || Math.ceil((data.total || itemList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const getStockStatus = (item: StockItem): StatusType => {
    if (item.quantity !== undefined && item.min_stock !== undefined) {
      if (item.quantity <= 0) return 'breakdown';
      if (item.quantity <= item.min_stock) return 'maintenance';
    }
    if (item.status?.toLowerCase() === 'out_of_stock') return 'breakdown';
    if (item.status?.toLowerCase() === 'low_stock') return 'maintenance';
    return 'in-store';
  };

  const filteredItems = items.filter(item => 
    !searchValue || 
    item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.item_code?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: TableColumn<StockItem>[] = [
    { key: 'id', header: 'S.No', width: '80px', render: (_val, _row, idx) => idx + 1 },
    { key: 'item_code', header: 'Item Code', render: (v) => v || '-' },
    { key: 'name', header: 'Item Name', sortable: true },
    { key: 'category', header: 'Category', render: (v) => v || '-' },
    { key: 'quantity', header: 'Qty', render: (v) => v ?? 0 },
    { key: 'unit', header: 'Unit', render: (v) => v || '-' },
    { key: 'unit_price', header: 'Price', render: (v) => v ? `₹${v}` : '-' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getStockStatus(row)} /> },
  ];

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading stock items...</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Stock Items</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchItems} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Stock Items Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No items match "${searchValue}"` : 'No stock items added yet'}</p>
        <Link to="/asset/stock-items/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Stock Item</Link>
      </div>
    );
  }

  return (
    <>
      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <DataCard
              key={item.id}
              title={item.name}
              subtitle={item.item_code || '-'}
              status={getStockStatus(item)}
              fields={[
                { label: 'Category', value: item.category || '-' },
                { label: 'Quantity', value: `${item.quantity ?? 0} ${item.unit || ''}` },
                { label: 'Price', value: item.unit_price ? `₹${item.unit_price}` : '-' },
                { label: 'Location', value: item.location || '-' },
              ]}
              viewPath={`/asset/stock-items/${item.id}`}
              editPath={`/asset/stock-items/${item.id}/edit`}
            />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filteredItems} selectable selectedRows={selectedRows} onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} onSelectAll={() => setSelectedRows(selectedRows.length === filteredItems.length ? [] : filteredItems.map(i => String(i.id)))} viewPath={(row) => `/asset/stock-items/${row.id}`} />
      )}

      {filteredItems.length > 0 && (
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

export default StockItemsList;
