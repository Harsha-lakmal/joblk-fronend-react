import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Transition from '../utils/Transition';
import UserAvatar from '../assets/joblk.png';

function DropdownProfile({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false); // Track user sign-in state
  const trigger = useRef(null);
  const dropdown = useRef(null);
  const location = useLocation();

  // Close the dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [dropdownOpen]);

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [dropdownOpen]);

  return (
    <div className="relative inline-flex">
      {!isSignedIn ? (
        <div className="flex space-x-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
            onClick={() => setIsSignedIn(true)} // Simulate sign-in
          >
            Sign In
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded"
            onClick={() => setIsSignedIn(true)} 
          >
            Login
          </button>
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
            <img className="w-8 h-8 rounded-full" src={UserAvatar} width="32" height="32" alt="User" />
            <div className="flex items-center truncate">
              <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">User Name</span>
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
            <div
              ref={dropdown}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setDropdownOpen(false)}
            >
              <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
                <div className="font-medium text-gray-800 dark:text-gray-100">User Name</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">User Type</div>
              </div>
              <ul>
                <li>
                  <Link
                    className="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3"
                    to="/settings"
                  >
                    Setting
                  </Link>
                </li>
                <li>
                  <button
                    className="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3"
                    onClick={() => setIsSignedIn(false)} // Sign out
                  >
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
