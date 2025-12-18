import React, { useState } from 'react';
import { Search, Filter, Circle, Eye, Clock, User, CreditCard, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

type TableStatus = 'available' | 'running' | 'billed';

interface TableData {
  id: number;
  number: number;
  floor: string;
  floorId: string;
  capacity: number;
  status: TableStatus;
  lastUsed?: string;
  orderDetails?: {
    orderId: string;
    startedAgo: string;
    amount: number;
    waiter: string;
  };
}

// Static data
const tablesData: TableData[] = [
  // Ground Floor
  { id: 1, number: 1, floor: 'Ground Floor', floorId: 'ground', capacity: 4, status: 'available', lastUsed: '2 hours ago' },
  { id: 2, number: 2, floor: 'Ground Floor', floorId: 'ground', capacity: 2, status: 'running', orderDetails: { orderId: '#1234', startedAgo: '25 mins', amount: 850, waiter: 'Raj Kumar' } },
  { id: 3, number: 3, floor: 'Ground Floor', floorId: 'ground', capacity: 6, status: 'billed', orderDetails: { orderId: '#1233', startedAgo: '45 mins', amount: 1240, waiter: 'Sam Singh' } },
  { id: 4, number: 4, floor: 'Ground Floor', floorId: 'ground', capacity: 4, status: 'available', lastUsed: '1 hour ago' },
  { id: 5, number: 5, floor: 'Ground Floor', floorId: 'ground', capacity: 4, status: 'running', orderDetails: { orderId: '#1235', startedAgo: '15 mins', amount: 650, waiter: 'Sam Singh' } },
  { id: 6, number: 6, floor: 'Ground Floor', floorId: 'ground', capacity: 2, status: 'available', lastUsed: '3 hours ago' },
  // First Floor
  { id: 7, number: 7, floor: 'First Floor', floorId: 'first', capacity: 4, status: 'available', lastUsed: '4 hours ago' },
  { id: 8, number: 8, floor: 'First Floor', floorId: 'first', capacity: 4, status: 'available', lastUsed: '5 hours ago' },
  { id: 9, number: 9, floor: 'First Floor', floorId: 'first', capacity: 6, status: 'running', orderDetails: { orderId: '#1236', startedAgo: '40 mins', amount: 1100, waiter: 'Raj Kumar' } },
  { id: 10, number: 10, floor: 'First Floor', floorId: 'first', capacity: 2, status: 'available', lastUsed: '30 mins ago' },
];

interface FBTablesProps {
  onViewOrder?: (tableNumber: number) => void;
}

const FBTables: React.FC<FBTablesProps> = ({ onViewOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState<'all' | 'ground' | 'first'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TableStatus>('all');
  const [tables, setTables] = useState(tablesData);
  const [lastUpdated, setLastUpdated] = useState('Just now');

  const getStatusConfig = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-green-500',
          indicatorColor: 'text-green-500',
          label: 'Available',
        };
      case 'running':
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-500',
          indicatorColor: 'text-amber-500',
          label: 'Running',
        };
      case 'billed':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          indicatorColor: 'text-red-500',
          label: 'Billed',
        };
    }
  };

  // Calculate stats
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    running: tables.filter(t => t.status === 'running').length,
    billed: tables.filter(t => t.status === 'billed').length,
  };

  // Filter tables
  const filteredTables = tables.filter(table => {
    const matchesSearch = searchQuery === '' || table.number.toString().includes(searchQuery);
    const matchesFloor = floorFilter === 'all' || table.floorId === floorFilter;
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    return matchesSearch && matchesFloor && matchesStatus;
  });

  // Group by floor
  const groupedTables = filteredTables.reduce((acc, table) => {
    if (!acc[table.floor]) acc[table.floor] = [];
    acc[table.floor].push(table);
    return acc;
  }, {} as Record<string, TableData[]>);

  const handleViewOrder = (table: TableData) => {
    toast.success(`Viewing order for Table ${table.number}`);
    onViewOrder?.(table.number);
  };

  const handleCompletePayment = (table: TableData) => {
    setTables(prev => prev.map(t => 
      t.id === table.id ? { ...t, status: 'available' as TableStatus, lastUsed: 'Just now', orderDetails: undefined } : t
    ));
    toast.success(`Payment completed for Table ${table.number}`);
  };

  const handleRefresh = () => {
    setLastUpdated('Just now');
    toast.success('Tables refreshed');
  };

  return (
    <div className="p-6 bg-background min-h-[600px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Table Status Monitor</h2>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Last updated: {lastUpdated}</span>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Tables</div>
        </div>
        <div className="bg-card border border-green-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="text-sm text-muted-foreground">Available</div>
        </div>
        <div className="bg-card border border-amber-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.running}</div>
          <div className="text-sm text-muted-foreground">Running</div>
        </div>
        <div className="bg-card border border-red-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.billed}</div>
          <div className="text-sm text-muted-foreground">Billed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-card border border-border rounded-lg p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by table number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value as 'all' | 'ground' | 'first')}
            className="pl-10 pr-8 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none min-w-[160px]"
          >
            <option value="all">All Floors</option>
            <option value="ground">Ground Floor</option>
            <option value="first">First Floor</option>
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | TableStatus)}
          className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="running">Running</option>
          <option value="billed">Billed</option>
        </select>
      </div>

      {/* Tables by Floor */}
      <div className="space-y-10">
        {Object.entries(groupedTables).map(([floor, floorTables]) => (
          <div key={floor}>
            {/* Floor Header */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">
                {floor}
              </h3>
              <div className="h-1 w-24 bg-primary mt-2 rounded-full"></div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {floorTables.map(table => {
                const config = getStatusConfig(table.status);
                return (
                  <div
                    key={table.id}
                    className={`rounded-xl border-2 transition-all duration-200 ${config.bgColor} ${config.borderColor} overflow-hidden`}
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-foreground">T{table.number}</span>
                        <span className="text-xs text-muted-foreground">{table.floor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Circle className={`w-4 h-4 ${config.indicatorColor} fill-current`} />
                        <span className={`text-sm font-medium ${config.indicatorColor}`}>{config.label}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Capacity: {table.capacity} people</span>
                      </div>

                      {table.status === 'available' && table.lastUsed && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Last used: {table.lastUsed}</span>
                        </div>
                      )}

                      {table.status === 'running' && table.orderDetails && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <span className="font-medium">Order {table.orderDetails.orderId}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Started: {table.orderDetails.startedAgo} ago</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <CreditCard className="w-4 h-4" />
                            <span>₹{table.orderDetails.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>Waiter: {table.orderDetails.waiter}</span>
                          </div>
                        </>
                      )}

                      {table.status === 'billed' && table.orderDetails && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <span className="font-medium">Order {table.orderDetails.orderId}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <CreditCard className="w-4 h-4" />
                            <span>₹{table.orderDetails.amount.toLocaleString()}</span>
                          </div>
                          <div className="text-sm text-red-600 font-medium">
                            Waiting for payment
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    {table.status === 'running' && (
                      <div className="p-4 pt-0">
                        <button
                          onClick={() => handleViewOrder(table)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View Order
                        </button>
                      </div>
                    )}

                    {table.status === 'billed' && (
                      <div className="p-4 pt-0">
                        <button
                          onClick={() => handleCompletePayment(table)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          <CreditCard className="w-4 h-4" />
                          Complete Payment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedTables).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No tables found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default FBTables;
