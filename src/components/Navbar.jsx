import React, { useEffect, useState } from "react";
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
} from "react-icons/bs";
import { 
  IoMdSettings,
  IoMdNotifications,
} from "react-icons/io";
import { PiSignOutBold } from "react-icons/pi";
import { FaCheck, FaRegComment, FaMapMarkerAlt } from "react-icons/fa";

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
  
  const firstName = getItemInLocalStorage("Name") || "";
  const lastName = getItemInLocalStorage("LASTNAME") || "";
  const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

  useEffect(() => {
    const userType = getItemInLocalStorage("USERTYPE");
    setUser(userType || "");
  }, []);

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

      {/* Main Navigation */}
      <nav className="px-2 overflow-x-auto" style={{ backgroundColor: themeColor }}>
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
                    block px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap
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
                    block px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap
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
    </header>
  );
};

export default Navbar;