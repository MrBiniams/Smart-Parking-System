export default {
  config: {
    // Replace the Strapi logo in the auth pages
    auth: {
      logo: '/admin/assets/logo.png',
    },
    // Replace the favicon
    head: {
      favicon: '/admin/assets/favicon.ico',
    },
    // Add a new locale to the interface
    locales: ['en'],
    // Replace the Strapi logo in the main navigation
    menu: {
      logo: '/admin/assets/logo.png',
    },
    // Override or extend the theme
    theme: {
      colors: {
        // Sky blue and white theme
        primary100: '#e0f7ff',     // light sky blue background
        primary200: '#b3e5fc',     // slightly deeper sky blue
        primary500: '#03a9f4',     // vibrant sky blue
        primary600: '#0288d1',     // deep sky blue for strong accents
        primary700: '#01579b',     // navy blue for hover and focus
        danger700: '#d32f2f',      // red for errors and alerts
        neutral0: '#ffffff',       // pure white
        neutral100: '#f9f9f9',     // soft white background
        neutral200: '#e0e0e0',     // for subtle borders
        neutral800: '#333333',     // dark text
      },
      shadows: {
        tableShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
      },
      sizes: {
        input: {
          S: '10px',
          M: '14px',
        },
      },
      borderRadius: '10px',
      button: {
        primary: {
          backgroundColor: '#03a9f4', // vibrant sky blue
          color: '#ffffff',
        },
        secondary: {
          backgroundColor: '#0288d1', // deeper blue
          color: '#ffffff',
        },
      },
    },
    // Disable video tutorials
    tutorials: false,
    // Disable notifications about new Strapi releases
    notifications: { releases: false },
  },
  bootstrap() {},
};
