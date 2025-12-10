import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Check, 
  MessageSquare, 
  Bell, 
  Settings,
  ChevronDown,
  MapPin
} from 'lucide-react';

// Module configuration with sub-modules
const modules = [
  {
    id: 'fm-module',
    name: 'FM Module',
    subModules: [
      { id: 'service-desk', name: 'Service Desk', path: '/service-desk' },
      { id: 'asset', name: 'Asset', path: '/asset', 
        children: [
          { name: 'Asset', path: '/asset', icon: 'grid' },
          { name: 'AMC', path: '/asset/amc', icon: 'file' },
          { name: 'Meter', path: '/asset/meter', icon: 'gauge' },
          { name: 'PPM', path: '/asset/ppm', icon: 'chart' },
          { name: 'Depreciation', path: '/asset/depreciation', icon: 'calendar' },
          { name: 'Design Insight', path: '/asset/design-insight', icon: 'mail' },
          { name: 'Configuration', path: '/asset/configuration', icon: 'settings' },
        ]
      },
      { id: 'soft-services', name: 'Soft Services', path: '/soft-services' },
      { id: 'inventory', name: 'Inventory', path: '/inventory' },
      { id: 'supplier-vendor', name: 'Supplier/Vendor', path: '/supplier-vendor' },
      { id: 'audit', name: 'Audit', path: '/audit' },
      { id: 'mail-room', name: 'Mail Room', path: '/mail-room' },
    ]
  },
  {
    id: 'safety',
    name: 'Safety',
    subModules: [
      { id: 'incident', name: 'Incident Management', path: '/incident' },
    ]
  },
  {
    id: 'security',
    name: 'Security',
    subModules: [
      { id: 'vms', name: 'VMS', path: '/vms',
        children: [
          { name: 'Visitors', path: '/vms/visitors', icon: 'users' },
          { name: 'Pre-Approved', path: '/vms/pre-approved', icon: 'check' },
          { name: 'Blacklist', path: '/vms/blacklist', icon: 'ban' },
          { name: 'Reports', path: '/vms/reports', icon: 'chart' },
          { name: 'Configuration', path: '/vms/configuration', icon: 'settings' },
        ]
      },
    ]
  },
  {
    id: 'booking-management',
    name: 'Booking Management',
    subModules: [
      { id: 'amenities', name: 'Amenities Booking', path: '/amenities' },
      { id: 'space', name: 'Space Booking', path: '/space-booking' },
      { id: 'fb', name: 'F&B', path: '/fb' },
    ]
  },
  {
    id: 'documents',
    name: 'Documents',
    path: '/documents',
    subModules: []
  },
  {
    id: 'fitout',
    name: 'Fitout',
    path: '/fitout',
    subModules: []
  },
  {
    id: 'calendar',
    name: 'Calendar',
    path: '/calendar',
    subModules: []
  },
];

interface AppHeaderProps {
  userName?: string;
  userInitials?: string;
  serviceName?: string;
  locationName?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  userName = 'MA',
  userInitials = 'MA',
  serviceName = 'A2z Online Service',
  locationName = 'PANCHSHIL AVENUE'
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive active module and sub-module from current path
  const getActiveFromPath = () => {
    const pathname = location.pathname;
    
    for (const mod of modules) {
      for (const subMod of mod.subModules) {
        if (pathname.startsWith(subMod.path)) {
          return { moduleId: mod.id, subModuleId: subMod.id };
        }
      }
      if (mod.path && pathname.startsWith(mod.path)) {
        return { moduleId: mod.id, subModuleId: '' };
      }
    }
    return { moduleId: 'fm-module', subModuleId: '' };
  };

  const { moduleId: activeModule, subModuleId: activeSubModule } = getActiveFromPath();

  const currentModule = modules.find(m => m.id === activeModule);
  const currentSubModule = currentModule?.subModules.find(s => s.id === activeSubModule);

  const isActivePath = (path: string) => {
    if (path === '/asset') {
      return location.pathname === '/asset';
    }
    return location.pathname.startsWith(path);
  };

  const handleModuleClick = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (mod?.subModules.length) {
      navigate(mod.subModules[0].path);
    } else if (mod?.path) {
      navigate(mod.path);
    }
  };

  const handleSubModuleClick = (subModuleId: string, path: string) => {
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/dashboard" className="text-xl font-bold text-foreground">
            LOGO
          </Link>
          
          {/* Dashboard Link */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Service Dropdown */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
              A
            </div>
            <span className="text-foreground">{serviceName}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Location Dropdown */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{locationName}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Check className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="relative p-2 hover:bg-accent rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            {userInitials}
          </div>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Module Navigation - Level 1 */}
      <nav className="flex items-center gap-1 px-4 border-b border-border overflow-x-auto">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative
              ${activeModule === module.id 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {module.name}
            {activeModule === module.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </nav>

      {/* Sub-Module Navigation - Level 2 */}
      {currentModule && currentModule.subModules.length > 0 && (
        <nav className="flex items-center gap-1 px-4 border-b border-border overflow-x-auto bg-secondary/30">
          {currentModule.subModules.map((subModule) => (
            <button
              key={subModule.id}
              onClick={() => handleSubModuleClick(subModule.id, subModule.path)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors relative
                ${activeSubModule === subModule.id 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {subModule.name}
              {activeSubModule === subModule.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </nav>
      )}

      {/* Tertiary Navigation - Level 3 */}
      {currentSubModule && currentSubModule.children && currentSubModule.children.length > 0 && (
        <nav className="flex items-center gap-6 px-4 py-2 border-b border-border overflow-x-auto">
          {currentSubModule.children.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center gap-2 text-sm whitespace-nowrap transition-colors
                ${isActivePath(item.path) 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default AppHeader;