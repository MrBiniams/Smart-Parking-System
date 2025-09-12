'use client';

import { useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { BookingSection, Location, Slot } from '@/types';
import SearchBox from './booking/SearchBox';
import LocationDetails from './booking/LocationDetails';
import MapView from './booking/MapView';
import Button from './fields/Button';
import { useBookingStore } from '@/store/bookingStore';
import ActiveBookings from './booking/ActiveBookings';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useUserStore } from '@/store/userStore';

interface BookingProps {
  data: BookingSection;
}

interface FormData {
  plateNumber: string;
  location: string;
  date: string;
  time: string;
  slot: string;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px'
};

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const PAYMENT_METHODS = [
  {
    id: 'telebirr',
    name: 'TeleBirr',
    icon: '/telebirr-logo.png',
    description: 'Pay with TeleBirr mobile money'
  },
  {
    id: 'cbe-birr',
    name: 'CBE Birr',
    icon: '/cbe-birr-logo.png',
    description: 'Pay with CBE Birr mobile banking'
  }
];

export default function Booking({ data }: BookingProps) {
  const {
    locations,
    selectedLocation,
    slots,
    selectedSlot,
    userLocation,
    formData,
    isLoading,
    error,
    showPaymentModal,
    showSlotGrid,
    setUserLocation,
    setFormData,
    setShowPaymentModal,
    handleLocationSelect,
    handleSlotSelect,
    loadLocations,
    loadSlots,
    resetBooking
  } = useBookingStore();

  const { user } = useUserStore();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });


  // Check if Google Maps API key is present
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
    }
  }, []);

  // Load locations on mount
  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  // Load slots when location is selected
  useEffect(() => {
    if (selectedLocation) {
      loadSlots(selectedLocation.documentId);
    }
  }, [selectedLocation, loadSlots]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    if (name === 'location') {
      const location = value ? locations.find((loc: Location) => loc.documentId === value) ?? null : null;
      if (location) {
        handleLocationSelect(location);
      }
    } else if (name === 'slot') {
      const slot = slots.find((slot: Slot) => slot.documentId === value) ?? null;
      if (slot) {
        handleSlotSelect(slot);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation || !selectedSlot) return;

    try {
      // Here you would typically make an API call to create the booking
      setShowPaymentModal(true);
    } catch (err) {
      console.error('Error creating booking:', err);
    }
  };

  const handlePaymentSelect = async (paymentMethod: string) => {
    if (!selectedSlot || !selectedLocation) return;

    try {
      if (paymentMethod === 'telebirr') {
        // Calculate amount based on slot price and duration
        const amount = selectedSlot.price || 0;
        
        // Here you would typically make an API call to initiate payment
        // const paymentResponse = await initiatePayment(token, selectedSlot.documentId, amount);
        
        // Redirect to payment page
        // if (paymentResponse.paymentUrl) {
        //   window.location.href = paymentResponse.paymentUrl;
        // }
      }
      
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white" id="booking-form">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{data.subtitle}</p>
        </div>
        {user && <ActiveBookings userId={user.id} />}

        <SearchBox
          formData={formData}
          locations={locations}
          availableSlots={slots.filter(slot => slot.slotStatus === 'available')}
          selectedLocation={selectedLocation}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onClearLocation={() => {
            resetBooking();
          }}
        />

        <div className="space-y-8">
          <div className="relative">
            <div className="w-full">
              <MapView
                isLoaded={isLoaded}
                selectedLocation={selectedLocation}
                locations={locations}
                containerStyle={{
                  ...containerStyle,
                  height: '600px'
                }}
                defaultCenter={{ lat: 9.0002, lng: 38.7636 }}
              >
                {/* Show all locations */}
                {locations.map((location: Location) => (
                  location?.coordinates && (
                    <Marker
                      key={location.documentId}
                      position={{
                        lat: location.coordinates.lat,
                        lng: location.coordinates.lng
                      }}
                      title={location.name}
                      icon={{
                        path: google?.maps?.SymbolPath?.CIRCLE,
                        scale: 8,
                        fillColor: selectedLocation?.documentId === location.documentId ? '#2563EB' : '#4CAF50',
                        fillOpacity: 0.8,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                      }}
                      onClick={() => handleLocationSelect(location)}
                    />
                  )
                ))}

                {/* Show slot markers if a location is selected */}
                {selectedLocation && slots.map((slot: Slot) => (
                  slot?.coordinates && (
                    <Marker
                      key={slot.documentId}
                      position={{
                        lat: slot.coordinates.lat,
                        lng: slot.coordinates.lng
                      }}
                      title={slot.name}
                      icon={{
                        path: google?.maps?.SymbolPath?.CIRCLE,
                        scale: 6,
                        fillColor: slot.slotStatus === 'available' ? '#4CAF50' : '#F44336',
                        fillOpacity: 0.8,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                      }}
                    />
                  )
                ))}
              </MapView>

              {/* Slot Sidebar */}
              {selectedLocation && (
                <div className="relative w-full h-auto bg-white shadow-lg overflow-hidden lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-96">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">Available Slots</h3>
                      <button
                        onClick={() => resetBooking()}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <LocationDetails
                      location={selectedLocation}
                      availableSlots={slots}
                      selectedSlot={selectedSlot}
                      onSlotSelect={handleSlotSelect}
                      showSlotGrid={showSlotGrid}
                    />
                  </div>
                </div>
              )}

              {/* Show nearby locations list */}
              {userLocation && locations.length > 0 && !selectedLocation && (
                <div className="absolute top-4 left-4 bg-white rounded-xl p-4 shadow-lg max-w-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Available Locations
                  </h3>
                  <div className="space-y-2">
                    {locations.slice(0, 3).map((location: Location) => (
                      <button
                        key={location.documentId}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full text-left p-3 rounded-lg transition hover:bg-gray-50 border border-gray-100"
                      >
                        <div className="font-medium text-gray-900">{location.name}</div>
                        <div className="text-sm text-gray-600">{location.address}</div>
                        {location.distance !== undefined && (
                          <div className="text-sm text-gray-500">
                            {location.distance.toFixed(1)} km away
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-800">Select Payment Method</h3>
              <p className="text-gray-600 mt-1">Choose your preferred payment option</p>
            </div>
            <div className="p-6 space-y-4">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentSelect(method.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition duration-200"
                >
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <div className="text-2xl">{method.name[0]}</div>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-lg font-medium text-gray-800">{method.name}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="p-6 bg-gray-50 flex justify-end">
              <Button
                onClick={() => setShowPaymentModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
} 