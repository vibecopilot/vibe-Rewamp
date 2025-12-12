import React from 'react';
import { Outlet } from 'react-router-dom';

const FBLayout: React.FC = () => {
  return (
    <div className="flex flex-col w-full p-6">
      <Outlet />
    </div>
  );
};

export default FBLayout;
