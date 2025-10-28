import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Heart, ImageIcon } from 'lucide-react';
import { artworkService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Loading, Button } from '../../components/common';
import { formatPrice } from '../../utils/helpers';

const MyArtworks = () => {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchMyArtworks();
  }, []);

  const fetchMyArtworks = async () => {
    try {
      setLoading(true);
      const data = await artworkService.getMyArtworks();
      setArtworks(data.results || []);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load your artworks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (artwork) => {
    if (!window.confirm(`Are you sure you want to delete "${artwork.title}"?`)) {
      return;
    }

    try {
      setDeleting(artwork.slug);
      await artworkService.deleteArtwork(artwork.slug);
      setArtworks(prev => prev.filter(a => a.slug !== artwork.slug));
      toast.success('Artwork deleted successfully');
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork');
    } finally {
      setDeleting(null);
    }
  };

  const formatCategory = (category) => {
    if (!category) return '';
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#b8862f] to-[#d4a343] rounded-2xl shadow-lg shadow-[#b8862f]/30">
            <ImageIcon className="w-6 h-6 text-[#1a1816]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#2d2a27] dark:text-[#fafaf9]">My Artworks</h2>
            <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
              {artworks.length} artwork{artworks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard/artworks/create')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6d2842] to-[#8b3654] text-white font-semibold rounded-xl shadow-lg shadow-[#6d2842]/30 hover:shadow-xl hover:shadow-[#6d2842]/40 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Artwork</span>
        </motion.button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loading text="Loading your artworks..." />
        </div>
      ) : artworks.length === 0 ? (
        <div className="bg-[#f5f5f3] dark:bg-gradient-to-br dark:from-[#3a3633] dark:to-[#2d2a27] rounded-2xl p-12 border border-[#e8e7e5] dark:border-[#4a4642] text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#b8862f]/20 to-[#d4a343]/20 rounded-full mb-4 shadow-inner">
            <ImageIcon className="w-10 h-10 text-[#d4a343]" />
          </div>
          <h3 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-2">
            No artworks yet
          </h3>
          <p className="text-[#5d5955] dark:text-[#c4bfb9] text-lg mb-6">
            Share your creativity with the world by uploading your first artwork!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/artworks/create')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6d2842] to-[#8b3654] text-white font-semibold rounded-xl shadow-lg shadow-[#6d2842]/30 hover:shadow-xl hover:shadow-[#6d2842]/40 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Artwork</span>
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-[#1a1816] rounded-2xl overflow-hidden border border-[#e8e7e5] dark:border-[#4a4642] shadow-lg hover:shadow-xl transition-all group"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                {artwork.primary_image ? (
                  <img
                    src={artwork.primary_image}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Placeholder when no image */}
                {!artwork.primary_image && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                    <ImageIcon className="w-16 h-16 mb-2" />
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}
                
                {/* Hidden fallback for failed image loads */}
                <div className="w-full h-full hidden flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                  <ImageIcon className="w-16 h-16 mb-2" />
                  <span className="text-sm font-medium">Image Failed</span>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    artwork.status === 'published' 
                      ? 'bg-green-500 text-white' 
                      : artwork.status === 'sold'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {artwork.status ? (artwork.status.charAt(0).toUpperCase() + artwork.status.slice(1)) : 'Draft'}
                  </span>
                </div>

                {/* Stats */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white text-sm">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Eye className="w-4 h-4" />
                      <span>{artwork.views_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Heart className="w-4 h-4" />
                      <span>{artwork.likes_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-1 line-clamp-1">
                  {artwork.title}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-[#6d2842] dark:text-[#d4a343]">
                    {formatPrice(artwork.price, artwork.currency)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-[#f5f5f3] dark:bg-[#3a3633] text-[#5d5955] dark:text-[#c4bfb9] rounded-full">
                    {formatCategory(artwork.category)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/artworks/edit/${artwork.slug}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#f5f5f3] dark:bg-[#3a3633] text-[#2d2a27] dark:text-[#fafaf9] rounded-lg hover:bg-[#e8e7e5] dark:hover:bg-[#4a4642] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(artwork)}
                    disabled={deleting === artwork.slug}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyArtworks;
