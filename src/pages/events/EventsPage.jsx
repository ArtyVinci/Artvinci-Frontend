import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Users, Tag, Search, Filter, Clock,
  Sparkles, Globe, Ticket, TrendingUp, Star, Plus, Edit, Trash2
} from 'lucide-react';
import { eventService } from '../../services/api';
import { showToast } from '../../services/toast';
import { Button, Loading } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';

const EventsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(''); // Separate state for search input
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    time: 'upcoming',
    is_online: '',
    is_free: '',
    is_featured: '',
    sort: '-start_date'
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'exhibition', label: 'Exhibition' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'gallery_opening', label: 'Gallery Opening' },
    { value: 'art_fair', label: 'Art Fair' },
    { value: 'auction', label: 'Auction' },
    { value: 'performance', label: 'Performance' },
    { value: 'artist_talk', label: 'Artist Talk' },
    { value: 'networking', label: 'Networking' },
    { value: 'competition', label: 'Competition' },
    { value: 'other', label: 'Other' }
  ];

  const timeFilters = [
    { value: '', label: 'All Time' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'past', label: 'Past' }
  ];

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.time) params.time = filters.time;
      if (filters.is_online) params.is_online = filters.is_online;
      if (filters.is_free) params.is_free = filters.is_free;
      if (filters.is_featured) params.is_featured = filters.is_featured;
      if (filters.sort) params.sort = filters.sort;

      const data = await eventService.getEvents(params);
      setEvents(data.results || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      showToast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventSlug, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventService.deleteEvent(eventSlug);
      showToast.success('Event deleted successfully');
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete event:', error);
      showToast.error('Failed to delete event');
    }
  };

  const handleEditEvent = (eventSlug, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/events/edit/${eventSlug}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatusBadge = (event) => {
    if (event.is_past) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Past</span>;
    }
    if (event.is_ongoing) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">Happening Now</span>;
    }
    if (event.is_sold_out) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">Sold Out</span>;
    }
    if (event.is_upcoming) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">Upcoming</span>;
    }
    return null;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] py-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            <span className="bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent">
              Art Events
            </span>
          </h1>
          <p className="text-lg text-[#5d5955] dark:text-[#c4bfb9] max-w-2xl mx-auto mb-6">
            Discover amazing art events, exhibitions, workshops, and more
          </p>
          
          {/* Create Event Button - Only for Artists */}
          {isAuthenticated && user?.role === 'artist' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => navigate('/events/create')}
                icon={Plus}
                className="bg-gradient-to-r from-[#6d2842] to-[#8b3654] hover:from-[#8b3654] hover:to-[#a64d6d] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Create New Event
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white dark:bg-[#2d2a27] rounded-2xl shadow-lg p-6 border border-[#e8e7e5] dark:border-[#4a4642]">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <input
                  type="text"
                  placeholder="Search events by title, location, category..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                icon={Filter}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#e8e7e5] dark:border-[#4a4642]"
              >
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-2 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Time
                  </label>
                  <select
                    value={filters.time}
                    onChange={(e) => handleFilterChange('time', e.target.value)}
                    className="w-full px-4 py-2 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  >
                    {timeFilters.map(time => (
                      <option key={time.value} value={time.value}>{time.label}</option>
                    ))}
                  </select>
                </div>

                {/* Online/Offline */}
                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Format
                  </label>
                  <select
                    value={filters.is_online}
                    onChange={(e) => handleFilterChange('is_online', e.target.value)}
                    className="w-full px-4 py-2 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  >
                    <option value="">All Formats</option>
                    <option value="true">Online Only</option>
                    <option value="false">In-Person Only</option>
                  </select>
                </div>

                {/* Free/Paid */}
                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Price
                  </label>
                  <select
                    value={filters.is_free}
                    onChange={(e) => handleFilterChange('is_free', e.target.value)}
                    className="w-full px-4 py-2 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  >
                    <option value="">All Events</option>
                    <option value="true">Free Only</option>
                    <option value="false">Paid Only</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-[#5d5955] dark:text-[#c4bfb9]">
            Found <span className="font-semibold text-[#6d2842] dark:text-[#d4a343]">{events.length}</span> events
          </p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-20 h-20 mx-auto mb-4 text-[#9b9791] dark:text-[#6d6762]" />
            <h3 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-2">
              No events found
            </h3>
            <p className="text-[#5d5955] dark:text-[#c4bfb9]">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/events/${event.slug}`}>
                  <div className="bg-white dark:bg-[#2d2a27] rounded-2xl overflow-hidden border border-[#e8e7e5] dark:border-[#4a4642] hover:shadow-2xl hover:shadow-[#6d2842]/10 dark:hover:shadow-[#d4a343]/10 transition-all duration-300 group h-full flex flex-col">
                    {/* Event Image */}
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#6d2842] to-[#a64d6d]">
                      {event.cover_image ? (
                        <img
                          src={event.cover_image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        {getEventStatusBadge(event)}
                      </div>

                      {/* Featured Badge */}
                      {event.is_featured && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#d4a343] text-white flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" />
                            Featured
                          </span>
                        </div>
                      )}

                      {/* Edit & Delete Buttons - Only for event owner */}
                      {isAuthenticated && user?.id === event.artist?.id && (
                        <div className="absolute bottom-4 right-4 flex gap-2">
                          <button
                            onClick={(e) => handleEditEvent(event.slug, e)}
                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200 hover:scale-110"
                            title="Edit Event"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteEvent(event.id, event.slug, e)}
                            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200 hover:scale-110"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-2 group-hover:text-[#6d2842] dark:group-hover:text-[#d4a343] transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9] mb-4 line-clamp-2 flex-1">
                        {event.short_description || event.description}
                      </p>

                      {/* Meta Information */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                          <Calendar className="w-4 h-4 text-[#6d2842] dark:text-[#d4a343]" />
                          <span>{formatDate(event.start_date)}</span>
                          <Clock className="w-4 h-4 text-[#6d2842] dark:text-[#d4a343] ml-2" />
                          <span>{formatTime(event.start_date)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                          {event.is_online ? (
                            <>
                              <Globe className="w-4 h-4 text-[#6d2842] dark:text-[#d4a343]" />
                              <span>Online Event</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4 text-[#6d2842] dark:text-[#d4a343]" />
                              <span className="line-clamp-1">{event.location_name || event.location_city}</span>
                            </>
                          )}
                        </div>

                        {event.max_attendees > 0 && (
                          <div className="flex items-center gap-2 text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                            <Users className="w-4 h-4 text-[#6d2842] dark:text-[#d4a343]" />
                            <span>{event.current_attendees} / {event.max_attendees} attendees</span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#e8e7e5] dark:border-[#4a4642]">
                        <div className="flex items-center gap-2">
                          {event.is_free ? (
                            <span className="text-sm font-semibold text-[#508978] dark:text-[#70a596]">
                              Free
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-[#6d2842] dark:text-[#d4a343]">
                              ${event.ticket_price}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#9b9791] dark:text-[#6d6762]" />
                          <span className="text-xs text-[#5d5955] dark:text-[#c4bfb9] capitalize">
                            {event.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Floating Action Button for Mobile - Artists Only */}
        {isAuthenticated && user?.role === 'artist' && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/events/create')}
            className="fixed bottom-8 right-8 md:hidden w-16 h-16 bg-gradient-to-r from-[#6d2842] to-[#8b3654] hover:from-[#8b3654] hover:to-[#a64d6d] text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300"
            title="Create Event"
          >
            <Plus className="w-8 h-8" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
