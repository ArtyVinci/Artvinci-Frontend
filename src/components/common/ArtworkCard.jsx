import { motion } from 'framer-motion';
import { Heart, Eye, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../../utils/helpers';

const ArtworkCard = ({ artwork, onLike }) => {
  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      onLike();
    }
  };

  // Get image URL - use primary_image or first image
  const imageUrl = artwork.primary_image || 
                   artwork.images?.[0]?.url || 
                   artwork.image ||
                   null;

  // Get artist name
  const artistName = artwork.artist?.username || 
                     artwork.artist_name || 
                     'Unknown Artist';

  // Format category for display
  const formatCategory = (category) => {
    if (!category) return '';
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Link to={`/gallery/${artwork.slug || artwork.id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        className="card-elegant overflow-hidden group cursor-pointer"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
              <ImageIcon className="w-16 h-16 mb-2" />
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}
          
          {/* Hidden fallback for failed image loads */}
          <div className="w-full h-full hidden flex-col items-center justify-center text-gray-400 dark:text-gray-600">
            <ImageIcon className="w-16 h-16 mb-2" />
            <span className="text-sm font-medium">Image Unavailable</span>
          </div>
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Like button */}
          <button
            onClick={handleLike}
            className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all duration-300 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
          >
            <Heart className="w-5 h-5" />
          </button>

          {/* View count badge */}
          {artwork.views_count > 0 && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
              <Eye className="w-3 h-3" />
              <span>{artwork.views_count}</span>
            </div>
          )}

          {/* Availability badge */}
          {!artwork.available && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              Sold
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
            {artwork.title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
            by {artistName}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#6d2842] dark:text-[#d4a343]">
                {formatPrice(artwork.price, artwork.currency || 'USD')}
              </span>
              {artwork.likes_count > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {artwork.likes_count} like{artwork.likes_count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {artwork.category && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                {formatCategory(artwork.category)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ArtworkCard;
