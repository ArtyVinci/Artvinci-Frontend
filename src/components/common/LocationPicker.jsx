import { useState, useRef, useEffect } from 'react';
import ReactMapGL, { Marker, NavigationControl } from 'react-map-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapPin, Search } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const LocationPicker = ({ 
  latitude = null, 
  longitude = null, 
  locationName = '',
  city = '',
  country = '',
  onChange 
}) => {
  const [viewport, setViewport] = useState({
    latitude: latitude || 36.8065,  // Default to Tunisia
    longitude: longitude || 10.1815,
    zoom: latitude && longitude ? 12 : 8
  });
  
  const [marker, setMarker] = useState(
    latitude && longitude ? { latitude, longitude } : null
  );

  const mapRef = useRef(null);
  const geocoderContainerRef = useRef(null);

  useEffect(() => {
    if (!geocoderContainerRef.current || !mapRef.current) return;

    const geocoderContainer = geocoderContainerRef.current;

    // Initialize Mapbox Geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapRef.current.getMap(),
      marker: false,
      placeholder: 'Search for a location...',
      proximity: {
        longitude: viewport.longitude,
        latitude: viewport.latitude
      }
    });

    // Add geocoder to the container
    geocoderContainer.appendChild(geocoder.onAdd(mapRef.current.getMap()));

    // Handle geocoder result
    geocoder.on('result', (e) => {
      const { center, place_name, context } = e.result;
      const [lng, lat] = center;

      // Extract city and country from context
      let extractedCity = '';
      let extractedCountry = '';

      if (context) {
        const placeContext = context.find(c => c.id.includes('place'));
        const countryContext = context.find(c => c.id.includes('country'));
        
        extractedCity = placeContext ? placeContext.text : '';
        extractedCountry = countryContext ? countryContext.text : '';
      }

      // Update marker and viewport
      setMarker({ latitude: lat, longitude: lng });
      setViewport(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        zoom: 14
      }));

      // Call onChange callback
      if (onChange) {
        const locationData = {
          latitude: lat,
          longitude: lng,
          location_name: place_name,
          location_city: extractedCity,
          location_country: extractedCountry
        };
        console.log('🔍 LocationPicker (Search): Sending location data:', locationData);
        onChange(locationData);
      }
    });

    // Cleanup
    return () => {
      if (geocoderContainer) {
        geocoderContainer.innerHTML = '';
      }
    };
  }, [onChange, viewport.latitude, viewport.longitude]);

  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat;

    setMarker({ latitude: lat, longitude: lng });

    // Reverse geocoding to get place name
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
    )
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const placeName = feature.place_name;
          
          let extractedCity = '';
          let extractedCountry = '';

          if (feature.context) {
            const placeContext = feature.context.find(c => c.id.includes('place'));
            const countryContext = feature.context.find(c => c.id.includes('country'));
            
            extractedCity = placeContext ? placeContext.text : '';
            extractedCountry = countryContext ? countryContext.text : '';
          }

          if (onChange) {
            const locationData = {
              latitude: lat,
              longitude: lng,
              location_name: placeName,
              location_city: extractedCity,
              location_country: extractedCountry
            };
            console.log('📍 LocationPicker: Sending location data:', locationData);
            onChange(locationData);
          }
        }
      })
      .catch(err => console.error('Reverse geocoding error:', err));
  };

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="relative">
        <div 
          ref={geocoderContainerRef} 
          className="mapbox-geocoder-container"
          style={{
            position: 'relative',
            zIndex: 1
          }}
        />
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border-2 border-[#e8e7e5] dark:border-[#4a4642] shadow-lg">
        <ReactMapGL
          ref={mapRef}
          {...viewport}
          onMove={evt => setViewport(evt.viewState)}
          style={{ width: '100%', height: '400px' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={handleMapClick}
        >
          {/* Navigation Controls */}
          <NavigationControl position="top-right" />

          {/* Marker */}
          {marker && (
            <Marker
              latitude={marker.latitude}
              longitude={marker.longitude}
              anchor="bottom"
            >
              <div className="relative">
                <MapPin 
                  className="w-10 h-10 text-[#6d2842] dark:text-[#d4a343] drop-shadow-lg" 
                  fill="currentColor"
                />
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#6d2842] dark:bg-[#d4a343] rounded-full" />
              </div>
            </Marker>
          )}
        </ReactMapGL>

        {/* Instructions Overlay */}
        {!marker && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#2d2a27] px-4 py-2 rounded-lg shadow-lg border border-[#e8e7e5] dark:border-[#4a4642]">
            <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9] flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search for a location or click on the map
            </p>
          </div>
        )}
      </div>

      {/* Selected Location Info */}
      {marker && (locationName || city) && (
        <div className="p-4 bg-gradient-to-br from-[#6d2842]/10 to-[#a64d6d]/10 dark:from-[#6d2842]/20 dark:to-[#a64d6d]/20 rounded-xl border border-[#6d2842]/20 dark:border-[#a64d6d]/30">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#6d2842] dark:text-[#d4a343] flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-1">
                Selected Location
              </p>
              <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                {locationName || `${city}, ${country}`}
              </p>
              <p className="text-xs text-[#9b9791] dark:text-[#6d6762] mt-1">
                Coordinates: {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mapbox-geocoder-container .mapboxgl-ctrl-geocoder {
          width: 100%;
          max-width: 100%;
          box-shadow: none;
          border: 2px solid var(--border-color, #e8e7e5);
          border-radius: 0.75rem;
          font-family: inherit;
        }

        .dark .mapbox-geocoder-container .mapboxgl-ctrl-geocoder {
          background-color: #1a1816;
          border-color: #4a4642;
          color: #fafaf9;
        }

        .mapbox-geocoder-container .mapboxgl-ctrl-geocoder input {
          font-family: inherit;
          padding: 0.75rem 2.5rem;
        }

        .mapbox-geocoder-container .mapboxgl-ctrl-geocoder--icon-search {
          top: 14px;
          left: 12px;
        }

        .mapbox-geocoder-container .mapboxgl-ctrl-geocoder--button {
          top: 10px;
          right: 8px;
        }

        .mapbox-geocoder-container .suggestions {
          border-radius: 0.75rem;
          margin-top: 0.5rem;
          border: 2px solid var(--border-color, #e8e7e5);
        }

        .dark .mapbox-geocoder-container .suggestions {
          background-color: #2d2a27;
          border-color: #4a4642;
        }

        .dark .mapbox-geocoder-container .suggestions li {
          color: #fafaf9;
        }

        .dark .mapbox-geocoder-container .suggestions li:hover {
          background-color: #3a3633;
        }

        .dark .mapbox-geocoder-container .suggestions > .active {
          background-color: #3a3633;
        }
      `}</style>
    </div>
  );
};

export default LocationPicker;
