import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageTitle from '../../components/ui/PageTitle';
import ListToolbar from '../../components/ui/ListToolbar';
import DataCard from '../../components/ui/DataCard';
import StatusBadge, { StatusType } from '../../components/ui/StatusBadge';
import { amenitiesService, AmenityBooking } from '../../services/amenities.service';
import { Loader2, CalendarDays, AlertCircle, RefreshCw } from 'lucide-react';

const AmenitiesBookingList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0, totalPages: 0 });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await amenitiesService.getBookings(pagination.page, pagination.perPage);
      const data = response.data;
      const bookingList = Array.isArray(data) ? data : data?.bookings || data?.amenity_bookings || data?.data || [];
      setBookings(bookingList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || bookingList.length,
        totalPages: data.total_pages || Math.ceil((data.total || bookingList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const getBookingStatus = (booking: AmenityBooking): StatusType => {
    const status = booking.status?.toLowerCase();
    if (status === 'confirmed' || status === 'approved') return 'approved';
    if (status === 'cancelled' || status === 'rejected') return 'rejected';
    if (status === 'completed') return 'checked-out';
    return 'pending';
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="p-6">
        <PageTitle title="Amenities Booking" breadcrumbs={[{ label: 'Amenities', path: '/amenities' }, { label: 'Bookings' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="p-6">
        <PageTitle title="Amenities Booking" breadcrumbs={[{ label: 'Amenities', path: '/amenities' }, { label: 'Bookings' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Bookings</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle title="Amenities Booking" breadcrumbs={[{ label: 'Amenities', path: '/amenities' }, { label: 'Bookings' }]} />

      <ListToolbar
        searchPlaceholder="Search bookings..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => {}}
        onExport={() => {}}
        onAdd={() => navigate('/amenities/book')}
        addLabel="Book Amenity"
      />

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}

      {!loading && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <CalendarDays className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
          <p className="text-muted-foreground mb-4">Book an amenity to get started</p>
          <Link to="/amenities/book" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Book Amenity</Link>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bookings.map((booking) => (
            <DataCard key={booking.id} title={booking.amenity_name || `Booking #${booking.id}`} subtitle={booking.booking_date} status={getBookingStatus(booking)} fields={[
              { label: 'Time', value: `${booking.start_time} - ${booking.end_time}` },
              { label: 'Booked By', value: booking.booked_by || '-' },
              { label: 'Purpose', value: booking.purpose || '-' },
            ]} viewPath={`/amenities/bookings/${booking.id}`} />
          ))}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmenitiesBookingList;
