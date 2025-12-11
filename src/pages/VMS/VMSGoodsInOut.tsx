import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import { Loader2, Package, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { getGoods } from '../../api';
import { dateFormat, formatTime } from '../../utils/dateUtils';

interface GoodsItem {
  id: number;
  ward_type?: 'in' | 'out';
  person_name?: { name: string };
  vehicle_no?: string;
  goods_in_time?: string;
  goods_out_time?: string;
  created_at?: string;
}

const VMSGoodsInOut: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inwards' | 'outwards'>('inwards');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [allGoods, setAllGoods] = useState<GoodsItem[]>([]);
  const [goodsIn, setGoodsIn] = useState<GoodsItem[]>([]);
  const [goodsOut, setGoodsOut] = useState<GoodsItem[]>([]);
  const [filteredData, setFilteredData] = useState<GoodsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getGoods();
      const data = response.data || [];
      setAllGoods(data);
      
      const inwards = data.filter((g: GoodsItem) => g.ward_type === 'in');
      const outwards = data.filter((g: GoodsItem) => g.ward_type === 'out');
      
      setGoodsIn(inwards);
      setGoodsOut(outwards);
      setFilteredData(activeTab === 'inwards' ? inwards : outwards);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch goods';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchGoods();
  }, []);

  useEffect(() => {
    const sourceData = activeTab === 'inwards' ? goodsIn : goodsOut;
    if (searchValue.trim() === '') {
      setFilteredData(sourceData);
    } else {
      const filtered = sourceData.filter((item) =>
        item.person_name?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.vehicle_no?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [activeTab, goodsIn, goodsOut, searchValue]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleTabChange = (tab: 'inwards' | 'outwards') => {
    setActiveTab(tab);
    setSearchValue('');
    setSelectedRows([]);
  };

  const columns: TableColumn<GoodsItem>[] = [
    {
      key: 'actions',
      header: 'Action',
      width: '80px',
      render: (_, row) => (
        <Link to={`/vms/goods-in-out/${row.id}`} className="text-muted-foreground hover:text-primary">
          <Eye className="w-4 h-4" />
        </Link>
      ),
    },
    {
      key: 'ward_type',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'in' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {value === 'in' ? 'Inward' : 'Outward'}
        </span>
      ),
    },
    {
      key: 'person_name',
      header: 'Person Name',
      sortable: true,
      render: (value) => value?.name || '-',
    },
    { key: 'vehicle_no', header: 'Vehicle Number', sortable: true, render: (v) => v || '-' },
    {
      key: 'goods_in_time',
      header: 'Goods In Time',
      sortable: true,
      render: (value) => value ? formatTime(value) : '-',
    },
    {
      key: 'goods_out_time',
      header: 'Goods Out Time',
      sortable: true,
      render: (value) => value ? formatTime(value) : '-',
    },
    {
      key: 'created_at',
      header: 'Created On',
      sortable: true,
      render: (value) => value ? dateFormat(value) : '-',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading goods data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Data</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchGoods}
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
      {/* Sub-tabs */}
      <div className="flex gap-4 border-b border-border mb-4">
        <button
          onClick={() => handleTabChange('inwards')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'inwards'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Inwards ({goodsIn.length})
        </button>
        <button
          onClick={() => handleTabChange('outwards')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'outwards'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Outwards ({goodsOut.length})
        </button>
      </div>

      <ListToolbar
        searchPlaceholder="Search by name, vehicle number..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        onFilter={() => console.log('Filter clicked')}
        onExport={() => console.log('Export clicked')}
        onAdd={() => navigate('/vms/goods-in-out/create')}
        addLabel="Add Goods"
      />

      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No {activeTab === 'inwards' ? 'Inward' : 'Outward'} Goods
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchValue ? `No goods match "${searchValue}"` : `No ${activeTab} goods records available`}
          </p>
          <Link
            to="/vms/goods-in-out/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            + Add Goods
          </Link>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          selectable
          selectedRows={selectedRows}
          onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])}
          onSelectAll={() => setSelectedRows(prev => prev.length === filteredData.length ? [] : filteredData.map(g => String(g.id)))}
          viewPath={(row) => `/vms/goods-in-out/${row.id}`}
        />
      )}
    </>
  );
};

export default VMSGoodsInOut;
