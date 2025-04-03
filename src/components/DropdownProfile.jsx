import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Transition from '../utils/Transition';
import DefaultAvatar from '../assets/joblk.png';
import { instance } from '/src/Service/AxiosHolder/AxiosHolder.jsx';
import Swal from 'sweetalert2';

function DropdownProfile({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [profileImage, setProfileImage] = useState(DefaultAvatar);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState({ username: 'Guest', role: 'Guest' });

  const trigger = useRef(null);
  const dropdown = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const showSuccess = () => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Success!",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const showError = (msg) => {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: msg || "Operation failed",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("userData");

    if (authToken) {
      setIsSignedIn(true);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        
        if (parsedUser.id) {
          fetchProfileImage(parsedUser.id);
        }
      }
    }
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const fetchProfileImage = async (userId) => {
    try {
      const response = await instance.get(`/user/get/imageProfile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        responseType: 'blob',
      });

      if (response.data && response.data.size > 0) {
        const imageUrl = URL.createObjectURL(response.data);
        setProfileImage(imageUrl);
      } else {
        setProfileImage(DefaultAvatar);
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
      setProfileImage(DefaultAvatar);
    }
  };

  const handleRefreshApplication = () => {
    try {
      setDropdownOpen(false);
      
      Swal.fire({
        title: 'Refreshing...',
        text: 'Please wait while the application refreshes',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
        timer: 1500
      });
      
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        
        if (parsedUser.id) {
          fetchProfileImage(parsedUser.id);
        }
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error refreshing application:', error);
      showError('Failed to refresh application');
    }
  };

  const clickHandler = useCallback(({ target }) => {
    if (!dropdown.current || !trigger.current) return;
    if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
    setDropdownOpen(false);
  }, [dropdownOpen]);

  const keyHandler = useCallback(({ keyCode }) => {
    if (dropdownOpen && keyCode === 27) {
      setDropdownOpen(false);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    document.addEventListener('click', clickHandler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [clickHandler, keyHandler]);

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setIsSignedIn(false);
    setDropdownOpen(false);
    navigate('/signin');
  };

  return (
    <div className="relative inline-flex">
      {!isSignedIn ? (
        <div className="flex space-x-4">
        </div>
      ) : (
        <div>
          <button
            ref={trigger}
            className="inline-flex justify-center items-center group"
            aria-haspopup="true"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <img
              className="w-8 h-8 rounded-full"
              src={profileImage}
              width="32"
              height="32"
              alt="User"
              onError={(e) => {
                e.target.src = DefaultAvatar;
              }}
            />
            <div className="flex items-center truncate">
              <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
                {userData.username}
              </span>
              <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
              </svg>
            </div>
          </button>

          <Transition
            className={`origin-top-right z-10 absolute top-full min-w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
            show={dropdownOpen}
            enter="transition ease-out duration-200 transform"
            enterStart="opacity-0 -translate-y-2"
            enterEnd="opacity-100 translate-y-0"
            leave="transition ease-out duration-200"
            leaveStart="opacity-100"
            leaveEnd="opacity-0"
          >
            <div ref={dropdown} onFocus={() => setDropdownOpen(true)} onBlur={() => setDropdownOpen(false)}>
              <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
                <div className="font-medium text-gray-800 dark:text-gray-100">{userData.username}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">{userData.role}</div>
              </div>
              <ul>
                <li>
                  <button 
                    className="w-full text-left font-medium text-sm text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white flex items-center py-1 px-3"
                    onClick={handleRefreshApplication}
                  >
                    <svg className="w-4 h-4 fill-current text-gray-500 dark:text-gray-400 mr-2" viewBox="0 0 16 16">
                      <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm4-8c0 .6-.2 1.1-.6 1.4-.4.4-.9.6-1.4.6V9l-2-2 2-2v1c.3 0 .5.1.7.3.2.2.3.4.3.7z" />
                    </svg>
                    Refresh Web Application
                  </button>
                </li>
                <li>
                  <button 
                    className="w-full text-left font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3" 
                    onClick={handleSignOut}
                  >
                    <svg className="w-4 h-4 fill-current text-violet-500 mr-2" viewBox="0 0 16 16">
                      <path d="M12.5 8H6c-.6 0-1-.4-1-1s.4-1 1-1h6.5L11 4.5c-.4-.4-.4-1 0-1.4s1-.4 1.4 0l3.4 3.4c.4.4.4 1 0 1.4l-3.4 3.4c-.2.2-.5.3-.7.3s-.5-.1-.7-.3c-.4-.4-.4-1 0-1.4l1.5-1.5zM8 16c-4.4 0-8-3.6-8-8s3.6-8 8-8c2.1 0 4.1.8 5.6 2.3.4.4.4 1 0 1.4s-1 .4-1.4 0C11 2.6 9.5 2 8 2 4.7 2 2 4.7 2 8s2.7 6 6 6c1.5 0 3-.6 4.2-1.7.4-.4 1-.4 1.4 0s.4 1 0 1.4C12.1 15.2 10.1 16 8 16z" />
                    </svg>
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      )}
    </div>
  );
}

export default DropdownProfile;