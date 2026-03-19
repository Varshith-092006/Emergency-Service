import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import N8nChatWidget from '../chatbot/N8nChatWidget';
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
  HeartPulse,
  Moon,
  Sun,
  HelpCircle,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-[1100] border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] focus:ring-offset-2 rounded-md transition-transform duration-300 hover:scale-105"
              aria-label="Go to homepage"
            >
              <div className="w-10 h-10 bg-[var(--primary-color)] rounded-xl flex items-center justify-center shadow-lg border border-[var(--glass-border)]">
                <HeartPulse className="w-6 h-6 text-[var(--secondary-color)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-[var(--primary-color)] leading-none italic uppercase tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>
                  Emergency
                </span>
                <span className="text-sm font-bold text-[var(--secondary-color)] leading-none tracking-[0.2em] uppercase">
                  Connect
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                if (item.protected && !isAuthenticated) return null;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-[var(--primary-color)] text-white shadow-md'
                        : 'text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--surface-hover)]'
                    } focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User & Theme Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--surface-hover)] transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <div className="relative group">
                      <button 
                        className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Admin menu"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin</span>
                      </button>
                      <div className="absolute right-0 mt-2 w-56 origin-top-right bg-[var(--surface-color)] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[1110] border border-[var(--border-color)]">
                        <div className="py-1">
                          {adminNavigation.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="block px-4 py-2 text-sm text-[var(--text-color)] hover:bg-[var(--surface-hover)]"
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
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="User profile"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-xs truncate">{user?.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Login"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
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
              className="md:hidden p-3 rounded-2xl text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] transition-all"
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
              className="md:hidden border-t border-[var(--border-color)] overflow-hidden bg-[var(--nav-bg)] backdrop-blur-xl"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => {
                  if (item.protected && !isAuthenticated) return null;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-4 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                        isActive(item.href)
                          ? 'bg-[var(--primary-color)] text-white shadow-xl translate-x-1'
                          : 'text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--surface-hover)]'
                      } focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
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
                        className={`flex items-center space-x-4 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest ${
                          isActive(item.href)
                            ? 'bg-[var(--secondary-color)] text-[var(--primary-color)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--surface-hover)]'
                        } focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)]`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </>
                )}

                {/* User Menu Mobile */}
                <div className="pt-6 border-t border-[var(--border-color)] space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-4 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--surface-hover)]"
                      >
                        <User className="w-5 h-5 text-[var(--secondary-color)]" />
                        <span>{user?.name} Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Terminate Session</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] mb-2"
                      >
                        Secure Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] bg-[var(--primary-color)] text-white text-center shadow-xl"
                      >
                        System Access
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
      <footer className="bg-[var(--primary-color)] text-white/80 border-t border-white/5 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--secondary-color)] opacity-5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="max-w-7xl mx-auto px-8 sm:px-12 py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                  <HeartPulse className="w-7 h-7 text-[var(--secondary-color)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white leading-none italic uppercase tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>
                    Emergency
                  </span>
                  <span className="text-xs font-black text-[var(--secondary-color)] leading-none tracking-[0.3em] uppercase mt-1">
                    Connect
                  </span>
                </div>
              </div>
              <p className="text-lg font-medium text-white/60 leading-relaxed max-w-md italic" style={{ fontFamily: 'var(--font-serif)' }}>
                "We provide the bridge between crisis and care, ensuring that in your most critical moments, you are never truly alone."
              </p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black text-[var(--secondary-color)] uppercase tracking-[0.3em] mb-8">Navigation</h4>
              <ul className="space-y-4">
                {navigation.filter(item => !item.protected).map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className="text-sm font-bold text-white/40 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black text-[var(--secondary-color)] uppercase tracking-[0.3em] mb-8">Rapid Response</h4>
              <ul className="space-y-4 font-bold text-sm">
                <li className="flex items-center space-x-4 text-white hover:text-[var(--secondary-color)] transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span>Universal: 112</span>
                </li>
                <li className="flex items-center space-x-4 text-white hover:text-[var(--secondary-color)] transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>Police Ops: 100</span>
                </li>
                <li className="flex items-center space-x-4 text-white hover:text-[var(--secondary-color)] transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <span>Medical: 108</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            <p>&copy; {new Date().getFullYear()} EmergencyConnect Redesign. Crafted for Excellence.</p>
            <div className="flex gap-8">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Protocol</span>
              <span className="hover:text-white transition-colors cursor-pointer">Network Status</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Global AI Chatbot Widget */}
      <N8nChatWidget />
    </div>
  );
};

export default Layout;