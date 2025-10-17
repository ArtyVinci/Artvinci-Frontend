import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Plus, ArrowLeft, Save, Image as ImageIcon, Sparkles } from 'lucide-react';
import { eventService } from '../../services/api';
import { showToast } from '../../services/toast';
import { Button, Loading, LocationPicker } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';

const EventFormPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!slug;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category: 'exhibition',
    status: 'draft',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    location_name: '',
    location_address: '',
    location_city: '',
    location_country: '',
    latitude: null,
    longitude: null,
    is_online: false,
    online_link: '',
    max_attendees: 0,
    is_free: true,
    ticket_price: 0.0,
    currency: 'USD',
    tags: [],
    requirements: '',
    schedule: '',
    featured_artists: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [currentArtist, setCurrentArtist] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchEvent();
    }
  }, [slug]);

  useEffect(() => {
    // Check if user is artist
    if (user && user.role !== 'artist') {
      showToast.error('Only artists can create events');
      navigate('/events');
    }
  }, [user, navigate]);

  const fetchEvent = async () => {
    try {
      const data = await eventService.getEventBySlug(slug);
      
      // Check ownership
      if (data.artist.id !== user.id) {
        showToast.error('You can only edit your own events');
        navigate('/events');
        return;
      }

      // Format dates for input fields
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        title: data.title || '',
        description: data.description || '',
        short_description: data.short_description || '',
        category: data.category || 'exhibition',
        status: data.status || 'draft',
        start_date: formatDateForInput(data.start_date),
        end_date: formatDateForInput(data.end_date),
        registration_deadline: formatDateForInput(data.registration_deadline),
        location_name: data.location?.name || '',
        location_address: data.location?.address || '',
        location_city: data.location?.city || '',
        location_country: data.location?.country || '',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        is_online: data.is_online || false,
        online_link: data.online_link || '',
        max_attendees: data.max_attendees || 0,
        is_free: data.is_free || true,
        ticket_price: data.ticket_price || 0.0,
        currency: data.currency || 'USD',
        tags: data.tags || [],
        requirements: data.requirements || '',
        schedule: data.schedule || '',
        featured_artists: data.featured_artists || []
      });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      showToast.error('Failed to load event');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      showToast.error('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      return;
    }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      showToast.error('Each image must be less than 5MB');
      return;
    }

    if (!isEditing) {
      // For new events, store images locally and show preview
      const newImages = await Promise.all(
        files.map(async (file) => {
          const url = URL.createObjectURL(file);
          return { file, url, caption: '' };
        })
      );
      setImages(prev => [...prev, ...newImages]);
      showToast.success(`${files.length} image(s) added. They will be uploaded after creating the event.`);
      return;
    }

    try {
      setUploadingImages(true);
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('images', file);
      });

      await eventService.uploadEventImages(slug, formData);
      showToast.success('Images uploaded successfully');
      
      // Refresh event data
      fetchEvent();
    } catch (error) {
      console.error('Failed to upload images:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to upload images';
      showToast.error(errorMsg);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      // Revoke the object URL to avoid memory leaks
      if (newImages[index].url) {
        URL.revokeObjectURL(newImages[index].url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddArtist = () => {
    if (currentArtist.trim() && !formData.featured_artists.includes(currentArtist.trim())) {
      setFormData(prev => ({
        ...prev,
        featured_artists: [...prev.featured_artists, currentArtist.trim()]
      }));
      setCurrentArtist('');
    }
  };

  const handleRemoveArtist = (artistToRemove) => {
    setFormData(prev => ({
      ...prev,
      featured_artists: prev.featured_artists.filter(artist => artist !== artistToRemove)
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      showToast.error('Please enter an event title first');
      return;
    }

    try {
      setGeneratingAI(true);
      showToast.info('🤖 Generating description with AI...');

      const location = formData.location_city 
        ? `${formData.location_city}${formData.location_country ? ', ' + formData.location_country : ''}`
        : '';

      const response = await eventService.generateEventDescription({
        title: formData.title,
        category: formData.category,
        location: location,
        additional_info: formData.short_description || ''
      });

      setFormData(prev => ({
        ...prev,
        description: response.description
      }));

      showToast.success('✨ Description generated successfully!');
    } catch (error) {
      console.error('Failed to generate description:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to generate description';
      showToast.error(errorMsg);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      showToast.error('Event title is required');
      return;
    }

    if (!formData.description.trim()) {
      showToast.error('Event description is required');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      showToast.error('Start and end dates are required');
      return;
    }

    // Validate dates are not in the past
    const now = new Date();
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (startDate < now && !isEditing) {
      showToast.error('Start date cannot be in the past');
      return;
    }

    if (endDate < startDate) {
      showToast.error('End date must be after start date');
      return;
    }

    if (formData.registration_deadline) {
      const regDeadline = new Date(formData.registration_deadline);
      if (regDeadline > startDate) {
        showToast.error('Registration deadline must be before start date');
        return;
      }
    }

    // Validate location for in-person events
    if (!formData.is_online) {
      console.log('🔍 Validating location - lat:', formData.latitude, 'lng:', formData.longitude);
      if (!formData.latitude || !formData.longitude) {
        showToast.error('Please select a location on the map for in-person events');
        return;
      }
      if (!formData.location_name.trim()) {
        showToast.error('Location name is required for in-person events');
        return;
      }
    }

    // Validate online link for online events
    if (formData.is_online && !formData.online_link.trim()) {
      showToast.error('Online link is required for online events');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare data for backend
      const eventData = {
        ...formData,
        // Convert boolean to ensure proper format
        is_online: Boolean(formData.is_online),
        is_free: Boolean(formData.is_free),
        // Ensure numeric fields are numbers
        max_attendees: parseInt(formData.max_attendees) || 0,
        ticket_price: parseFloat(formData.ticket_price) || 0.0,
        // Ensure coordinates are numbers (not strings) if they exist
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      // Remove empty fields (but keep null coordinates for backend validation)
      if (!eventData.online_link) delete eventData.online_link;
      if (!eventData.registration_deadline) delete eventData.registration_deadline;
      
      // Debug: Log the data being sent
      console.log('Event data being sent to backend:', eventData);
      
      if (isEditing) {
        const response = await eventService.updateEvent(slug, eventData);
        showToast.success('Event updated successfully');
        // Backend returns { message: '...', event: {...} }
        const eventSlug = response.event?.slug || slug;
        navigate(`/events/${eventSlug}`);
      } else {
        const response = await eventService.createEvent(eventData);
        const createdSlug = response.slug;
        
        // Upload pending images if any
        if (images.length > 0) {
          try {
            setUploadingImages(true);
            const imageFormData = new FormData();
            images.forEach((img) => {
              imageFormData.append('images', img.file);
            });
            await eventService.uploadEventImages(createdSlug, imageFormData);
            showToast.success('Event created and images uploaded successfully!');
          } catch (imgError) {
            console.error('Failed to upload images:', imgError);
            showToast.warning('Event created but some images failed to upload. You can upload them later.');
          } finally {
            setUploadingImages(false);
          }
        } else {
          showToast.success('Event created successfully');
        }
        
        navigate(`/events/${createdSlug}`);
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract specific error messages
      let errorMessage = 'Failed to save event';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'object') {
          // Get first error message from validation errors
          const firstKey = Object.keys(errorData)[0];
          if (firstKey && Array.isArray(errorData[firstKey])) {
            errorMessage = `${firstKey}: ${errorData[firstKey][0]}`;
          } else if (firstKey) {
            errorMessage = `${firstKey}: ${errorData[firstKey]}`;
          }
        }
      }
      showToast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] py-12">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(isEditing ? `/events/${slug}` : '/events')}
            className="mb-6"
          >
            Back
          </Button>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-2">
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-lg text-[#5d5955] dark:text-[#c4bfb9]">
            {isEditing ? 'Update your event details' : 'Share your amazing art event with the community'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#2d2a27] rounded-3xl shadow-xl border border-[#e8e7e5] dark:border-[#4a4642] p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Amazing Art Exhibition"
                    className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    maxLength={300}
                    placeholder="Brief overview of your event (max 300 characters)"
                    className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  />
                  <p className="text-xs text-[#9b9791] dark:text-[#6d6762] mt-1">
                    {formData.short_description.length} / 300 characters
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9]">
                      Full Description *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generatingAI || !formData.title.trim()}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Sparkles className="w-4 h-4" />
                      {generatingAI ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Detailed description of your event... (or click 'Generate with AI' above)"
                    className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  />
                  {generatingAI && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                      <span>Gemini AI is crafting your description...</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                    >
                      <option value="exhibition">Exhibition</option>
                      <option value="workshop">Workshop</option>
                      <option value="gallery_opening">Gallery Opening</option>
                      <option value="art_fair">Art Fair</option>
                      <option value="auction">Auction</option>
                      <option value="performance">Performance</option>
                      <option value="artist_talk">Artist Talk</option>
                      <option value="networking">Networking</option>
                      <option value="competition">Competition</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                Date & Time
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    min={!isEditing ? new Date().toISOString().slice(0, 16) : undefined}
                    required
                    className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  />
                  <p className="text-xs text-[#9b9791] dark:text-[#6d6762] mt-1">
                    {!isEditing && 'Cannot select past dates'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    min={formData.start_date || (!isEditing ? new Date().toISOString().slice(0, 16) : undefined)}
                    required
                    className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  />
                  <p className="text-xs text-[#9b9791] dark:text-[#6d6762] mt-1">
                    Must be after start date
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Registration Deadline (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={handleChange}
                    min={!isEditing ? new Date().toISOString().slice(0, 16) : undefined}
                    max={formData.start_date || undefined}
                    className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  />
                  <p className="text-xs text-[#9b9791] dark:text-[#6d6762] mt-1">
                    Must be before event start date
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                Location
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_online"
                    checked={formData.is_online}
                    onChange={handleChange}
                    id="is_online"
                    className="w-5 h-5 text-[#6d2842] focus:ring-[#6d2842] rounded"
                  />
                  <label htmlFor="is_online" className="text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9]">
                    This is an online event
                  </label>
                </div>

                {formData.is_online ? (
                  <div>
                    <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                      Online Event Link
                    </label>
                    <input
                      type="url"
                      name="online_link"
                      value={formData.online_link}
                      onChange={handleChange}
                      placeholder="https://zoom.us/j/123456789"
                      className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                      Event Location
                    </label>
                    <LocationPicker
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      locationName={formData.location_name}
                      city={formData.location_city}
                      country={formData.location_country}
                      onChange={(location) => {
                        console.log('📝 EventFormPage: Received location from picker:', location);
                        setFormData(prev => {
                          const updatedData = {
                            ...prev,
                            latitude: location.latitude,
                            longitude: location.longitude,
                            location_name: location.location_name,
                            location_city: location.location_city,
                            location_country: location.location_country
                          };
                          console.log('✅ EventFormPage: Updated formData:', updatedData);
                          return updatedData;
                        });
                      }}
                    />
                    
                    {/* Keep the address field for additional details */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                        Additional Address Details (Optional)
                      </label>
                      <input
                        type="text"
                        name="location_address"
                        value={formData.location_address}
                        onChange={handleChange}
                        placeholder="Suite 200, Building B, etc."
                        className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Capacity & Pricing */}
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                Capacity & Pricing
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Maximum Attendees (0 for unlimited)
                  </label>
                  <input
                    type="number"
                    name="max_attendees"
                    value={formData.max_attendees}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_free"
                    checked={formData.is_free}
                    onChange={handleChange}
                    id="is_free"
                    className="w-5 h-5 text-[#6d2842] focus:ring-[#6d2842] rounded"
                  />
                  <label htmlFor="is_free" className="text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9]">
                    Free Event
                  </label>
                </div>

                {!formData.is_free && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                        Ticket Price
                      </label>
                      <input
                        type="number"
                        name="ticket_price"
                        value={formData.ticket_price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                Additional Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Event Schedule (Optional)
                  </label>
                  <textarea
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleChange}
                    rows="4"
                    placeholder="10:00 AM - Registration&#10;11:00 AM - Opening Remarks&#10;12:00 PM - Main Exhibition"
                    className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Requirements (Optional)
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="3"
                    placeholder="What attendees need to bring or know..."
                    className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                    />
                    <Button type="button" onClick={handleAddTag} icon={Plus}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-[#6d2842] to-[#a64d6d] text-white rounded-full text-sm flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured Artists */}
                <div>
                  <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                    Featured Artists (Optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentArtist}
                      onChange={(e) => setCurrentArtist(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArtist())}
                      placeholder="Add artist name..."
                      className="flex-1 px-4 py-2 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                    />
                    <Button type="button" onClick={handleAddArtist} icon={Plus}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.featured_artists.map((artist, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#f5f5f3] dark:bg-[#1a1816] rounded-full text-sm flex items-center gap-2 border border-[#e8e7e5] dark:border-[#4a4642]"
                      >
                        {artist}
                        <button
                          type="button"
                          onClick={() => handleRemoveArtist(artist)}
                          className="hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                Event Images
              </h2>
              
              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-[#e8e7e5] dark:border-[#4a4642]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {!isEditing && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                          Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-2 border-dashed border-[#e8e7e5] dark:border-[#4a4642] rounded-xl p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-[#9b9791] dark:text-[#6d6762]" />
                <p className="text-[#5d5955] dark:text-[#c4bfb9] mb-4">
                  {isEditing 
                    ? 'Upload event images to make it more attractive' 
                    : 'Add images now (they will be uploaded after creating the event)'}
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-input"
                  disabled={uploadingImages}
                />
                <label 
                  htmlFor="image-upload-input" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6d2842] to-[#8b3654] hover:from-[#8b3654] hover:to-[#a64d6d] text-white rounded-xl cursor-pointer transition-all duration-300 disabled:opacity-50"
                  style={{ pointerEvents: uploadingImages ? 'none' : 'auto', opacity: uploadingImages ? 0.5 : 1 }}
                >
                  <Upload className="w-5 h-5" />
                  {uploadingImages ? 'Uploading...' : images.length > 0 ? 'Add More Images' : 'Choose Images'}
                </label>
                <p className="text-xs text-[#9b9791] dark:text-[#6d6762] mt-2">
                  JPEG, PNG, GIF, WebP (Max 5MB each)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-[#e8e7e5] dark:border-[#4a4642]">
              <Button
                type="submit"
                disabled={submitting}
                icon={Save}
                className="flex-1"
              >
                {submitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(isEditing ? `/events/${slug}` : '/events')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EventFormPage;
