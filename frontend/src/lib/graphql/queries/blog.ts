import { gql } from '@apollo/client';

export const GET_BLOG_BY_SLUG = gql`
query GetBlogBySlug($slug:String) {
    blogs(filters:{slug:{eq:$slug}}) {
    title
    slug
    updatedAt
    publishedAt
    image {
      url
      previewUrl
      caption
      alternativeText
      name
    }
    documentId
    description
    createdAt
    content
    }
}
`; 