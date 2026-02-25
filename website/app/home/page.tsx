'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, MapPin, Video } from 'lucide-react';
import { propertyAPI, Property } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, getImageUrl } from '@/lib/constants';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && user.role === 'none') {
      router.push('/role-selection');
    }
  }, [user, router]);

  const { data: featuredData } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => propertyAPI.getFeatured(),
  });

  const { data: recentData } = useQuery({
    queryKey: ['recent-properties'],
    queryFn: () => propertyAPI.getProperties({}, 1, 10),
  });

  const featuredProperties = featuredData?.properties || [];
  const recentProperties = recentData?.properties || [];

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
    return `₹${price}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-8 border" style={{ borderColor: 'rgba(212,175,55,0.2)' }}>
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6199f3e209?q=80&w=1200&auto=format&fit=crop"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.9))'
          }}></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="inline-block px-3 py-1.5 rounded-lg mb-4" style={{ backgroundColor: Colors.gold }}>
              <span className="text-[10px] font-extrabold tracking-wider text-black">FEATURED LUXURY</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: Colors.white }}>
              The Gold Standard<br />of Architecture
            </h2>
            <p className="text-sm max-w-xl" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Curated collection of the most prestigious properties in the city.
            </p>
          </div>
        </div>

        {user?.role === 'owner' && (
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <button
              onClick={() => router.push('/post-property')}
              className="p-6 rounded-2xl border flex items-start justify-between hover:scale-105 transition-all"
              style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
            >
              <div>
                <Plus size={24} color={Colors.gold} className="mb-3" />
                <p className="text-xs font-bold tracking-wider" style={{ color: Colors.textPrimary }}>
                  POST LUXURY<br />LISTING
                </p>
              </div>
            </button>
            <button
              onClick={() => router.push('/explore')}
              className="p-6 rounded-2xl border flex items-start justify-between hover:scale-105 transition-all"
              style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
            >
              <div>
                <Sparkles size={24} color={Colors.gold} className="mb-3" />
                <p className="text-xs font-bold tracking-wider" style={{ color: Colors.textPrimary }}>
                  PREMIUM<br />STAYS
                </p>
              </div>
            </button>
          </div>
        )}

        {featuredProperties.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-bold" style={{ color: Colors.textPrimary }}>
                Featured Properties
              </h3>
              <button
                onClick={() => router.push('/explore')}
                className="text-sm font-semibold hover:opacity-80"
                style={{ color: Colors.gold }}
              >
                See All
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property: Property) => (
                <button
                  key={property._id}
                  onClick={() => router.push(`/property/${property._id}`)}
                  className="relative h-64 rounded-2xl overflow-hidden border hover:scale-105 transition-all"
                  style={{ borderColor: Colors.border }}
                >
                  <img
                    src={getImageUrl(property.images[0])}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.85))'
                  }}></div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="px-2 py-1 rounded-md flex items-center gap-1" style={{ backgroundColor: Colors.gold }}>
                      <Sparkles size={10} color="#000" />
                      <span className="text-[9px] font-extrabold text-black">FEATURED</span>
                    </div>
                    {property.videoUrl && (
                      <div className="px-2 py-1 rounded-md flex items-center gap-1 border" style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        borderColor: Colors.gold
                      }}>
                        <Video size={10} color={Colors.gold} />
                        <span className="text-[9px] font-extrabold" style={{ color: Colors.gold }}>VIDEO</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xl font-extrabold mb-1" style={{ color: Colors.gold }}>
                      {formatPrice(property.price)}
                    </p>
                    <p className="text-sm font-semibold mb-2" style={{ color: Colors.white }}>
                      {property.title}
                    </p>
                    <div className="flex items-center gap-1">
                      <MapPin size={11} color={Colors.textSecondary} />
                      <p className="text-xs" style={{ color: Colors.textSecondary }}>
                        {property.area}, {property.city}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {recentProperties.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-bold" style={{ color: Colors.textPrimary }}>
                Recent Listings
              </h3>
              <button
                onClick={() => router.push('/explore')}
                className="text-sm font-semibold hover:opacity-80"
                style={{ color: Colors.gold }}
              >
                See All
              </button>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentProperties.map((property: Property) => (
                <button
                  key={property._id}
                  onClick={() => router.push(`/property/${property._id}`)}
                  className="rounded-2xl overflow-hidden border hover:scale-105 transition-all"
                  style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
                >
                  <div className="relative h-32">
                    <img
                      src={getImageUrl(property.images[0])}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    {property.videoUrl && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-md flex items-center gap-1 border" style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        borderColor: Colors.gold
                      }}>
                        <Video size={8} color={Colors.gold} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-base font-bold mb-1" style={{ color: Colors.gold }}>
                      {formatPrice(property.price)}
                    </p>
                    <p className="text-sm font-semibold mb-1 truncate" style={{ color: Colors.textPrimary }}>
                      {property.title}
                    </p>
                    <p className="text-xs truncate" style={{ color: Colors.textSecondary }}>
                      {property.area}, {property.city}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="text-center mt-16">
          <p className="text-[10px] font-semibold tracking-[4px]" style={{ color: 'rgba(212,175,55,0.3)' }}>
            SINCE 2026
          </p>
        </div>
      </main>
    </div>
  );
}
