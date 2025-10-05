import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { artworkService } from '../../services/api';
import { ArtworkCard, Loading, Input, Button } from '../../components/common';
import { ART_CATEGORIES, PRICE_RANGES, SORT_OPTIONS } from '../../utils/constants';

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [likedArtworks, setLikedArtworks] = useState(new Set());

  useEffect(() => {
    fetchArtworks();
  }, [selectedCategory, selectedPriceRange, selectedSort]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: selectedSort,
      };
      const data = await artworkService.getArtworks(params);
      setArtworks(data.results || data);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      // Use mock data if API fails
      setArtworks(getMockArtworks());
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (artworkId) => {
    try {
      await artworkService.likeArtwork(artworkId);
      setLikedArtworks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(artworkId)) {
          newSet.delete(artworkId);
        } else {
          newSet.add(artworkId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error liking artwork:', error);
    }
  };

  const filteredArtworks = artworks
    .filter(artwork => {
      const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artwork.artist_name && artwork.artist_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (selectedPriceRange !== 'all') {
        const range = PRICE_RANGES.find(r => r.id === selectedPriceRange);
        const matchesPrice = artwork.price >= range.min && artwork.price <= range.max;
        return matchesSearch && matchesPrice;
      }
      
      return matchesSearch;
    });

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
                placeholder="Search artworks or artists..."
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
                    {ART_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category.icon} {category.name}
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
              {(selectedCategory !== 'all' || selectedPriceRange !== 'all' || searchTerm) && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedPriceRange('all');
                      setSearchTerm('');
                    }}
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
          Showing {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? 's' : ''}
        </div>

        {/* Artworks Grid */}
        {loading ? (
          <Loading text="Loading artworks..." />
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No artworks found matching your criteria
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredArtworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                onLike={handleLike}
                isLiked={likedArtworks.has(artwork.id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Mock data for development
const getMockArtworks = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Artwork ${i + 1}`,
    artist_name: `Artist ${Math.floor(Math.random() * 5) + 1}`,
    price: Math.floor(Math.random() * 1000) + 100,
    category: ['painting', 'digital', 'sculpture'][Math.floor(Math.random() * 3)],
    image: `https://source.unsplash.com/random/800x800/?art,${i}`,
  }));
};

export default Gallery;
