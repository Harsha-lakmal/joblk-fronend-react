import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function NotificationIcon({ unread }) {
  return (
    <div className="relative">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
          fill="currentColor"
          className="text-gray-500 dark:text-gray-400"
        />
      </svg>
      {unread > 0 && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></div>
      )}
    </div>
  );
}

function NotificationItem({ notification, onDismiss }) {
  const { id, title, message, time, read, type } = notification;
  
  const typeColors = {
    info: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    success: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    warning: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
    error: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  };

  return (
    <div key={id} className={`px-3 py-2 rounded-lg mb-1 ${!read ? 'bg-violet-50 dark:bg-gray-700/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`rounded-full p-1.5 mr-2 ${typeColors[type] || typeColors.info}`}>
            {type === 'info' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === 'success' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {type === 'warning' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {type === 'error' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{message}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{time}</div>
          </div>
        </div>
        <button 
          onClick={() => onDismiss(id)}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DropdownNotifications({ align = 'right' }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New message',
      message: 'You have received a new message from Sarah',
      time: '2 min ago',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'New user',
      message: 'A new user has registered',
      time: '1 hour ago',
      read: false,
      type: 'success'
    },
    {
      id: 3,
      title: 'System alert',
      message: 'Scheduled maintenance tomorrow at 3AM',
      time: '5 hours ago',
      read: true,
      type: 'warning'
    }
    
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const dismissNotification = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('#notifications-dropdown') && !event.target.closest('#notifications-button')) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="relative">
      <button
        id="notifications-button"
        className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full ${dropdownOpen && 'bg-gray-200 dark:bg-gray-800'}`}
        onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Notifications</span>
        <NotificationIcon unread={unreadCount} />
      </button>

      {dropdownOpen && (
        <div
          id="notifications-dropdown"
          className={`absolute mt-2 w-72 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-50 ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto max-h-80">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onDismiss={dismissNotification}
                />
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You don't have any notifications yet.
                </p>
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link
                // to="/"
                className="text-xs font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                onClick={() => setDropdownOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}