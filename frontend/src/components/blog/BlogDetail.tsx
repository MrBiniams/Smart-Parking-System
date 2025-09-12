'use client';

import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useQuery } from '@apollo/client';
import { GET_BLOG_BY_SLUG } from '@/lib/graphql/queries/blog';
import client from '@/lib/apollo-client';

interface BlogDetailProps {
  slug: string;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ slug }) => {
  const { loading, error, data } = useQuery(GET_BLOG_BY_SLUG, {
    variables: { slug },
    client,
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Title skeleton */}
          <div className="h-12 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
          
          {/* Metadata skeleton */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>

          {/* Image skeleton */}
          <div className="w-full h-96 bg-gray-200 rounded-lg mb-8"></div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-red-500">Error loading blog post</div>
      </div>
    );
  }

  const blog = data?.blogs[0];
  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-gray-500">Blog post not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        <div className="flex items-center text-gray-600 mb-4">
          <span className="mr-4">
            {format(new Date(blog.publishedAt), 'MMMM d, yyyy')}
          </span>
          {blog.author && (
            <span className="flex items-center">
              <span className="mr-2">By</span>
              <span className="font-medium">{blog.author}</span>
            </span>
          )}
        </div>
      </div>

      {blog.image?.data?.attributes && (
        <div className="relative w-full h-96 mb-8">
          <Image
            src={blog.image.data.attributes.url}
            alt={blog.image.data.attributes.alternativeText || blog.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </div>

      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail; 