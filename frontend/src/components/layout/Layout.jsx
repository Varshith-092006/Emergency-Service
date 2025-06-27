import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { 
  MapPin, 
  Phone, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home,
  Shield,
  BarChart2,
  Users as UsersIcon,
  AlertTriangle,
  HelpCircle,
  Settings
} from 'lucide-react';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Home', href: '/', icon: Home, protected: false },
    { name: 'Emergency Map', href: '/map', icon: MapPin, protected: true },
    { name: 'Services', href: '/services', icon: Phone, protected: false },
    { name: 'Help', href: '/help', icon: HelpCircle, protected: false },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart2 },
    { name: 'Manage Services', href: '/admin/services', icon: Phone },
    { name: 'User Management', href: '/admin/users', icon: UsersIcon },
    { name: 'SOS Alerts', href: '/admin/alerts', icon: AlertTriangle },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
              aria-label="Go to homepage"
            >
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                EmergencyConnect
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                if (item.protected && !isAuthenticated) return null;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <div className="relative group">
                      <button 
                        className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Admin menu"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin</span>
                      </button>
                      <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          {adminNavigation.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="User profile"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-xs truncate">{user?.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Login"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Register"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => {
                  if (item.protected && !isAuthenticated) return null;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Admin Navigation Mobile */}
                {user?.role === 'admin' && (
                  <>
                    <div className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-t border-gray-200">
                      Admin Panel
                    </div>
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                          isActive(item.href)
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </>
                )}

                {/* User Menu Mobile */}
                <div className="pt-4 border-t border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <User className="w-5 h-5" />
                        <span>{user?.name}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">EmergencyConnect</span>
              </div>
              <p className="text-gray-600">
                Connecting communities with emergency services when every second counts.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {navigation.filter(item => !item.protected).map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className="text-gray-600 hover:text-gray-900 focus:outline-none focus:underline"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Emergency Contacts</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>General Emergency: 112</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>Police: 100</span>
                </li>
                <li className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-green-500" />
                  <span>Ambulance: 108</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <span>Fire Department: 101</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} EmergencyConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;