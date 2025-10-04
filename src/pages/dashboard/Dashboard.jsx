import { useState } from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Heart, ShoppingBag, Image as ImageIcon, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'My Profile', icon: User },
    { id: 'artworks', name: 'My Artworks', icon: ImageIcon, artistOnly: true },
    { id: 'favorites', name: 'Favorites', icon: Heart },
    { id: 'purchases', name: 'Purchases', icon: ShoppingBag },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const visibleTabs = tabs.filter(tab => !tab.artistOnly || user?.role === 'artist');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass dark:glass-dark rounded-2xl p-6 sticky top-24">
              <nav className="space-y-2">
                {visibleTabs.map((tab) => (
                  <Link
                    key={tab.id}
                    to={`/dashboard/${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="glass dark:glass-dark rounded-2xl p-8 min-h-[500px]">
              <Routes>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<ProfileSection user={user} />} />
                <Route path="artworks" element={<ArtworksSection />} />
                <Route path="favorites" element={<FavoritesSection />} />
                <Route path="purchases" element={<PurchasesSection />} />
                <Route path="settings" element={<SettingsSection />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Section
const ProfileSection = ({ user }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Profile</h2>
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
          {user?.name?.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium capitalize">
            {user?.role}
          </span>
        </div>
      </div>
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          Profile management features coming soon!
        </p>
      </div>
    </div>
  </div>
);

// Artworks Section
const ArtworksSection = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Artworks</h2>
    <p className="text-gray-600 dark:text-gray-400">
      Upload and manage your artworks here. Feature coming soon!
    </p>
  </div>
);

// Favorites Section
const FavoritesSection = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Favorites</h2>
    <p className="text-gray-600 dark:text-gray-400">
      View all your favorite artworks here. Feature coming soon!
    </p>
  </div>
);

// Purchases Section
const PurchasesSection = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Purchases</h2>
    <p className="text-gray-600 dark:text-gray-400">
      View your purchase history here. Feature coming soon!
    </p>
  </div>
);

// Settings Section
const SettingsSection = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h2>
    <p className="text-gray-600 dark:text-gray-400">
      Manage your account settings here. Feature coming soon!
    </p>
  </div>
);

export default Dashboard;
