import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Users, Clock, Globe, Ticket, Tag, 
  ArrowLeft, Share2, Heart, Edit, Trash2, UserPlus, UserMinus, CheckCircle, Navigation
} from 'lucide-react';
import ReactMapGL, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { eventService } from '../../services/api';
import { showToast } from '../../services/toast';
import { Button, Loading, Modal } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import EventLocationMap from '../../components/events/EventLocationMap';

const EventDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    attendee_name: '',
    attendee_notes: '',
    special_requirements: '',
    payment_method: 'cash'
  });

  useEffect(() => {
    fetchEventDetails();
  }, [slug]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventBySlug(slug);
      console.log('🗺️ EventDetailPage: Fetched event data:', data);
      console.log('📍 Coordinates - lat:', data.latitude, 'lng:', data.longitude);
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      showToast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      showToast.error('Please login to subscribe to events');
      navigate('/login');
      return;
    }

    try {
      setSubscribing(true);
      await eventService.subscribeToEvent(slug, subscriptionData);
      showToast.success('Successfully subscribed to event!');
      setShowSubscribeModal(false);
      fetchEventDetails();
    } catch (error) {
      console.error('Failed to subscribe:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to subscribe to event';
      showToast.error(errorMessage);
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await eventService.unsubscribeFromEvent(slug);
      showToast.success('Successfully unsubscribed from event');
      fetchEventDetails();
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      showToast.error('Failed to unsubscribe from event');
    }
  };

  const handleDelete = async () => {
    try {
      await eventService.deleteEvent(slug);
      showToast.success('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      console.error('Failed to delete event:', error);
      showToast.error('Failed to delete event');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const isOwner = user && event && user.id === event.artist.id;
  const canSubscribe = isAuthenticated && !isOwner && event?.registration_open && !event?.is_subscribed;

  // Debug subscription state
  useEffect(() => {
    if (event) {
      console.log('🔍 Subscription Debug:');
      console.log('- isAuthenticated:', isAuthenticated);
      console.log('- isOwner:', isOwner);
      console.log('- registration_open:', event.registration_open);
      console.log('- is_subscribed:', event.is_subscribed);
      console.log('- canSubscribe:', canSubscribe);
      console.log('- registration_deadline:', event.registration_deadline);
    }
  }, [event, isAuthenticated, isOwner, canSubscribe]);

  if (loading) {
    return <Loading />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] py-20">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
            Event not found
          </h2>
          <Button onClick={() => navigate('/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] py-12">
      <div className="container-custom">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/events')}
          >
            Back to Events
          </Button>
        </motion.div>

        {/* Event Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#2d2a27] rounded-3xl overflow-hidden shadow-xl border border-[#e8e7e5] dark:border-[#4a4642] mb-8"
        >
          {/* Cover Image */}
          <div className="relative aspect-[21/9] bg-gradient-to-br from-[#6d2842] to-[#a64d6d]">
            {event.cover_image ? (
              <img
                src={event.cover_image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-32 h-32 text-white/30" />
              </div>
            )}

            {/* Action Buttons Overlay */}
            <div className="absolute top-6 right-6 flex gap-3">
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    icon={Edit}
                    onClick={() => navigate(`/events/edit/${slug}`)}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    icon={Trash2}
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-white/90 backdrop-blur-sm text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Event Content */}
          <div className="p-8 md:p-12">
            {/* Title and Category */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-[#6d2842] text-white capitalize">
                    {event.category.replace('_', ' ')}
                  </span>
                  {event.is_featured && (
                    <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-[#d4a343] text-white">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                  {event.title}
                </h1>

                {/* Artist Info */}
                <Link to={`/artist/${event.artist.id}`}>
                  <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6d2842] to-[#a64d6d] flex items-center justify-center text-white font-bold text-lg">
                      {event.artist.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-[#9b9791] dark:text-[#6d6762]">Organized by</p>
                      <p className="font-semibold text-[#2d2a27] dark:text-[#fafaf9]">
                        {event.artist.username}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Subscribe Button */}
              <div className="flex flex-col gap-3">
                {canSubscribe && (
                  <Button
                    size="lg"
                    icon={UserPlus}
                    onClick={() => setShowSubscribeModal(true)}
                    className="min-w-[200px]"
                  >
                    Subscribe to Event
                  </Button>
                )}

                {/* Registration Closed Message */}
                {isAuthenticated && !isOwner && !event.is_subscribed && !event.registration_open && (
                  <div className="min-w-[200px] p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-xl">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 text-center">
                      Registration Closed
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-500 text-center mt-1">
                      {event.is_sold_out ? 'Event is sold out' : 'Deadline has passed'}
                    </p>
                  </div>
                )}

                {event.is_subscribed && !isOwner && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 justify-center">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">You're subscribed!</span>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      icon={UserMinus}
                      onClick={handleUnsubscribe}
                      className="min-w-[200px]"
                    >
                      Unsubscribe
                    </Button>
                  </div>
                )}

                {isOwner && (
                  <Link to={`/events/${slug}/attendees`}>
                    <Button
                      variant="outline"
                      size="lg"
                      icon={Users}
                      className="min-w-[200px] w-full"
                    >
                      View Attendees ({event.current_attendees})
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 p-6 bg-[#f5f5f3] dark:bg-[#1a1816] rounded-2xl">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#6d2842] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-1">
                    Date & Time
                  </p>
                  <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                    {formatDate(event.start_date)}
                  </p>
                  <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                    {formatTime(event.start_date)} - {formatTime(event.end_date)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#b8862f] flex items-center justify-center flex-shrink-0">
                  {event.is_online ? (
                    <Globe className="w-5 h-5 text-white" />
                  ) : (
                    <MapPin className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-1">
                    Location
                  </p>
                  {event.is_online ? (
                    <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                      Online Event
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                        {event.location.name}
                      </p>
                      <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                        {event.location.city}, {event.location.country}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#508978] flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-1">
                    Capacity
                  </p>
                  {event.max_attendees > 0 ? (
                    <>
                      <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                        {event.current_attendees} / {event.max_attendees} attendees
                      </p>
                      {event.spots_remaining !== null && (
                        <p className="text-sm font-semibold text-[#6d2842] dark:text-[#d4a343]">
                          {event.spots_remaining} spots left
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                      Unlimited capacity
                    </p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#6d2842] flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-1">
                    Ticket Price
                  </p>
                  {event.is_free ? (
                    <p className="text-lg font-bold text-[#508978] dark:text-[#70a596]">
                      FREE
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-[#6d2842] dark:text-[#d4a343]">
                      ${event.ticket_price} {event.currency}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#b8862f] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-1">
                    Status
                  </p>
                  {event.is_past ? (
                    <p className="text-sm text-[#9b9791] dark:text-[#6d6762]">Event Ended</p>
                  ) : event.is_ongoing ? (
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      Happening Now!
                    </p>
                  ) : event.is_upcoming ? (
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                      Upcoming
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Registration Deadline */}
              {event.registration_deadline && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#508978] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-1">
                      Registration Deadline
                    </p>
                    <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                      {formatDate(event.registration_deadline)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Map Display for In-Person Events */}
            {!event.is_online && (
              <>
                {event.location?.latitude && event.location?.longitude ? (
                  <EventLocationMap
                    currentEvent={{
                      ...event,
                      latitude: event.location.latitude,
                      longitude: event.location.longitude
                    }}
                    onEventClick={(eventSlug) => navigate(`/events/${eventSlug}`)}
                  />
                ) : (
                  <div className="mb-8 p-6 bg-gradient-to-br from-[#b8862f]/10 to-[#d4a343]/10 dark:from-[#b8862f]/20 dark:to-[#d4a343]/20 rounded-2xl border border-[#b8862f]/20 dark:border-[#d4a343]/30">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-6 h-6 text-[#b8862f] dark:text-[#d4a343] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-lg font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-1">
                          Map View Not Available
                        </p>
                        <p className="text-[#5d5955] dark:text-[#c4bfb9]">
                          This event doesn't have precise location coordinates yet.
                          {isOwner && (
                            <span className="block mt-2">
                              <button
                                onClick={() => navigate(`/events/edit/${slug}`)}
                                className="text-[#6d2842] dark:text-[#d4a343] font-medium hover:underline inline-flex items-center gap-1"
                              >
                                Edit this event to add map location →
                              </button>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Attendees Section - For Artist */}
            {isOwner && event.current_attendees > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-br from-[#6d2842]/10 to-[#a64d6d]/10 dark:from-[#6d2842]/20 dark:to-[#a64d6d]/20 rounded-2xl border border-[#6d2842]/20 dark:border-[#a64d6d]/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#6d2842] dark:text-[#d4a343]" />
                    Registered Attendees
                  </h2>
                  <Link to={`/events/${slug}/attendees`}>
                    <Button variant="outline" size="sm">
                      View Full List
                    </Button>
                  </Link>
                </div>
                <p className="text-[#5d5955] dark:text-[#c4bfb9] mb-3">
                  <strong>{event.current_attendees}</strong> {event.current_attendees === 1 ? 'person has' : 'people have'} subscribed to your event
                </p>
                <p className="text-sm text-[#9b9791] dark:text-[#6d6762]">
                  Click "View Full List" to see detailed attendee information, payment methods, and special requirements.
                </p>
              </div>
            )}

            {/* Attendee Count - For Art Lovers */}
            {!isOwner && event.current_attendees > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-br from-[#508978]/10 to-[#70a596]/10 dark:from-[#508978]/20 dark:to-[#70a596]/20 rounded-2xl border border-[#508978]/20 dark:border-[#70a596]/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#508978] flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#2d2a27] dark:text-[#fafaf9]">
                      {event.current_attendees} {event.current_attendees === 1 ? 'person is' : 'people are'} attending
                    </p>
                    <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                      Join them at this exciting event!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                About This Event
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-[#5d5955] dark:text-[#c4bfb9] whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Additional Sections */}
            {event.schedule && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                  Event Schedule
                </h2>
                <div className="bg-[#f5f5f3] dark:bg-[#1a1816] rounded-xl p-6">
                  <p className="text-[#5d5955] dark:text-[#c4bfb9] whitespace-pre-wrap">
                    {event.schedule}
                  </p>
                </div>
              </div>
            )}

            {event.requirements && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                  Requirements
                </h2>
                <div className="bg-[#f5f5f3] dark:bg-[#1a1816] rounded-xl p-6">
                  <p className="text-[#5d5955] dark:text-[#c4bfb9] whitespace-pre-wrap">
                    {event.requirements}
                  </p>
                </div>
              </div>
            )}

            {event.featured_artists && event.featured_artists.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                  Featured Artists
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.featured_artists.map((artist, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-[#f5f5f3] dark:bg-[#1a1816] rounded-full text-[#5d5955] dark:text-[#c4bfb9]"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-[#6d2842] to-[#a64d6d] text-white rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Event Images Gallery */}
            {event.images && event.images.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                  Event Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#6d2842] to-[#a64d6d]"
                    >
                      <img
                        src={image.url}
                        alt={image.caption || `Event image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Subscribe Modal */}
      <Modal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        title="Subscribe to Event"
      >
        <div className="space-y-4">
          <div>
            <p className="text-[#5d5955] dark:text-[#c4bfb9] mb-3">
              You're about to subscribe to <strong>{event.title}</strong>
            </p>
            
            {/* Show ticket price if event is paid */}
            {!event.is_free && event.ticket_price > 0 && (
              <div className="p-4 bg-gradient-to-br from-[#6d2842]/10 to-[#a64d6d]/10 dark:from-[#6d2842]/20 dark:to-[#a64d6d]/20 rounded-xl border border-[#6d2842]/20 dark:border-[#a64d6d]/30 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9]">Ticket Price</p>
                    <p className="text-2xl font-bold text-[#6d2842] dark:text-[#d4a343]">
                      ${event.ticket_price} {event.currency}
                    </p>
                  </div>
                  <Ticket className="w-12 h-12 text-[#6d2842] dark:text-[#d4a343] opacity-50" />
                </div>
                <p className="text-xs text-[#9b9791] dark:text-[#6d6762] mt-2">
                  Payment will be collected based on your selected payment method.
                </p>
              </div>
            )}

            {/* Show free event badge */}
            {event.is_free && (
              <div className="p-4 bg-gradient-to-br from-[#508978]/10 to-[#70a596]/10 dark:from-[#508978]/20 dark:to-[#70a596]/20 rounded-xl border border-[#508978]/20 dark:border-[#70a596]/30 mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-[#508978] dark:text-[#70a596]" />
                  <div>
                    <p className="text-lg font-bold text-[#508978] dark:text-[#70a596]">FREE Event</p>
                    <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                      No payment required to attend this event
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
              Attendee Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subscriptionData.attendee_name}
              onChange={(e) => setSubscriptionData(prev => ({ ...prev, attendee_name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
              required
            />
          </div>

          {/* Show Payment Method only for paid events */}
          {!event.is_free && event.ticket_price > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash"
                    checked={subscriptionData.payment_method === 'cash'}
                    onChange={(e) => setSubscriptionData(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-4 h-4 text-[#6d2842] focus:ring-[#6d2842] focus:ring-2"
                  />
                  <span className="text-[#2d2a27] dark:text-[#fafaf9]">Cash</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value="online"
                    checked={subscriptionData.payment_method === 'online'}
                    onChange={(e) => setSubscriptionData(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-4 h-4 text-[#6d2842] focus:ring-[#6d2842] focus:ring-2"
                  />
                  <span className="text-[#2d2a27] dark:text-[#fafaf9]">Online Payment</span>
                </label>
              </div>
              {subscriptionData.payment_method === 'online' && (
                <p className="text-xs text-[#9b9791] dark:text-[#6d6762] mt-2">
                  Note: Online payment functionality is coming soon. You'll be able to pay at the event.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={subscriptionData.attendee_notes}
              onChange={(e) => setSubscriptionData(prev => ({ ...prev, attendee_notes: e.target.value }))}
              placeholder="Any notes or questions for the organizer..."
              className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
              Special Requirements (Optional)
            </label>
            <textarea
              value={subscriptionData.special_requirements}
              onChange={(e) => setSubscriptionData(prev => ({ ...prev, special_requirements: e.target.value }))}
              placeholder="Dietary restrictions, accessibility needs, etc..."
              className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubscribe}
              disabled={subscribing || !subscriptionData.attendee_name.trim()}
              className="flex-1"
            >
              {subscribing ? 'Subscribing...' : 'Confirm Subscription'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSubscribeModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Event"
      >
        <div className="space-y-4">
          <p className="text-[#5d5955] dark:text-[#c4bfb9]">
            Are you sure you want to delete <strong>{event.title}</strong>? This action cannot be undone.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Delete Event
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetailPage;
