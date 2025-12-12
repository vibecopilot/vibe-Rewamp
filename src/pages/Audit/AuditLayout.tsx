import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

const mainTabs = [
  { id: 'operational', label: 'Operational', path: '/audit/operational' },
  { id: 'vendor', label: 'Vendor', path: '/audit/vendor' },
];

const operationalSubTabs = [
  { id: 'scheduled', label: 'Scheduled', path: '/audit/operational/scheduled' },
  { id: 'conducted', label: 'Conducted', path: '/audit/operational/conducted' },
  { id: 'checklists', label: 'Checklists', path: '/audit/operational/checklists' },
];

const vendorSubTabs = [
  { id: 'scheduled', label: 'Scheduled', path: '/audit/vendor/scheduled' },
  { id: 'conducted', label: 'Conducted', path: '/audit/vendor/conducted' },
];

const AuditLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isOperational = location.pathname.includes('/audit/operational');
  const isVendor = location.pathname.includes('/audit/vendor');
  const currentMainTab = mainTabs.find(tab => location.pathname.startsWith(tab.path));
  const subTabs = isOperational ? operationalSubTabs : isVendor ? vendorSubTabs : [];
  const currentSubTab = subTabs.find(tab => location.pathname.startsWith(tab.path));

  const breadcrumbItems = [
    { label: 'FM Module', path: '/audit' },
    { label: 'Audit' },
    ...(currentMainTab ? [{ label: currentMainTab.label }] : []),
    ...(currentSubTab ? [{ label: currentSubTab.label }] : []),
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Main Tab Navigation (Operational / Vendor) */}
      <div className="border-b border-border mb-4">
        <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id === 'operational' ? '/audit/operational/scheduled' : '/audit/vendor/scheduled')}
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

      {/* Sub-Tab Navigation (Scheduled / Conducted / Checklists) */}
      {subTabs.length > 0 && (
        <div className="mb-6">
          <nav className="flex gap-2 overflow-x-auto scrollbar-hide">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === tab.path
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}
      
      {/* Content Area */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuditLayout;