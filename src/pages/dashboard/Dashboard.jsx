import { useState } from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Heart, ShoppingBag, Image as ImageIcon, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ELEGANT_COLORS } from '../../utils/elegantTheme';
import Profile from './Profile';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Extract current tab from URL
  const currentPath = location.pathname.split('/').pop();
  const activeTab = currentPath === 'dashboard' ? 'profile' : currentPath;

  const tabs = [
    { 
      id: 'profile', 
      name: 'My Profile', 
      icon: User,
      color: 'from-[#6d2842] to-[#a64d6d]' // Burgundy
    },
    { 
      id: 'artworks', 
      name: 'My Artworks', 
      icon: ImageIcon, 
      artistOnly: true,
      color: 'from-[#b8862f] to-[#d4a343]' // Gold
    },
    { 
      id: 'favorites', 
      name: 'Favorites', 
      icon: Heart,
      color: 'from-[#508978] to-[#70a596]' // Sage
    },
    { 
      id: 'purchases', 
      name: 'Purchases', 
      icon: ShoppingBag,
      color: 'from-[#6d2842] to-[#b8862f]' // Burgundy to Gold
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: Settings,
      color: 'from-[#4a4642] to-[#6d6762]' // Charcoal
    },
  ];

  const visibleTabs = tabs.filter(tab => !tab.artistOnly || user?.role === 'artist');

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#2d2a27] relative overflow-hidden py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #b8862f 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6d2842]/5 dark:from-[#6d2842]/10 via-transparent to-[#b8862f]/5 dark:to-[#b8862f]/10"></div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-2xl shadow-lg shadow-[#6d2842]/50">
              <Sparkles className="w-6 h-6 text-[#fafaf9]" />
            </div>
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-[#2d2a27] dark:from-[#fafaf9] via-[#6d2842] dark:via-[#d4a343] to-[#b8862f] bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-[#5d5955] dark:text-[#c4bfb9] text-lg">
            Welcome back, <span className="font-semibold text-[#6d2842] dark:text-[#d4a343]">{user?.first_name || user?.username}</span>!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gradient-to-br dark:from-[#1a1816] dark:to-[#2d2a27] backdrop-blur-xl rounded-3xl p-6 sticky top-24 border border-[#e8e7e5] dark:border-[#4a4642] shadow-xl dark:shadow-2xl shadow-black/10 dark:shadow-black/50"
            >
              <nav className="space-y-2">
                {visibleTabs.map((tab, index) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/dashboard/${tab.id}`}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-[#6d2842]/30`
                          : 'text-[#5d5955] dark:text-[#c4bfb9] hover:bg-[#f5f5f3] dark:hover:bg-[#3a3633] hover:text-[#2d2a27] dark:hover:text-[#fafaf9] hover:shadow-md'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        activeTab === tab.id ? 'text-white' : ''
                      }`} />
                      <span className="font-medium">{tab.name}</span>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-lg shadow-white/50"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gradient-to-br dark:from-[#1a1816] dark:to-[#2d2a27] backdrop-blur-xl rounded-3xl p-8 min-h-[600px] border border-[#e8e7e5] dark:border-[#4a4642] shadow-xl dark:shadow-2xl shadow-black/10 dark:shadow-black/50"
            >
              <Routes>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<Profile />} />
                <Route path="artworks" element={<ArtworksSection />} />
                <Route path="favorites" element={<FavoritesSection />} />
                <Route path="purchases" element={<PurchasesSection />} />
                <Route path="settings" element={<SettingsSection />} />
              </Routes>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Artworks Section
const ArtworksSection = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-gradient-to-br from-[#b8862f] to-[#d4a343] rounded-2xl shadow-lg shadow-[#b8862f]/30">
        <ImageIcon className="w-6 h-6 text-[#1a1816]" />
      </div>
      <h2 className="text-3xl font-bold text-[#2d2a27] dark:text-[#fafaf9]">My Artworks</h2>
    </div>
    <div className="bg-[#f5f5f3] dark:bg-gradient-to-br dark:from-[#3a3633] dark:to-[#2d2a27] rounded-2xl p-8 border border-[#e8e7e5] dark:border-[#4a4642]">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#b8862f]/20 to-[#d4a343]/20 rounded-full mb-4 shadow-inner">
          <ImageIcon className="w-8 h-8 text-[#d4a343]" />
        </div>
        <p className="text-[#5d5955] dark:text-[#c4bfb9] text-lg">
          Upload and manage your artworks here.
        </p>
        <p className="text-[#9b9791] dark:text-[#6d6762] mt-2">Feature coming soon!</p>
      </div>
    </div>
  </motion.div>
);

// Favorites Section
const FavoritesSection = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-gradient-to-br from-[#508978] to-[#70a596] rounded-2xl shadow-lg shadow-[#508978]/30">
        <Heart className="w-6 h-6 text-[#1a1816]" />
      </div>
      <h2 className="text-3xl font-bold text-[#2d2a27] dark:text-[#fafaf9]">My Favorites</h2>
    </div>
    <div className="bg-[#f5f5f3] dark:bg-gradient-to-br dark:from-[#3a3633] dark:to-[#2d2a27] rounded-2xl p-8 border border-[#e8e7e5] dark:border-[#4a4642]">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#508978]/20 to-[#70a596]/20 rounded-full mb-4 shadow-inner">
          <Heart className="w-8 h-8 text-[#70a596]" />
        </div>
        <p className="text-[#5d5955] dark:text-[#c4bfb9] text-lg">
          View all your favorite artworks here.
        </p>
        <p className="text-[#9b9791] dark:text-[#6d6762] mt-2">Feature coming soon!</p>
      </div>
    </div>
  </motion.div>
);

// Purchases Section
const PurchasesSection = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-2xl shadow-lg shadow-[#6d2842]/30">
        <ShoppingBag className="w-6 h-6 text-[#fafaf9]" />
      </div>
      <h2 className="text-3xl font-bold text-[#2d2a27] dark:text-[#fafaf9]">My Purchases</h2>
    </div>
    <div className="bg-[#f5f5f3] dark:bg-gradient-to-br dark:from-[#3a3633] dark:to-[#2d2a27] rounded-2xl p-8 border border-[#e8e7e5] dark:border-[#4a4642]">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6d2842]/20 to-[#a64d6d]/20 rounded-full mb-4 shadow-inner">
          <ShoppingBag className="w-8 h-8 text-[#a64d6d]" />
        </div>
        <p className="text-[#5d5955] dark:text-[#c4bfb9] text-lg">
          View your purchase history here.
        </p>
        <p className="text-[#9b9791] dark:text-[#6d6762] mt-2">Feature coming soon!</p>
      </div>
    </div>
  </motion.div>
);

// Settings Section
const SettingsSection = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-gradient-to-br from-[#4a4642] to-[#6d6762] rounded-2xl shadow-lg shadow-[#4a4642]/30">
        <Settings className="w-6 h-6 text-[#fafaf9]" />
      </div>
      <h2 className="text-3xl font-bold text-[#2d2a27] dark:text-[#fafaf9]">Settings</h2>
    </div>
    <div className="bg-[#f5f5f3] dark:bg-gradient-to-br dark:from-[#3a3633] dark:to-[#2d2a27] rounded-2xl p-8 border border-[#e8e7e5] dark:border-[#4a4642]">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#4a4642]/20 to-[#6d6762]/20 rounded-full mb-4 shadow-inner">
          <Settings className="w-8 h-8 text-[#6d6762] dark:text-[#9b9791]" />
        </div>
        <p className="text-[#5d5955] dark:text-[#c4bfb9] text-lg">
          Manage your account settings here.
        </p>
        <p className="text-[#9b9791] dark:text-[#6d6762] mt-2">Feature coming soon!</p>
      </div>
    </div>
  </motion.div>
);

export default Dashboard;
