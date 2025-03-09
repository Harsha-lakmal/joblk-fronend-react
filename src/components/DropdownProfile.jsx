import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Transition from '../utils/Transition';
import DefaultAvatar from '../assets/joblk.png';
import { instance } from '/src/Service/AxiosHolder/AxiosHolder.jsx';

function DropdownProfile({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState({ profileImage: DefaultAvatar });
  const [uploading, setUploading] = useState(false);
  const [img, setImg] = useState('');

  const trigger = useRef(null);
  const dropdown = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("userData");

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (storedUser) {
      
      const parsedUser = JSON.parse(storedUser);
      
      setUser(parsedUser);
      if (parsedUser.id) {
        getImgProfile(parsedUser.id);
      }
    }

    if (authToken) {
      setIsSignedIn(true);
    }
  }, [storedUser]);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

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
    navigate('/signup');

    
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.type.split('/')[0];
    if (fileType !== 'image') {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedUser = { ...user, profileImage: e.target.result };
    };
    reader.readAsDataURL(file);

    uploadProfileImage(file); 
  };

  async function uploadProfileImage(file) {
    console.log(file);
    
    setUploading(true);
    const userId = user.id;

    const randomFileName = generateRandomFileName();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await instance.put(`/user/update/imageProfile/${userId}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Profile image updated successfully!');
      getImgProfile(user.id);

      const updatedUser = { ...user, profileImage: response.data.imageUrl };
      localStorage.setItem("userData", JSON.stringify(updatedUser)); 
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Error updating profile image.');
    } finally {
      setUploading(false);
    }
  }

  async function getImgProfile(userId) {
    try {
      const response = await instance.get(`/user/get/imageProfile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        responseType: 'blob', 
      });

      if (!response || !response.data) {
        throw new Error("No profile image found");
      }

      const imageUrl = URL.createObjectURL(response.data);

      if (imageUrl) {
        setImg(imageUrl);
        const updatedUser = { ...user, profileImage: imageUrl };
       
      }
    } catch (error) {
      console.error('Error fetching user profile image:', error);
      alert("Could not fetch user profile image. Please try again.");
    }
  }

  function generateRandomFileName(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  const getdata = JSON.parse(storedUser);

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
              src={img || user.profileImage || DefaultAvatar}
              width="32"
              height="32"
              alt="User"
            />
            <div className="flex items-center truncate">
              <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
                {getdata.username || 'Guest'}
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
                <div className="font-medium text-gray-800 dark:text-gray-100">{getdata.username}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">{getdata.role}</div>
              </div>
              <ul>
                <li>
                  <label className="block font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3 cursor-pointer">
                    Upload Profile Picture
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    
                  </label>
                </li>
                
                <li>
                  <button className="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3" onClick={handleSignOut}>
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
