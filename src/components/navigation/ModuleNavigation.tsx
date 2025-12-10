import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getItemInLocalStorage } from '../../utils/localStorage';

interface NavItem {
  name: string;
  path?: string;
  feature?: string;
  children?: NavItem[];
}

interface ModuleNavigationProps {
  navItems: NavItem[];
}

// Feature name mapping from FEATURES array to module names
const featureToModuleMap: Record<string, string[]> = {
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

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({ navItems }) => {
  const location = useLocation();
  const themeColor = useSelector((state: any) => state.theme.color);
  const [collapsedLevels, setCollapsedLevels] = useState<{ level1: boolean; level2: boolean }>({
    level1: false,
    level2: false,
  });
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);

  useEffect(() => {
    const storedFeatures = getItemInLocalStorage('FEATURES');
    if (storedFeatures && Array.isArray(storedFeatures)) {
      const featureNames = storedFeatures.map((f: any) => f.feature_name);
      setEnabledFeatures(featureNames);
    }
  }, []);

  // Filter modules based on enabled features
  const isModuleEnabled = (moduleName: string): boolean => {
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
  }, [navItems, enabledFeatures]);

  // Find active levels based on current path
  const { activeLevel1, activeLevel2, activeLevel3Items } = useMemo(() => {
    let level1: NavItem | null = null;
    let level2: NavItem | null = null;
    let level3Items: NavItem[] = [];

    for (const item of filteredNavItems) {
      if (item.path && location.pathname.startsWith(item.path)) {
        level1 = item;
        break;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path && location.pathname.startsWith(child.path)) {
            level1 = item;
            level2 = child;
            // Check if this child has its own sub-navigation (like Asset -> AMC, Meter, etc.)
            break;
          }
        }
      }
      if (level1) break;
    }

    return { activeLevel1: level1, activeLevel2: level2, activeLevel3Items: level3Items };
  }, [location.pathname, filteredNavItems]);

  // Auto-collapse when 3rd level is selected
  useEffect(() => {
    if (activeLevel2) {
      setCollapsedLevels({ level1: true, level2: true });
    }
  }, [activeLevel2]);

  const toggleLevel1 = () => {
    setCollapsedLevels(prev => ({ ...prev, level1: !prev.level1 }));
  };

  const toggleLevel2 = () => {
    setCollapsedLevels(prev => ({ ...prev, level2: !prev.level2 }));
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

  return (
    <div className="bg-background border-b border-border">
      {/* Level 1 Navigation - Main Modules */}
      <div className="relative">
        <nav className={`px-2 overflow-x-auto transition-all duration-300 ${collapsedLevels.level1 && activeLevel1 ? 'h-0 overflow-hidden' : ''}`}>
          <ul className="flex items-center gap-0 flex-nowrap">
            {filteredNavItems.map((item) => (
              <li key={item.name} className="flex-shrink-0">
                {item.path && !item.children ? (
                  <NavLink
                    to={item.path}
                    className={`block px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap uppercase tracking-wide
                      ${isActive(item.path) ? 'border-b-2' : 'text-foreground hover:bg-accent'}`}
                    style={isActive(item.path) ? { color: themeColor, borderColor: themeColor } : {}}
                  >
                    {item.name}
                  </NavLink>
                ) : (
                  <span
                    className={`block px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap uppercase tracking-wide
                      ${isParentActive(item) ? 'border-b-2' : 'text-foreground hover:bg-accent'}`}
                    style={isParentActive(item) ? { color: themeColor, borderColor: themeColor } : {}}
                    onClick={() => {
                      if (item.children?.[0]?.path) {
                        window.location.href = item.children[0].path;
                      }
                    }}
                  >
                    {item.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse/Expand Button for Level 1 */}
        {activeLevel1 && collapsedLevels.level1 && (
          <button
            onClick={toggleLevel1}
            className="absolute right-2 top-1 p-1 rounded hover:bg-accent transition-colors"
            title="Expand modules"
          >
            <ChevronDown size={16} className="text-muted-foreground" />
          </button>
        )}
        {activeLevel1 && !collapsedLevels.level1 && (
          <button
            onClick={toggleLevel1}
            className="absolute right-2 top-2 p-1 rounded hover:bg-accent transition-colors"
            title="Collapse modules"
          >
            <ChevronUp size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Level 2 Navigation - Sub Modules */}
      {activeLevel1?.children && activeLevel1.children.length > 0 && (
        <div className="relative border-t border-border">
          <nav className={`px-2 overflow-x-auto bg-muted/30 transition-all duration-300 ${collapsedLevels.level2 ? 'h-0 overflow-hidden' : ''}`}>
            <ul className="flex items-center gap-0 flex-nowrap">
              {activeLevel1.children.map((child) => (
                <li key={child.name} className="flex-shrink-0">
                  <NavLink
                    to={child.path || '#'}
                    className={`block px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap uppercase
                      ${isActive(child.path) ? 'border-b-2' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                    style={isActive(child.path) ? { color: themeColor, borderColor: themeColor } : {}}
                  >
                    {child.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Collapse/Expand Button for Level 2 */}
          {collapsedLevels.level2 && (
            <button
              onClick={toggleLevel2}
              className="absolute right-2 top-0.5 p-1 rounded hover:bg-accent transition-colors"
              title="Expand sub-modules"
            >
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          )}
          {!collapsedLevels.level2 && (
            <button
              onClick={toggleLevel2}
              className="absolute right-2 top-1.5 p-1 rounded hover:bg-accent transition-colors"
              title="Collapse sub-modules"
            >
              <ChevronUp size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleNavigation;