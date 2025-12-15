import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import { Loader2, Users, AlertCircle, RefreshCw, Eye, Edit2, Phone, Briefcase, Building } from 'lucide-react';
import { getStaff, domainPrefix } from '../../api';

interface Staff {
  id: number;
  firstname?: string;
  lastname?: string;
  unit_name?: string;
  email?: string;
  mobile_no?: string;
  work_type?: string;
  profile_picture?: { url: string };
  created_at?: string;
  status?: boolean;
}

const GRID_PAGE_SIZE = 12;
const LIST_PAGE_SIZE = 10;

const VMSStaff: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = viewMode === 'grid' ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStaff();
      const data = response.data;
      const staffArray = Array.isArray(data.staffs) ? data.staffs : Array.isArray(data) ? data : [];
      const sortedData = staffArray.sort((a: Staff, b: Staff) =>
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
      setStaffList(sortedData);
      setFilteredStaff(sortedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff';
      setError(errorMessage);
      setStaffList([]);
      setFilteredStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, searchValue]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim() === '') {
      setFilteredStaff(staffList);
    } else {
      const filtered = staffList.filter((item) => {
        const fullName = `${item.firstname || ''} ${item.lastname || ''}`.toLowerCase();
        return (
          fullName.includes(value.toLowerCase()) ||
          item.unit_name?.toLowerCase().includes(value.toLowerCase()) ||
          item.mobile_no?.toLowerCase().includes(value.toLowerCase())
        );
      });
      setFilteredStaff(filtered);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentPageData = paginatedData;
    const currentPageIds = currentPageData.map(s => String(s.id));
    const allSelected = currentPageIds.every(id => selectedRows.includes(id));
    if (allSelected) {
      setSelectedRows(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedRows(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const totalPages = Math.ceil(filteredStaff.length / pageSize);
  const paginatedData = filteredStaff.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: TableColumn<Staff>[] = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '80px',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link to={`/vms/staff/${row.id}`} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors">
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
    {
      key: 'profile_picture',
      header: 'PROFILE',
      width: '80px',
      render: (_, row) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
          {row.profile_picture?.url ? (
            <img
              src={domainPrefix + row.profile_picture.url}
              alt="Profile"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => window.open(domainPrefix + row.profile_picture!.url, '_blank')}
            />
          ) : (
            <img src="/profile.png" alt="Default" className="w-full h-full object-cover" />
          )}
        </div>
      ),
    },
    { key: 'id', header: 'ID', sortable: true },
    {
      key: 'name',
      header: 'NAME',
      sortable: true,
      render: (_, row) => `${row.firstname || ''} ${row.lastname || ''}`.trim() || '-',
    },
    { key: 'unit_name', header: 'UNIT', render: (value) => value || '-' },
    { key: 'email', header: 'EMAIL', render: (value) => value || '-' },
    { key: 'mobile_no', header: 'MOBILE', render: (value) => value || '-' },
    { key: 'work_type', header: 'WORK TYPE', render: (value) => value || '-' },
  ];

  if (loading && staffList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading staff...</p>
      </div>
    );
  }

  if (error && staffList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Staff</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchStaff}
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
      <ListToolbar
        searchPlaceholder="Search by name, unit, or mobile"
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={true}
        onFilter={() => console.log('Filter clicked')}
        onExport={() => console.log('Export clicked')}
        onAdd={() => navigate('/vms/staff/create')}
        addLabel="Add"
      />

      {loading && staffList.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {!loading && filteredStaff.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Staff Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? `No staff match "${searchValue}"` : 'Start by adding your first staff member'}
          </p>
          <Link
            to="/vms/staff/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            + Add Staff
          </Link>
        </div>
      )}

      {filteredStaff.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((staff) => {
            const fullName = `${staff.firstname || ''} ${staff.lastname || ''}`.trim() || 'N/A';
            return (
              <div key={staff.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {staff.profile_picture?.url ? (
                        <img
                          src={domainPrefix + staff.profile_picture.url}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img src="/profile.png" alt="Default" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground truncate">{fullName}</h3>
                      <p className="text-xs text-muted-foreground">ID: {staff.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    staff.status ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {staff.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{staff.unit_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{staff.mobile_no || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{staff.work_type || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Link
                    to={`/vms/staff/${staff.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <Link
                    to={`/vms/staff/${staff.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredStaff.length > 0 && viewMode === 'table' && (
        <DataTable
          columns={columns}
          data={paginatedData}
          selectable
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
        />
      )}

      {/* Pagination */}
      {filteredStaff.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredStaff.length)} of {filteredStaff.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border hover:bg-accent'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VMSStaff;
