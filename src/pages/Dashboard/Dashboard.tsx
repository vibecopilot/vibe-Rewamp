import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Wrench, 
  Building2, 
  CalendarDays, 
  FileText, 
  HardHat,
  Ticket,
  AlertTriangle,
  Coffee,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubModule {
  name: string;
  count: number;
  path: string;
}

interface Module {
  name: string;
  icon: React.ElementType;
  path: string;
  color: string;
  gradient: string;
  growth: number;
  totalCount: number;
  subModules: SubModule[];
}

const modules: Module[] = [
  { 
    name: 'Service Desk', 
    icon: Ticket, 
    path: '/service-desk', 
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    growth: 12.5,
    totalCount: 1247,
    subModules: [
      { name: 'Open Tickets', count: 156, path: '/service-desk?status=open' },
      { name: 'In Progress', count: 89, path: '/service-desk?status=progress' },
      { name: 'Resolved', count: 1002, path: '/service-desk?status=resolved' },
    ]
  },
  { 
    name: 'Asset', 
    icon: Wrench, 
    path: '/asset', 
    color: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-emerald-600',
    growth: 8.3,
    totalCount: 3456,
    subModules: [
      { name: 'Assets', count: 2150, path: '/asset' },
      { name: 'AMC', count: 234, path: '/asset/amc' },
      { name: 'PPM', count: 567, path: '/asset/ppm-activity' },
      { name: 'Stock Items', count: 505, path: '/asset/stock-items' },
    ]
  },
  { 
    name: 'Soft Services', 
    icon: Building2, 
    path: '/soft-services', 
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    growth: -2.1,
    totalCount: 892,
    subModules: [
      { name: 'Services', count: 456, path: '/soft-services/service' },
      { name: 'Checklists', count: 234, path: '/soft-services/checklist' },
      { name: 'Tasks', count: 202, path: '/soft-services/task' },
    ]
  },
  { 
    name: 'VMS', 
    icon: Users, 
    path: '/vms/visitors', 
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    growth: 15.7,
    totalCount: 5623,
    subModules: [
      { name: 'Visitors', count: 3450, path: '/vms/visitors' },
      { name: 'Vehicles', count: 890, path: '/vms/registered-vehicles' },
      { name: 'Staff', count: 567, path: '/vms/staff' },
      { name: 'Patrolling', count: 456, path: '/vms/patrolling' },
      { name: 'Goods', count: 260, path: '/vms/goods' },
    ]
  },
  { 
    name: 'Amenities Booking', 
    icon: CalendarDays, 
    path: '/amenities', 
    color: 'bg-pink-500',
    gradient: 'from-pink-500 to-pink-600',
    growth: 5.2,
    totalCount: 678,
    subModules: [
      { name: 'Active', count: 234, path: '/amenities?status=active' },
      { name: 'Upcoming', count: 156, path: '/amenities?status=upcoming' },
      { name: 'Completed', count: 288, path: '/amenities?status=completed' },
    ]
  },
  { 
    name: 'Space Booking', 
    icon: Building2, 
    path: '/space-booking', 
    color: 'bg-indigo-500',
    gradient: 'from-indigo-500 to-indigo-600',
    growth: 9.8,
    totalCount: 1234,
    subModules: [
      { name: 'Booked', count: 456, path: '/space-booking?status=booked' },
      { name: 'Available', count: 345, path: '/space-booking?status=available' },
      { name: 'Pending', count: 433, path: '/space-booking?status=pending' },
    ]
  },
  { 
    name: 'F&B', 
    icon: Coffee, 
    path: '/fb', 
    color: 'bg-amber-500',
    gradient: 'from-amber-500 to-amber-600',
    growth: 18.4,
    totalCount: 2345,
    subModules: [
      { name: 'Restaurant', count: 1234, path: '/fb/restaurant' },
      { name: 'Pantry', count: 1111, path: '/fb/pantry' },
    ]
  },
  { 
    name: 'Incident', 
    icon: AlertTriangle, 
    path: '/incident', 
    color: 'bg-red-500',
    gradient: 'from-red-500 to-red-600',
    growth: -5.6,
    totalCount: 156,
    subModules: [
      { name: 'Open', count: 23, path: '/incident?status=open' },
      { name: 'Investigating', count: 45, path: '/incident?status=investigating' },
      { name: 'Resolved', count: 88, path: '/incident?status=resolved' },
    ]
  },
  { 
    name: 'Documents', 
    icon: FileText, 
    path: '/documents', 
    color: 'bg-teal-500',
    gradient: 'from-teal-500 to-teal-600',
    growth: 3.2,
    totalCount: 4567,
    subModules: [
      { name: 'Personal', count: 1234, path: '/documents/personal' },
      { name: 'Common', count: 2345, path: '/documents/common' },
      { name: 'Shared', count: 988, path: '/documents/shared' },
    ]
  },
  { 
    name: 'Fitout', 
    icon: HardHat, 
    path: '/fitout', 
    color: 'bg-cyan-500',
    gradient: 'from-cyan-500 to-cyan-600',
    growth: 7.1,
    totalCount: 234,
    subModules: [
      { name: 'Active', count: 89, path: '/fitout?status=active' },
      { name: 'Completed', count: 123, path: '/fitout?status=completed' },
      { name: 'Pending', count: 22, path: '/fitout?status=pending' },
    ]
  },
  { 
    name: 'Calendar', 
    icon: CalendarDays, 
    path: '/calendar', 
    color: 'bg-violet-500',
    gradient: 'from-violet-500 to-violet-600',
    growth: 11.3,
    totalCount: 789,
    subModules: [
      { name: 'Events', count: 345, path: '/calendar?type=events' },
      { name: 'Tasks', count: 234, path: '/calendar?type=tasks' },
      { name: 'Meetings', count: 210, path: '/calendar?type=meetings' },
    ]
  },
  { 
    name: 'Audit', 
    icon: Activity, 
    path: '/audit/operational/scheduled', 
    color: 'bg-slate-500',
    gradient: 'from-slate-500 to-slate-600',
    growth: 6.8,
    totalCount: 456,
    subModules: [
      { name: 'Operational', count: 234, path: '/audit/operational/scheduled' },
      { name: 'Vendor', count: 222, path: '/audit/vendor/scheduled' },
    ]
  },
];

const ModuleCard: React.FC<{ module: Module; index: number }> = ({ module, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isPositiveGrowth = module.growth >= 0;

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 group",
        isHovered && "shadow-card-hover border-primary/30 scale-[1.02]",
        isExpanded && "row-span-2"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header Section */}
      <Link to={module.path} className="block p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
            module.gradient
          )}>
            <module.icon className="w-6 h-6 text-white" />
          </div>
          
          {/* Growth Badge */}
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
            isPositiveGrowth 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          )}>
            {isPositiveGrowth ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(module.growth)}%</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
          {module.name}
        </h3>
        
        {/* Total Count */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {module.totalCount.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">total records</span>
        </div>
      </Link>

      {/* Submodules Section */}
      <div className="px-5 pb-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }}
          className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <span className="font-medium uppercase tracking-wider">Submodules ({module.subModules.length})</span>
          <ChevronRight className={cn(
            "w-4 h-4 transition-transform duration-200",
            isExpanded && "rotate-90"
          )} />
        </button>

        <div className={cn(
          "space-y-2 overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-96 opacity-100" : "max-h-24 opacity-100"
        )}>
          {module.subModules.slice(0, isExpanded ? undefined : 3).map((subModule, idx) => (
            <Link
              key={subModule.name}
              to={subModule.path}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group/sub"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full bg-gradient-to-r",
                  module.gradient
                )} />
                <span className="text-sm text-muted-foreground group-hover/sub:text-foreground transition-colors">
                  {subModule.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {subModule.count.toLocaleString()}
                </span>
                <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover/sub:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
          
          {!isExpanded && module.subModules.length > 3 && (
            <div className="text-xs text-muted-foreground text-center py-1">
              +{module.subModules.length - 3} more
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-5 pb-4">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-500",
              module.gradient
            )}
            style={{ 
              width: isHovered ? '100%' : `${Math.min((module.totalCount / 5000) * 100, 100)}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate overall stats
  const totalRecords = modules.reduce((acc, m) => acc + m.totalCount, 0);
  const avgGrowth = modules.reduce((acc, m) => acc + m.growth, 0) / modules.length;

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to FM Module</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Modules</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{modules.length}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Records</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalRecords.toLocaleString()}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              avgGrowth >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
            )}>
              {avgGrowth >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">Avg. Growth</span>
          </div>
          <p className={cn(
            "text-3xl font-bold",
            avgGrowth >= 0 ? "text-emerald-500" : "text-red-500"
          )}>
            {avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((module, index) => (
          <ModuleCard key={module.name} module={module} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
