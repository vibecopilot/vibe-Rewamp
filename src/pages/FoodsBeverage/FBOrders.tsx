import React, { useState, useMemo } from 'react';
import { Search, Grid, List, Eye, Download, Printer, X, Clock, User, MapPin, Phone, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  tableType: string;
  customer: string;
  phone: string;
  time: string;
  items: number;
  amount: number;
  status: 'Running' | 'Completed' | 'Cancelled';
  type: 'Dine-in' | 'Delivery' | 'Takeaway';
  address?: string;
  orderItems: { name: string; qty: number; price: number }[];
}

const staticOrders: Order[] = [
  { id: '1234', tableType: 'Table 5', customer: 'Rahul Sharma', phone: '9876543210', time: '12:30 PM', items: 5, amount: 850, status: 'Running', type: 'Dine-in', orderItems: [{ name: 'Paneer Tikka', qty: 2, price: 250 }, { name: 'Butter Chicken', qty: 1, price: 320 }, { name: 'Naan', qty: 2, price: 40 }] },
  { id: '1235', tableType: 'Delivery', customer: 'Priya Singh', phone: '9876543211', time: '12:35 PM', items: 8, amount: 1200, status: 'Completed', type: 'Delivery', address: '123, Main Street, Delhi', orderItems: [{ name: 'Biryani', qty: 2, price: 350 }, { name: 'Raita', qty: 2, price: 50 }] },
  { id: '1236', tableType: 'Takeaway', customer: 'Amit Kumar', phone: '9876543212', time: '12:40 PM', items: 3, amount: 450, status: 'Running', type: 'Takeaway', orderItems: [{ name: 'Veg Thali', qty: 1, price: 250 }, { name: 'Lassi', qty: 2, price: 100 }] },
  { id: '1237', tableType: 'Table 2', customer: 'Sita Devi', phone: '9876543213', time: '12:45 PM', items: 4, amount: 650, status: 'Cancelled', type: 'Dine-in', orderItems: [{ name: 'Dal Makhani', qty: 1, price: 220 }, { name: 'Roti', qty: 4, price: 20 }] },
  { id: '1238', tableType: 'Table 8', customer: 'Raj Verma', phone: '9876543214', time: '12:50 PM', items: 6, amount: 980, status: 'Running', type: 'Dine-in', orderItems: [{ name: 'Mutton Curry', qty: 1, price: 450 }, { name: 'Rice', qty: 2, price: 80 }] },
  { id: '1239', tableType: 'Delivery', customer: 'Neha Gupta', phone: '9876543215', time: '12:55 PM', items: 7, amount: 1350, status: 'Completed', type: 'Delivery', address: '456, Park Avenue, Mumbai', orderItems: [{ name: 'Fish Curry', qty: 2, price: 380 }, { name: 'Prawn Fry', qty: 1, price: 420 }] },
  { id: '1240', tableType: 'Table 12', customer: 'Arun Sharma', phone: '9876543216', time: '1:00 PM', items: 9, amount: 2100, status: 'Running', type: 'Dine-in', orderItems: [{ name: 'Tandoori Platter', qty: 1, price: 850 }, { name: 'Kebab', qty: 3, price: 280 }] },
  { id: '1241', tableType: 'Takeaway', customer: 'Pooja Reddy', phone: '9876543217', time: '1:05 PM', items: 2, amount: 280, status: 'Completed', type: 'Takeaway', orderItems: [{ name: 'Samosa', qty: 4, price: 40 }, { name: 'Chai', qty: 2, price: 30 }] },
  { id: '1242', tableType: 'Delivery', customer: 'Karan Singh', phone: '9876543218', time: '1:10 PM', items: 5, amount: 890, status: 'Running', type: 'Delivery', address: '789, Lake Road, Bangalore', orderItems: [{ name: 'Chicken Biryani', qty: 2, price: 320 }, { name: 'Coke', qty: 2, price: 60 }] },
  { id: '1243', tableType: 'Table 3', customer: 'Meera Jain', phone: '9876543219', time: '1:15 PM', items: 4, amount: 720, status: 'Completed', type: 'Dine-in', orderItems: [{ name: 'Paneer Butter Masala', qty: 1, price: 280 }, { name: 'Jeera Rice', qty: 2, price: 120 }] },
  { id: '1244', tableType: 'Table 7', customer: 'Vikram Patel', phone: '9876543220', time: '1:20 PM', items: 8, amount: 1560, status: 'Running', type: 'Dine-in', orderItems: [{ name: 'Mixed Grill', qty: 1, price: 680 }, { name: 'Naan', qty: 4, price: 40 }] },
  { id: '1245', tableType: 'Delivery', customer: 'Anjali Desai', phone: '9876543221', time: '1:25 PM', items: 6, amount: 1100, status: 'Completed', type: 'Delivery', address: '321, MG Road, Chennai', orderItems: [{ name: 'South Indian Thali', qty: 2, price: 380 }, { name: 'Filter Coffee', qty: 2, price: 80 }] },
  { id: '1246', tableType: 'Takeaway', customer: 'Suresh Kumar', phone: '9876543222', time: '1:30 PM', items: 3, amount: 420, status: 'Cancelled', type: 'Takeaway', orderItems: [{ name: 'Dosa', qty: 2, price: 150 }, { name: 'Vada', qty: 2, price: 60 }] },
  { id: '1247', tableType: 'Table 9', customer: 'Deepak Rao', phone: '9876543223', time: '1:35 PM', items: 7, amount: 1280, status: 'Running', type: 'Dine-in', orderItems: [{ name: 'Lamb Rogan Josh', qty: 1, price: 480 }, { name: 'Butter Naan', qty: 3, price: 50 }] },
  { id: '1248', tableType: 'Delivery', customer: 'Kavita Shah', phone: '9876543224', time: '1:40 PM', items: 4, amount: 680, status: 'Completed', type: 'Delivery', address: '567, Civil Lines, Hyderabad', orderItems: [{ name: 'Hyderabadi Biryani', qty: 1, price: 380 }, { name: 'Mirchi Ka Salan', qty: 1, price: 120 }] },
  { id: '1249', tableType: 'Table 6', customer: 'Ravi Mehta', phone: '9876543225', time: '1:45 PM', items: 5, amount: 850, status: 'Running', type: 'Dine-in', orderItems: [{ name: 'Chicken Tikka', qty: 2, price: 280 }, { name: 'Rumali Roti', qty: 3, price: 30 }] },
  { id: '1250', tableType: 'Takeaway', customer: 'Sunita Nair', phone: '9876543226', time: '1:50 PM', items: 2, amount: 300, status: 'Completed', type: 'Takeaway', orderItems: [{ name: 'Idli', qty: 4, price: 40 }, { name: 'Sambar', qty: 1, price: 60 }] },
  { id: '1251', tableType: 'Delivery', customer: 'Manoj Agarwal', phone: '9876543227', time: '1:55 PM', items: 9, amount: 1890, status: 'Running', type: 'Delivery', address: '890, Ring Road, Pune', orderItems: [{ name: 'Family Combo', qty: 1, price: 1200 }, { name: 'Dessert Platter', qty: 1, price: 350 }] },
  { id: '1252', tableType: 'Table 4', customer: 'Geeta Pillai', phone: '9876543228', time: '2:00 PM', items: 6, amount: 1020, status: 'Completed', type: 'Dine-in', orderItems: [{ name: 'Fish Fry', qty: 2, price: 320 }, { name: 'Appam', qty: 4, price: 60 }] },
  { id: '1253', tableType: 'Table 10', customer: 'Ashok Reddy', phone: '9876543229', time: '2:05 PM', items: 8, amount: 1650, status: 'Running', type: 'Dine-in', orderItems: [{ name: 'Chettinad Chicken', qty: 1, price: 420 }, { name: 'Parotta', qty: 4, price: 40 }] },
];

const level4OrderTabs = [
  { id: 'all', label: 'All Orders' },
  { id: 'running', label: 'Running' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const dateFilterOptions = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom'];
const typeFilterOptions = ['All Types', 'Dine-in', 'Delivery', 'Takeaway'];

const FBOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Today');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const recordsPerPage = viewMode === 'list' ? 10 : 12;

  // Filter orders
  const filteredOrders = useMemo(() => {
    let orders = [...staticOrders];

    // Filter by tab
    if (activeTab !== 'all') {
      orders = orders.filter(o => o.status.toLowerCase() === activeTab);
    }

    // Filter by type
    if (typeFilter !== 'All Types') {
      orders = orders.filter(o => o.type === typeFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      orders = orders.filter(o =>
        o.id.includes(query) ||
        o.customer.toLowerCase().includes(query) ||
        o.phone.includes(query)
      );
    }

    return orders;
  }, [activeTab, typeFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Running': return 'bg-warning-light text-warning';
      case 'Completed': return 'bg-success-light text-success';
      case 'Cancelled': return 'bg-error-light text-error';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleExport = () => {
    toast.success('Exporting orders to Excel...');
  };

  const handlePrintBill = () => {
    toast.success('Printing bill...');
  };

  const handlePrintKOT = () => {
    toast.success('Printing KOT...');
  };

  const handleCancelOrder = () => {
    if (selectedOrder) {
      toast.success(`Order #${selectedOrder.id} cancelled`);
      setSelectedOrder(null);
    }
  };

  // Calculate order total details
  const getOrderBilling = (order: Order) => {
    const subtotal = order.orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const serviceCharge = subtotal * 0.05;
    const discount = 50;
    const total = subtotal + cgst + sgst + serviceCharge - discount;
    return { subtotal, cgst, sgst, serviceCharge, discount, total };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Level 4 - Order Sub-tabs */}
      <div className="flex items-center w-full border-b border-border bg-muted/30">
        <nav className="w-full overflow-x-auto scrollbar-hide">
          <ul className="flex items-center w-full">
            {level4OrderTabs.map(tab => (
              <li key={tab.id} className="flex-1 min-w-0">
                <button
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                  className={`w-full px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap uppercase tracking-wide text-center ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary bg-accent/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-muted">
                    {tab.id === 'all' ? staticOrders.length :
                     staticOrders.filter(o => o.status.toLowerCase() === tab.id).length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Controls Bar */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer, Phone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 w-72 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {dateFilterOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {typeFilterOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <FileText className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm">Try adjusting your filters or search query</p>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Table/Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Time</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Items</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, idx) => (
                  <tr key={order.id} className={`border-b border-border ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">#{order.id}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{order.tableType}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{order.customer}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{order.time}</td>
                    <td className="px-4 py-3 text-sm text-center text-foreground">{order.items}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">₹{order.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-primary hover:bg-accent rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedOrders.map(order => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-foreground">#{order.id}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-foreground font-medium">{order.tableType}</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {order.time}
                  </p>
                  <p className="text-muted-foreground">{order.items} items</p>
                  <p className="text-xl font-bold text-primary">₹{order.amount.toLocaleString()}</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" /> {order.customer}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mt-4 py-3 px-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page: {recordsPerPage}</span>
              <span className="mx-2">|</span>
              <span>
                {(currentPage - 1) * recordsPerPage + 1}-{Math.min(currentPage * recordsPerPage, filteredOrders.length)} of {filteredOrders.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-foreground">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-primary">
              <h2 className="text-lg font-bold text-white">Order #{selectedOrder.id} Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="text-sm font-medium text-foreground">#{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-medium text-foreground">Dec 18, 2025 {selectedOrder.time}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">{selectedOrder.type} ({selectedOrder.tableType})</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">KOT</p>
                  <p className="text-sm font-medium text-foreground">#10</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 border border-border rounded-lg">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Customer Info
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedOrder.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedOrder.phone}</span>
                  </div>
                  {selectedOrder.address && (
                    <div className="col-span-2 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-foreground">{selectedOrder.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-border rounded-lg overflow-hidden">
                <h3 className="text-sm font-semibold text-foreground p-3 bg-muted">Order Items</h3>
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Item</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderItems.map((item, idx) => (
                      <tr key={idx} className="border-t border-border">
                        <td className="px-4 py-2 text-sm text-foreground">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-center text-foreground">{item.qty}</td>
                        <td className="px-4 py-2 text-sm text-right text-foreground">₹{item.price}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-foreground">₹{item.price * item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Billing */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-semibold text-foreground mb-3">Billing Summary</h3>
                {(() => {
                  const billing = getOrderBilling(selectedOrder);
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">₹{billing.subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">CGST (2.5%)</span><span className="text-foreground">₹{billing.cgst.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">SGST (2.5%)</span><span className="text-foreground">₹{billing.sgst.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Service Charge (5%)</span><span className="text-foreground">₹{billing.serviceCharge.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-success">-₹{billing.discount.toFixed(2)}</span></div>
                      <div className="flex justify-between pt-2 border-t border-border font-bold">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary text-lg">₹{billing.total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 p-4 border border-border rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm font-medium text-foreground">Cash</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedOrder.status === 'Completed' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}`}>
                    {selectedOrder.status === 'Completed' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/30">
              <button
                onClick={handlePrintBill}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                <Printer className="w-4 h-4" /> Print Bill
              </button>
              <button
                onClick={handlePrintKOT}
                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-accent"
              >
                <Printer className="w-4 h-4" /> Print KOT
              </button>
              {selectedOrder.status === 'Running' && (
                <button
                  onClick={handleCancelOrder}
                  className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg text-sm font-medium hover:bg-error/90"
                >
                  <X className="w-4 h-4" /> Cancel Order
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-accent"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FBOrders;
