import React from 'react';
import BlogDetail from '@/components/blog/BlogDetail';

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  return (
    <main>
      <BlogDetail slug={params?.slug} />
    </main>
  );
} 