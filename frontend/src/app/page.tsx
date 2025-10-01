'use client';

import { useQuery } from '@apollo/client';
import { GET_BLOGS, GET_TESTIMONIALS } from '@/graphql/queries';
import Hero from '@/components/home/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Blog from '@/components/Blog';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/common/Footer';
import Booking from '@/components/Booking';
import content from '@/data/content.json' assert { type: 'json' };
import { AboutSection, BlogSection, TestimonialsSection, FooterSection, BookingSection, ServicesSection } from '@/types';
import { useUserStore, UserRole } from '@/store/userStore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';

interface Content {
  about: AboutSection;
  blog: BlogSection;
  testimonials: TestimonialsSection;
  bookingSection: BookingSection;
  services: ServicesSection;
}

export default function Home() {
  const router = useRouter();
  const { user, token, isActiveSession, isTokenValid, logout } = useUserStore();
  const [permissions, setPermissions] = useState({
    canViewHero: true,
    canViewAbout: true,
    canViewBlog: true,
    canViewTestimonials: true,
    canViewFooter: true,
  });

  // isActiveSession is automatically reset to false on page reload via store onRehydrateStorage

  useEffect(() => {
    // Check if token is expired and clear if needed
    if (token && !isTokenValid()) {
      logout();
      return;
    }

    // FOR FRESH VISITS: Clear attendant data if no active session
    // This ensures attendants don't persist across browser sessions
    if (user?.role?.name === 'Attendant' && token && !isActiveSession) {
      logout();
      return;
    }

    // ONLY redirect attendants if they have an ACTIVE session (just logged in)
    if (user?.role?.name === 'Attendant' && token && isActiveSession) {
      router.push('/attendant/management');
      return;
    }

    // If somehow an attendant user is stored without token, clear it
    if (user?.role?.name === 'Attendant' && !token) {
      logout();
    }
  }, [user, token, isActiveSession, router, isTokenValid, logout]);

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

  // Render regular home page for all users (attendants are redirected above)
  return (
    <main className="min-h-screen">
      {permissions.canViewHero && <Hero />}
      <Booking data={content.bookingSection} />
      {permissions.canViewAbout && <About data={content.about} />}
      <Services data={content.services as ServicesSection} />
      {permissions.canViewBlog && blogs.length > 0 && <Blog data={{ title: "Latest Updates", posts: blogs }} />}
      {permissions.canViewTestimonials && testimonials.length > 0 && <Testimonials data={{ title: "What Our Users Say", items: testimonials }} />}
      <Contact />
      {permissions.canViewFooter && <Footer data={content.footer} />}
    </main>
  );
}
