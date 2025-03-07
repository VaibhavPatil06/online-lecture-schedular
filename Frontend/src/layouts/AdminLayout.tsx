import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, BookOpen, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/instructors', icon: Users, label: 'Instructors' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { path: '/admin/schedule', icon: Calendar, label: 'Schedule' },
  ];

  return (
    <div className="min-h-screen">
      <nav className="glass-card fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
                {navItems.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`nav-link ${location.pathname === path ? 'active' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;