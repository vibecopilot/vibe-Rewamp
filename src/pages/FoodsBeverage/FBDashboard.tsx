import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, UtensilsCrossed,
  Clock, ChefHat, CheckCircle, Truck, Zap, ShoppingCart, ClipboardList,
  LayoutGrid, BarChart3, AlertTriangle, CreditCard, Banknote, Smartphone,
  Star, Calendar, Phone, ArrowRight, Package, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

// Get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Static data
const kpiData = [
  { id: 1, label: "Today's Revenue", value: '₹25,450', comparison: '+15%', trend: 'up', icon: DollarSign, color: 'bg-green-500' },
  { id: 2, label: 'Total Orders', value: '48', comparison: '+8 orders', trend: 'up', icon: ShoppingBag, color: 'bg-blue-500' },
  { id: 3, label: 'Customers Served', value: '135', comparison: '+22', trend: 'up', icon: Users, color: 'bg-purple-500' },
  { id: 4, label: 'Table Status', value: '8 Active', subInfo: '4 Available, 2 Reserved', icon: UtensilsCrossed, color: 'bg-orange-500' },
];

const liveStatus = [
  { label: 'Running Orders', value: 12, icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: 'In Kitchen', value: 8, icon: ChefHat, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Ready to Serve', value: 4, icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Out for Delivery', value: 3, icon: Truck, color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const runningTables = [
  { table: 5, status: 'active', bill: 850, items: 4, time: '25 min', waiter: 'Raj Kumar' },
  { table: 2, status: 'active', bill: 1240, items: 7, time: '45 min', waiter: 'Sam Patel' },
  { table: 8, status: 'billed', bill: 650, items: 3, time: '15 min', waiter: 'Raj Kumar' },
  { table: 12, status: 'active', bill: 2100, items: 9, time: '1h 10m', waiter: 'Sam Patel' },
];

const recentOrders = [
  { time: '12:45 PM', id: '#1248', type: 'Dine-in (Table 5)', items: 5, amount: 850, status: 'completed' },
  { time: '12:40 PM', id: '#1247', type: 'Delivery', items: 8, amount: 1520, status: 'delivery' },
  { time: '12:35 PM', id: '#1246', type: 'Takeaway', items: 3, amount: 420, status: 'completed' },
  { time: '12:30 PM', id: '#1245', type: 'Dine-in (Table 12)', items: 6, amount: 1100, status: 'completed' },
  { time: '12:25 PM', id: '#1244', type: 'Zomato', items: 4, amount: 680, status: 'delivered' },
  { time: '12:20 PM', id: '#1243', type: 'Dine-in (Table 3)', items: 5, amount: 720, status: 'completed' },
];

const salesData = [
  { hour: '9 AM', value: 800 },
  { hour: '10 AM', value: 1200 },
  { hour: '11 AM', value: 1800 },
  { hour: '12 PM', value: 2400 },
  { hour: '1 PM', value: 2850 },
  { hour: '2 PM', value: 2600 },
  { hour: '3 PM', value: 1400 },
  { hour: '4 PM', value: 800 },
  { hour: '5 PM', value: 1600 },
  { hour: '6 PM', value: 2200 },
  { hour: '7 PM', value: 2800 },
  { hour: '8 PM', value: 2400 },
];

const topItems = [
  { rank: 1, name: 'Butter Chicken', orders: 45, revenue: 14400, trend: '+12%', trendUp: true },
  { rank: 2, name: 'Paneer Tikka', orders: 38, revenue: 9500, trend: '+8%', trendUp: true },
  { rank: 3, name: 'Veg Biryani', orders: 32, revenue: 6400, trend: '-5%', trendUp: false },
  { rank: 4, name: 'Dal Makhani', orders: 28, revenue: 5040, trend: '+15%', trendUp: true },
  { rank: 5, name: 'Cold Coffee', orders: 25, revenue: 3000, trend: '0%', trendUp: null },
];

const lowStockItems = [
  { name: 'Chicken (Raw)', current: 3, min: 10, critical: true },
  { name: 'Paneer', current: 5, min: 8, critical: false },
  { name: 'Tomatoes', current: 2, min: 10, critical: true },
];

const paymentBreakdown = [
  { method: 'Cash', amount: 10200, percent: 40, icon: Banknote, color: 'bg-green-500' },
  { method: 'Card', amount: 8450, percent: 33, icon: CreditCard, color: 'bg-blue-500' },
  { method: 'UPI', amount: 6800, percent: 27, icon: Smartphone, color: 'bg-purple-500' },
];

const staffOnDuty = [
  { name: 'Raj Kumar', role: 'Waiter', checkIn: '9:00 AM', metric: 'Tables: 8', present: true },
  { name: 'Sam Patel', role: 'Waiter', checkIn: '9:05 AM', metric: 'Tables: 6', present: true },
  { name: 'Kumar', role: 'Chef', checkIn: '8:45 AM', metric: 'Orders: 42', present: true },
  { name: 'Sita Devi', role: 'Cashier', checkIn: '9:00 AM', metric: 'Bills: 35', present: true },
  { name: 'Priya Singh', role: 'Waiter', checkIn: '-', metric: '-', present: false },
];

const onlineOrders = [
  { platform: 'Swiggy', orders: 12, revenue: 4850, commission: 970 },
  { platform: 'Zomato', orders: 8, revenue: 3200, commission: 640 },
];

const reviews = [
  { rating: 5, time: '12:30 PM', order: '#1245', comment: 'Amazing butter chicken! Best in the area.', customer: 'Rahul Sharma' },
  { rating: 4, time: '11:45 AM', order: '#1243', comment: 'Good food but service was slow.', customer: 'Priya Singh' },
  { rating: 5, time: '10:30 AM', order: '#1240', comment: 'Excellent paneer tikka. Will order again!', customer: 'Amit Kumar' },
];

const reservations = [
  { time: '2:00 PM', table: 8, party: 4, name: 'Mr. Sharma', phone: '98765-43210', status: 'upcoming' },
  { time: '7:30 PM', table: 5, party: 6, name: 'Ms. Verma', phone: '98765-43211', status: 'upcoming' },
  { time: '8:00 PM', table: 12, party: 2, name: 'Mr. Singh', phone: '98765-43212', status: 'upcoming' },
];

const weekComparison = [
  { label: 'Total Revenue', value: '₹1,78,450', comparison: '+12%', trendUp: true },
  { label: 'Total Orders', value: '485 orders', comparison: '+45 orders', trendUp: true },
  { label: 'Avg Order Value', value: '₹368', comparison: '-₹12', trendUp: false },
];

interface FBDashboardProps {
  onNavigate?: (tab: string) => void;
}

const FBDashboard: React.FC<FBDashboardProps> = ({ onNavigate }) => {
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('day');
  const maxSale = Math.max(...salesData.map(d => d.value));

  const handleQuickAction = (action: string) => {
    if (onNavigate) {
      if (action === 'new-order') onNavigate('pos');
      else if (action === 'orders') onNavigate('orders');
      else if (action === 'tables') onNavigate('tables');
      else toast.success(`Opening ${action}...`);
    } else {
      toast.success(`Opening ${action}...`);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      completed: { label: '✅ Completed', color: 'bg-green-100 text-green-700' },
      delivery: { label: '🚚 Out for Delivery', color: 'bg-blue-100 text-blue-700' },
      delivered: { label: '✅ Delivered', color: 'bg-green-100 text-green-700' },
    };
    return configs[status] || configs.completed;
  };

  return (
    <div className="p-4 space-y-6 bg-background min-h-screen">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{getGreeting()}, Admin! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening in your restaurant today</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
            <option>Main Branch</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div key={kpi.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              {kpi.trend && (
                <span className={`flex items-center gap-1 text-xs font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.comparison}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            {kpi.subInfo && <p className="text-xs text-muted-foreground mt-1">{kpi.subInfo}</p>}
            <p className="text-sm text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Live Status */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <h2 className="font-semibold text-foreground">LIVE STATUS</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {liveStatus.map((status, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${status.color} text-center`}>
              <status.icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-3xl font-bold">{status.value}</p>
              <p className="text-sm">{status.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="font-semibold text-foreground">QUICK ACTIONS</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => handleQuickAction('new-order')} className="flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">New Order</span>
          </button>
          <button onClick={() => handleQuickAction('orders')} className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all hover:scale-105">
            <ClipboardList className="w-5 h-5" />
            <span className="font-medium">View All Orders</span>
          </button>
          <button onClick={() => handleQuickAction('tables')} className="flex items-center justify-center gap-2 p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all hover:scale-105">
            <LayoutGrid className="w-5 h-5" />
            <span className="font-medium">Table Layout</span>
          </button>
          <button onClick={() => toast.success('Opening report...')} className="flex items-center justify-center gap-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all hover:scale-105">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Today's Report</span>
          </button>
        </div>
      </div>

      {/* Running Tables + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold text-foreground">RUNNING TABLES</h2>
            </div>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {runningTables.map((table, idx) => (
              <div key={idx} className="bg-background border border-border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">Table {table.table}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${table.status === 'active' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {table.status === 'active' ? '🟡 Active' : '🔴 Billed'}
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">₹{table.bill.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{table.items} items</p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {table.time}</span>
                  <span>{table.waiter}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">+ 4 more tables running...</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold text-foreground">LOW STOCK ALERTS</h2>
            </div>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">Inventory <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            {lowStockItems.map((item, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${item.critical ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{item.critical ? '🔴' : '🟡'} {item.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">Only {item.current} kg left (Min: {item.min} kg)</p>
              </div>
            ))}
          </div>
          <button onClick={() => toast.success('Creating PO...')} className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm">
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* Recent Orders + Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-foreground">RECENT ORDERS</h2>
            </div>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Time</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Order ID</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Type</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Items</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Amount</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <tr key={idx} className="border-t border-border hover:bg-accent/50 cursor-pointer">
                      <td className="px-3 py-2 text-muted-foreground">{order.time}</td>
                      <td className="px-3 py-2 font-medium text-foreground">{order.id}</td>
                      <td className="px-3 py-2 text-foreground">{order.type}</td>
                      <td className="px-3 py-2 text-foreground">{order.items} items</td>
                      <td className="px-3 py-2 font-medium text-foreground">₹{order.amount.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold text-foreground">STAFF ON DUTY</h2>
            </div>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">Attendance <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2">
            {staffOnDuty.map((staff, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
                <div className="flex items-center gap-2">
                  <span className={staff.present ? 'text-green-500' : 'text-red-500'}>{staff.present ? '✅' : '❌'}</span>
                  <div>
                    <p className="font-medium text-foreground text-sm">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{staff.checkIn}</p>
                  <p>{staff.metric}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">TODAY'S SALES TREND</h2>
          </div>
          <div className="flex gap-1">
            {(['day', 'week', 'month'] as const).map(period => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${chartPeriod === period ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-2 h-48 mt-4">
          {salesData.map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.6)] rounded-t-sm hover:from-[hsl(var(--primary)/0.9)] transition-all cursor-pointer"
                style={{ height: `${(data.value / maxSale) * 100}%` }}
                title={`₹${data.value.toLocaleString()}`}
              />
              <span className="text-xs text-muted-foreground">{data.hour.replace(' AM', '').replace(' PM', '')}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">Peak Hour: 1:00 PM - 2:00 PM (₹2,850)</p>
      </div>

      {/* Top Items + Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="font-semibold text-foreground">TOP SELLING ITEMS TODAY</h2>
            </div>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">Full Report <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            {topItems.map((item) => (
              <div key={item.rank} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `${item.rank}.`}</span>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">₹{item.revenue.toLocaleString()}</p>
                  <p className={`text-xs flex items-center justify-end gap-1 ${item.trendUp === true ? 'text-green-600' : item.trendUp === false ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {item.trendUp === true ? <TrendingUp className="w-3 h-3" /> : item.trendUp === false ? <TrendingDown className="w-3 h-3" /> : null}
                    {item.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-foreground">PAYMENT METHODS</h2>
          </div>
          <div className="space-y-4">
            {paymentBreakdown.map((payment, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <payment.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{payment.method}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">₹{payment.amount.toLocaleString()} ({payment.percent}%)</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${payment.color} rounded-full transition-all`} style={{ width: `${payment.percent}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-border">
              <p className="text-lg font-bold text-foreground text-center">Total: ₹25,450</p>
            </div>
          </div>
        </div>
      </div>

      {/* Online Orders + Customer Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold text-foreground">ONLINE ORDERS (Aggregators)</h2>
            </div>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {onlineOrders.map((order, idx) => (
              <div key={idx} className="bg-background border border-border rounded-lg p-3">
                <p className="font-semibold text-foreground mb-2">{order.platform}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Orders:</span><span className="text-foreground">{order.orders}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Revenue:</span><span className="text-foreground">₹{order.revenue.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Commission:</span><span className="text-red-500">-₹{order.commission}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span>Total Online Orders: <strong>20</strong></span>
              <span>Net Revenue: <strong className="text-green-600">₹6,440</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="font-semibold text-foreground">RECENT FEEDBACK</h2>
            </div>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">All Reviews <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-background border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{review.time}</span>
                </div>
                <p className="text-sm text-foreground mb-1">"{review.comment}"</p>
                <p className="text-xs text-muted-foreground">— {review.customer} ({review.order})</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">Today's Average: <span className="font-semibold text-foreground">⭐ 4.5/5</span> (18 reviews)</p>
          </div>
        </div>
      </div>

      {/* Reservations + Week Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-foreground">TODAY'S RESERVATIONS</h2>
            </div>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">Manage <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            {reservations.map((res, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{res.time.split(' ')[0]}</p>
                    <p className="text-xs text-muted-foreground">{res.time.split(' ')[1]}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Table {res.table} • Party of {res.party}</p>
                    <p className="text-sm text-muted-foreground">{res.name}</p>
                  </div>
                </div>
                <button onClick={() => toast.success(`Calling ${res.phone}...`)} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-foreground">THIS WEEK VS LAST WEEK</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {weekComparison.map((item, idx) => (
              <div key={idx} className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className={`text-sm flex items-center justify-center gap-1 ${item.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {item.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {item.comparison} vs last week
                </p>
                <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-xs text-muted-foreground">
        Last updated: Just now • Auto-refresh every 30 seconds
      </div>
    </div>
  );
};

export default FBDashboard;
