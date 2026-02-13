import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1a2f4a]">
      {/* Top Navbar - Dark Navy */}
      <header className="bg-gradient-to-r from-[#2d3748] to-[#1a202c] shadow-lg">
        {/* Top section: Logo + User Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Tagline - Stacked Vertically */}
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wider">FLOWRITE GROUP</h1>
              <p className="text-sm text-gray-300 mt-1">PTY LTD | ACN: 632 294 869</p>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-white font-medium">{user?.name} (Admin)</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Separate Row Below */}
        <nav className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1">
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${isActive
                    ? 'text-red-500 border-red-500'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`
                }
              >
                FILL FORM
              </NavLink>
              <NavLink
                to="/dashboard/submissions"
                className={({ isActive }) =>
                  `px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${isActive
                    ? 'text-red-500 border-red-500'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`
                }
              >
                SUBMISSIONS
              </NavLink>
              <NavLink
                to="/dashboard/customers"
                className={({ isActive }) =>
                  `px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${isActive
                    ? 'text-red-500 border-red-500'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`
                }
              >
                CUSTOMERS
              </NavLink>
              <NavLink
                to="/dashboard/items"
                className={({ isActive }) =>
                  `px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${isActive
                    ? 'text-red-500 border-red-500'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`
                }
              >
                ITEMS
              </NavLink>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
