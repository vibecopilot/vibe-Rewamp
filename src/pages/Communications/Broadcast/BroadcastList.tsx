import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Edit, Plus, Grid3X3, List } from 'lucide-react';
import { getBroadCast } from '../../../api/index';
import { dateFormatSTD } from '../../../utils/dateUtils';

interface Broadcast {
  id: number;
  notice_title?: string;
  type?: string;
  notice_discription?: string;
  CreatedBy?: string;
  expiry_date?: string;
  created_at?: string;
  status?: string;
}

const BroadcastList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [filteredBroadcasts, setFilteredBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = viewMode === 'grid' ? 12 : 10;

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  useEffect(() => {
    if (searchValue) {
      const filtered = broadcasts.filter((broadcast) =>
        broadcast.notice_title?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredBroadcasts(filtered);
    } else {
      setFilteredBroadcasts(broadcasts);
    }
    setCurrentPage(1);
  }, [searchValue, broadcasts]);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const res = await getBroadCast();
      const data = Array.isArray(res.data) ? res.data : [];
      const sortedBroadcasts = data.sort((a: Broadcast, b: Broadcast) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
      setBroadcasts(sortedBroadcasts);
      setFilteredBroadcasts(sortedBroadcasts);
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
      setBroadcasts([]);
      setFilteredBroadcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = filteredBroadcasts.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const totalPages = Math.ceil(filteredBroadcasts.length / recordsPerPage);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
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
            onClick={() => navigate('/crm/communications/broadcast/create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Broadcast/Notice
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((broadcast) => (
            <div
              key={broadcast.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">#{broadcast.id}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(broadcast.status)}`}>
                  {broadcast.status || 'N/A'}
                </span>
              </div>
              
              <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                {broadcast.notice_title || 'No Title'}
              </h3>
              
              <div className="space-y-1 text-xs text-muted-foreground mb-4">
                <p><span className="font-medium">Type:</span> {broadcast.type || '-'}</p>
                <p><span className="font-medium">Created By:</span> {broadcast.CreatedBy || '-'}</p>
                <p><span className="font-medium">Expiry:</span> {broadcast.expiry_date ? dateFormatSTD(broadcast.expiry_date) : '-'}</p>
                <p><span className="font-medium">Created:</span> {broadcast.created_at ? dateFormatSTD(broadcast.created_at) : '-'}</p>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Link
                  to={`/crm/communications/broadcast/${broadcast.id}`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4 text-primary" />
                </Link>
                <Link
                  to={`/crm/communications/broadcast/${broadcast.id}/edit`}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Notice Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Created On</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((broadcast) => (
                  <tr key={broadcast.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/crm/communications/broadcast/${broadcast.id}`}>
                          <Eye className="w-4 h-4 text-primary hover:text-primary/80" />
                        </Link>
                        <Link to={`/crm/communications/broadcast/${broadcast.id}/edit`}>
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{broadcast.notice_title || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{broadcast.type || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate">{broadcast.notice_discription || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{broadcast.CreatedBy || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{broadcast.expiry_date ? dateFormatSTD(broadcast.expiry_date) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{broadcast.created_at ? dateFormatSTD(broadcast.created_at) : '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(broadcast.status)}`}>
                        {broadcast.status || '-'}
                      </span>
                    </td>
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
            Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredBroadcasts.length)} of {filteredBroadcasts.length}
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
          <p className="text-muted-foreground">No broadcasts found</p>
        </div>
      )}
    </div>
  );
};

export default BroadcastList;
