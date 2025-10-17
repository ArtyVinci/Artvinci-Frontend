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
    navigate('/login');
    setIsProfileOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Events', path: '/events' },
    { name: 'Store', path: '/store' },
    { name: 'Artists', path: '/artists' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-[#2d2a27]/95 border-b border-[#e8e7e5] dark:border-[#4a4642] backdrop-blur-xl shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-3 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-display font-extrabold bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent tracking-tight">
              Artvinci
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] font-medium transition-all duration-200 rounded-lg hover:bg-[#f5f5f3] dark:hover:bg-[#1a1816]"
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
              className="p-2 rounded-xl hover:bg-[#f5f5f3] dark:hover:bg-[#1a1816] transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-[#d4a343]" />
              ) : (
                <Moon className="w-5 h-5 text-[#6d2842]" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#f5f5f3] dark:hover:bg-[#383530] transition-all duration-200 hover:scale-105"
                >
                  {user?.profile_image ? (
                    <img 
                      src={user.profile_image} 
                      alt={user?.username || 'Profile'}
                      className="w-10 h-10 rounded-xl object-cover shadow-md hover:shadow-lg transition-all duration-200 ring-2 ring-white dark:ring-[#2d2a27]"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 ring-2 ring-white dark:ring-[#2d2a27]">
                      {(user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#2d2a27] rounded-2xl shadow-2xl py-2 border border-[#e8e7e5] dark:border-[#4a4642] overflow-hidden"
                  >
                    <div className="px-5 py-4 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] text-white">
                      <div className="flex items-center gap-3 mb-2">
                        {user?.profile_image ? (
                          <img 
                            src={user.profile_image} 
                            alt={user?.username || 'Profile'}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/30 shadow-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/30">
                            {(user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold">
                            {user?.first_name && user?.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user?.username}
                          </p>
                          <p className="text-xs opacity-90">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium capitalize">
                          {user?.role || 'User'}
                        </span>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-5 py-3 hover:bg-[#f5f5f3] dark:hover:bg-[#1a1816] transition-colors text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343]"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>

                      <Link
                        to="/dashboard/favorites"
                        className="flex items-center gap-3 px-5 py-3 hover:bg-[#f5f5f3] dark:hover:bg-[#1a1816] transition-colors text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343]"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Heart className="w-5 h-5" />
                        <span className="font-medium">Favorites</span>
                      </Link>

                      <Link
                        to="/dashboard/purchases"
                        className="flex items-center gap-3 px-5 py-3 hover:bg-[#f5f5f3] dark:hover:bg-[#1a1816] transition-colors text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343]"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-medium">Purchases</span>
                      </Link>

                      <Link
                        to="/dashboard/settings"
                        className="flex items-center gap-3 px-5 py-3 hover:bg-[#f5f5f3] dark:hover:bg-[#1a1816] transition-colors text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343]"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-[#e8e7e5] dark:border-[#4a4642]">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-5 py-3 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
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
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] font-medium rounded-lg hover:bg-[#f5f5f3] dark:hover:bg-[#1a1816] transition-all"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] hover:from-[#5a2338] hover:via-[#6d2842] hover:to-[#8b3654] text-white font-semibold rounded-xl shadow-lg shadow-[#6d2842]/30 hover:shadow-xl hover:shadow-[#6d2842]/40 transition-all"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-[#f5f5f3] dark:hover:bg-[#1a1816] transition-colors text-[#5d5955] dark:text-[#c4bfb9]"
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
            className="md:hidden py-4 border-t border-[#e8e7e5] dark:border-[#4a4642]"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-3 text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-[#e8e7e5] dark:border-[#4a4642] space-y-3">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full py-3 text-[#5d5955] dark:text-[#c4bfb9]"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-5 h-5 text-[#d4a343]" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 text-[#6d2842]" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block py-3 text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] transition-colors"
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
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-5 py-3 text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] font-medium rounded-lg hover:bg-[#f5f5f3] dark:hover:bg-[#1a1816] transition-all"
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-5 py-3 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] hover:from-[#5a2338] hover:via-[#6d2842] hover:to-[#8b3654] text-white font-semibold rounded-xl shadow-lg shadow-[#6d2842]/30 hover:shadow-xl hover:shadow-[#6d2842]/40 transition-all"
                    >
                      Sign Up
                    </motion.button>
                  </Link>
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
