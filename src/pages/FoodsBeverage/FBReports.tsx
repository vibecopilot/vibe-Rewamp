import React, { useState } from 'react';
import { 
  Download, FileText, Calendar, TrendingUp, TrendingDown, DollarSign, 
  ShoppingCart, Users, BarChart3, PieChart, Package, AlertTriangle,
  Clock, Star, Minus, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface SummaryCard {
  icon: React.ReactNode;
  label: string;
  value: string;
  subText?: string;
  comparison?: { value: string; positive: boolean };
}

// Sub-tabs for Reports
const reportTabs = [
  { id: 'sales', label: 'Sales' },
  { id: 'financial', label: 'Financial' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'items', label: 'Items' },
  { id: 'staff', label: 'Staff' },
];

// Date range options
const dateRangeOptions = [
  'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 
  'This Month', 'Last Month', 'Custom Range'
];

const periodOptions = [
  'December 2024', 'November 2024', 'October 2024',
  'This Quarter', 'Last Quarter', 'This Year'
];

// Static Data
const salesSummaryCards: SummaryCard[] = [
  { icon: <DollarSign className="w-6 h-6" />, label: 'Total Sales', value: '₹4,56,780', subText: 'Dec 1-18, 2024', comparison: { value: '+18%', positive: true } },
  { icon: <ShoppingCart className="w-6 h-6" />, label: 'Total Orders', value: '1,234', subText: '68 orders/day', comparison: { value: '+12%', positive: true } },
  { icon: <BarChart3 className="w-6 h-6" />, label: 'Avg Order Value', value: '₹370', subText: '₹150 - ₹2,500', comparison: { value: '+5%', positive: true } },
  { icon: <Calendar className="w-6 h-6" />, label: 'Peak Day', value: 'Saturday, Dec 14', subText: '₹35,680 | 96 orders' },
];

const salesByType = [
  { type: 'Dine-in', amount: 250000, percentage: 55, color: 'bg-purple-500' },
  { type: 'Delivery', amount: 150000, percentage: 33, color: 'bg-blue-500' },
  { type: 'Takeaway', amount: 56780, percentage: 12, color: 'bg-green-500' },
];

const paymentMethods = [
  { method: 'Cash', amount: 180000, percentage: 39, color: 'bg-green-500' },
  { method: 'Card', amount: 150000, percentage: 33, color: 'bg-blue-500' },
  { method: 'UPI', amount: 126780, percentage: 28, color: 'bg-purple-500' },
];

const dailySalesData = [
  { date: 'Dec 1', amount: 22000 }, { date: 'Dec 2', amount: 19500 }, { date: 'Dec 3', amount: 21800 },
  { date: 'Dec 4', amount: 23400 }, { date: 'Dec 5', amount: 25600 }, { date: 'Dec 6', amount: 28900 },
  { date: 'Dec 7', amount: 31200 }, { date: 'Dec 8', amount: 24800 }, { date: 'Dec 9', amount: 22300 },
  { date: 'Dec 10', amount: 26700 }, { date: 'Dec 11', amount: 25900 }, { date: 'Dec 12', amount: 27400 },
  { date: 'Dec 13', amount: 29100 }, { date: 'Dec 14', amount: 35680 }, { date: 'Dec 15', amount: 33200 },
  { date: 'Dec 16', amount: 28500 }, { date: 'Dec 17', amount: 26900 }, { date: 'Dec 18', amount: 25450 },
];

const hourlySalesData = [
  { hour: '9 AM', amount: 800 }, { hour: '10 AM', amount: 1200 }, { hour: '11 AM', amount: 1800 },
  { hour: '12 PM', amount: 2400 }, { hour: '1 PM', amount: 2850 }, { hour: '2 PM', amount: 2600 },
  { hour: '3 PM', amount: 1400 }, { hour: '4 PM', amount: 800 }, { hour: '5 PM', amount: 1600 },
  { hour: '6 PM', amount: 2200 }, { hour: '7 PM', amount: 2800 }, { hour: '8 PM', amount: 2400 },
  { hour: '9 PM', amount: 1800 }, { hour: '10 PM', amount: 1200 },
];

const topPerformingDays = [
  { day: 'Saturday, Dec 14', sales: 35680, orders: 96 },
  { day: 'Sunday, Dec 15', sales: 33200, orders: 89 },
  { day: 'Friday, Dec 13', sales: 29100, orders: 78 },
  { day: 'Saturday, Dec 7', sales: 31200, orders: 84 },
  { day: 'Thursday, Dec 12', sales: 27400, orders: 74 },
];

// Financial Data
const incomeData = [
  { label: 'Dine-in', amount: 250000 },
  { label: 'Delivery', amount: 150000 },
  { label: 'Takeaway', amount: 56780 },
];

const cogsData = [
  { label: 'Ingredients', amount: 150000, percentage: 33 },
  { label: 'Packaging', amount: 8000, percentage: 2 },
];

const operatingExpenses = [
  { label: 'Staff Salaries', amount: 80000, percentage: 18 },
  { label: 'Rent', amount: 50000, percentage: 11 },
  { label: 'Electricity', amount: 15000, percentage: 3 },
  { label: 'Water', amount: 3000, percentage: 1 },
  { label: 'Gas', amount: 8000, percentage: 2 },
  { label: 'Maintenance', amount: 5000, percentage: 1 },
  { label: 'Marketing', amount: 10000, percentage: 2 },
  { label: 'Delivery Charges', amount: 12000, percentage: 3 },
  { label: 'Aggregator Commission', amount: 18000, percentage: 4 },
  { label: 'Miscellaneous', amount: 10000, percentage: 2 },
];

const monthlyComparison = [
  { metric: 'Revenue', oct: 345000, nov: 412000, dec: 456780, trend: '+11%', positive: true },
  { metric: 'Expenses', oct: 280000, nov: 320000, dec: 369000, trend: '+15%', positive: false },
  { metric: 'Net Profit', oct: 65000, nov: 92000, dec: 87780, trend: '-5%', positive: false },
  { metric: 'Profit Margin', oct: '18.8%', nov: '22.3%', dec: '19.2%', trend: '-3.1%', positive: false },
];

// Inventory Data
const inventorySummary: SummaryCard[] = [
  { icon: <Package className="w-6 h-6" />, label: 'Total Inventory Value', value: '₹2,45,680', subText: '27 items in stock' },
  { icon: <AlertTriangle className="w-6 h-6" />, label: 'Items Below Min Stock', value: '18 items', subText: '67% - Attention needed' },
  { icon: <Package className="w-6 h-6" />, label: 'Out of Stock', value: '0 items', subText: '✅ All stocked' },
  { icon: <TrendingDown className="w-6 h-6" />, label: 'Total Wastage', value: '₹4,560', subText: '1% of inventory' },
];

const stockStatusData = [
  { status: 'Good Stock', count: 4, percentage: 15, color: 'bg-green-500' },
  { status: 'Low Stock', count: 18, percentage: 67, color: 'bg-yellow-500' },
  { status: 'Critical', count: 5, percentage: 18, color: 'bg-red-500' },
  { status: 'Out of Stock', count: 0, percentage: 0, color: 'bg-gray-400' },
];

const criticalItems = [
  { item: 'Chicken (Raw)', current: '5 kg', min: '10 kg', daysLeft: 2, suggested: '15 kg', priority: 'High' },
  { item: 'Milk', current: '10 L', min: '20 L', daysLeft: 3, suggested: '20 L', priority: 'High' },
  { item: 'Butter', current: '2 kg', min: '5 kg', daysLeft: 4, suggested: '8 kg', priority: 'High' },
  { item: 'Paneer', current: '3 kg', min: '5 kg', daysLeft: 5, suggested: '8 kg', priority: 'Medium' },
  { item: 'Tomatoes', current: '8 kg', min: '10 kg', daysLeft: 6, suggested: '15 kg', priority: 'Medium' },
];

const categoryStockValue = [
  { category: 'Proteins', value: 85000, percentage: 35 },
  { category: 'Grains', value: 45000, percentage: 18 },
  { category: 'Vegetables', value: 35000, percentage: 14 },
  { category: 'Dairy', value: 40000, percentage: 16 },
  { category: 'Spices', value: 25000, percentage: 10 },
  { category: 'Others', value: 15680, percentage: 7 },
];

const topConsumedItems = [
  { item: 'Rice (Basmati)', consumed: '150 kg', cost: 12000 },
  { item: 'Chicken (Raw)', consumed: '120 kg', cost: 30000 },
  { item: 'Onions', consumed: '100 kg', cost: 4000 },
  { item: 'Paneer', consumed: '80 kg', cost: 24000 },
  { item: 'Tomatoes', consumed: '95 kg', cost: 4750 },
];

const wastageData = [
  { item: 'Milk', quantity: '5 L', reason: 'Expired', cost: 300, date: 'Dec 15' },
  { item: 'Tomatoes', quantity: '8 kg', reason: 'Spoiled', cost: 400, date: 'Dec 12' },
  { item: 'Paneer', quantity: '2 kg', reason: 'Expired', cost: 600, date: 'Dec 10' },
  { item: 'Chicken', quantity: '3 kg', reason: 'Spoiled', cost: 750, date: 'Dec 8' },
  { item: 'Vegetables', quantity: '10 kg', reason: 'Damaged', cost: 500, date: 'Dec 5' },
];

// Items Data
const itemsSummary: SummaryCard[] = [
  { icon: <Package className="w-6 h-6" />, label: 'Total Menu Items', value: '32 active', subText: '4 inactive items' },
  { icon: <ShoppingCart className="w-6 h-6" />, label: 'Total Orders', value: '1,234', subText: '3,567 units sold' },
  { icon: <BarChart3 className="w-6 h-6" />, label: 'Avg Items/Order', value: '2.9 items', subText: 'Range: 1-12 items' },
  { icon: <DollarSign className="w-6 h-6" />, label: 'Revenue per Item', value: '₹142', subText: 'per item sold' },
];

const bestSellers = [
  { rank: '🥇', item: 'Butter Chicken', orders: 456, revenue: 145920, percentage: 32, trend: '+15%' },
  { rank: '🥈', item: 'Paneer Tikka', orders: 398, revenue: 99500, percentage: 22, trend: '+12%' },
  { rank: '🥉', item: 'Veg Biryani', orders: 345, revenue: 69000, percentage: 15, trend: '+8%' },
  { rank: '4', item: 'Dal Makhani', orders: 289, revenue: 52020, percentage: 11, trend: '+10%' },
  { rank: '5', item: 'Naan', orders: 267, revenue: 13350, percentage: 3, trend: '0%' },
  { rank: '6', item: 'Cold Coffee', orders: 234, revenue: 28080, percentage: 6, trend: '+5%' },
  { rank: '7', item: 'Tandoori Roti', orders: 198, revenue: 5940, percentage: 1, trend: '0%' },
  { rank: '8', item: 'Paneer Kabab', orders: 187, revenue: 41140, percentage: 9, trend: '+7%' },
  { rank: '9', item: 'Chicken Biryani', orders: 156, revenue: 39000, percentage: 9, trend: '+18%' },
  { rank: '10', item: 'Gulab Jamun', orders: 145, revenue: 11600, percentage: 3, trend: '+3%' },
];

const slowMovers = [
  { item: 'Fish Curry', orders: 12, revenue: 4200, daysSinceOrder: 8 },
  { item: 'Pasta', orders: 18, revenue: 3600, daysSinceOrder: 5 },
  { item: 'Mutton Rogan Josh', orders: 15, revenue: 6000, daysSinceOrder: 7 },
  { item: 'Filter Coffee', orders: 22, revenue: 1100, daysSinceOrder: 4 },
  { item: 'Gajar Halwa', orders: 19, revenue: 1710, daysSinceOrder: 6 },
];

const categoryPerformance = [
  { category: 'Starters', items: 9, orders: 1245, revenue: 289000, avgPrice: 232, topItem: 'Paneer Tikka' },
  { category: 'Main Course', items: 8, orders: 1478, revenue: 356000, avgPrice: 241, topItem: 'Butter Chicken' },
  { category: 'Beverages', items: 5, orders: 567, revenue: 68040, avgPrice: 120, topItem: 'Cold Coffee' },
  { category: 'Desserts', items: 4, orders: 289, revenue: 26010, avgPrice: 90, topItem: 'Gulab Jamun' },
  { category: 'Breads', items: 4, orders: 678, revenue: 27120, avgPrice: 40, topItem: 'Naan' },
];

const itemProfitability = [
  { item: 'Cold Coffee', price: 120, cost: 35, profit: 85, margin: 71 },
  { item: 'Naan', price: 50, cost: 12, profit: 38, margin: 76 },
  { item: 'Dal Makhani', price: 180, cost: 45, profit: 135, margin: 75 },
  { item: 'Paneer Tikka', price: 250, cost: 80, profit: 170, margin: 68 },
  { item: 'Gulab Jamun', price: 80, cost: 25, profit: 55, margin: 69 },
];

// Staff Data
const staffSummary: SummaryCard[] = [
  { icon: <Users className="w-6 h-6" />, label: 'Total Staff', value: '12', subText: 'Active: 10 | Inactive: 2' },
  { icon: <Clock className="w-6 h-6" />, label: 'Attendance Rate', value: '94.5%', subText: 'Present: 10/12 today' },
  { icon: <DollarSign className="w-6 h-6" />, label: 'Total Salary', value: '₹2,40,000/mo', subText: 'Paid: ₹80,000 (Dec 1-18)' },
  { icon: <Star className="w-6 h-6" />, label: 'Avg Performance', value: '4.2/5', subText: 'Top: Raj Kumar' },
];

const attendanceSummary = [
  { name: 'Raj Kumar', role: 'Waiter', daysWorked: 17, daysAbsent: 1, attendance: 94 },
  { name: 'Sam Patel', role: 'Waiter', daysWorked: 18, daysAbsent: 0, attendance: 100 },
  { name: 'Kumar', role: 'Chef', daysWorked: 18, daysAbsent: 0, attendance: 100 },
  { name: 'Sita Devi', role: 'Cashier', daysWorked: 17, daysAbsent: 1, attendance: 94 },
  { name: 'Priya Singh', role: 'Waiter', daysWorked: 15, daysAbsent: 3, attendance: 83 },
  { name: 'Arun Sharma', role: 'Chef', daysWorked: 18, daysAbsent: 0, attendance: 100 },
  { name: 'Neha Gupta', role: 'Kitchen', daysWorked: 16, daysAbsent: 2, attendance: 89 },
  { name: 'Karan Singh', role: 'Delivery', daysWorked: 17, daysAbsent: 1, attendance: 94 },
];

const waiterPerformance = [
  { name: 'Raj Kumar', tables: 145, orders: 289, revenue: 112000, avgBill: 387, rating: 4.5 },
  { name: 'Sam Patel', tables: 128, orders: 256, revenue: 98500, avgBill: 385, rating: 4.3 },
  { name: 'Priya Singh', tables: 95, orders: 187, revenue: 68900, avgBill: 368, rating: 4.0 },
];

const chefPerformance = [
  { name: 'Kumar', orders: 467, avgTime: '18 min', errors: 3, rating: 4.6 },
  { name: 'Arun Sharma', orders: 423, avgTime: '22 min', errors: 5, rating: 4.2 },
];

const salaryBreakdown = [
  { name: 'Raj Kumar', role: 'Waiter', salary: 20000, days: 17, earned: 11333, status: 'Paid' },
  { name: 'Sam Patel', role: 'Waiter', salary: 20000, days: 18, earned: 12000, status: 'Paid' },
  { name: 'Kumar', role: 'Chef', salary: 35000, days: 18, earned: 21000, status: 'Paid' },
  { name: 'Sita Devi', role: 'Cashier', salary: 18000, days: 17, earned: 10200, status: 'Paid' },
  { name: 'Priya Singh', role: 'Waiter', salary: 18000, days: 15, earned: 9000, status: 'Pending' },
  { name: 'Arun Sharma', role: 'Chef', salary: 32000, days: 18, earned: 19200, status: 'Paid' },
];

const shiftAnalysis = [
  { shift: 'Morning', staff: 4, attendance: 95, orders: 456, revenue: 134000 },
  { shift: 'Afternoon', staff: 6, attendance: 93, orders: 678, revenue: 223000 },
  { shift: 'Evening', staff: 8, attendance: 96, orders: 789, revenue: 289000 },
];

const FBReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [period, setPeriod] = useState('December 2024');

  const handleExport = (type: 'pdf' | 'excel') => {
    toast.success(`Generating ${type.toUpperCase()}...`);
  };

  // Summary Card Component
  const SummaryCard = ({ card, colorClass = 'bg-primary/10 text-primary' }: { card: SummaryCard; colorClass?: string }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {card.icon}
        </div>
        {card.comparison && (
          <span className={`text-xs font-medium flex items-center gap-1 ${card.comparison.positive ? 'text-green-600' : 'text-red-600'}`}>
            {card.comparison.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {card.comparison.value}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground">{card.value}</p>
        <p className="text-sm text-muted-foreground">{card.label}</p>
        {card.subText && <p className="text-xs text-muted-foreground mt-1">{card.subText}</p>}
      </div>
    </div>
  );

  // Bar Chart Component
  const HorizontalBar = ({ data, maxValue }: { data: { label: string; value: number; percentage: number; color: string }[]; maxValue: number }) => (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div key={idx}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground font-medium">{item.label}</span>
            <span className="text-muted-foreground">₹{item.value.toLocaleString()} ({item.percentage}%)</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${item.color} rounded-full transition-all duration-500`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Simple Line Chart
  const SimpleLineChart = ({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between gap-1 pb-6">
          {data.map((item, idx) => {
            const heightPercent = range > 0 ? ((item.value - minValue) / range) * 80 + 20 : 50;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full flex justify-center">
                  <div 
                    className="w-2 bg-primary rounded-t hover:bg-primary/80 transition-all cursor-pointer"
                    style={{ height: `${heightPercent}%`, minHeight: '20px', maxHeight: `${height - 40}px` }}
                    title={`${item.label}: ₹${item.value.toLocaleString()}`}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    ₹{item.value.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground overflow-x-auto">
          {data.filter((_, i) => i % 3 === 0).map((item, idx) => (
            <span key={idx} className="whitespace-nowrap">{item.label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Donut Chart Component
  const DonutChart = ({ data, size = 120 }: { data: { label: string; value: number; percentage: number; color: string }[]; size?: number }) => {
    let currentAngle = 0;
    const radius = size / 2 - 10;
    const innerRadius = radius * 0.6;
    
    return (
      <div className="flex items-center gap-6">
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, idx) => {
            const angle = (item.percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = ((startAngle + angle) * Math.PI) / 180;
            
            const x1 = size/2 + radius * Math.cos(startRad);
            const y1 = size/2 + radius * Math.sin(startRad);
            const x2 = size/2 + radius * Math.cos(endRad);
            const y2 = size/2 + radius * Math.sin(endRad);
            
            const x1Inner = size/2 + innerRadius * Math.cos(startRad);
            const y1Inner = size/2 + innerRadius * Math.sin(startRad);
            const x2Inner = size/2 + innerRadius * Math.cos(endRad);
            const y2Inner = size/2 + innerRadius * Math.sin(endRad);
            
            const largeArc = angle > 180 ? 1 : 0;
            
            const colorMap: Record<string, string> = {
              'bg-green-500': '#22c55e',
              'bg-blue-500': '#3b82f6',
              'bg-purple-500': '#8b5cf6',
              'bg-yellow-500': '#eab308',
              'bg-red-500': '#ef4444',
              'bg-gray-400': '#9ca3af',
            };
            
            return (
              <path
                key={idx}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner} Z`}
                fill={colorMap[item.color] || '#8b5cf6'}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-foreground">{item.label}</span>
              <span className="text-muted-foreground">({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Sales Tab
  const renderSalesTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {salesSummaryCards.map((card, idx) => (
          <SummaryCard key={idx} card={card} />
        ))}
      </div>

      {/* Sales by Type & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sales by Order Type</h3>
          <HorizontalBar 
            data={salesByType.map(s => ({ label: s.type, value: s.amount, percentage: s.percentage, color: s.color }))}
            maxValue={250000}
          />
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h3>
          <DonutChart 
            data={paymentMethods.map(p => ({ label: p.method, value: p.amount, percentage: p.percentage, color: p.color }))}
          />
        </div>
      </div>

      {/* Daily Sales Trend */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Daily Sales Trend</h3>
          <div className="flex gap-2">
            {['Day', 'Week', 'Month'].map(tab => (
              <button key={tab} className={`px-3 py-1 text-xs rounded ${tab === 'Day' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <SimpleLineChart data={dailySalesData.map(d => ({ label: d.date, value: d.amount }))} height={200} />
        <p className="text-sm text-muted-foreground mt-4 text-center">Peak: Saturday, Dec 14 (₹35,680)</p>
      </div>

      {/* Hourly Pattern & Top Days */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Average Sales by Hour</h3>
          <SimpleLineChart data={hourlySalesData.map(h => ({ label: h.hour, value: h.amount }))} height={160} />
          <p className="text-sm text-muted-foreground mt-3 text-center">Peak: 1-2 PM (Lunch) and 7-8 PM (Dinner)</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Sales Days</h3>
          <div className="space-y-3">
            {topPerformingDays.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-bold">{idx + 1}</span>
                  <span className="text-sm text-foreground">{day.day}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₹{day.sales.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{day.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Financial Tab
  const renderFinancialTab = () => {
    const totalIncome = incomeData.reduce((sum, i) => sum + i.amount, 0);
    const totalCOGS = cogsData.reduce((sum, c) => sum + c.amount, 0);
    const totalOperating = operatingExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = totalCOGS + totalOperating;
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);

    return (
      <div className="space-y-6">
        {/* P&L Statement */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-bold text-foreground mb-1">Profit & Loss Statement</h3>
          <p className="text-sm text-muted-foreground mb-6">December 2024 (Dec 1-18)</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income */}
            <div>
              <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" /> Income
              </h4>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2">
                {incomeData.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-green-200 dark:border-green-700 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>TOTAL INCOME</span>
                    <span className="text-green-600">₹{totalIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COGS */}
            <div>
              <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" /> Cost of Goods Sold
              </h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
                {cogsData.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-medium">₹{item.amount.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                ))}
                <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total COGS</span>
                    <span className="text-blue-600">₹{totalCOGS.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="mt-6">
            <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-500" /> Operating Expenses
            </h4>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {operatingExpenses.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-orange-200 dark:border-orange-700 pt-2 mt-3">
                <div className="flex justify-between font-bold">
                  <span>Total Operating</span>
                  <span className="text-orange-600">₹{totalOperating.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 bg-primary/10 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-xl font-bold text-primary">₹{netProfit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-xl font-bold text-primary">{profitMargin}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-3 text-left rounded-tl-lg">Metric</th>
                  <th className="p-3 text-right">Oct</th>
                  <th className="p-3 text-right">Nov</th>
                  <th className="p-3 text-right">Dec (18d)</th>
                  <th className="p-3 text-right rounded-tr-lg">Trend</th>
                </tr>
              </thead>
              <tbody>
                {monthlyComparison.map((row, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="p-3 font-medium">{row.metric}</td>
                    <td className="p-3 text-right">{typeof row.oct === 'number' ? `₹${row.oct.toLocaleString()}` : row.oct}</td>
                    <td className="p-3 text-right">{typeof row.nov === 'number' ? `₹${row.nov.toLocaleString()}` : row.nov}</td>
                    <td className="p-3 text-right">{typeof row.dec === 'number' ? `₹${row.dec.toLocaleString()}` : row.dec}</td>
                    <td className={`p-3 text-right font-medium ${row.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {row.positive ? '↑' : '↓'} {row.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Cash Flow (Dec 1-18)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Cash In</p>
              <p className="text-2xl font-bold text-green-600">₹4,61,780</p>
              <p className="text-xs text-muted-foreground">Sales + Other</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Cash Out</p>
              <p className="text-2xl font-bold text-red-600">₹3,69,000</p>
              <p className="text-xs text-muted-foreground">All Expenses</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Net Cash Flow</p>
              <p className="text-2xl font-bold text-primary">₹92,780</p>
              <p className="text-xs text-green-600">✓ Positive</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Inventory Tab
  const renderInventoryTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventorySummary.map((card, idx) => (
          <SummaryCard key={idx} card={card} colorClass={idx === 1 ? 'bg-yellow-100 text-yellow-600' : idx === 3 ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'} />
        ))}
      </div>

      {/* Stock Status & Category Value */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Stock Status Breakdown</h3>
          <DonutChart data={stockStatusData.map(s => ({ label: s.status, value: s.count, percentage: s.percentage, color: s.color }))} />
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Category-wise Stock Value</h3>
          <HorizontalBar 
            data={categoryStockValue.map(c => ({ label: c.category, value: c.value, percentage: c.percentage, color: 'bg-purple-500' }))}
            maxValue={85000}
          />
        </div>
      </div>

      {/* Critical Items */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Items Requiring Immediate Attention
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3 text-left rounded-tl-lg">Item</th>
                <th className="p-3 text-right">Current</th>
                <th className="p-3 text-right">Min</th>
                <th className="p-3 text-right">Days Left</th>
                <th className="p-3 text-right">Suggested</th>
                <th className="p-3 text-center rounded-tr-lg">Priority</th>
              </tr>
            </thead>
            <tbody>
              {criticalItems.map((item, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="p-3 font-medium">{item.item}</td>
                  <td className="p-3 text-right">{item.current}</td>
                  <td className="p-3 text-right">{item.min}</td>
                  <td className="p-3 text-right">{item.daysLeft} days</td>
                  <td className="p-3 text-right">{item.suggested}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {item.priority === 'High' ? '🔴' : '🟡'} {item.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Consumed & Wastage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Consumed Items (Last 30 Days)</h3>
          <div className="space-y-3">
            {topConsumedItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-bold">{idx + 1}</span>
                  <span className="text-sm font-medium">{item.item}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{item.consumed}</p>
                  <p className="text-xs text-muted-foreground">₹{item.cost.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Wastage Report</h3>
          <div className="space-y-2">
            {wastageData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{item.item} ({item.quantity})</p>
                  <p className="text-xs text-muted-foreground">{item.reason} • {item.date}</p>
                </div>
                <span className="text-sm font-semibold text-red-600">₹{item.cost}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total Wastage</span>
                <span className="text-red-600">₹2,550</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Purchase History Summary (Last 30 Days)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">45</p>
            <p className="text-sm text-muted-foreground">Total POs</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">₹3,45,890</p>
            <p className="text-sm text-muted-foreground">Total Purchases</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">₹7,686</p>
            <p className="text-sm text-muted-foreground">Avg PO Value</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">ABC Foods</p>
            <p className="text-sm text-muted-foreground">Top Supplier (15 orders)</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Items Tab
  const renderItemsTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {itemsSummary.map((card, idx) => (
          <SummaryCard key={idx} card={card} />
        ))}
      </div>

      {/* Best Sellers */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">🏆 Best Sellers (Top 10)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3 text-left rounded-tl-lg">Rank</th>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-right">Orders</th>
                <th className="p-3 text-right">Revenue</th>
                <th className="p-3 text-right">% of Total</th>
                <th className="p-3 text-right rounded-tr-lg">Trend</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.map((item, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/50">
                  <td className="p-3 text-lg">{item.rank}</td>
                  <td className="p-3 font-medium">{item.item}</td>
                  <td className="p-3 text-right">{item.orders}</td>
                  <td className="p-3 text-right">₹{item.revenue.toLocaleString()}</td>
                  <td className="p-3 text-right">{item.percentage}%</td>
                  <td className={`p-3 text-right font-medium ${item.trend.startsWith('+') ? 'text-green-600' : item.trend === '0%' ? 'text-gray-500' : 'text-red-600'}`}>
                    {item.trend.startsWith('+') ? '↑' : item.trend === '0%' ? '→' : '↓'} {item.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slow Movers */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">📉 Slow Movers (Bottom 5)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-right">Orders</th>
                <th className="p-3 text-right">Revenue</th>
                <th className="p-3 text-right">Days Since Order</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {slowMovers.map((item, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="p-3 font-medium">{item.item}</td>
                  <td className="p-3 text-right">{item.orders}</td>
                  <td className="p-3 text-right">₹{item.revenue.toLocaleString()}</td>
                  <td className="p-3 text-right text-orange-600">{item.daysSinceOrder} days</td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => toast.success(`${item.item} marked as inactive`)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Mark Inactive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Performance & Veg/Non-Veg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Category Performance</h3>
          <div className="space-y-3">
            {categoryPerformance.map((cat, idx) => (
              <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{cat.category}</span>
                  <span className="text-sm text-primary font-semibold">₹{cat.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{cat.items} items</span>
                  <span>{cat.orders} orders</span>
                  <span>Avg: ₹{cat.avgPrice}</span>
                  <span>Top: {cat.topItem}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Veg vs Non-Veg Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border-l-4 border-green-500">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="font-bold text-lg">Veg Items</p>
              <p className="text-2xl font-bold text-green-600">18</p>
              <p className="text-sm text-muted-foreground">1,567 orders (52%)</p>
              <p className="text-sm font-medium">₹2,38,000</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center border-l-4 border-red-500">
              <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2" />
              <p className="font-bold text-lg">Non-Veg Items</p>
              <p className="text-2xl font-bold text-red-600">14</p>
              <p className="text-sm text-muted-foreground">1,445 orders (48%)</p>
              <p className="text-sm font-medium">₹2,18,780</p>
            </div>
          </div>
        </div>
      </div>

      {/* Item Profitability */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">💰 Item Profitability (Highest Margins)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3 text-left rounded-tl-lg">Item</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3 text-right">Profit</th>
                <th className="p-3 text-right rounded-tr-lg">Margin</th>
              </tr>
            </thead>
            <tbody>
              {itemProfitability.map((item, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="p-3 font-medium">{item.item}</td>
                  <td className="p-3 text-right">₹{item.price}</td>
                  <td className="p-3 text-right text-red-600">₹{item.cost}</td>
                  <td className="p-3 text-right text-green-600">₹{item.profit}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">{item.margin}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Staff Tab
  const renderStaffTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {staffSummary.map((card, idx) => (
          <SummaryCard key={idx} card={card} />
        ))}
      </div>

      {/* Attendance Summary */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Attendance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3 text-left rounded-tl-lg">Staff Name</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-right">Days Worked</th>
                <th className="p-3 text-right">Days Absent</th>
                <th className="p-3 text-right rounded-tr-lg">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {attendanceSummary.map((staff, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="p-3 font-medium">{staff.name}</td>
                  <td className="p-3 text-muted-foreground">{staff.role}</td>
                  <td className="p-3 text-right">{staff.daysWorked}</td>
                  <td className="p-3 text-right">{staff.daysAbsent}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${staff.attendance >= 95 ? 'bg-green-100 text-green-600' : staff.attendance >= 90 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                      {staff.attendance}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Waiter Performance</h3>
          <div className="space-y-3">
            {waiterPerformance.map((waiter, idx) => (
              <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{waiter.name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{waiter.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <div><span className="block font-medium text-foreground">{waiter.tables}</span>Tables</div>
                  <div><span className="block font-medium text-foreground">{waiter.orders}</span>Orders</div>
                  <div><span className="block font-medium text-foreground">₹{waiter.revenue.toLocaleString()}</span>Revenue</div>
                  <div><span className="block font-medium text-foreground">₹{waiter.avgBill}</span>Avg Bill</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Chef Performance</h3>
          <div className="space-y-3">
            {chefPerformance.map((chef, idx) => (
              <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{chef.name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{chef.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div><span className="block font-medium text-foreground">{chef.orders}</span>Orders</div>
                  <div><span className="block font-medium text-foreground">{chef.avgTime}</span>Avg Time</div>
                  <div><span className="block font-medium text-foreground">{chef.errors}</span>Errors</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Salary Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3 text-left rounded-tl-lg">Staff Name</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-right">Salary</th>
                <th className="p-3 text-right">Days</th>
                <th className="p-3 text-right">Earned (18d)</th>
                <th className="p-3 text-center rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {salaryBreakdown.map((staff, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="p-3 font-medium">{staff.name}</td>
                  <td className="p-3 text-muted-foreground">{staff.role}</td>
                  <td className="p-3 text-right">₹{staff.salary.toLocaleString()}</td>
                  <td className="p-3 text-right">{staff.days}</td>
                  <td className="p-3 text-right">₹{staff.earned.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${staff.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {staff.status === 'Paid' ? '✅' : '⏳'} {staff.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department & Shift Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Department Breakdown</h3>
          <div className="space-y-3">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="font-medium">Kitchen Staff</p>
              <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                <div><span className="text-muted-foreground">Count:</span> 4</div>
                <div><span className="text-muted-foreground">Salary:</span> ₹1,10,000</div>
                <div><span className="text-muted-foreground">Attendance:</span> 96%</div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-medium">Service Staff</p>
              <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                <div><span className="text-muted-foreground">Count:</span> 5</div>
                <div><span className="text-muted-foreground">Salary:</span> ₹95,000</div>
                <div><span className="text-muted-foreground">Attendance:</span> 92%</div>
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="font-medium">Others</p>
              <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                <div><span className="text-muted-foreground">Count:</span> 3</div>
                <div><span className="text-muted-foreground">Salary:</span> ₹35,000</div>
                <div><span className="text-muted-foreground">Attendance:</span> 95%</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Shift Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Shift</th>
                  <th className="p-2 text-right">Staff</th>
                  <th className="p-2 text-right">Attendance</th>
                  <th className="p-2 text-right">Orders</th>
                  <th className="p-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {shiftAnalysis.map((shift, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="p-2 font-medium">{shift.shift}</td>
                    <td className="p-2 text-right">{shift.staff}</td>
                    <td className="p-2 text-right">{shift.attendance}%</td>
                    <td className="p-2 text-right">{shift.orders}</td>
                    <td className="p-2 text-right">₹{shift.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            value={activeTab === 'financial' ? period : dateRange}
            onChange={(e) => {
              if (activeTab === 'financial') {
                setPeriod(e.target.value);
              } else {
                setDateRange(e.target.value);
              }
              toast.success(`Report updated for ${e.target.value}`);
            }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            {(activeTab === 'financial' ? periodOptions : dateRangeOptions).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {activeTab === 'inventory' && (
            <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
              <option>All Categories</option>
              <option>Proteins</option>
              <option>Grains</option>
              <option>Vegetables</option>
              <option>Dairy</option>
              <option>Spices</option>
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
          >
            <FileText className="w-4 h-4" /> Download PDF
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent"
          >
            <Download className="w-4 h-4" /> Download Excel
          </button>
        </div>
      </div>

      {/* Level 4 Sub-tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {reportTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'sales' && renderSalesTab()}
      {activeTab === 'financial' && renderFinancialTab()}
      {activeTab === 'inventory' && renderInventoryTab()}
      {activeTab === 'items' && renderItemsTab()}
      {activeTab === 'staff' && renderStaffTab()}
    </div>
  );
};

export default FBReports;
