import { useState, useEffect, useCallback } from 'react';
import ReactMapGL, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { MapPin, Navigation, Calendar, Users, ExternalLink } from 'lucide-react';
import { eventService } from '../../services/api';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const EventLocationMap = ({ currentEvent, onEventClick }) => {
  const [viewport, setViewport] = useState({
    latitude: parseFloat(currentEvent.latitude),
    longitude: parseFloat(currentEvent.longitude),
    zoom: 12
  });
  
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  useEffect(() => {
    const fetchNearbyEvents = async () => {
      try {
        setLoading(true);
        // Fetch all upcoming events
        const response = await eventService.getEvents({ 
          time: 'upcoming',
          status: 'published'
        });
        
        // Filter events that have coordinates and are not the current event
        const eventsWithLocation = response.results.filter(event => 
          event.id !== currentEvent.id &&
          event.latitude && 
          event.longitude &&
          !event.is_online
        );
        
        // Calculate distance and sort by proximity (optional: limit to nearby only)
        const eventsWithDistance = eventsWithLocation.map(event => ({
          ...event,
          distance: calculateDistance(
            parseFloat(currentEvent.latitude),
            parseFloat(currentEvent.longitude),
            parseFloat(event.latitude),
            parseFloat(event.longitude)
          )
        }));
        
        // Show events within 50km radius
        const nearby = eventsWithDistance
          .filter(event => event.distance < 50)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10); // Limit to 10 nearby events
        
        setNearbyEvents(nearby);
      } catch (error) {
        console.error('Failed to fetch nearby events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNearbyEvents();
  }, [currentEvent.id, currentEvent.latitude, currentEvent.longitude, calculateDistance]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Map Container */}
      <div className="rounded-xl overflow-hidden border-2 border-[#e8e7e5] dark:border-[#4a4642] shadow-lg">
        <ReactMapGL
          {...viewport}
          onMove={evt => setViewport(evt.viewState)}
          style={{ width: '100%', height: '500px' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <NavigationControl position="top-right" />

          {/* Current Event Marker - Larger and distinct */}
          <Marker
            latitude={parseFloat(currentEvent.latitude)}
            longitude={parseFloat(currentEvent.longitude)}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedEvent(currentEvent);
            }}
          >
            <div className="cursor-pointer transform hover:scale-110 transition-transform">
              <MapPin 
                className="w-10 h-10 text-[#6d2842] dark:text-[#d4a343] drop-shadow-lg animate-pulse" 
                fill="currentColor"
              />
            </div>
          </Marker>

          {/* Nearby Events Markers - Smaller */}
          {nearbyEvents.map((event) => (
            <Marker
              key={event.id}
              latitude={parseFloat(event.latitude)}
              longitude={parseFloat(event.longitude)}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedEvent(event);
              }}
            >
              <div className="cursor-pointer transform hover:scale-110 transition-transform">
                <MapPin 
                  className="w-7 h-7 text-[#a64d6d] dark:text-[#b8862f] drop-shadow-md" 
                  fill="currentColor"
                />
              </div>
            </Marker>
          ))}

          {/* Popup for selected event */}
          {selectedEvent && (
            <Popup
              latitude={parseFloat(selectedEvent.latitude)}
              longitude={parseFloat(selectedEvent.longitude)}
              onClose={() => setSelectedEvent(null)}
              closeButton={true}
              closeOnClick={false}
              anchor="bottom"
              offset={[0, -40]}
              className="event-popup"
            >
              <div className="p-3 max-w-xs">
                {/* Event Image */}
                {selectedEvent.cover_image && (
                  <img
                    src={selectedEvent.cover_image}
                    alt={selectedEvent.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                
                {/* Current Event Badge */}
                {selectedEvent.id === currentEvent.id && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-[#6d2842] text-white mb-2">
                    Current Event
                  </span>
                )}
                
                {/* Event Title */}
                <h3 className="font-bold text-lg text-[#2d2a27] dark:text-[#fafaf9] mb-2 line-clamp-2">
                  {selectedEvent.title}
                </h3>
                
                {/* Event Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedEvent.start_date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{selectedEvent.location_name || selectedEvent.location_city}</span>
                  </div>
                  
                  {selectedEvent.max_attendees > 0 && (
                    <div className="flex items-center gap-2 text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                      <Users className="w-4 h-4" />
                      <span>{selectedEvent.current_attendees} / {selectedEvent.max_attendees} attendees</span>
                    </div>
                  )}
                </div>
                
                {/* Action Button */}
                {selectedEvent.id === currentEvent.id ? (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEvent.latitude},${selectedEvent.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#6d2842] dark:bg-[#d4a343] text-white dark:text-[#1a1816] rounded-lg hover:bg-[#8b3355] dark:hover:bg-[#e8b350] transition-colors text-sm font-medium"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                ) : (
                  <button
                    onClick={() => onEventClick(selectedEvent.slug)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#6d2842] dark:bg-[#d4a343] text-white dark:text-[#1a1816] rounded-lg hover:bg-[#8b3355] dark:hover:bg-[#e8b350] transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Event
                  </button>
                )}
              </div>
            </Popup>
          )}
        </ReactMapGL>
      </div>

      {/* Nearby Events Info */}
      {nearbyEvents.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-[#6d2842]/10 to-[#a64d6d]/10 dark:from-[#6d2842]/20 dark:to-[#a64d6d]/20 rounded-xl border border-[#6d2842]/20 dark:border-[#a64d6d]/30">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-[#6d2842] dark:text-[#d4a343]" />
            <h3 className="font-semibold text-[#2d2a27] dark:text-[#fafaf9]">
              {nearbyEvents.length} Nearby Event{nearbyEvents.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
            Click on markers to explore other events in this area. The pulsing marker shows the current event.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6d2842]"></div>
          <p className="mt-2 text-sm text-[#5d5955] dark:text-[#c4bfb9]">Loading nearby events...</p>
        </div>
      )}

      <style>{`
        .event-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 0.75rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        
        .event-popup .mapboxgl-popup-close-button {
          font-size: 20px;
          padding: 8px;
          color: #2d2a27;
        }
        
        .dark .event-popup .mapboxgl-popup-content {
          background-color: #2d2a27;
        }
        
        .dark .event-popup .mapboxgl-popup-close-button {
          color: #fafaf9;
        }
        
        .event-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }
        
        .dark .event-popup .mapboxgl-popup-tip {
          border-top-color: #2d2a27;
        }
      `}</style>
    </div>
  );
};

export default EventLocationMap;
