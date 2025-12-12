import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import DataCard from '../../components/ui/DataCard';
import { getAmenitiesBooking, getFacitilitySetup } from '../../api';
import { Loader2, CalendarDays, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface AmenityBooking {
  id: number;
  amenity_id: number;
  fac_name?: string;
  fac_type?: string;
  amount?: number;
  status?: string;
  payment?: { payment_method?: string };
  book_by_user?: string;
  created_at?: string;
  booking_date?: string;
  slot_time?: string;
  description?: string;
  terms?: string;
}

interface Facility {
  id: number;
  fac_name: string;
  fac_type: string;
  description?: string;
  terms?: string;
  amenity_slots?: { id: number; start_hr: number; start_min: number; end_hr: number; end_min: number }[];
}

const AmenitiesList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<AmenityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDefaultPerPage = (mode: 'grid' | 'table') => mode === 'grid' ? 12 : 10;
  
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: getDefaultPerPage('grid'),
    total: 0,
    totalPages: 0,
  });

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    setPagination(prev => ({ ...prev, perPage: getDefaultPerPage(mode), page: 1 }));
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes, facilitiesRes] = await Promise.all([
        getAmenitiesBooking(),
        getFacitilitySetup()
      ]);

      const bookingsData = Array.isArray(bookingsRes?.data?.amenity_bookings) 
        ? bookingsRes.data.amenity_bookings 
        : Array.isArray(bookingsRes?.data) ? bookingsRes.data : [];
      
      const facilitiesData: Facility[] = Array.isArray(facilitiesRes?.data?.amenities)
        ? facilitiesRes.data.amenities
        : Array.isArray(facilitiesRes?.data) ? facilitiesRes.data : [];

      // Combine booking data with facility details
      const combinedData = bookingsData.map((booking: AmenityBooking) => {
        const facility = facilitiesData.find((f) => f.id === booking.amenity_id);
        const slots = facility?.amenity_slots || [];
        const slot = slots.find((s: any) => s.id === (booking as any).amenity_slot_id);
        const slotTime = slot
          ? `${String(slot.start_hr || 0).padStart(2, '0')}:${String(slot.start_min || 0).padStart(2, '0')} - ${String(slot.end_hr || 0).padStart(2, '0')}:${String(slot.end_min || 0).padStart(2, '0')}`
          : 'N/A';

        return {
          ...booking,
          fac_name: facility?.fac_name || 'N/A',
          fac_type: facility?.fac_type || 'N/A',
          description: facility?.description || 'N/A',
          terms: facility?.terms || 'N/A',
          slot_time: slotTime,
        };
      });

      const sortedData = combinedData.sort((a: AmenityBooking, b: AmenityBooking) => b.id - a.id);
      setBookings(sortedData);
      setFilteredBookings(sortedData);
      setPagination(prev => ({
        ...prev,
        total: sortedData.length,
        totalPages: Math.ceil(sortedData.length / prev.perPage),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter((item) =>
        item.fac_name?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredBookings(filtered);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchValue, bookings]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = date.getFullYear();
    return `${dd}/${mm}/${yy}`;
  };

  const handleExport = () => {
    toast.loading('Exporting...');
    try {
      const exportData = filteredBookings.map((b) => ({
        ID: b.id,
        'Facility Name': b.fac_name,
        'Facility Type': b.fac_type,
        'Total Amount': b.amount || 'N/A',
        'Payment Status': b.status || 'N/A',
        'Payment Method': b.payment?.payment_method || 'N/A',
        'Booked By': b.book_by_user || 'N/A',
        'Booked On': formatDate(b.created_at),
        'Scheduled On': formatDate(b.booking_date),
        'Scheduled Time': b.slot_time,
        'Description': b.description,
        'Terms': b.terms,
        'Booking Status': b.status || 'N/A',
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Amenities Bookings');
      XLSX.writeFile(wb, 'Amenities_Bookings.xlsx');
      toast.dismiss();
      toast.success('Exported successfully');
    } catch {
      toast.dismiss();
      toast.error('Export failed');
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredBookings.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredBookings.map(r => String(r.id)));
    }
  };

  const paginatedData = filteredBookings.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  const getStatusColor = (status?: string): string => {
    const s = status?.toLowerCase();
    if (s === 'confirmed' || s === 'approved' || s === 'paid') return 'bg-green-100 text-green-700';
    if (s === 'cancelled' || s === 'rejected') return 'bg-red-100 text-red-700';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const columns: TableColumn<AmenityBooking>[] = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '80px',
      render: (_, row) => (
        <Link to={`/amenities/bookings/${row.id}`} className="text-muted-foreground hover:text-primary">
          <Eye className="w-4 h-4" />
        </Link>
      ),
    },
    { key: 'id', header: 'ID', width: '80px', sortable: true },
    { key: 'fac_name', header: 'FACILITY NAME', sortable: true },
    { key: 'fac_type', header: 'FACILITY TYPE', sortable: true },
    { key: 'amount', header: 'TOTAL AMOUNT', render: (v) => v || 'N/A' },
    { 
      key: 'status', 
      header: 'PAYMENT STATUS', 
      render: (v) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(v as string)}`}>
          {v || 'N/A'}
        </span>
      )
    },
    { key: 'payment', header: 'PAYMENT METHOD', render: (v: any) => v?.payment_method || 'N/A' },
    { key: 'book_by_user', header: 'BOOKED BY', render: (v) => v || 'N/A' },
    { key: 'created_at', header: 'BOOKED ON', render: (v) => formatDate(v as string) },
    { key: 'booking_date', header: 'SCHEDULED ON', render: (v) => formatDate(v as string) },
    { key: 'slot_time', header: 'SCHEDULED TIME', render: (v) => v || 'N/A' },
    { key: 'description', header: 'DESCRIPTION', render: (v) => v || '-' },
    { key: 'terms', header: 'TERMS', render: (v) => v || '-' },
    { 
      key: 'booking_status', 
      header: 'BOOKING STATUS', 
      render: (_, row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status || 'N/A'}
        </span>
      )
    },
  ];

  if (loading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading amenities bookings...</p>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Bookings</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb 
        items={[
          { label: 'Booking Management' }, 
          { label: 'Amenities Booking' }
        ]} 
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/amenities/book')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Book
        </button>

        <div className="flex-1">
          <ListToolbar
            searchPlaceholder="Search by Facility"
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onFilter={() => {}}
            onExport={handleExport}
            showViewToggle={true}
          />
        </div>
      </div>

      {loading && bookings.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {!loading && filteredBookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <CalendarDays className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Amenity Bookings Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? `No bookings match "${searchValue}"` : 'Book a facility to get started'}
          </p>
          <button
            onClick={() => navigate('/amenities/book')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            + Book Facility
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
          viewPath={(row) => `/amenities/bookings/${row.id}`}
        />
      )}

      {paginatedData.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((booking) => (
            <DataCard
              key={booking.id}
              title={booking.fac_name || `Booking #${booking.id}`}
              subtitle={`${formatDate(booking.booking_date)} • ${booking.slot_time}`}
              status={booking.status?.toLowerCase() === 'confirmed' || booking.status?.toLowerCase() === 'approved' ? 'approved' : 
                      booking.status?.toLowerCase() === 'cancelled' ? 'rejected' : 'pending'}
              fields={[
                { label: 'Type', value: booking.fac_type || '-' },
                { label: 'Amount', value: booking.amount ? `₹${booking.amount}` : 'N/A' },
                { label: 'Booked By', value: booking.book_by_user || 'N/A' },
              ]}
              viewPath={`/amenities/bookings/${booking.id}`}
            />
          ))}
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, filteredBookings.length)} of{' '}
            {filteredBookings.length} records
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">‹ Prev</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= Math.ceil(filteredBookings.length / pagination.perPage)} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: Math.ceil(filteredBookings.length / prev.perPage) }))} disabled={pagination.page >= Math.ceil(filteredBookings.length / pagination.perPage)} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">»</button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Per page:</span>
            <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
              <option value={10}>10</option>
              <option value={12}>12</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmenitiesList;
