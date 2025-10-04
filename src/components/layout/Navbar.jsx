import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Palette, Sun, Moon, User, LogOut, Heart, ShoppingBag, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Button from '../common/Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Store', path: '/store' },
    { name: 'Artists', path: '/artists' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-40 glass dark:glass-dark border-b border-white/20 dark:border-gray-700/50 backdrop-blur-xl">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">
              Artvinci
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 glass dark:glass-dark rounded-2xl shadow-xl py-2 border border-white/20 dark:border-gray-700/50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard/favorites"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Favorites</span>
                    </Link>

                    <Link
                      to="/dashboard/purchases"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Purchases</span>
                    </Link>

                    <Link
                      to="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="primary" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full py-3 text-gray-700 dark:text-gray-300"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block py-3 text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-3 text-red-600 dark:text-red-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
