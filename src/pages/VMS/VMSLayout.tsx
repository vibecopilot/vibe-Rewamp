import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const tabs = [
  { id: 'visitors', label: 'Visitors', path: '/vms/visitors' },
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
      
      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <Outlet />
    </div>
  );
};

export default VMSLayout;
