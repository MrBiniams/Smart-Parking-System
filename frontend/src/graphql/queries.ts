import { gql } from '@apollo/client';

export const GET_HERO = gql`
  query GetHero {
    hero {
      title
      description
      buttons
      image {
        url
        alternativeText
      }
    }
  }
`;

export const GET_BLOGS = gql`
  query GetBlogs {
    blogs {
      title
      description
      content
      slug
      createdAt
      image {
        url
        alternativeText
      }
    }
  }
`;

export const GET_TESTIMONIALS = gql`
  query GetTestimonials {
    testimonials {
      name
      role
      content
      avatar {
        url
        alternativeText
      }
    }
  }
`; 