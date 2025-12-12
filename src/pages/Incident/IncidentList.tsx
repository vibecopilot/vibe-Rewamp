import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Edit } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import { getIncidents } from '../../api';
import { dateFormatSTD } from '../../utils/dateUtils';

interface Incident {
  id: number;
  description?: string;
  building_name?: string;
  time_and_date?: string;
  incident_level?: string;
  primary_incident_category?: string;
  primary_incident_sub_category?: string;
  support_required?: boolean;
  status?: string;
  site_name?: string;
  region_name?: string;
  tower_name?: string;
}

const IncidentList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = viewMode === 'grid' ? 12 : 10;

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    if (searchValue) {
      const filtered = incidents.filter(
        (inc) =>
          inc.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
          inc.building_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          inc.site_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          String(inc.id).includes(searchValue)
      );
      setFilteredIncidents(filtered);
    } else {
      setFilteredIncidents(incidents);
    }
    setCurrentPage(1);
  }, [searchValue, incidents]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await getIncidents();
      // Handle different API response formats
      const data = res.data;
      const incidentArray = Array.isArray(data) ? data : (data?.incidents || data?.data || []);
      setIncidents(incidentArray);
      setFilteredIncidents(incidentArray);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]);
      setFilteredIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = filteredIncidents.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const totalPages = Math.ceil(filteredIncidents.length / recordsPerPage);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'Safety', path: '/incident' },
        { label: 'Incident Management' }
      ]} />

      <ListToolbar
        searchPlaceholder="Search incidents..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => {}}
        onExport={() => {}}
        onAdd={() => navigate('/incident/create')}
        addLabel="Add Incident"
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((incident) => (
            <div
              key={incident.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">#{incident.id}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(incident.status)}`}>
                  {incident.status || 'Open'}
                </span>
              </div>
              
              <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                {incident.description || 'No Description'}
              </h3>
              
              <div className="space-y-1 text-xs text-muted-foreground mb-4">
                <p><span className="font-medium">Site:</span> {incident.site_name || '-'}</p>
                <p><span className="font-medium">Building:</span> {incident.building_name || '-'}</p>
                <p><span className="font-medium">Level:</span> {incident.incident_level || '-'}</p>
                <p><span className="font-medium">Date:</span> {incident.time_and_date ? dateFormatSTD(incident.time_and_date) : '-'}</p>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Link
                  to={`/incident/${incident.id}`}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4 text-primary" />
                </Link>
                <Link
                  to={`/incident/${incident.id}/edit`}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">View</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tower</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((incident) => (
                  <tr key={incident.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/incident/${incident.id}`}>
                          <Eye className="w-4 h-4 text-primary hover:text-primary/80" />
                        </Link>
                        <Link to={`/incident/${incident.id}/edit`}>
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{incident.id}</td>
                    <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate">{incident.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{incident.site_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{incident.region_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{incident.tower_name || '-'}</td>
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
            Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredIncidents.length)} of {filteredIncidents.length}
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
          <p className="text-muted-foreground">No incidents found</p>
        </div>
      )}
    </div>
  );
};

export default IncidentList;
