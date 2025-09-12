import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_HERO } from '../../graphql/queries';
import { useUserStore } from '@/store/userStore';
import AuthModal from '../auth/AuthModal';
import { ProfileDrawer } from '../profile/profile-drawer';
import Image from 'next/image';

const Hero = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const { loading, error, data } = useQuery(GET_HERO);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleBookNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) {
      console.log('Opening auth modal...');//debug line
      setIsAuthModalOpen(true);
      return;
    }
    // Scroll to booking form
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error.message}</div>;

  const hero = data?.hero;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${STRAPI_URL}${imageUrl}`;
  };

  return (
    <section className="relative min-h-[105vh] lg:h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
      {/* Auth Buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-4">
        {!user ? (
          <>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-full font-semibold transition border-2 border-white hover:bg-white hover:text-blue-600 text-sm sm:text-base"
            >
              Login
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-full font-semibold transition bg-white text-blue-600 hover:bg-opacity-90 text-sm sm:text-base"
            >
              Sign Up
            </button>
          </>
        ) : (
          <ProfileDrawer />
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row items-center justify-start gap-8 pt-2 pb-8 lg:pt-4 lg:pb-16">
           <div className="lg:w-1/2 text-center lg:text-left relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              {hero?.title || 'Welcome to Our Parking Service'}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 max-w-2xl mx-auto lg:mx-0">
              {hero?.description || 'Find and book parking spaces easily with our convenient service. Reserve your spot in advance and enjoy hassle-free parking.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
              <button
                onClick={handleBookNow}
                className="px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold transition text-center bg-white text-blue-600 hover:bg-opacity-90 text-sm sm:text-base relative z-10 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                {user ? 'Book Now' : 'Login to Book'}
              </button>
            </div>
          </div>
          
          <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px]">
            {hero?.image?.url ? (
              <Image
                src={getImageUrl(hero.image.url) || ''}
                alt={hero.image.alternativeText || ''}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <Image
                src="/images/parking-illustration.svg"
                alt="Parking illustration"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </section>
  );
};

export default Hero;