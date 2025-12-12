import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import DataCard from '../../components/ui/DataCard';
import { getPantry } from '../../api';
import { Loader2, Package, AlertCircle, RefreshCw, Eye, Edit2, Check, X } from 'lucide-react';

interface PantryItem {
  id: number;
  item_name: string;
  stock: number;
  description?: string;
  created_at: string;
  ordered_by_name?: {
    firstname?: string;
    lastname?: string;
  };
}

const PantryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Grid default 12, List default 10
  const getDefaultPerPage = (mode: 'grid' | 'table') => mode === 'grid' ? 12 : 10;
  
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: getDefaultPerPage('grid'),
    total: 0,
    totalPages: 0,
  });

  // Update perPage when view mode changes
  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    setPagination(prev => ({ ...prev, perPage: getDefaultPerPage(mode), page: 1 }));
  };

  const fetchPantryItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPantry();
      const data = response.data || [];
      const sortedData = data.sort((a: PantryItem, b: PantryItem) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPantryItems(sortedData);
      setFilteredItems(sortedData);
      setPagination(prev => ({
        ...prev,
        total: sortedData.length,
        totalPages: Math.ceil(sortedData.length / prev.perPage),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pantry items';
      setError(errorMessage);
      setPantryItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPantryItems();
  }, [fetchPantryItems]);

  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredItems(pantryItems);
    } else {
      const filtered = pantryItems.filter((item) =>
        item.item_name?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredItems(filtered);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchValue, pantryItems]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredItems.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredItems.map(item => String(item.id)));
    }
  };

  const handleApprove = (id: number) => {
    console.log('Approve item:', id);
  };

  const handleReject = (id: number) => {
    console.log('Reject item:', id);
  };

  const paginatedData = filteredItems.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  const columns: TableColumn<PantryItem>[] = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Link to={`/fb/pantry/${row.id}`} className="text-muted-foreground hover:text-primary">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/fb/pantry/${row.id}/edit`} className="text-muted-foreground hover:text-primary">
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
    { key: 'item_name', header: 'ITEM NAME', sortable: true },
    { 
      key: 'ordered_by', 
      header: 'ORDERED BY',
      render: (_, row) => {
        const name = row.ordered_by_name 
          ? `${row.ordered_by_name.firstname || ''} ${row.ordered_by_name.lastname || ''}`.trim()
          : '-';
        return name || '-';
      }
    },
    { key: 'stock', header: 'STOCK', sortable: true },
    { 
      key: 'action_buttons', 
      header: 'ACTION',
      render: (_, row) => row.stock !== 0 ? (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleApprove(row.id)}
            className="p-1.5 rounded-full text-green-500 hover:bg-green-100 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleReject(row.id)}
            className="p-1.5 rounded-full text-red-500 hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : null
    },
  ];

  if (loading && pantryItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading pantry items...</p>
      </div>
    );
  }

  if (error && pantryItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Pantry Items</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchPantryItems}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/fb/pantry/create')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Add new Items
        </button>

        <div className="flex-1">
          <ListToolbar
            searchPlaceholder="Search by Item Name, employee Name"
            searchValue={searchValue}
            onSearchChange={handleSearch}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onFilter={() => console.log('Filter clicked')}
            showViewToggle={true}
          />
        </div>
      </div>

      {loading && pantryItems.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Pantry Items Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? `No items match "${searchValue}"` : 'Start by adding your first pantry item'}
          </p>
          <button
            onClick={() => navigate('/fb/pantry/create')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            + Add Pantry Item
          </button>
        </div>
      )}

      {paginatedData.length > 0 && viewMode === 'table' && (
        <DataTable
          columns={columns}
          data={paginatedData}
          selectable
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          viewPath={(row) => `/fb/pantry/${row.id}`}
        />
      )}

      {paginatedData.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((item) => (
            <DataCard
              key={item.id}
              title={item.item_name || 'Unknown'}
              subtitle={`Stock: ${item.stock || 0}`}
              fields={[
                { label: 'Ordered By', value: item.ordered_by_name ? `${item.ordered_by_name.firstname || ''} ${item.ordered_by_name.lastname || ''}`.trim() || '-' : '-' },
                { label: 'Description', value: item.description || '-' },
              ]}
              viewPath={`/fb/pantry/${item.id}`}
              editPath={`/fb/pantry/${item.id}/edit`}
            />
          ))}
        </div>
      )}

      {filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, filteredItems.length)} of{' '}
            {filteredItems.length} records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= Math.ceil(filteredItems.length / pagination.perPage)}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next ›
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.ceil(filteredItems.length / prev.perPage) }))}
              disabled={pagination.page >= Math.ceil(filteredItems.length / pagination.perPage)}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Per page:</span>
            <select
              value={pagination.perPage}
              onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))}
              className="px-2 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={10}>10</option>
              <option value={12}>12</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default PantryManagement;
