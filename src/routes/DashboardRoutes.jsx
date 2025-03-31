import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip'; // ✅ Import react-tooltip
import { Navbar, Sidebar, ThemeSettings } from '../components';
import { Dashboard, Posts, Categories, SubCategories } from '../pages';
import { useStateContext } from '../contexts/ContextProvider';
import Users from '../pages/Users';

const DashboardRoutes = () => {
  const { setCurrentColor, setCurrentMode, currentMode, activeMenu, currentColor, themeSettings, setThemeSettings } = useStateContext();

  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
      <div className="flex relative dark:bg-main-dark-bg">
        {/* Settings Button with Tooltip */}
        <div className="fixed right-4 bottom-4" style={{ zIndex: '1000' }}>
          <button
            type="button"
            onClick={() => setThemeSettings(true)}
            style={{ background: currentColor, borderRadius: '50%' }}
            className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
            data-tooltip-id="settings-tooltip" // ✅ Tooltip ID
          >
            <FiSettings />
          </button>
          <Tooltip id="settings-tooltip" place="top" effect="solid">
            Settings
          </Tooltip>
        </div>
        {activeMenu ? (
          <div className="sidebar dark:bg-secondary-dark-bg shadow-lg">
            <Sidebar />
          </div>
        ) : (
          <div className="w-0 dark:bg-secondary-dark-bg">
            <Sidebar />
          </div>
        )}
        <div
          className={
            activeMenu
              ? 'dark:bg-main-dark-bg bg-main-bg min-h-screen md:ml-72 w-full  '
              : 'bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 '
          }
        >
          <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full shadow-sm">
            <Navbar />
          </div>
          <div>
            {themeSettings && (<ThemeSettings />)}

            <Routes>
              {/* dashboard  */}
              <Route path="dashboard" element={(<Dashboard />)} />

              {/* pages  */}
              <Route path="users" element={(<Users />)} />
              <Route path="categories" element={<Categories />} />
              <Route path="subcategories" element={<SubCategories />} />
              <Route path="posts" element={<Posts />} />
            </Routes>
          </div>
          {/* <Footer /> */}
        </div>
      </div>

    </div>
  );
};

export default DashboardRoutes;
