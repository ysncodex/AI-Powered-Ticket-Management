import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import HeaderNav from './HeaderNav';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      {/* Top Navigation with Profile & Logout */}
      <HeaderNav />

      <div className="flex h-[calc(100vh-64px)] bg-gray-50 text-gray-900 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
