import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Edit, Plus, Grid3X3, List } from 'lucide-react';
import { getEvents } from '../../../api/index';
import { dateFormatSTD } from '../../../utils/dateUtils';

interface Event {
  id: number;
  event_name?: string;
  venue?: string;
  discription?: string;
  created_by?: string;
  start_date_time?: string;
  end_date_time?: string;
  scheduledOn?: string;
  scheduledTime?: string;
  bookingStatus?: string;
  created_at?: string;
}

const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = viewMode === 'grid' ? 12 : 10;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (searchValue) {
      const filtered = events.filter((event) =>
        event.event_name?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
    setCurrentPage(1);
  }, [searchValue, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getEvents();
      const data = Array.isArray(res.data) ? res.data : [];
      const sortedEvents = data.sort((a: Event, b: Event) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = filteredEvents.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const totalPages = Math.ceil(filteredEvents.length / recordsPerPage);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="flex-1 min-w-[200px] max-w-md px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/crm/communications/events/create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((event) => (
            <div
              key={event.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">#{event.id}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(event.scheduledTime)}`}>
                  {event.scheduledTime || 'N/A'}
                </span>
              </div>
              
              <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                {event.event_name || 'No Title'}
              </h3>
              
              <div className="space-y-1 text-xs text-muted-foreground mb-4">
                <p><span className="font-medium">Venue:</span> {event.venue || '-'}</p>
                <p><span className="font-medium">Start:</span> {event.start_date_time ? dateFormatSTD(event.start_date_time) : '-'}</p>
                <p><span className="font-medium">End:</span> {event.end_date_time ? dateFormatSTD(event.end_date_time) : '-'}</p>
                <p><span className="font-medium">Created By:</span> {event.created_by || '-'}</p>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Link
                  to={`/crm/communications/events/${event.id}`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4 text-primary" />
                </Link>
                <Link
                  to={`/crm/communications/events/${event.id}/edit`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Venue</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Event Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Expired</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Created On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((event) => (
                  <tr key={event.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/crm/communications/events/${event.id}`}>
                          <Eye className="w-4 h-4 text-primary hover:text-primary/80" />
                        </Link>
                        <Link to={`/crm/communications/events/${event.id}/edit`}>
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{event.event_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{event.venue || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate">{event.discription || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{event.created_by || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{event.start_date_time ? dateFormatSTD(event.start_date_time) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{event.end_date_time ? dateFormatSTD(event.end_date_time) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{event.scheduledOn || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{event.scheduledTime || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{event.bookingStatus || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{event.created_at ? dateFormatSTD(event.created_at) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredEvents.length)} of {filteredEvents.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {!loading && paginatedData.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No events found</p>
        </div>
      )}
    </div>
  );
};

export default EventsList;
