import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const level2Tabs = [
  { id: 'visitors', label: 'Visitors', path: '/security/visitors' },
  { id: 'registered-vehicles', label: 'Registered Vehicles', path: '/security/registered-vehicles' },
  { id: 'staff', label: 'Staff', path: '/security/staff' },
  { id: 'patrolling', label: 'Patrolling', path: '/security/patrolling' },
  { id: 'goods-in-out', label: 'Goods In/Out', path: '/security/goods-in-out' },
];

const SecurityLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getActiveTab = () => {
    const tab = level2Tabs.find(tab => location.pathname.startsWith(tab.path));
    return tab?.id || 'visitors';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Level 2 Tabs */}
      <div className="bg-background border-b border-border">
        <nav className="overflow-x-auto scrollbar-hide">
          <ul className="flex items-center">
            {level2Tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => navigate(tab.path)}
                  className={`px-6 py-3 text-sm font-semibold transition-colors whitespace-nowrap uppercase tracking-wide ${
                    getActiveTab() === tab.id
                      ? 'text-primary border-b-2 border-primary bg-accent/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SecurityLayout;
