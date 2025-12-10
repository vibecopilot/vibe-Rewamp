import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

const assetSubModules = [
  { name: "Asset", path: "/assets/all-assets" },
  { name: "AMC", path: "/assets/amc" },
  { name: "Meter", path: "/assets/meter" },
  { name: "Checklist", path: "/assets/checklist" },
  { name: "Routine Task", path: "/assets/routine-task" },
  { name: "PPM Checklist", path: "/assets/ppm" },
  { name: "PPM Activity", path: "/assets/ppm-task" },
  { name: "PPM Calendar", path: "/assets/ppm-calendar" },
  { name: "Stock Items", path: "/assets/stock-items" },
];

const AssetNav = () => {
  const themeColor = useSelector((state) => state.theme.color);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative w-full mb-2">
      <nav className={`overflow-x-auto transition-all duration-300 ${isCollapsed ? 'h-0 overflow-hidden' : ''}`}>
        <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-lg">
          {assetSubModules.map((module) => (
            <NavLink
              key={module.path}
              to={module.path}
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-200 uppercase tracking-wide
                ${isActive 
                  ? "bg-white shadow-sm" 
                  : "text-gray-600 hover:bg-white/50"
                }`
              }
              style={({ isActive }) => isActive ? { color: themeColor } : {}}
            >
              {module.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-0 -top-1 p-1 rounded hover:bg-gray-200 transition-colors"
        title={isCollapsed ? "Expand sub-modules" : "Collapse sub-modules"}
      >
        {isCollapsed ? (
          <BsChevronDown size={14} className="text-gray-500" />
        ) : (
          <BsChevronUp size={14} className="text-gray-500" />
        )}
      </button>
    </div>
  );
};

export default AssetNav;
