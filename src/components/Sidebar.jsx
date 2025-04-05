import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SiShopware } from 'react-icons/si';
import { MdOutlineCancel, MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp, MdOutlinePostAdd } from 'react-icons/md';
import { Tooltip } from 'react-tooltip'; // ✅ Import react-tooltip
import { links } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import { FiHome, FiMap, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import { RiUserShared2Fill } from 'react-icons/ri';
import { BiSolidCategory } from 'react-icons/bi';
import { FaCog } from 'react-icons/fa';

const Sidebar = () => {
  const { currentColor, activeMenu, setActiveMenu, screenSize } = useStateContext();
  const [isConfigOpen, setIsConfigOpen] = useState(false); // State for Config Dropdown

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const activeLink = 'flex items-center gap-3 pl-4 pt-3 pb-2.5 rounded-lg bg-blue-600 text-white text-lg no-underline';
  const normalLink = 'flex items-center gap-3 pl-4 pt-3 pb-2.5 rounded-lg text-lg text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray no-underline';

  return (
    <div className={`pl-1 pb-5 fixed h-screen w-72 bg-white dark:bg-gray-900 shadow-md transition-transform duration-500 ease-in-out ${activeMenu ? "translate-x-0" : "-translate-x-72"
      }`}
    >
      <div className="flex justify-between items-center">
        <Link to="/dashboard" onClick={handleCloseSideBar} className="items-center gap-2 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900 no-underline">
          <img
            src="/mamaGhar.png"
            alt="MamaGhar Logo"
            className="w-8 h-8 rounded-2xl"
          />
          <span className="text-3xl">MamaGhar</span>
        </Link>
        {/* ✅ Replace Syncfusion Tooltip with react-tooltip */}
        <button
          type="button"
          onClick={() => setActiveMenu(!activeMenu)}
          style={{ color: currentColor }}
          className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
          data-tooltip-id="menu-tooltip" // ✅ Tooltip ID
        >
          <MdOutlineCancel size={24} />
        </button>
        <Tooltip id="menu-tooltip" place="bottom" effect="solid">
          Menu
        </Tooltip>
      </div>
      {/* Sidebar Menu */}
      <div className="mt-4">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? activeLink : normalLink)}>
          <FiShoppingBag className="text-xl" /> Dashboard
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => (isActive ? activeLink : normalLink)}>
          <RiUserShared2Fill className="text-xl" /> Users
        </NavLink>
        <NavLink to="/posts" className={({ isActive }) => (isActive ? activeLink : normalLink)}>
          <MdOutlinePostAdd className="text-xl" /> Posts
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => (isActive ? activeLink : normalLink)}>
          <BiSolidCategory className="text-xl" /> Categories
        </NavLink>

        {/* Config Dropdown */}
        <div>
          <button
            className={`flex items-center justify-between w-full pl-4 pt-3 pb-2.5 rounded-lg text-lg text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray no-underline focus:outline-none transition-colors duration-200 ${isConfigOpen ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
            onClick={() => setIsConfigOpen(!isConfigOpen)}
          >
            <div className="flex items-center gap-3">
              <FaCog className="text-xl" />
              <span>Config</span>
            </div>
            <MdOutlineKeyboardArrowDown
              className={`mr-4 text-xl transition-all duration-300 transform ${isConfigOpen ? "rotate-180" : "rotate-0"
                }`}
            />
          </button>

          {/* Dropdown Items */}
          <div
            className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isConfigOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
              <NavLink
                to="/state"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 rounded-lg transition-colors duration-200 ${isActive
                    ? activeLink : normalLink
                  }`
                }
              >
                <FiMapPin className="text-lg opacity-80" />
                <span>State</span>
              </NavLink>

              <NavLink
                to="/district"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 rounded-lg transition-colors duration-200 ${isActive
                    ? activeLink : normalLink
                  }`
                }
              >
                <FiMap className="text-lg opacity-80" />
                <span>District</span>
              </NavLink>

              <NavLink
                to="/city"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 rounded-lg transition-colors duration-200 ${isActive
                    ? activeLink : normalLink
                  }`
                }
              >
                <FiHome className="text-lg opacity-80" />
                <span>City</span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
