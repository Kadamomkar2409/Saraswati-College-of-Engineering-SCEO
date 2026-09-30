import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ onOpenAddStudent }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/students')) return 'Student Directory';
    if (location.pathname.startsWith('/dashboard')) return 'Admin Overview';
    return 'Saraswati College of Engineering';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenAddStudent={onOpenAddStudent}
      />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          onToggleMobile={() => setMobileOpen((prev) => !prev)}
          title={getPageTitle()}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
