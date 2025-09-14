import Image from 'next/image';
import Link from 'next/link';
import { BlogSection } from '@/types';

interface BlogProps {
  data: BlogSection;
}

export default function Blog({ data }: BlogProps) {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    // If the URL already starts with http, return it as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Otherwise, prepend the Strapi URL
    return `${STRAPI_URL}${imageUrl}`;
  };

  return (
    <section id="blogs" className="py-16 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{data.title}</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {data.posts.map((post) => (
            <div key={post.slug} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              <div className="relative h-48 sm:h-56">
                {post.image?.url ? (
                  <Image
                    src={getImageUrl(post.image.url) || ''}
                    alt={post.image.alternativeText || post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.description}</p>
                <Link href={`/blog/${post.slug}`} className="text-blue-600 font-semibold hover:text-blue-800">
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 