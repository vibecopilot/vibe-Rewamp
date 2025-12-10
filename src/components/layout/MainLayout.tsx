import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  ChevronDown, 
  Check, 
  MessageSquare, 
  Bell, 
  Settings,
  MapPin,
  LogOut
} from 'lucide-react';
import { getItemInLocalStorage } from '../../utils/localStorage';
import { persistor } from '../../store/store';

interface NavItem {
  name: string;
  path?: string;
  children?: NavItem[];
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: 'FM Module',
    children: [
      { name: 'Service Desk', path: '/tickets' },
      { name: 'Asset', path: '/assets' },
      { name: 'Soft Services', path: '/services' },
      { name: 'Inventory', path: '/materials' },
      { name: 'Supplier/Vendor', path: '/suppliers' },
      { name: 'Audit', path: '/audit' },
      { name: 'Mail Room', path: '/mail-room' },
    ]
  },
  {
    name: 'Safety',
    children: [
      { name: 'Incident', path: '/incidents' },
      { name: 'Permit', path: '/permit' },
    ]
  },
  {
    name: 'Security',
    children: [
      { name: 'Passes', path: '/passes' },
      { name: 'Patrolling', path: '/patrolling' },
    ]
  },
  {
    name: 'Value Added Services',
    children: [
      { name: 'Meetings', path: '/meeting' },
      { name: 'Parking', path: '/parking' },
      { name: 'Transportation', path: '/transportation' },
      { name: 'Food & Beverage', path: '/food-beverage' },
    ]
  },
  {
    name: 'Finance',
    children: [
      { name: 'Bills', path: '/bills' },
      { name: 'PO', path: '/purchase-order' },
      { name: 'WO', path: '/work-order' },
      { name: 'GRN', path: '/grn' },
      { name: 'GDN', path: '/gdn' },
      { name: 'LOI', path: '/letter-of-indent' },
      { name: 'Accounting', path: '/accounting' },
    ]
  },
  {
    name: 'CRM',
    children: [
      { name: 'Business', path: '/business' },
      { name: 'Insights', path: '/insights' },
      { name: 'CAR', path: '/car' },
    ]
  },
  {
    name: 'Utility',
    children: [
      { name: 'Project Management', path: '/project-management' },
      { name: 'Task Management', path: '/Task-management' },
      { name: 'Calendar', path: '/calendar' },
      { name: 'Compliance', path: '/compliance' },
    ]
  },
  {
    name: 'Booking Management',
    children: [
      { name: 'Facility Booking', path: '/booking' },
      { name: 'Hotel Request', path: '/admin/booking-request/hotel-request' },
      { name: 'Flight Request', path: '/admin/booking-request/flight-request' },
      { name: 'Cab Request', path: '/admin/booking-request/cab-request' },
    ]
  },
  {
    name: 'Transitioning',
    children: [
      { name: 'Fit Out', path: '/fit-out' },
    ]
  },
  {
    name: 'Market Place',
    path: '/market-place'
  },
  {
    name: 'Employee WorkSpace',
    path: '/employee/workspace'
  },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const themeColor = useSelector((state: any) => state.theme.color);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState('');
  
  const firstName = getItemInLocalStorage('Name') || '';
  const lastName = getItemInLocalStorage('LASTNAME') || '';
  const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';

  useEffect(() => {
    const userType = getItemInLocalStorage('USERTYPE');
    setUser(userType || '');
  }, []);

  const handleLogout = () => {
    const keysToRemove = [
      'TOKEN', 'COMPANYID', 'HRMSORGID', 'board_id', 'menuState', 'Name',
      'LASTNAME', 'USERTYPE', 'user', 'UNITID', 'Building', 'categories',
      'SITEID', 'STATUS', 'complaint', 'UserId', 'VIBETOKEN', 'VIBEUSERID',
      'VIBEORGID', 'FEATURES', 'HRMS_EMPLOYEE_ID',
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    navigate('/login');
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  const isParentActive = (item: NavItem) => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  const handleMouseEnter = (name: string) => {
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-foreground">LOGO</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Dashboard Link */}
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <LayoutDashboard size={18} />
              <span className="text-sm font-medium hidden md:inline">Dashboard</span>
            </Link>

            {/* Service Dropdown */}
            <div className="hidden md:flex items-center gap-1 cursor-pointer group">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: themeColor }}
              >
                <span className="text-xs text-white font-bold">A</span>
              </div>
              <span className="text-sm text-foreground">A2z Online Service</span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </div>

            {/* Location Dropdown */}
            <div className="hidden md:flex items-center gap-1 cursor-pointer group">
              <MapPin size={18} style={{ color: themeColor }} />
              <span className="text-sm text-foreground">PANCHSHIL AVENUE</span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </div>

            {/* Action Icons */}
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Check size={18} className="text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <MessageSquare size={18} className="text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors relative">
              <Bell size={18} className="text-muted-foreground" />
              <span 
                className="absolute top-1 right-1 w-4 h-4 text-white text-[10px] rounded-full flex items-center justify-center"
                style={{ backgroundColor: themeColor }}
              >
                3
              </span>
            </button>

            {/* User Avatar */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: themeColor }}
            >
              <span className="text-sm font-medium text-white">{userInitials}</span>
            </div>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-accent rounded-full transition-colors"
              title="Logout"
            >
              <LogOut size={18} className="text-muted-foreground" />
            </button>

            {/* Settings */}
            <Link to="/settings" className="p-2 hover:bg-accent rounded-full transition-colors">
              <Settings size={18} className="text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="px-2 overflow-x-auto">
          <ul className="flex items-center gap-0" onMouseLeave={handleMouseLeave}>
            {navItems.map((item) => (
              <li
                key={item.name}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.name)}
              >
                {item.path && !item.children ? (
                  <Link
                    to={item.path}
                    className={`
                      block px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap
                      ${isActive(item.path) 
                        ? 'border-b-2' 
                        : 'text-foreground hover:bg-accent'
                      }
                    `}
                    style={isActive(item.path) ? { color: themeColor, borderColor: themeColor } : {}}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className={`
                      block px-3 py-3 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap
                      ${isParentActive(item) || activeDropdown === item.name
                        ? 'border-b-2' 
                        : 'text-foreground hover:bg-accent'
                      }
                    `}
                    style={isParentActive(item) || activeDropdown === item.name ? { color: themeColor, borderColor: themeColor } : {}}
                  >
                    {item.name}
                  </span>
                )}

                {/* Dropdown */}
                {item.children && activeDropdown === item.name && (
                  <div className="absolute top-full left-0 bg-card border border-border rounded-md shadow-lg min-w-[180px] py-1 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.path || '#'}
                        className={`
                          flex items-center px-4 py-2 text-sm transition-colors
                          ${isActive(child.path) 
                            ? 'bg-accent' 
                            : 'text-foreground hover:bg-accent'
                          }
                        `}
                        style={isActive(child.path) ? { color: themeColor } : {}}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;