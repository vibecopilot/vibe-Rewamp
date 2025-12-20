import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ListToolbar from '../../components/ui/ListToolbar';
import DataTable, { TableColumn } from '../../components/ui/DataTable';
import { Loader2, Package, AlertCircle, RefreshCw, Eye, Edit2, Truck, User, Clock } from 'lucide-react';
import { getGoods } from '../../api';
import { dateFormat, formatTime } from '../../utils/dateUtils';

interface GoodsItem {
  id: number;
  ward_type?: 'in' | 'out';
  person_name?: { name: string } | string;
  vehicle_no?: string;
  goods_in_time?: string;
  goods_out_time?: string;
  created_at?: string;
}

type SubTab = 'inwards' | 'outwards';

const GRID_PAGE_SIZE = 12;
const LIST_PAGE_SIZE = 10;

const VMSGoodsInOut: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SubTab>('inwards');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [goodsIn, setGoodsIn] = useState<GoodsItem[]>([]);
  const [goodsOut, setGoodsOut] = useState<GoodsItem[]>([]);
  const [filteredData, setFilteredData] = useState<GoodsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = viewMode === 'grid' ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;

  const fetchGoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getGoods();
      // Ensure data is an array - handle different API response formats
      const rawData = response?.data;
      const data = Array.isArray(rawData) 
        ? rawData 
        : Array.isArray(rawData?.goods) 
          ? rawData.goods 
          : Array.isArray(rawData?.data) 
            ? rawData.data 
            : [];
      
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
      const filtered = sourceData.filter((item) => {
        const personName = typeof item.person_name === 'object' ? item.person_name?.name : item.person_name;
        return (
          personName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.vehicle_no?.toLowerCase().includes(searchValue.toLowerCase())
        );
      });
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  }, [activeTab, goodsIn, goodsOut, searchValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleTabChange = (tab: SubTab) => {
    setActiveTab(tab);
    setSearchValue('');
    setSelectedRows([]);
    setCurrentPage(1);
  };

  const getPersonName = (item: GoodsItem): string => {
    if (typeof item.person_name === 'object') {
      return item.person_name?.name || '-';
    }
    return item.person_name || '-';
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentPageIds = paginatedData.map(g => String(g.id));
    const allSelected = currentPageIds.every(id => selectedRows.includes(id));
    if (allSelected) {
      setSelectedRows(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedRows(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const columns: TableColumn<GoodsItem>[] = [
    {
      key: 'actions',
      header: 'ACTION',
      width: '80px',
      render: (_, row) => (
        <Link to={`/vms/goods-in-out/${row.id}`} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors inline-flex">
          <Eye className="w-4 h-4" />
        </Link>
      ),
    },
    {
      key: 'ward_type',
      header: 'TYPE',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'in' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
        }`}>
          {value === 'in' ? 'Inward' : 'Outward'}
        </span>
      ),
    },
    {
      key: 'person_name',
      header: 'PERSON NAME',
      sortable: true,
      render: (_, row) => getPersonName(row),
    },
    { key: 'vehicle_no', header: 'VEHICLE NUMBER', sortable: true, render: (v) => v || '-' },
    {
      key: 'goods_in_time',
      header: 'GOODS IN TIME',
      sortable: true,
      render: (value) => value ? formatTime(value) : '-',
    },
    {
      key: 'goods_out_time',
      header: 'GOODS OUT TIME',
      sortable: true,
      render: (value) => value ? formatTime(value) : '-',
    },
    {
      key: 'created_at',
      header: 'CREATED ON',
      sortable: true,
      render: (value) => value ? dateFormat(value) : '-',
    },
  ];

  const subTabs: { id: SubTab; label: string; count: number }[] = [
    { id: 'inwards', label: 'Inwards', count: goodsIn.length },
    { id: 'outwards', label: 'Outwards', count: goodsOut.length },
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
      <div className="flex gap-1 border-b border-border mb-4">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <ListToolbar
        searchPlaceholder="Search by name, vehicle number"
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={true}
        onFilter={() => console.log('Filter clicked')}
        onExport={() => console.log('Export clicked')}
        onAdd={() => navigate('/vms/goods-in-out/create')}
        addLabel="Add"
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
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedData.map((item) => {
                const personName = getPersonName(item);
                return (
                  <div key={item.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground truncate">{personName}</h3>
                          <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        item.ward_type === 'in' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}>
                        {item.ward_type === 'in' ? 'Inward' : 'Outward'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.vehicle_no || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          In: {item.goods_in_time ? formatTime(item.goods_in_time) : '-'} | Out: {item.goods_out_time ? formatTime(item.goods_out_time) : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Link
                        to={`/vms/goods-in-out/${item.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <Link
                        to={`/vms/goods-in-out/${item.id}/edit`}
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
          ) : (
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
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
      )}
    </>
  );
};

export default VMSGoodsInOut;
