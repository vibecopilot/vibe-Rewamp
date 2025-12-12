import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ListToolbar from '../../../components/list/ListToolbar';
import DataTable from '../../../components/table/DataTable';
import { getoutbound, deleteOutbound } from '../../../api';
import { useViewMode } from '../../../hooks/useViewMode';

interface OutboundPackage {
  id: number;
  vendor_id: number;
  recipient_name: string;
  unit: string;
  entity: string;
  awb_number: string;
  mail_outbound_type: string;
  sending_date: string;
}

const OutboundList: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode, recordsPerPage } = useViewMode();
  const [packages, setPackages] = useState<OutboundPackage[]>([]);
  const [filteredData, setFilteredData] = useState<OutboundPackage[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getoutbound();
      setPackages(response.data || []);
      setFilteredData(response.data || []);
    } catch (error) {
      console.error('Error fetching outbound packages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = packages.filter((item) =>
      item.recipient_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleRemove = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteOutbound(id);
      toast.success('Package deleted');
      fetchPackages();
    } catch { toast.error('Failed to delete'); }
  };

  const columns = [
    { name: 'VIEW', width: '80px', cell: (row: OutboundPackage) => <button onClick={() => navigate(`/mail-room/outbound/${row.id}`)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary"><Eye size={16} /></button> },
    { name: 'ID', selector: (row: OutboundPackage) => row.id, sortable: true, width: '80px' },
    { name: 'RECIPIENT', selector: (row: OutboundPackage) => row.recipient_name || '-', sortable: true },
    { name: 'UNIT', selector: (row: OutboundPackage) => row.unit || '-', sortable: true },
    { name: 'ENTITY', selector: (row: OutboundPackage) => row.entity || '-', sortable: true },
    { name: 'VENDOR ID', selector: (row: OutboundPackage) => row.vendor_id || '-', sortable: true },
    { name: 'AWB NUMBER', selector: (row: OutboundPackage) => row.awb_number || '-', sortable: true },
    { name: 'PACKAGE TYPE', selector: (row: OutboundPackage) => row.mail_outbound_type || '-', sortable: true },
    { name: 'SENDING DATE', selector: (row: OutboundPackage) => row.sending_date || '-', sortable: true },
    { name: 'REMOVE', width: '100px', cell: (row: OutboundPackage) => <button onClick={() => handleRemove(row.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button> },
  ];

  return (
    <div>
      <ListToolbar searchPlaceholder="Search By Sender name" searchValue={searchText} onSearchChange={handleSearch} viewMode={viewMode} onViewModeChange={setViewMode} showViewToggle showAddButton addButtonLabel="Add" onAddClick={() => navigate('/mail-room/outbound/create')} showFilter={false} showExport={false} />
      <DataTable columns={columns} data={filteredData} loading={loading} pagination paginationPerPage={recordsPerPage} />
    </div>
  );
};

export default OutboundList;
