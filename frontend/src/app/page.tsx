'use client';

import { useQuery } from '@apollo/client';
import { GET_BLOGS, GET_TESTIMONIALS } from '@/graphql/queries';
import Hero from '@/components/home/Hero';
import About from '@/components/About';
import Blog from '@/components/Blog';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/common/Footer';
import Booking from '@/components/Booking';
import content from '@/data/content.json';
import { AboutSection, BlogSection, TestimonialsSection, FooterSection, BookingSection } from '@/types';
import { useUserStore, UserRole } from '@/store/userStore';
import { useState, useEffect } from 'react';
import authService from '@/services/auth.service';
import AttendantBookingList from '@/components/booking/AttendantBookingList';
import AttendantBookingForm from '@/components/booking/AttendantBookingForm';

interface Content {
  about: AboutSection;
  blog: BlogSection;
  testimonials: TestimonialsSection;
  footer: FooterSection;
  bookingSection: BookingSection;
}

export default function Home() {
  const { user, token, setUser, setToken, logout } = useUserStore();
  const [permissions, setPermissions] = useState({
    canViewHero: true,
    canViewAbout: true,
    canViewBlog: true,
    canViewTestimonials: true,
    canViewFooter: true,
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('slots');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchPlate, setSearchPlate] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await authService.verifyToken(token);
          if (response.user) {
            const userRole: UserRole = {...response.user.role};
            
            setUser({
              id: response.user.id,
              documentId: response.user.documentId,
              username: response.user.email || '',
              email: response.user.email || '',
              role: userRole,
              firstName: response.user.firstName || '',
              lastName: response.user.lastName || '',
              phoneNumber: response.user.phoneNumber || '',
              avatar: ''
            });
            setToken(response.jwt);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
    };

    verifyToken();
  }, [token, setUser, setToken, logout]);

  useEffect(() => {
    // Set location ID when user is loaded
    if (user?.role?.name === 'Attendant') {
      // Assuming the first location is the attendant's location
      setLocationId(content.bookingSection.locations[0].id);
    }
  }, [user]);

  const { data: blogsData, loading: blogsLoading, error: blogsError } = useQuery(GET_BLOGS);
  const { data: testimonialsData, loading: testimonialsLoading, error: testimonialsError } = useQuery(GET_TESTIMONIALS);

  if (blogsLoading || testimonialsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (blogsError) {
    console.error('Error fetching blogs data:', blogsError);
  }
  if (testimonialsError) {
    console.error('Error fetching testimonials data:', testimonialsError);
  }

  const blogs = blogsData?.blogs?.map((blog: any) => ({
    ...blog,
    image: blog.image || {
      url: '/images/default-blog.jpg',
      alternativeText: 'Default blog image'
    }
  })) || [];
  const testimonials = testimonialsData?.testimonials || [];

  // Render attendant view if user is an attendant
  if (user?.role?.name === 'Attendant') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            {/* Profile Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-2xl font-semibold text-white shadow-md">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    Attendant
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                  activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                  activeTab === 'slots' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('slots')}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Slots
              </button>
              <button
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                  activeTab === 'bookings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('bookings')}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Bookings
              </button>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Location:</span>
                <span className="font-medium text-gray-900">Bole Medhanialem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pl-64">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {activeTab === 'dashboard' && 'Dashboard'}
                    {activeTab === 'slots' && 'Slot Management'}
                    {activeTab === 'bookings' && 'Booking Management'}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === 'dashboard' && 'Overview of your location'}
                    {activeTab === 'slots' && 'Manage parking slots'}
                    {activeTab === 'bookings' && 'View and manage bookings'}
                  </p>
                </div>
                {activeTab !== 'dashboard' && (
                  <button 
                    onClick={() => setShowBookingForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                  >
                    Create New Booking
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {activeTab === 'dashboard' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Cards */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Slots</p>
                          <p className="text-2xl font-semibold text-blue-900 mt-1">
                            {content.bookingSection.locations[0].slots.length}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Available Slots</p>
                          <p className="text-2xl font-semibold text-green-900 mt-1">
                            {content.bookingSection.locations[0].slots.filter(slot => slot.status === 'available').length}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-600">Occupied Slots</p>
                          <p className="text-2xl font-semibold text-yellow-900 mt-1">
                            {content.bookingSection.locations[0].slots.filter(slot => slot.status === 'occupied').length}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'slots' && (
                <div className="p-6">
                  <div className="h-[600px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {content.bookingSection.locations[0].slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-5 border border-gray-200 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                            selectedSlotId === slot.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{slot.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">Type: {slot.type}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              slot.status === 'available' ? 'bg-green-50 text-green-700 border border-green-100' :
                              slot.status === 'occupied' ? 'bg-red-50 text-red-700 border border-red-100' :
                              slot.status === 'reserved' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                              'bg-gray-50 text-gray-700 border border-gray-100'
                            }`}>
                              {slot.status}
                            </span>
                          </div>
                          {selectedSlotId === slot.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex justify-end space-x-3">
                                <button className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-100">
                                  View Details
                                </button>
                                {slot.status !== 'occupied' && (
                                  <button className="px-4 py-2 text-sm font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-100">
                                    Book Now
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="p-6">
                  {showBookingForm ? (
                    <div className="mb-8">
                      <AttendantBookingForm
                        locationId={locationId || ''}
                        slotId={selectedSlotId || ''}
                        onSuccess={() => {
                          setShowBookingForm(false);
                          setSelectedSlotId(null);
                        }}
                        onCancel={() => {
                          setShowBookingForm(false);
                          setSelectedSlotId(null);
                        }}
                      />
                    </div>
                  ) : (
                    locationId && (
                      <div>
                        <div className="mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <input
                                type="text"
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                placeholder="Search by phone number..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm"
                              />
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={searchPlate}
                                onChange={(e) => setSearchPlate(e.target.value)}
                                placeholder="Search by plate number..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                        <AttendantBookingList 
                          locationId={locationId} 
                          filters={{
                            phoneNumber: searchPhone,
                            plateNumber: searchPlate
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render regular home page for non-attendants
  return (
    <main className="min-h-screen">
      {permissions.canViewHero && <Hero />}
      <Booking data={content.bookingSection} />
      {permissions.canViewAbout && <About data={content.about} />}
      {permissions.canViewBlog && blogs.length > 0 && <Blog data={{ title: "Latest Updates", posts: blogs }} />}
      {permissions.canViewTestimonials && testimonials.length > 0 && <Testimonials data={{ title: "What Our Users Say", items: testimonials }} />}
      {permissions.canViewFooter && <Footer data={content.footer} />}
    </main>
  );
}
