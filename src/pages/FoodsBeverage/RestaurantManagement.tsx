import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import DataCard from '../../components/ui/DataCard';
import { getFB, downloadRestaurtantData } from '../../api';
import { Loader2, UtensilsCrossed, AlertCircle, RefreshCw, Eye, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Restaurant {
  id: number;
  restaurant_name: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
  booking_allowed: boolean;
  order_allowed: boolean;
  status: boolean;
}

const RestaurantManagement: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
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

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFB();
      const data = Array.isArray(response?.data) ? response.data : [];
      setRestaurants(data);
      setFilteredRestaurants(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        totalPages: Math.ceil(data.length / prev.perPage),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurants';
      setError(errorMessage);
      setRestaurants([]);
      setFilteredRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter((item) =>
        item.restaurant_name?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchValue, restaurants]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleExport = async () => {
    toast.loading('Downloading Please Wait');
    try {
      const response = await downloadRestaurtantData();
      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: response.headers['content-type'],
        })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Restaurants_Data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Restaurants Data downloaded successfully');
    } catch (error) {
      toast.dismiss();
      console.error('Error downloading:', error);
      toast.error('Something went wrong, please try again');
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredRestaurants.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredRestaurants.map(r => String(r.id)));
    }
  };

  const getOpenDays = (restaurant: Restaurant): string => {
    const daysOfWeek = [
      { key: 'mon', label: 'M' },
      { key: 'tue', label: 'T' },
      { key: 'wed', label: 'W' },
      { key: 'thu', label: 'T' },
      { key: 'fri', label: 'F' },
      { key: 'sat', label: 'S' },
      { key: 'sun', label: 'S' },
    ];
    return daysOfWeek
      .filter((day) => restaurant[day.key as keyof Restaurant] === 1)
      .map((day) => day.label)
      .join(' ');
  };

  const paginatedData = filteredRestaurants.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  const columns: TableColumn<Restaurant>[] = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Link to={`/fb/restaurant/${row.id}`} className="text-muted-foreground hover:text-primary">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/fb/restaurant/${row.id}/edit`} className="text-muted-foreground hover:text-primary">
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
    { key: 'restaurant_name', header: 'NAME', sortable: true },
    { 
      key: 'open_days', 
      header: 'OPEN DAYS', 
      render: (_, row) => getOpenDays(row) || '-'
    },
    { 
      key: 'booking_allowed', 
      header: 'BOOKING ALLOWED',
      render: (value) => (
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </div>
      )
    },
    { 
      key: 'order_allowed', 
      header: 'ORDER ALLOWED',
      render: (value) => (
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'ACTIVE',
      render: (value) => (
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </div>
      )
    },
  ];

  if (loading && restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading restaurants...</p>
      </div>
    );
  }

  if (error && restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Restaurants</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchRestaurants}
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
          onClick={() => navigate('/fb/restaurant/pos')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-accent-foreground border border-primary rounded-lg hover:bg-accent/90 transition-colors"
        >
          🖥️ POS System
        </button>
        <button
          onClick={() => navigate('/fb/restaurant/create')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Add
        </button>

        <div className="flex-1">
          <ListToolbar
            searchPlaceholder="Search by restaurant name"
            searchValue={searchValue}
            onSearchChange={handleSearch}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onFilter={() => console.log('Filter clicked')}
            onExport={handleExport}
            showViewToggle={true}
          />
        </div>
      </div>

      {loading && restaurants.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {!loading && filteredRestaurants.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <UtensilsCrossed className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Restaurants Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? `No restaurants match "${searchValue}"` : 'Start by adding your first restaurant'}
          </p>
          <button
            onClick={() => navigate('/fb/restaurant/create')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            + Add Restaurant
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
          viewPath={(row) => `/fb/restaurant/${row.id}`}
        />
      )}

      {paginatedData.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((restaurant) => (
            <DataCard
              key={restaurant.id}
              title={restaurant.restaurant_name || 'Unknown'}
              subtitle={getOpenDays(restaurant) || 'No open days set'}
              fields={[
                { label: 'Booking', value: restaurant.booking_allowed ? 'Allowed' : 'Not Allowed' },
                { label: 'Order', value: restaurant.order_allowed ? 'Allowed' : 'Not Allowed' },
                { label: 'Status', value: restaurant.status ? 'Active' : 'Inactive' },
              ]}
              viewPath={`/fb/restaurant/${restaurant.id}`}
              editPath={`/fb/restaurant/${restaurant.id}/edit`}
            />
          ))}
        </div>
      )}

      {filteredRestaurants.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, filteredRestaurants.length)} of{' '}
            {filteredRestaurants.length} records
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
              disabled={pagination.page >= Math.ceil(filteredRestaurants.length / pagination.perPage)}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next ›
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.ceil(filteredRestaurants.length / prev.perPage) }))}
              disabled={pagination.page >= Math.ceil(filteredRestaurants.length / pagination.perPage)}
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

export default RestaurantManagement;
