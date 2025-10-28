import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { artworkService } from '../../services/api';
import { ArtworkCard, Loading, Input, Button } from '../../components/common';
import { ART_CATEGORIES, PRICE_RANGES, SORT_OPTIONS } from '../../utils/constants';
import { toast } from 'react-hot-toast';

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 12,
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    fetchArtworks();
  }, [selectedCategory, selectedSort, pagination.page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchArtworks();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      // Build API params
      const params = {
        page: pagination.page,
        page_size: pagination.page_size,
        sort: selectedSort,
      };

      // Add category filter
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      // Add search
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add price range filter
      if (selectedPriceRange && selectedPriceRange !== 'all') {
        const range = PRICE_RANGES.find(r => r.id === selectedPriceRange);
        if (range) {
          if (range.min > 0) params.min_price = range.min;
          if (range.max !== Infinity) params.max_price = range.max;
        }
      }

      console.log('Fetching artworks with params:', params);
      const data = await artworkService.getArtworks(params);
      
      setArtworks(data.results || []);
      setPagination(prev => ({
        ...prev,
        total_count: data.count || 0,
        total_pages: data.total_pages || 1,
      }));
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks. Please try again.');
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (artworkSlug) => {
    try {
      const response = await artworkService.likeArtwork(artworkSlug);
      
      // Update local state
      setArtworks(prevArtworks =>
        prevArtworks.map(artwork =>
          artwork.slug === artworkSlug
            ? { ...artwork, likes_count: response.likes_count }
            : artwork
        )
      );
      
      toast.success(response.is_liked ? 'Added to favorites!' : 'Removed from favorites');
    } catch (error) {
      console.error('Error liking artwork:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to like artworks');
      } else {
        toast.error('Failed to update favorite');
      }
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSearchTerm('');
    setSelectedSort('newest');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedPriceRange !== 'all' || 
    searchTerm.trim() !== '' ||
    selectedSort !== 'newest';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] py-16">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
            <span className="bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent">Art Gallery</span>
          </h1>
          <p className="text-lg text-[#5d5955] dark:text-[#c4bfb9] max-w-2xl mx-auto">
            Explore our curated collection of stunning artworks from talented artists worldwide
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search artworks, artists, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              Filters
            </Button>
          </div>

          {/* Filters Section */}
          <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="glass dark:glass-dark rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === ''
                          ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      🎨 All
                    </button>
                    {ART_CATEGORIES.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedCategory === category.value
                            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Price Range
                  </label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {PRICE_RANGES.map((range) => (
                      <option key={range.id} value={range.id}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Sort By
                  </label>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600 dark:text-gray-400">
          Showing {artworks.length} of {pagination.total_count} artwork{pagination.total_count !== 1 ? 's' : ''}
          {searchTerm && ` for "${searchTerm}"`}
        </div>

        {/* Artworks Grid */}
        {loading ? (
          <Loading text="Loading artworks..." />
        ) : artworks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              No artworks found
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              {hasActiveFilters ? 'Try adjusting your filters or search terms' : 'Check back soon for new artwork!'}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="mt-4"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {artworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onLike={() => handleLike(artwork.slug)}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {[...Array(pagination.total_pages)].map((_, index) => {
                    const pageNum = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.total_pages ||
                      (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            pagination.page === pageNum
                              ? 'bg-gradient-to-r from-[#6d2842] to-[#8b3654] text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === pagination.page - 2 ||
                      pageNum === pagination.page + 2
                    ) {
                      return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Gallery;
