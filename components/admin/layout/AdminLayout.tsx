'use client';

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  sidebarPosition?: 'left' | 'right';
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, sidebarPosition = 'left' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isRightSidebar = sidebarPosition === 'right';

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        position={sidebarPosition}
      />

      {/* Main content */}
      <div className={`w-full ${isRightSidebar ? 'lg:pr-64' : 'lg:pl-64'} pl-0 pr-0`}>
        {/* Header */}
        <AdminHeader 
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          sidebarPosition={sidebarPosition}
        />

        {/* Page content - Full width */}
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
