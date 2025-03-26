import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { Button } from '.';
// import { userProfileData } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
// import avatar from '../data/avatar.jpg';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { useSelector } from 'react-redux';

const UserProfile = () => {
  const { currentColor,setIsClicked, initialState } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-6 rounded-lg w-96 shadow-lg">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg dark:text-gray-200">User Profile</p>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>
      <div className="flex gap-4 items-center mt-1 border-color border-b-1 pb-2">
        {
          admin?.avatar && (
            <img
              className="rounded-full h-24 w-24"
              src={admin.avatar}
              alt="user-profile"
            />
          )
        }
        <div>
          <p className="font-semibold text-xl dark:text-gray-200 mb-1">
            {admin?.name || 'Michael Roberts'}
          </p>
          <p className="text-gray-500 text-sm dark:text-gray-400 mb-1">
            {admin?.role || 'Administrator'}
          </p>
          <p className="text-gray-500 text-sm font-semibold dark:text-gray-400 mb-1">
            {admin?.email || 'info@shop.com'}
          </p>
        </div>
      </div>
      {/* <div>
        {userProfileData.map((item, index) => (
          <div key={index} className="flex gap-4 border-b-1 border-color p-2 hover:bg-light-gray cursor-pointer dark:hover:bg-[#42464D]">
            <button
              type="button"
              style={{ color: item.iconColor, backgroundColor: item.iconBg }}
              className=" text-xl rounded-lg p-3 hover:bg-light-gray"
            >
              {item.icon}
            </button>

            <div>
              <p className="font-semibold dark:text-gray-200 mb-1">{item.title}</p>
              <p className="text-gray-500 text-sm dark:text-gray-400 mb-1"> {item.desc} </p>
            </div>
          </div>
        ))}
      </div> */}

      <div className="mt-2">
        <button
          style={{
            backgroundColor: currentColor
          }}
          className='text-white p-2.5 rounded-[10px] w-full'
          onClick={()=>{
            handleLogout();
            setIsClicked(initialState);
          }} // Directly use onClick
        >
          Logout
        </button>
      </div>
    </div>

  );
};

export default UserProfile;
