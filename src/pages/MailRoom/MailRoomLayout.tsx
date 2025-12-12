import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const tabs = [
  { id: 'delivery-vendor', label: 'Delivery Vendor', path: '/mail-room/delivery-vendor' },
  { id: 'inbound', label: 'Inbound', path: '/mail-room/inbound' },
  { id: 'outbound', label: 'Outbound', path: '/mail-room/outbound' },
];

const MailRoomLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentTab = tabs.find(tab => location.pathname.startsWith(tab.path));
  const breadcrumbItems = [
    { label: 'FM Module', path: '/mail-room' },
    { label: 'Mail Room' },
    ...(currentTab ? [{ label: currentTab.label }] : []),
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                location.pathname.startsWith(tab.path)
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content Area */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default MailRoomLayout;
