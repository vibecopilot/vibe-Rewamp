import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, NavLink, Link, useLocation } from "react-router-dom";
import { getItemInLocalStorage } from "../utils/localStorage";
import { useSelector } from "react-redux";
import { persistor } from "../store/store";
import { 
  MdOutlineDashboard,
  MdManageAccounts,
} from "react-icons/md";
import { 
  BsTicketPerforated,
  BsPersonCircle,
  BsChevronDown,
  BsChevronUp,
} from "react-icons/bs";
import { 
  IoMdSettings,
  IoMdNotifications,
} from "react-icons/io";
import { PiSignOutBold } from "react-icons/pi";
import { FaCheck, FaRegComment, FaMapMarkerAlt } from "react-icons/fa";

// Feature name mapping from FEATURES array to module names
const featureToModuleMap = {
  'tickets': ['Service Desk'],
  'assets': ['Asset'],
  'soft_services': ['Soft Services'],
  'items': ['Inventory'],
  'vendors': ['Supplier/Vendor'],
  'audits': ['Audit'],
  'mailroom': ['Mail Room'],
  'incidents': ['Incident'],
  'permits': ['Permit'],
  'gatepass': ['Passes'],
  'bookings': ['Facility Booking', 'Hotel Request', 'Flight Request', 'Cab Request'],
  'meeting': ['Meetings'],
  'parking': ['Parking'],
  'transport': ['Transportation'],
  'fnb': ['Food & Beverage'],
  'doctors': ['Doctor Appointment'],
  'fitness': ['Fitness'],
  'bills': ['Bills'],
  'purchase_order': ['PO'],
  'work_order': ['WO'],
  'calendar': ['Calendar'],
  'project_task': ['Project Management', 'Task Management'],
  'space': ['Fit Out'],
  'hrms': ['Employee WorkSpace'],
};

const navItems = [
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
      { name: 'Doctor Appointment', path: '/doctor-appointment' },
      { name: 'Fitness', path: '/fitness' },
      { name: 'Pantry', path: '/pantry' },
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
      { name: 'Material PR', path: '/material-pr' },
      { name: 'Service PR', path: '/service-pr' },
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

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const themeColor = useSelector((state) => state.theme.color);
  const [user, setUser] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [enabledFeatures, setEnabledFeatures] = useState([]);
  const [collapsedLevels, setCollapsedLevels] = useState({ level1: false, level2: false });
  
  const firstName = getItemInLocalStorage("Name") || "";
  const lastName = getItemInLocalStorage("LASTNAME") || "";
  const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

  useEffect(() => {
    const userType = getItemInLocalStorage("USERTYPE");
    setUser(userType || "");
    
    // Get enabled features
    const storedFeatures = getItemInLocalStorage('FEATURES');
    if (storedFeatures && Array.isArray(storedFeatures)) {
      const featureNames = storedFeatures.map((f) => f.feature_name);
      setEnabledFeatures(featureNames);
    }
  }, []);

  // Filter modules based on enabled features
  const isModuleEnabled = (moduleName) => {
    if (enabledFeatures.length === 0) return true; // Show all if no features configured
    
    for (const [feature, modules] of Object.entries(featureToModuleMap)) {
      if (modules.includes(moduleName)) {
        return enabledFeatures.includes(feature);
      }
    }
    return true; // Show modules not in the map by default
  };

  const filteredNavItems = useMemo(() => {
    return navItems.map(item => ({
      ...item,
      children: item.children?.filter(child => isModuleEnabled(child.name))
    })).filter(item => 
      item.path || (item.children && item.children.length > 0)
    );
  }, [enabledFeatures]);

  // Find active parent module
  const activeParent = useMemo(() => {
    for (const item of filteredNavItems) {
      if (item.path && location.pathname.startsWith(item.path)) return item;
      if (item.children) {
        for (const child of item.children) {
          if (child.path && location.pathname.startsWith(child.path)) return item;
        }
      }
    }
    return null;
  }, [location.pathname, filteredNavItems]);

  // Auto-collapse when navigating to a module
  useEffect(() => {
    if (activeParent) {
      setCollapsedLevels({ level1: true, level2: false });
    }
  }, [activeParent]);

  const handleLogout = () => {
    const keysToRemove = [
      "TOKEN", "COMPANYID", "HRMSORGID", "board_id", "menuState", "Name",
      "LASTNAME", "USERTYPE", "user", "UNITID", "Building", "categories",
      "SITEID", "STATUS", "complaint", "UserId", "VIBETOKEN", "VIBEUSERID",
      "VIBEORGID", "FEATURES", "HRMS_EMPLOYEE_ID",
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    navigate("/login");
  };

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  const isParentActive = (item) => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  const handleMouseEnter = (name) => {
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-xl font-bold text-gray-800">LOGO</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Dashboard Link */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MdOutlineDashboard size={18} />
            <span className="text-sm font-medium hidden md:inline">Dashboard</span>
          </Link>

          {/* Service Dropdown */}
          <div className="hidden md:flex items-center gap-1 cursor-pointer">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: themeColor }}
            >
              <span className="text-xs text-white font-bold">A</span>
            </div>
            <span className="text-sm text-gray-800">A2z Online Service</span>
            <BsChevronDown size={12} className="text-gray-500" />
          </div>

          {/* Location Dropdown */}
          <div className="hidden md:flex items-center gap-1 cursor-pointer">
            <FaMapMarkerAlt size={16} style={{ color: themeColor }} />
            <span className="text-sm text-gray-800">PANCHSHIL AVENUE</span>
            <BsChevronDown size={12} className="text-gray-500" />
          </div>

          {/* Action Icons */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FaCheck size={16} className="text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FaRegComment size={16} className="text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <IoMdNotifications size={18} className="text-gray-500" />
            <span 
              className="absolute top-0 right-0 w-4 h-4 text-white text-[10px] rounded-full flex items-center justify-center"
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
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Logout"
          >
            <PiSignOutBold size={18} className="text-gray-500" />
          </button>

          {/* Settings */}
          <Link to="/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <IoMdSettings size={18} className="text-gray-500" />
          </Link>
        </div>
      </div>

      {/* Level 1 - Main Module Navigation */}
      <div className="relative">
        <nav 
          className={`px-2 overflow-x-auto transition-all duration-300 ${collapsedLevels.level1 && activeParent ? 'h-0 overflow-hidden' : ''}`} 
          style={{ backgroundColor: themeColor }}
        >
          <ul className="flex items-center gap-0" onMouseLeave={handleMouseLeave}>
            {filteredNavItems.map((item) => (
              <li
                key={item.name}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.name)}
              >
                {item.path && !item.children ? (
                  <Link
                    to={item.path}
                    className={`
                      block px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap uppercase tracking-wide
                      ${isActive(item.path) 
                        ? 'bg-white text-gray-800 rounded-t-md' 
                        : 'text-white hover:bg-white/20'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className={`
                      block px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap uppercase tracking-wide
                      ${isParentActive(item) || activeDropdown === item.name
                        ? 'bg-white text-gray-800 rounded-t-md' 
                        : 'text-white hover:bg-white/20'
                      }
                    `}
                  >
                    {item.name}
                  </span>
                )}

                {/* Dropdown */}
                {item.children && activeDropdown === item.name && (
                  <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-b-md shadow-lg min-w-[180px] py-1 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.path || '#'}
                        className={`
                          flex items-center px-4 py-2 text-sm transition-colors
                          ${isActive(child.path) 
                            ? 'bg-gray-100 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
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

        {/* Collapse/Expand Button for Level 1 */}
        {activeParent && collapsedLevels.level1 && (
          <button
            onClick={() => setCollapsedLevels(prev => ({ ...prev, level1: false }))}
            className="absolute right-2 top-0.5 p-1 rounded hover:bg-white/20 transition-colors z-10"
            title="Expand modules"
            style={{ backgroundColor: themeColor }}
          >
            <BsChevronDown size={14} className="text-white" />
          </button>
        )}
        {activeParent && !collapsedLevels.level1 && (
          <button
            onClick={() => setCollapsedLevels(prev => ({ ...prev, level1: true }))}
            className="absolute right-2 top-2 p-1 rounded hover:bg-white/20 transition-colors z-10"
            title="Collapse modules"
          >
            <BsChevronUp size={14} className="text-white" />
          </button>
        )}
      </div>

      {/* Level 2 - Sub Module Navigation (when parent is active) */}
      {activeParent?.children && activeParent.children.length > 0 && (
        <div className="relative border-t border-gray-200 bg-gray-100">
          <nav className={`px-2 overflow-x-auto transition-all duration-300 ${collapsedLevels.level2 ? 'h-0 overflow-hidden' : ''}`}>
            <ul className="flex items-center gap-0 flex-nowrap">
              {activeParent.children.map((child) => (
                <li key={child.name} className="flex-shrink-0">
                  <Link
                    to={child.path || '#'}
                    className={`block px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap uppercase
                      ${isActive(child.path) 
                        ? 'border-b-2 text-gray-800' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                    style={isActive(child.path) ? { borderColor: themeColor, color: themeColor } : {}}
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Collapse/Expand Button for Level 2 */}
          {collapsedLevels.level2 ? (
            <button
              onClick={() => setCollapsedLevels(prev => ({ ...prev, level2: false }))}
              className="absolute right-2 top-0.5 p-1 rounded hover:bg-gray-200 transition-colors"
              title="Expand sub-modules"
            >
              <BsChevronDown size={12} className="text-gray-500" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsedLevels(prev => ({ ...prev, level2: true }))}
              className="absolute right-2 top-1.5 p-1 rounded hover:bg-gray-200 transition-colors"
              title="Collapse sub-modules"
            >
              <BsChevronUp size={12} className="text-gray-500" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;