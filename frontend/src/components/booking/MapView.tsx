import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Location, Slot } from '@/types';
import { mapStyles } from '@/utils/mapStyles';

interface MapViewProps {
  isLoaded: boolean;
  selectedLocation: Location | null;
  locations: Location[];
  slots?: Slot[];
  containerStyle: {
    width: string;
    height: string;
  };
  defaultCenter: {
    lat: number;
    lng: number;
  };
  children?: ReactNode;
  onLocationSelect?: (location: Location) => void;
}

export default function MapView({
  isLoaded,
  selectedLocation,
  locations,
  slots,
  containerStyle,
  defaultCenter,
  children,
  onLocationSelect
}: MapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [zoom, setZoom] = useState(15);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showRouteView, setShowRouteView] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [closestLocations, setClosestLocations] = useState<Location[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);

  // Handle zooming when a location is selected
  useEffect(() => {
    if (mapRef.current && selectedLocation?.coordinates) {
      mapRef.current.panTo(selectedLocation.coordinates);
      setZoom(17);
    } else if (mapRef.current) {
      setZoom(13);
    }
  }, [selectedLocation]);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  // Get user's current location and calculate closest locations
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          
          // Calculate distances and sort locations
          const locationsWithDistance = locations.map(location => ({
            ...location,
            distance: calculateDistance(
              userLoc.lat,
              userLoc.lng,
              location.coordinates.lat,
              location.coordinates.lng
            )
          }));
          
          // Sort by distance and take top 3
          const sortedLocations = locationsWithDistance
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 3);
          
          setClosestLocations(sortedLocations);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [locations]);

  const handleMarkerClick = (location: Location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleInfoWindowClick = (location: Location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    if (infoWindow) {
      infoWindow.close();
    }
  };

  const getDirections = async () => {
    if (!selectedLocation || !userLocation) return;
    
    const directionsService = new google.maps.DirectionsService();
    const origin = new google.maps.LatLng(userLocation.lat, userLocation.lng);
    const destination = new google.maps.LatLng(
      selectedLocation.coordinates.lat,
      selectedLocation.coordinates.lng
    );

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          setIsMaximized(true);
          setShowRouteView(true);
          
          // Center the map on the route
          if (mapRef.current) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(origin);
            bounds.extend(destination);
            result.routes[0].overview_path.forEach(point => {
              bounds.extend(point);
            });
            mapRef.current.fitBounds(bounds);
          }
        }
      }
    );
  };

  const resetDirections = () => {
    setDirections(null);
    setIsMaximized(false);
    setShowRouteView(false);
    if (mapRef.current && selectedLocation?.coordinates) {
      mapRef.current.panTo(selectedLocation.coordinates);
      setZoom(17);
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="animate-pulse text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Calculate bounds to fit all locations
  const bounds = new google.maps.LatLngBounds();
  locations.forEach(location => {
    if (location.coordinates) {
      bounds.extend(location.coordinates);
    }
  });

  const center = selectedLocation?.coordinates || 
    (bounds.getCenter() || defaultCenter);

  const getMarkerIcon = (isSelected: boolean, isUser: boolean = false, isAvailable: boolean = true): google.maps.Symbol => {
    if (!isLoaded) {
      return {
        path: google?.maps?.SymbolPath?.CIRCLE,
        scale: 1,
        fillColor: '#000000',
        fillOpacity: 0,
        strokeColor: '#000000',
        strokeWeight: 0,
      };
    }
    
    return {
      path: google?.maps?.SymbolPath?.CIRCLE,
      scale: isUser ? 10 : isSelected ? 8 : 6,
      fillColor: isUser ? '#4285F4' : isSelected ? '#2563EB' : isAvailable ? '#4CAF50' : '#F44336',
      fillOpacity: isUser ? 1 : 0.8,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
    };
  };

  return (
    <div className={`relative transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
      <GoogleMap
        mapContainerStyle={{
          ...containerStyle,
          height: isMaximized ? '100vh' : containerStyle.height
        }}
        center={center}
        zoom={zoom}
        onLoad={(map) => {
          mapRef.current = map;
          if (!selectedLocation && locations.length > 0) {
            map.fitBounds(bounds);
          }
        }}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: mapStyles,
          gestureHandling: 'greedy'
        }}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            title="Your Location"
            icon={getMarkerIcon(false, true)}
          />
        )}
        
        {/* Location markers */}
        {locations.map((location) => (
          location?.coordinates && (
            <Marker
              key={location.documentId}
              position={location.coordinates}
              title={location.name}
              icon={getMarkerIcon(selectedLocation?.documentId === location.documentId)}
              onClick={() => handleMarkerClick(location)}
            >
              {selectedLocation?.documentId === location.documentId && !directions && (
                <InfoWindow
                  position={location.coordinates}
                  options={{
                    pixelOffset: new google.maps.Size(0, -40),
                    maxWidth: 300
                  }}
                  onCloseClick={() => {
                    if (onLocationSelect) {
                      onLocationSelect(selectedLocation);
                    }
                  }}
                >
                  <div className="p-2">
                    <h3 className="text-lg font-semibold mb-1">{selectedLocation.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{selectedLocation.address}</p>
                    <div className="text-sm text-gray-700">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          getDirections();
                        }}
                        className="mt-2 w-full bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        Get Directions
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          )
        ))}

        {/* Closest Locations Markers (when no location is selected) */}
        {!selectedLocation && closestLocations.map((location) => (
          location?.coordinates && (
            <Marker
              key={location.documentId}
              position={location.coordinates}
              icon={getMarkerIcon(false)}
              title={location.name}
              onClick={() => handleMarkerClick(location)}
            />
          )
        ))}

        {/* Show directions */}
        {directions && (
          <>
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#2563EB',
                  strokeWeight: 5,
                }
              }}
            />
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={resetDirections}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Slot markers (only shown when a location is selected and no directions) */}
        {!directions && slots?.map((slot) => (
          slot?.coordinates && (
            <Marker
              key={slot.documentId}
              position={slot.coordinates}
              title={`Slot ${slot.name}`}
              icon={getMarkerIcon(false, false, slot.slotStatus === 'available')}
            />
          )
        ))}
        
        {children}
      </GoogleMap>

      {/* Route View Panel */}
      {showRouteView && directions && (
        <div className="absolute bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl max-h-[50vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Route Details</h3>
              <button
                onClick={resetDirections}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Start: {directions.routes[0].legs[0].start_address}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">End: {directions.routes[0].legs[0].end_address}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Distance: {directions.routes[0].legs[0].distance?.text}</span>
                <span>Duration: {directions.routes[0].legs[0].duration?.text}</span>
              </div>
            </div>

            <div className="space-y-2">
              {directions.routes[0].legs[0].steps.map((step, index) => (
                <div key={index} className="flex items-start p-2 hover:bg-gray-50 rounded">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: step.instructions }} />
                    <p className="text-xs text-gray-500 mt-1">{step.distance?.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 