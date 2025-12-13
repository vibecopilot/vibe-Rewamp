import React from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const tabs = [
  { id: 'events', label: 'Events', path: '/crm/communications/events' },
  { id: 'broadcast', label: 'Broadcast', path: '/crm/communications/broadcast' },
  { id: 'polls', label: 'Polls', path: '/crm/communications/polls' },
  { id: 'forum', label: 'Forum', path: '/crm/communications/forum' },
  { id: 'groups', label: 'Groups', path: '/crm/communications/groups' },
];

const CommunicationsLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="p-6">
      {/* Tab Navigation - Above Breadcrumb */}
      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              `px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive || location.pathname.startsWith(tab.path)
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Breadcrumb - Below Tabs */}
      <Breadcrumb items={[
        { label: 'CRM', path: '/crm/communications' },
        { label: 'Communications' }
      ]} />

      {/* Content Area */}
      <div className="bg-card border border-border rounded-lg p-4 mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default CommunicationsLayout;
