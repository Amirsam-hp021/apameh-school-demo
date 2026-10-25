import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DemoBanner from './DemoBanner';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/** App shell for signed-in pages: demo banner, sidebar, top bar and page content. */
export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer and scroll to top on navigation.
  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <div className="flex flex-1">
        <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DemoBanner />
          <Topbar onMenu={() => setDrawerOpen(true)} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
