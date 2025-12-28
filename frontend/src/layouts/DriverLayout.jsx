import React from 'react';
import DriverSidebar from './DriverSidebar';

const DriverLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DriverSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;