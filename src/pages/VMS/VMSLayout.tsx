import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const tabs = [
  { id: 'visitors', label: 'Visitor', path: '/vms/visitors' },
  { id: 'registered-vehicles', label: 'Registered Vehicles', path: '/vms/registered-vehicles' },
  { id: 'staff', label: 'Staff', path: '/vms/staff' },
  { id: 'patrolling', label: 'Patrolling', path: '/vms/patrolling' },
  { id: 'goods-in-out', label: 'Goods In/Out', path: '/vms/goods-in-out' },
];

const VMSLayout: React.FC = () => {
  const location = useLocation();
  
  // Get current tab name for breadcrumb
  const currentTab = tabs.find(tab => location.pathname.startsWith(tab.path));
  const breadcrumbItems = [
    { label: 'VMS', path: '/vms' },
    ...(currentTab ? [{ label: currentTab.label }] : []),
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Main Tab Navigation with Gradient Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-primary via-primary/80 to-warning rounded-t-lg px-4 py-3">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="border-x border-b border-border rounded-b-lg bg-card">
          {/* Tab Content */}
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VMSLayout;
