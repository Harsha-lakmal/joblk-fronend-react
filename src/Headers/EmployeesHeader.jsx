import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileCheck , BookOpen, Briefcase, X, Settings  } from 'lucide-react';
import Notifications from '../components/DropdownNotifications';
import UserMenu from '../components/DropdownProfile';

function SidebarLinkGroup({ children, activecondition }) {
  return (
    <li className={`px-3 py-2 rounded-lg mb-0.5 last:mb-0 ${activecondition ? 'bg-violet-500/10 dark:bg-violet-500/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} cursor-pointer`}>
      {children}
    </li>
  );
}

function EmployeesHeader({ sidebarOpen, setSidebarOpen, variant = 'default' }) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
    setSearchModalOpen(false);
  }, [location]);

  // Close mobile menu and search modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileNavOpen && !event.target.closest('#mobile-nav') && !event.target.closest('#mobile-nav-button')) {
        setMobileNavOpen(false);
      }
      if (searchModalOpen && !event.target.closest('#search-modal') && !event.target.closest('.search-button')) {
        setSearchModalOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileNavOpen, searchModalOpen]);

  return (
    <header className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${variant === 'v2' || variant === 'v3' ? 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10' : 'max-lg:shadow-xs lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90'} ${variant === 'v2' ? 'dark:before:bg-gray-800' : ''} ${variant === 'v3' ? 'dark:before:bg-gray-900' : ''}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 ${variant === 'v2' || variant === 'v3' ? '' : 'lg:border-b border-gray-200 dark:border-gray-700/60'}`}>
          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              id="mobile-nav-button"
              className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer"
              aria-controls="mobile-nav"
              aria-expanded={mobileNavOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMobileNavOpen(!mobileNavOpen);
              }}
            >
              <span className="sr-only">Open navigation</span>
              {!mobileNavOpen ? (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="5" width="16" height="2" />
                  <rect x="4" y="11" width="16" height="2" />
                  <rect x="4" y="17" width="16" height="2" />
                </svg>
              ) : (
                <X className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile logo/brand */}
          <div className="lg:hidden flex items-center">
            <span className="text-lg font-semibold cursor-default">Joblk</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex space-x-1">
              <SidebarLinkGroup activecondition={location.pathname === "/employees/dashboard/home"}>
                <NavLink
                  end
                  to="/employees/dashboard/home"
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 rounded-lg transition-colors group ${isActive ? 'text-violet-500 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400'} cursor-pointer`
                  }
                >
                  <Home className={`w-5 h-5 mr-2 ${location.pathname === "/employees/dashboard/home" ? 'text-violet-500 dark:text-violet-400' : 'text-gray-500 group-hover:text-violet-500 dark:text-gray-400 dark:group-hover:text-violet-400'}`} />
                  <span className="text-sm font-medium">Home</span>
                </NavLink>
              </SidebarLinkGroup>

           

              <SidebarLinkGroup activecondition={location.pathname === "/employees/dashboard/document"}>
                <NavLink
                  end
                  to="/employees/dashboard/document"
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 rounded-lg transition-colors group ${isActive ? 'text-violet-500 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400'} cursor-pointer`
                  }
                >
                  <FileCheck  className={`w-5 h-5 mr-2 ${location.pathname === "/employees/dashboard/document" ? 'text-violet-500 dark:text-violet-400' : 'text-gray-500 group-hover:text-violet-500 dark:text-gray-400 dark:group-hover:text-violet-400'}`} />
                  <span className="text-sm font-medium">Document</span>
                </NavLink>
              </SidebarLinkGroup>

              <SidebarLinkGroup activecondition={location.pathname === "/employees/dashboard/job"}>
                <NavLink
                  end
                  to="/employees/dashboard/job"
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 rounded-lg transition-colors group ${isActive ? 'text-violet-500 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400'} cursor-pointer`
                  }
                >
                  <Briefcase className={`w-5 h-5 mr-2 ${location.pathname === "/employees/dashboard/job" ? 'text-violet-500 dark:text-violet-400' : 'text-gray-500 group-hover:text-violet-500 dark:text-gray-400 dark:group-hover:text-violet-400'}`} />
                  <span className="text-sm font-medium">Jobs</span>
                </NavLink>
              </SidebarLinkGroup>


              <SidebarLinkGroup activecondition={location.pathname === "/employees/dashboard/about"}>
                <NavLink
                  end
                  to="/employees/dashboard/about"
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 rounded-lg transition-colors group ${isActive ? 'text-violet-500 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400'} cursor-pointer`
                  }
                >
                  <Settings  className={`w-5 h-5 mr-2 ${location.pathname === "/employees/dashboard/about" ? 'text-violet-500 dark:text-violet-400' : 'text-gray-500 group-hover:text-violet-500 dark:text-gray-400 dark:group-hover:text-violet-400'}`} />
                  <span className="text-sm font-medium">Settings</span>
                </NavLink>
              </SidebarLinkGroup>
            </ul>

            
          </nav>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <Notifications align="right" />
            </div>
            <div className="hidden sm:block">
              {/* <Help align="right" /> */}
            </div>
            <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
            <UserMenu align="right" />
          </div>
        </div>

        {/* Search Modal */}
     

        {/* Mobile Navigation */}
        {mobileNavOpen && (
          <div 
            id="mobile-nav"
            className="lg:hidden absolute left-0 right-0 top-16 bg-white dark:bg-gray-800 shadow-lg z-20 border-t border-gray-200 dark:border-gray-700"
          >
            <nav className="px-4 py-3">
              <ul className="space-y-1">
                <li>
                  <NavLink
                    end
                    to="/employees/dashboard/home"
                    className={({ isActive }) => 
                      `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'} cursor-pointer`
                    }
                  >
                    <Home className="w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">Home</span>
                  </NavLink>
                </li>
              
                <li>
                  <NavLink
                    end
                    to="/employees/dashboard/document"
                    className={({ isActive }) => 
                      `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'} cursor-pointer`
                    }
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">Document</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    end
                    to="/employees/dashboard/job"
                    className={({ isActive }) => 
                      `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'} cursor-pointer`
                    }
                  >
                    <Briefcase className="w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">Jobs</span>
                  </NavLink>
                </li>


                <li>
                  <NavLink
                    end
                    to="/employees/dashboard/about"
                    className={({ isActive }) => 
                      `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'} cursor-pointer`
                    }
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">Setting</span>
                  </NavLink>
                </li>
                <li className="sm:hidden pt-2 border-t border-gray-200 dark:border-gray-700/60 mt-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-default">Notifications</span>
                    <Notifications align="right" />
                  </div>
                </li>
                <li className="sm:hidden pt-2 border-t border-gray-200 dark:border-gray-700/60">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-default">Help</span>
                  </div>
                </li>
                
              </ul>

            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default EmployeesHeader;