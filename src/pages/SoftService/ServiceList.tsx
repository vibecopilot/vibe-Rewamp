import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ListToolbar from '../../components/ui/ListToolbar';
import DataCard from '../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import { 
  getSoftServices, 
  softServiceDownloadQrCode, 
  getSoftServiceDownload 
} from '../../api';
import { Loader2, Wrench, AlertCircle, RefreshCw, Eye, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SoftService {
  id: number | string;
  name: string;
  building_name?: string;
  floor_name?: string;
  unit_name?: string;
  created_by?: string;
  created_at?: string;
  status?: string;
}

const ServiceList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [services, setServices] = useState<SoftService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getPerPage = (mode: 'grid' | 'table') => mode === 'grid' ? 12 : 10;
  const [pagination, setPagination] = useState({ page: 1, perPage: getPerPage('grid'), total: 0, totalPages: 0 });

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage: getPerPage(viewMode), page: 1 }));
  }, [viewMode]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSoftServices();
      const data = response.data;
      const serviceList = Array.isArray(data) ? data : data?.soft_services || data?.data || [];
      
      // Filter by search
      const filtered = searchValue 
        ? serviceList.filter((s: SoftService) => 
            s.name?.toLowerCase().includes(searchValue.toLowerCase())
          )
        : serviceList;
      
      setServices(filtered);
      setPagination(prev => ({
        ...prev,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [searchValue]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleExport = async () => {
    try {
      const response = await getSoftServiceDownload();
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'soft_services.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export successful');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleQrCode = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    try {
      const response = await softServiceDownloadQrCode(selectedRows);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qr_codes.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('QR Codes downloaded');
    } catch (error) {
      toast.error('Failed to download QR codes');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const paginatedServices = services.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  const columns: TableColumn<SoftService>[] = [
    { 
      key: 'actions', 
      header: 'ACTION', 
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link to={`/soft-services/${row.id}`} className="p-1.5 rounded-md hover:bg-accent text-primary">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/soft-services/${row.id}/edit`} className="p-1.5 rounded-md hover:bg-accent text-primary">
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      )
    },
    { key: 'name', header: 'SERVICE NAME', sortable: true },
    { key: 'building_name', header: 'BUILDING', render: (v) => v || '-' },
    { key: 'floor_name', header: 'FLOOR', render: (v) => v || '-' },
    { key: 'unit_name', header: 'UNIT', render: (v) => v || '-' },
    { key: 'created_by', header: 'CREATED BY', render: (v) => v || '-' },
    { key: 'created_at', header: 'CREATED ON', render: (v) => formatDate(v) },
  ];

  if (loading && services.length === 0) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Service' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="p-6">
        <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Service' }]} />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Services</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchServices} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'FM Module' }, { label: 'Soft Services', path: '/soft-services' }, { label: 'Service' }]} />

      <ListToolbar
        searchPlaceholder="Search By Service name"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        onAdd={() => navigate('/soft-services/create')}
        addLabel="Add"
        showQrCode
        onQrCode={handleQrCode}
      />

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}

      {!loading && paginatedServices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <Wrench className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
          <Link to="/soft-services/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Service</Link>
        </div>
      )}

      {viewMode === 'grid' && paginatedServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedServices.map((service) => (
            <DataCard 
              key={service.id} 
              title={service.name} 
              subtitle={`Building: ${service.building_name || '-'}`}
              fields={[
                { label: 'Floor', value: service.floor_name || '-' },
                { label: 'Unit', value: service.unit_name || '-' },
                { label: 'Created By', value: service.created_by || '-' },
                { label: 'Created On', value: formatDate(service.created_at) },
              ]} 
              viewPath={`/soft-services/${service.id}`} 
              editPath={`/soft-services/${service.id}/edit`} 
            />
          ))}
        </div>
      ) : paginatedServices.length > 0 && (
        <DataTable 
          columns={columns} 
          data={paginatedServices} 
          selectable 
          selectedRows={selectedRows} 
          onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])} 
          onSelectAll={() => setSelectedRows(selectedRows.length === paginatedServices.length ? [] : paginatedServices.map(s => String(s.id)))} 
        />
      )}

      {services.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
          <select 
            value={pagination.perPage} 
            onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} 
            className="px-2 py-1.5 text-sm border border-border rounded-md bg-background"
          >
            <option value={10}>10</option>
            <option value={12}>12</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default ServiceList;
