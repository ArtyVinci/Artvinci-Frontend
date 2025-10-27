import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Database, Eye, AlertCircle, RefreshCw, User } from 'lucide-react';
import api from '../../services/api';

const FaceDebugPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/auth/face/debug/');
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-[#2d2a27] p-4 rounded-xl shadow-lg border border-[#e8e7e5] dark:border-[#4a4642] z-50">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#508978]" />
          <span className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">Loading face stats...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-white dark:bg-[#2d2a27] p-4 rounded-xl shadow-lg border border-[#e8e7e5] dark:border-[#4a4642] z-50 min-w-64"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#508978]" />
          <span className="text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9]">Face Recognition Debug</span>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-1 hover:bg-[#f5f5f3] dark:hover:bg-[#3a3633] rounded"
        >
          <RefreshCw className={`w-4 h-4 text-[#5d5955] dark:text-[#c4bfb9] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">{error}</span>
        </div>
      ) : stats ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5d5955] dark:text-[#c4bfb9]">Total Users:</span>
            <span className="font-medium text-[#2d2a27] dark:text-[#fafaf9]">{stats.total_users}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5d5955] dark:text-[#c4bfb9]">With Face Encodings:</span>
            <span className={`font-medium ${stats.users_with_faces > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.users_with_faces}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5d5955] dark:text-[#c4bfb9]">With Profile Images:</span>
            <span className={`font-medium ${stats.users_with_images > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
              {stats.users_with_images}
            </span>
          </div>

          {stats.users_with_faces === 0 && stats.users_with_images === 0 && (
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  No face data found. Register or upload profile photos first.
                </span>
              </div>
            </div>
          )}

          {stats.recent_logins && stats.recent_logins.length > 0 && (
            <div className="mt-2 pt-2 border-t border-[#e8e7e5] dark:border-[#4a4642]">
              <span className="text-xs text-[#5d5955] dark:text-[#c4bfb9]">Recent Attempts:</span>
              <div className="mt-1 space-y-1">
                {stats.recent_logins.slice(0, 3).map((attempt, idx) => (
                  <div key={idx} className="text-xs flex items-center gap-2">
                    <User className="w-3 h-3 text-[#5d5955] dark:text-[#c4bfb9]" />
                    <span className={`${attempt.success ? 'text-green-600' : 'text-red-600'}`}>
                      {attempt.email} - {attempt.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
};

export default FaceDebugPanel;