import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Settings,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  LogOut,
  Building2,
  MapPin,
  LayoutDashboard
} from 'lucide-react';
import { getItemInLocalStorage, setItemInLocalStorage } from '../../utils/localStorage';
import { getSiteData, siteChange } from '../../api';

// Feature name mapping from FEATURES array to module names
const featureToModuleMap: Record<string, string[]> = {
  'tickets': ['service-desk'],
  'assets': ['asset'],
  'soft_services': ['soft-services'],
  'items': ['inventory'],
  'vendors': ['supplier-vendor'],
  'audits': ['audit'],
  'mailroom': ['mail-room'],
  'incidents': ['incident'],
  'permits': ['permit'],
  'gatepass': ['vms'],
  'bookings': ['amenities', 'space', 'fb'],
  'meeting': ['meeting'],
  'parking': ['parking'],
  'transport': ['transportation'],
  'fnb': ['fb'],
  'space': ['fitout'],
  'calendar': ['calendar'],
};

// Module configuration with sub-modules
const modules = [
  {
    id: 'fm-module',
    name: 'FM Module',
    subModules: [
      { id: 'service-desk', name: 'Service Desk', path: '/service-desk' },
      { id: 'asset', name: 'Asset', path: '/asset', 
        children: [
          { name: 'Asset', path: '/asset' },
          { name: 'AMC', path: '/asset/amc' },
          { name: 'Meter', path: '/asset/meter' },
          { name: 'Checklist', path: '/asset/checklist' },
          { name: 'Routine Task', path: '/asset/routine-task' },
          { name: 'PPM Checklist', path: '/asset/ppm-checklist' },
          { name: 'PPM Activity', path: '/asset/ppm-activity' },
          { name: 'PPM Calendar', path: '/asset/ppm-calendar' },
          { name: 'Stock Items', path: '/asset/stock-items' },
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

interface SiteData {
  id: number;
  name: string;
  company?: string;
}

interface UserData {
  name: string;
  initials: string;
  email: string;
  mobile: string;
  userType: string;
  avatar?: string;
}

interface AppHeaderProps {
  userName?: string;
  userInitials?: string;
  serviceName?: string;
  locationName?: string;
}

const AppHeader: React.FC<AppHeaderProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [sitesData, setSitesData] = useState<SiteData[]>([]);
  const [selectedSite, setSelectedSite] = useState<SiteData | null>(null);
  const [loadingSites, setLoadingSites] = useState(true);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [collapsedLevels, setCollapsedLevels] = useState({ level1: false, level2: false });
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const siteDropdownRef = useRef<HTMLDivElement>(null);

  // Get enabled features from localStorage
  useEffect(() => {
    const storedFeatures = getItemInLocalStorage('FEATURES');
    if (storedFeatures && Array.isArray(storedFeatures)) {
      const featureNames = storedFeatures.map((f: any) => f.feature_name);
      setEnabledFeatures(featureNames);
    }
  }, []);

  // Filter modules based on enabled features
  const isModuleEnabled = (moduleId: string): boolean => {
    if (enabledFeatures.length === 0) return true; // Show all if no features configured
    
    for (const [feature, moduleIds] of Object.entries(featureToModuleMap)) {
      if (moduleIds.includes(moduleId)) {
        return enabledFeatures.includes(feature);
      }
    }
    return true; // Show modules not in the map by default
  };

  // Filter modules and submodules based on features
  const filteredModules = useMemo(() => {
    return modules.map(mod => ({
      ...mod,
      subModules: mod.subModules.filter(sub => isModuleEnabled(sub.id))
    })).filter(mod => 
      mod.path || (mod.subModules && mod.subModules.length > 0)
    );
  }, [enabledFeatures]);

  // Fetch sites from API
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await getSiteData();
        const sites = response?.data?.sites || response?.data || [];
        const formattedSites = Array.isArray(sites) ? sites.map((site: any) => ({
          id: site.id || site.site_id,
          name: site.name || site.site_name || site.building_name,
          company: site.company || site.company_name || ''
        })) : [];
        
        setSitesData(formattedSites);
        
        // Set selected site from localStorage or first available
        const savedSiteId = getItemInLocalStorage('SITEID');
        if (savedSiteId && formattedSites.length) {
          const savedSite = formattedSites.find((s: SiteData) => s.id === Number(savedSiteId));
          setSelectedSite(savedSite || formattedSites[0]);
        } else if (formattedSites.length) {
          setSelectedSite(formattedSites[0]);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
      } finally {
        setLoadingSites(false);
      }
    };
    
    fetchSites();
  }, []);

  // Get user data from localStorage
  const getUserData = (): UserData => {
    const firstName = String(getItemInLocalStorage('Name') || '');
    const lastName = String(getItemInLocalStorage('LASTNAME') || '');
    const userType = String(getItemInLocalStorage('USERTYPE') || 'User');
    const email = String(getItemInLocalStorage('EMAIL') || getItemInLocalStorage('email') || '');
    const mobile = String(getItemInLocalStorage('MOBILE') || getItemInLocalStorage('phone') || '');
    const avatar = String(getItemInLocalStorage('AVATAR') || getItemInLocalStorage('profileImage') || '');
    
    const name = `${firstName} ${lastName}`.trim() || 'User';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';

    return { name, initials, email, mobile, userType, avatar };
  };

  const userData = getUserData();
  // console.log("UserData------------", userData);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(event.target as Node)) {
        setShowSiteDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear all localStorage keys used in the app
    const keysToRemove = [
      'TOKEN', 'COMPANYID', 'HRMSORGID', 'board_id', 'menuState', 'Name',
      'LASTNAME', 'USERTYPE', 'user', 'UNITID', 'Building', 'categories',
      'SITEID', 'STATUS', 'complaint', 'UserId', 'VIBETOKEN', 'VIBEUSERID',
      'VIBEORGID', 'FEATURES', 'HRMS_EMPLOYEE_ID', 'EMAIL', 'MOBILE', 'AVATAR'
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();
    // Force redirect to login page
    window.location.href = '/login';
  };

  const handleSiteChange = async (site: SiteData) => {
    try {
      // Call API to change site
      await siteChange(site.id);
      setSelectedSite(site);
      setShowSiteDropdown(false);
      // Save to localStorage
      setItemInLocalStorage('SITEID', site.id.toString());
      setItemInLocalStorage('Building', site.name);
      // Trigger data refresh
      window.dispatchEvent(new CustomEvent('siteChanged', { detail: site }));
      // Reload to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error changing site:', error);
    }
  };

  // Derive active module and sub-module from current path
  const getActiveFromPath = () => {
    const pathname = location.pathname;
    
    for (const mod of filteredModules) {
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

  const currentModule = filteredModules.find(m => m.id === activeModule);
  const currentSubModule = currentModule?.subModules.find(s => s.id === activeSubModule);

  // Reorder modules so active one comes first
  const sortedModules = useMemo(() => {
    if (!activeModule) return filteredModules;
    const active = filteredModules.find(m => m.id === activeModule);
    const rest = filteredModules.filter(m => m.id !== activeModule);
    return active ? [active, ...rest] : filteredModules;
  }, [filteredModules, activeModule]);

  // Reorder submodules so active one comes first
  const sortedSubModules = useMemo(() => {
    if (!currentModule?.subModules || !activeSubModule) return currentModule?.subModules || [];
    const active = currentModule.subModules.find(s => s.id === activeSubModule);
    const rest = currentModule.subModules.filter(s => s.id !== activeSubModule);
    return active ? [active, ...rest] : currentModule.subModules;
  }, [currentModule, activeSubModule]);

  // Reorder level 3 items so active one comes first
  const sortedLevel3 = useMemo(() => {
    if (!currentSubModule?.children) return [];
    const activePath = location.pathname;
    
    // Find active item - exact match first, then startsWith for nested paths
    const activeItem = currentSubModule.children.find(c => {
      if (c.path === '/asset') {
        return activePath === '/asset';
      }
      return activePath === c.path || activePath.startsWith(c.path + '/');
    });
    
    if (!activeItem) return currentSubModule.children;
    const rest = currentSubModule.children.filter(c => c.path !== activeItem.path);
    return [activeItem, ...rest];
  }, [currentSubModule, location.pathname]);

  // Auto-collapse when navigating to a sub-module with children (level 3)
  useEffect(() => {
    if (currentSubModule?.children && currentSubModule.children.length > 0) {
      setCollapsedLevels({ level1: true, level2: true });
    }
  }, [currentSubModule]);

  const isActivePath = (path: string) => {
    if (path === '/asset') {
      return location.pathname === '/asset';
    }
    return location.pathname.startsWith(path);
  };

  const handleModuleClick = (moduleId: string) => {
    const mod = filteredModules.find(m => m.id === moduleId);
    if (mod?.subModules.length) {
      navigate(mod.subModules[0].path);
    } else if (mod?.path) {
      navigate(mod.path);
    }
  };

  const handleSubModuleClick = (path: string) => {
    navigate(path);
  };

  const toggleLevel1 = () => setCollapsedLevels(prev => ({ ...prev, level1: !prev.level1 }));
  const toggleLevel2 = () => setCollapsedLevels(prev => ({ ...prev, level2: !prev.level2 }));

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
      {/* Left Side - Site Selector & Dashboard */}
      <div className="flex items-center gap-4">
         {/* Logo */}
        <Link to="/dashboard" className="text-xl font-bold text-foreground">
        LOGO
        </Link>
       

        {/* Dashboard Link */}
        <Link 
        to="/dashboard" 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          location.pathname === '/dashboard' 
          ? 'bg-primary text-primary-foreground' 
          : 'hover:bg-accent text-foreground'
        }`}
        >
        <LayoutDashboard className="w-4 h-4" />
        <span className="text-sm font-medium">Dashboard</span>
        </Link>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-4">
        {/* Site/Company Selector */}
       
   <div className="relative" ref={siteDropdownRef}>
        <button 
          onClick={() => setShowSiteDropdown(!showSiteDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
          disabled={loadingSites}
        >
          <Building2 className="w-4 h-4 text-primary" />
          <div className="text-left">
          {loadingSites ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : selectedSite ? (
            <>
            {selectedSite.company && (
              <div className="text-xs text-muted-foreground">{selectedSite.company}</div>
            )}
            <div className="text-sm font-medium text-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {selectedSite.name}
            </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No sites</div>
          )}
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {showSiteDropdown && sitesData.length > 0 && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">Select Site</div>
            {sitesData.map((site) => (
            <button
              key={site.id}
              onClick={() => handleSiteChange(site)}
              className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors ${
              selectedSite?.id === site.id ? 'bg-accent' : ''
              }`}
            >
              <div className="text-sm font-medium text-foreground">{site.name}</div>
              {site.company && <div className="text-xs text-muted-foreground">{site.company}</div>}
            </button>
            ))}
          </div>
          </div>
        )}
        </div>
        {/* Settings Icon */}
        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
        <Settings className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={userDropdownRef}>
        <button 
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex items-center gap-2 hover:bg-accent rounded-lg p-1 transition-colors"
        >
          {userData.avatar ? (
          <img 
            src={userData.avatar} 
            alt={userData.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          ) : (
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            {userData.initials}
          </div>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {showUserDropdown && (
          <div className="absolute right-0 top-full mt-1 w-72 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
            {userData.avatar ? (
              <img 
              src={userData.avatar} 
              alt={userData.name}
              className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
              {userData.initials}
              </div>
            )}
            <div>
              <div className="font-semibold text-foreground">{userData.name}</div>
              <div className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded inline-block">
              {userData.userType}
              </div>
            </div>
            </div>
          </div>
          
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{userData.email || 'Not available' }</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{userData.mobile || 'Not available'}</span>
            </div>
          </div>

          <div className="p-2 border-t border-border">
            <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
            <LogOut className="w-4 h-4" />
            Logout
            </button>
          </div>
          </div>
        )}
        </div>
      </div>
      </div>

      {/* Module Navigation - Level 1 */}
      <div className="relative">
        <nav 
          className={`flex items-center gap-2 px-4 pr-12 border-b border-border overflow-x-auto transition-all duration-300 ease-in-out ${
            collapsedLevels.level1 && currentModule ? 'max-h-0 py-0 opacity-0 border-0' : 'max-h-16 py-0 opacity-100'
          }`}
        >
          {sortedModules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative uppercase
                ${activeModule === module.id 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {module.name}
              {activeModule === module.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all" />
              )}
            </button>
          ))}
        </nav>

        {/* Collapse/Expand Button for Level 1 - Improved UI */}
        {currentModule && (
          <button
            onClick={toggleLevel1}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full border border-border bg-background hover:bg-accent shadow-sm transition-all duration-200 z-10 ${
              collapsedLevels.level1 ? 'opacity-90' : 'opacity-70 hover:opacity-100'
            }`}
            title={collapsedLevels.level1 ? "Expand modules" : "Collapse modules"}
          >
            <ChevronDown 
              className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                collapsedLevels.level1 ? 'rotate-0' : 'rotate-180'
              }`} 
            />
          </button>
        )}
      </div>

      {/* Sub-Module Navigation - Level 2 */}
      {currentModule && currentModule.subModules.length > 0 && (
        <div className="relative">
          <nav 
            className={`flex items-center gap-2 px-4 pr-12 border-b border-border overflow-x-auto bg-secondary/30 transition-all duration-300 ease-in-out ${
              collapsedLevels.level2 ? 'max-h-0 py-0 opacity-0 border-0' : 'max-h-14 py-0 opacity-100'
            }`}
          >
            {sortedSubModules.map((subModule) => (
              <button
                key={subModule.id}
                onClick={() => handleSubModuleClick(subModule.path)}
                className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors relative uppercase
                  ${activeSubModule === subModule.id 
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {subModule.name}
                {activeSubModule === subModule.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all" />
                )}
              </button>
            ))}
          </nav>

          {/* Collapse/Expand Button for Level 2 - Improved UI */}
          <button
            onClick={toggleLevel2}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full border border-border bg-background hover:bg-accent shadow-sm transition-all duration-200 z-10 ${
              collapsedLevels.level2 ? 'opacity-90' : 'opacity-70 hover:opacity-100'
            }`}
            title={collapsedLevels.level2 ? "Expand sub-modules" : "Collapse sub-modules"}
          >
            <ChevronDown 
              className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                collapsedLevels.level2 ? 'rotate-0' : 'rotate-180'
              }`} 
            />
          </button>
        </div>
      )}

      {/* Tertiary Navigation - Level 3 */}
      {currentSubModule && currentSubModule.children && currentSubModule.children.length > 0 && (
        <nav className="flex items-center gap-2 px-4 py-2 border-b border-border overflow-x-auto bg-muted/50 animate-fade-in">
          {sortedLevel3.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`px-3 py-1.5 text-sm whitespace-nowrap transition-all duration-200 uppercase rounded-md
                ${isActivePath(item.path) 
                  ? 'text-primary font-medium bg-background shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
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