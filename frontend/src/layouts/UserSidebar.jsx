import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Clock, 
  BarChart3, 
  User, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/user/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Request Ride',
      href: '/user/request-ride',
      icon: MapPin,
    },
    {
      name: 'Ride History',
      href: '/user/ride-history',
      icon: Clock,
    },
    {
      name: 'Analytics',
      href: '/user/analytics',
      icon: BarChart3,
    },
    {
      name: 'Profile',
      href: '/user/profile',
      icon: User,
    }
  ];

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg min-h-screen">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">NeuroFleetX User</h1>
      </div>
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <Icon
                  className={`${isActive
                    ? 'text-blue-600'
                    : 'text-gray-400 group-hover:text-gray-500'}
                    mr-3 flex-shrink-0 h-6 w-6`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs font-medium text-gray-500">
              User
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto flex-shrink-0 bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;