import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SiShopware } from 'react-icons/si';
import { MdOutlineCancel } from 'react-icons/md';
import { Tooltip } from 'react-tooltip'; // ✅ Import react-tooltip
import { links } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';

const Sidebar = () => {
  const { currentColor, activeMenu, setActiveMenu, screenSize } = useStateContext();

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const activeLink = 'flex items-center gap-3 pl-4 pt-3 pb-2.5 rounded-lg  text-white text-lg no-underline';
  const normalLink = 'flex items-center gap-3 pl-4 pt-3 pb-2.5 rounded-lg text-lg text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray no-underline';

  return (
    <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-5">
      {activeMenu && (
        <>
          <div className="flex justify-between items-center">
            <Link to="/dashboard" onClick={handleCloseSideBar} className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900 no-underline">
              <SiShopware size={22} /> <span className="text-2xl">MamaGhar</span>
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
          <div className="mt-15 ">
            {links.map((item, index) => (
              <div key={`${item.title}-${index}`}>
                <p className="text-gray-400 dark:text-gray-400 m-1 mt-4 uppercase ">
                  {item.title}
                </p>
                {item.links.map((link) => (
                  <NavLink
                    to={`/${link.name}`}
                    key={link.name}
                    onClick={handleCloseSideBar}
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? currentColor : '',
                    })}
                    className={({ isActive }) => (isActive ? activeLink : normalLink)}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="capitalize no-underline">{link.name}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
