import React, { useState } from 'react';
import { Search, Filter, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

type TableStatus = 'available' | 'running' | 'billed';

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: TableStatus;
  orderDetails?: {
    orderNo: string;
    time: string;
    amount: number;
  };
}

interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

// Static data
const floorsData: Floor[] = [
  {
    id: 'ground',
    name: 'Ground Floor',
    tables: [
      { id: 1, number: 1, capacity: 4, status: 'available' },
      { id: 2, number: 2, capacity: 2, status: 'running', orderDetails: { orderNo: 'ORD-1024', time: '25 min', amount: 450 } },
      { id: 3, number: 3, capacity: 6, status: 'billed' },
      { id: 4, number: 4, capacity: 4, status: 'available' },
      { id: 5, number: 5, capacity: 4, status: 'running', orderDetails: { orderNo: 'ORD-1025', time: '10 min', amount: 320 } },
      { id: 6, number: 6, capacity: 2, status: 'available' },
    ]
  },
  {
    id: 'first',
    name: 'First Floor',
    tables: [
      { id: 7, number: 7, capacity: 4, status: 'available' },
      { id: 8, number: 8, capacity: 4, status: 'available' },
      { id: 9, number: 9, capacity: 6, status: 'running', orderDetails: { orderNo: 'ORD-1026', time: '40 min', amount: 890 } },
      { id: 10, number: 10, capacity: 2, status: 'available' },
    ]
  }
];

interface FBNewTableProps {
  onSelectTable?: (tableNumber: number) => void;
}

const FBNewTable: React.FC<FBNewTableProps> = ({ onSelectTable }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TableStatus>('all');

  const getStatusConfig = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-green-500',
          indicatorColor: 'text-green-500',
          cursor: 'cursor-pointer',
          hoverEffect: 'hover:scale-105 hover:shadow-lg',
        };
      case 'running':
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-500',
          indicatorColor: 'text-amber-500',
          cursor: 'cursor-not-allowed',
          hoverEffect: '',
        };
      case 'billed':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          indicatorColor: 'text-red-500',
          cursor: 'cursor-not-allowed',
          hoverEffect: '',
        };
    }
  };

  const handleTableClick = (table: Table) => {
    if (table.status === 'available') {
      toast.success(`Order started for Table ${table.number}`);
      onSelectTable?.(table.number);
    } else if (table.status === 'running') {
      toast.error('Table is already occupied');
    } else if (table.status === 'billed') {
      toast.error('Waiting for payment clearance');
    }
  };

  const filteredFloors = floorsData.map(floor => ({
    ...floor,
    tables: floor.tables.filter(table => {
      const matchesSearch = searchQuery === '' || table.number.toString().includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
  })).filter(floor => floor.tables.length > 0);

  return (
    <div className="p-6 bg-background min-h-[600px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Select Table to Start Order</h2>
        
        {/* Status Legend */}
        <div className="flex items-center gap-6 bg-card px-4 py-2 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 fill-green-500 text-green-500" />
            <span className="text-sm text-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-sm text-foreground">Running</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 fill-red-500 text-red-500" />
            <span className="text-sm text-foreground">Billed</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by table number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | TableStatus)}
            className="pl-10 pr-8 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none min-w-[150px]"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="running">Running</option>
            <option value="billed">Billed</option>
          </select>
        </div>
      </div>

      {/* Floor Sections */}
      <div className="space-y-10">
        {filteredFloors.map(floor => (
          <div key={floor.id}>
            {/* Floor Header */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">
                {floor.name}
              </h3>
              <div className="h-1 w-24 bg-primary mt-2 rounded-full"></div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {floor.tables.map(table => {
                const config = getStatusConfig(table.status);
                return (
                  <div
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${config.bgColor} ${config.borderColor} ${config.cursor} ${config.hoverEffect} group`}
                  >
                    {/* Table Number */}
                    <div className="text-center mb-3">
                      <span className="text-2xl font-bold text-foreground">T{table.number}</span>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex justify-center mb-3">
                      <Circle className={`w-6 h-6 ${config.indicatorColor} fill-current`} />
                    </div>

                    {/* Capacity */}
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">{table.capacity} ppl</span>
                    </div>

                    {/* Tooltip for Running Tables */}
                    {table.status === 'running' && table.orderDetails && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        <div>Order: {table.orderDetails.orderNo}</div>
                        <div>Time: {table.orderDetails.time}</div>
                        <div>Amount: ₹{table.orderDetails.amount}</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
                      </div>
                    )}

                    {/* Tooltip for Billed Tables */}
                    {table.status === 'billed' && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        Payment pending
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredFloors.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No tables found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default FBNewTable;
