export default async (strapi: any) => {
  try {
  // Create Hero content (Single Type)
    await strapi.entityService.create('api::hero.hero', {
      data: {
        title: 'Smart Parking Solutions',
        description: 'Find and book parking spots in real-time. Save time and eliminate parking hassles.',
        buttons: [
          {
            text: 'Book Now',
            href: '/booking',
            primary: true
          },
          {
            text: 'Learn More',
            href: '/about',
            primary: false
          }
        ],
        publishedAt: new Date()
      }
    });
  } catch (error) {
    console.log("Error creating hero seed data:", error);
  }
  
  try {
    // Create About content (Single Type)
    await strapi.entityService.create('api::about.about', {
      data: {
        title: 'About Us',
        features: [
          {
            icon: '🎯',
            title: 'Our Mission',
            description: 'To revolutionize parking management through smart technology and exceptional service.'
          },
          {
            icon: '👥',
            title: 'Our Team',
            description: 'Dedicated professionals committed to making parking hassle-free for everyone.'
          },
          {
            icon: '💡',
            title: 'Innovation',
            description: 'Leveraging cutting-edge technology to provide seamless parking solutions.'
          }
        ],
        publishedAt: new Date()
      }
    });
  } catch (error) {
    console.log("Error creating about seed data:", error);
  }
  
  try { 
    // Create Footer content (Single Type)
    await strapi.entityService.create('api::footer.footer', {
      data: {
        description: 'Smart parking solutions for a better future.',
        quickLinks: [
          {
            text: 'About Us',
            href: '/about'
          },
          {
            text: 'Services',
            href: '/services'
          },
          {
            text: 'Contact',
            href: '/contact'
          },
          {
            text: 'Blog',
            href: '/blog'
          }
        ],
        publishedAt: new Date()
      }
    });
  } catch (error) {
    console.log("Error creating footer seed data:", error);
  }
  
  try {
    // Create Blog posts
    const blogPosts = [
      {
        title: 'Smart Parking Innovation',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        slug: 'smart-parking-innovation',
        publishedAt: new Date()
      },
      {
        title: 'IoT in Parking Management',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        slug: 'iot-in-parking-management',
        publishedAt: new Date()
      },
      {
        title: 'Future of Urban Parking',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        slug: 'future-of-urban-parking',
        publishedAt: new Date()
      }
    ];
  
    for (const post of blogPosts) {
      await strapi.entityService.create('api::blog.blog', {
        data: post
      });
    }
  } catch (error) {
    console.log("Error creating blog posts seed data:", error);
  }
  
  try {
    // Create Testimonials
    const testimonials = [
      {
        name: 'John Doe',
        role: 'Regular User',
        content: "The best parking solution I've ever used. It saves me so much time!",
        publishedAt: new Date()
      },
      {
        name: 'Jane Smith',
        role: 'Business Owner',
        content: 'This platform has transformed how we manage parking at our facility.',
        publishedAt: new Date()
      },
      {
        name: 'Mike Johnson',
        role: 'Property Manager',
        content: 'Excellent service and very user-friendly interface. Highly recommended!',
        publishedAt: new Date()
      }
    ];
  
    for (const testimonial of testimonials) {
      await strapi.entityService.create('api::testimonial.testimonial', {
        data: testimonial
      });
    }
  } catch (error) {
    console.log("Error creating testimonials seed data:", error);
  }
  
  try {
    // Create Locations with their Slots
    const locations = [
      {
        name: 'Downtown Mall',
        address: '123 Main Street, City Center',
        totalSlots: 100,
        availableSlots: 50,
        pricePerHour: 5,
        openingHours: [
          {
              day: 'monday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'tuesday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'wednesday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'thursday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
          },
          {
              day: 'friday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'saturday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'sunday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          }
        ],
        coordinates: {
          lat: 37.7749,
          lng: -122.4194
        },
        publishedAt: new Date()
      },
      {
        name: 'Airport Terminal',
        address: '456 Airport Road, Airport Area',
        totalSlots: 200,
        availableSlots: 75,
        pricePerHour: 8,
        openingHours: [
          {
              day: 'monday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'tuesday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'wednesday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'thursday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
          },
          {
              day: 'friday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'saturday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'sunday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          }
        ],
        coordinates: {
          lat: 37.7749,
          lng: -122.4194
        },
        publishedAt: new Date()
      },
      {
        name: 'Shopping Complex',
        address: '789 Retail Avenue, Shopping District',
        totalSlots: 150,
        availableSlots: 60,
        pricePerHour: 6,
        openingHours: [
          {
              day: 'monday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'tuesday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'wednesday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'thursday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
          },
          {
              day: 'friday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'saturday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          },
          {
              day: 'sunday',
              openTime: '08:00:00',
              closeTime: '18:00:00',
              isClosed: false
          }
        ],
        coordinates: {
          lat: 37.7749,
          lng: -122.4194
        },
        publishedAt: new Date()
      }
    ];
  
    for (const location of locations) {
      // Create the location first
      const createdLocation = await strapi.entityService.create('api::location.location', {
        data: location
      });
    
        try {

          // Create slots for this location
          const slots = [];
          for (let i = 1; i <= location.totalSlots; i++) {
            slots.push({
              name: `Slot ${i}`,
              number: i,
              isAvailable: i <= location.availableSlots,
              location: createdLocation.id,
              type: 'standard',
              coordinates: {
                  lat: 37.7749,
                  lng: -122.4194
              },
              publishedAt: new Date()
            });
          }

          // Create all slots for this location
          for (const slot of slots) {
            await strapi.entityService.create('api::slot.slot', {
              data: slot
            });
          }
      } catch (error) {
        console.log("Error creating slots seed data:", error);
      }
    }
  } catch (error) {
    console.log("Error creating locations seed data:", error);
  }

  console.log('Seed data created successfully!');
}; 