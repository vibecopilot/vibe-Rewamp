import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import { Loader2, Car, AlertCircle, RefreshCw, Eye, Edit2 } from 'lucide-react';
import { getRegisteredVehicle } from '../../api';

interface RegisteredVehicle {
  id: number;
  vehicle_number: string;
  category?: string;
  slot_name?: string;
  vehicle_category?: string;
  vehicle_type?: string;
  sticker_number?: string;
  registration_number?: string;
  insurance_number?: string;
  insurance_valid_till?: string;
  created_at?: string;
}

const VMSRegisteredVehicles: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<RegisteredVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<RegisteredVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRegisteredVehicle();
      const data = response.data;
      const sortedData = Array.isArray(data) 
        ? data.sort((a: RegisteredVehicle, b: RegisteredVehicle) => 
            new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
          )
        : [];
      setVehicles(sortedData);
      setFilteredVehicles(sortedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vehicles';
      setError(errorMessage);
      setVehicles([]);
      setFilteredVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim() === '') {
      setFilteredVehicles(vehicles);
    } else {
      const filtered = vehicles.filter((item) =>
        item.vehicle_number?.toLowerCase().includes(value.toLowerCase()) ||
        item.slot_name?.toLowerCase().includes(value.toLowerCase()) ||
        item.sticker_number?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredVehicles(filtered);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredVehicles.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredVehicles.map(v => String(v.id)));
    }
  };

  const columns: TableColumn<RegisteredVehicle>[] = [
    {
      key: 'actions',
      header: 'Action',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Link to={`/vms/registered-vehicles/${row.id}`} className="text-muted-foreground hover:text-primary">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/vms/registered-vehicles/${row.id}/edit`} className="text-muted-foreground hover:text-primary">
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
    { key: 'vehicle_number', header: 'Vehicle Number', sortable: true },
    { key: 'category', header: 'Category', sortable: true, render: (value) => value || '-' },
    { key: 'slot_name', header: 'Parking Slot', sortable: true, render: (value) => value || '-' },
    { key: 'vehicle_category', header: 'Vehicle Category', sortable: true, render: (value) => value || '-' },
    { key: 'vehicle_type', header: 'Vehicle Type', sortable: true, render: (value) => value || '-' },
    { key: 'sticker_number', header: 'Sticker Number', sortable: true, render: (value) => value || '-' },
    { key: 'registration_number', header: 'Registration Number', sortable: true, render: (value) => value || '-' },
    { key: 'insurance_number', header: 'Insurance Number', sortable: true, render: (value) => value || '-' },
  ];

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading registered vehicles...</p>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Vehicles</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchVehicles}
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
        searchPlaceholder="Search by vehicle number, parking slot, sticker number..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        onFilter={() => console.log('Filter clicked')}
        onExport={() => console.log('Export clicked')}
        onAdd={() => navigate('/vms/registered-vehicles/create')}
        addLabel="Add Vehicle"
      />

      {loading && vehicles.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {!loading && filteredVehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <Car className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Vehicles Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? `No vehicles match "${searchValue}"` : 'Start by adding your first vehicle'}
          </p>
          <Link
            to="/vms/registered-vehicles/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            + Add Vehicle
          </Link>
        </div>
      )}

      {filteredVehicles.length > 0 && (
        <DataTable
          columns={columns}
          data={filteredVehicles}
          selectable
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          viewPath={(row) => `/vms/registered-vehicles/${row.id}`}
        />
      )}
    </>
  );
};

export default VMSRegisteredVehicles;
