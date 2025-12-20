import React from 'react';
import { Outlet } from 'react-router-dom';

// SecurityLayout - renders only the content area
// Level 2 tabs (VISITORS | REGISTERED VEHICLES | STAFF | PATROLLING | GOODS IN/OUT) 
// are rendered by AppHeader, so we don't duplicate them here
const SecurityLayout: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default SecurityLayout;