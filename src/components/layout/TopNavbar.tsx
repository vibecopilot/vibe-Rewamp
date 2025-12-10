import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ChevronDown, 
  Check, 
  MessageSquare, 
  Bell, 
  Settings,
  MapPin
} from 'lucide-react';

interface NavItem {
  name: string;
  path?: string;
  children?: NavItem[];
  icon?: React.ReactNode;
}

interface TopNavbarProps {
  logo?: string;
  navItems: NavItem[];
  onServiceChange?: (service: string) => void;
  onLocationChange?: (location: string) => void;
  currentService?: string;
  currentLocation?: string;
  userName?: string;
  userInitials?: string;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  logo = 'LOGO',
  navItems,
  onServiceChange,
  onLocationChange,
  currentService = 'A2z Online Service',
  currentLocation = 'PANCHSHIL AVENUE',
  userName,
  userInitials = 'MA',
}) => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  const handleMouseEnter = (name: string) => {
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
    setActiveSubDropdown(null);
  };

  const handleSubMouseEnter = (name: string) => {
    setActiveSubDropdown(name);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-xl font-bold text-foreground">{logo}</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Dashboard Link */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          {/* Service Dropdown */}
          <div className="flex items-center gap-1 cursor-pointer group">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs text-primary-foreground font-bold">A</span>
            </div>
            <span className="text-sm text-foreground">{currentService}</span>
            <ChevronDown size={16} className="text-muted-foreground" />
          </div>

          {/* Location Dropdown */}
          <div className="flex items-center gap-1 cursor-pointer group">
            <MapPin size={18} className="text-primary" />
            <span className="text-sm text-foreground">{currentLocation}</span>
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
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
            <span className="text-sm font-medium text-foreground">{userInitials}</span>
          </div>

          {/* Settings */}
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <Settings size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-4">
        <ul className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
          {navItems.map((item) => (
            <li
              key={item.name}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.name)}
            >
              {item.path ? (
                <Link
                  to={item.path}
                  className={`
                    block px-4 py-3 text-sm font-medium transition-colors
                    ${isActive(item.path) 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-foreground hover:text-primary hover:bg-accent'
                    }
                  `}
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className={`
                    block px-4 py-3 text-sm font-medium cursor-pointer transition-colors
                    ${activeDropdown === item.name 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-foreground hover:text-primary hover:bg-accent'
                    }
                  `}
                >
                  {item.name}
                </span>
              )}

              {/* First Level Dropdown */}
              {item.children && activeDropdown === item.name && (
                <div className="absolute top-full left-0 bg-card border border-border rounded-md shadow-lg min-w-[200px] py-1 z-50 animate-fade-in">
                  {item.children.map((child) => (
                    <div
                      key={child.name}
                      className="relative"
                      onMouseEnter={() => handleSubMouseEnter(child.name)}
                    >
                      {child.path ? (
                        <Link
                          to={child.path}
                          className={`
                            flex items-center gap-2 px-4 py-2 text-sm transition-colors
                            ${isActive(child.path) 
                              ? 'text-primary bg-accent' 
                              : 'text-foreground hover:text-primary hover:bg-accent'
                            }
                          `}
                        >
                          {child.icon}
                          {child.name}
                        </Link>
                      ) : (
                        <div
                          className={`
                            flex items-center justify-between gap-2 px-4 py-2 text-sm cursor-pointer transition-colors
                            ${activeSubDropdown === child.name 
                              ? 'text-primary bg-accent' 
                              : 'text-foreground hover:text-primary hover:bg-accent'
                            }
                          `}
                        >
                          <span className="flex items-center gap-2">
                            {child.icon}
                            {child.name}
                          </span>
                          {child.children && <ChevronDown size={14} className="-rotate-90" />}
                        </div>
                      )}

                      {/* Second Level Dropdown */}
                      {child.children && activeSubDropdown === child.name && (
                        <div className="absolute top-0 left-full bg-card border border-border rounded-md shadow-lg min-w-[200px] py-1 z-50 animate-fade-in">
                          {child.children.map((subChild) => (
                            <Link
                              key={subChild.name}
                              to={subChild.path || '#'}
                              className={`
                                flex items-center gap-2 px-4 py-2 text-sm transition-colors
                                ${isActive(subChild.path) 
                                  ? 'text-primary bg-accent' 
                                  : 'text-foreground hover:text-primary hover:bg-accent'
                                }
                              `}
                            >
                              {subChild.icon}
                              {subChild.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default TopNavbar;
