import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import { Loader2, Users, AlertCircle, RefreshCw, Eye, Edit2 } from 'lucide-react';
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
}

const VMSStaff: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (selectedRows.length === filteredStaff.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredStaff.map(s => String(s.id)));
    }
  };

  const columns: TableColumn<Staff>[] = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Link to={`/vms/staff/${row.id}`} className="text-muted-foreground hover:text-primary">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/vms/staff/${row.id}/edit`} className="text-muted-foreground hover:text-primary">
            <Edit2 className="w-4 h-4" />
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

      {filteredStaff.length > 0 && (
        <DataTable
          columns={columns}
          data={filteredStaff}
          selectable
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          viewPath={(row) => `/vms/staff/${row.id}`}
        />
      )}
    </>
  );
};

export default VMSStaff;
