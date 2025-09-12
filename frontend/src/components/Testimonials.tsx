import Image from 'next/image';
import { TestimonialsSection } from '@/types';

interface TestimonialsProps {
  data: TestimonialsSection;
}

export default function Testimonials({ data }: TestimonialsProps) {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    // If the URL already starts with http, return it as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Otherwise, prepend the Strapi URL
    return `${STRAPI_URL}${imageUrl}`;
  };

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{data.title}</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {data.items.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 sm:p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 mr-4">
                  {testimonial.avatar?.url ? (
                    <Image
                      src={getImageUrl(testimonial.avatar.url) || ''}
                      alt={testimonial.avatar.alternativeText || testimonial.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 