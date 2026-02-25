'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, MapPin, Video, X } from 'lucide-react';
import { propertyAPI, Property } from '@/lib/api';
import { Colors, getImageUrl } from '@/lib/constants';
import Navbar from '@/components/Navbar';

const PROPERTY_TYPES = ['Apartment/Flat', 'Independent House/Villa', 'Penthouse', 'PG/Hostel', 'Office Space', 'Shop/Showroom', 'Plot/Land', 'Warehouse', 'Farm House'];
const BHK_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK+', 'Studio', 'Room'];
const FURNISHING = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

export default function ExplorePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<any>({});

  const activeFilters = {
    ...filters,
    ...(search ? { search } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['explore-properties', activeFilters],
    queryFn: () => propertyAPI.getProperties(activeFilters, 1, 20),
  });

  const properties = data?.properties || [];
  const hasActiveFilters = Object.values(filters).some(Boolean) || !!search;

  const applyFilter = (key: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
    return `₹${price}`;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ backgroundColor: Colors.background }}>
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold mb-1" style={{ color: Colors.textPrimary }}>Explore</h1>
          <p className="text-sm" style={{ color: Colors.textSecondary }}>
            {data?.totalResults ? `${data.totalResults} properties` : 'Find your perfect space'}
          </p>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border" style={{
            backgroundColor: Colors.card,
            borderColor: Colors.border
          }}>
            <Search size={18} color={Colors.textSecondary} />
            <input
              type="text"
              placeholder="Search society, area, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: Colors.textPrimary }}
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={16} color={Colors.textSecondary} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-12 h-12 rounded-xl border flex items-center justify-center"
            style={{
              backgroundColor: hasActiveFilters ? Colors.gold : Colors.card,
              borderColor: hasActiveFilters ? Colors.gold : Colors.border
            }}
          >
            <SlidersHorizontal size={18} color={hasActiveFilters ? '#000' : Colors.textPrimary} />
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilters((prev: any) => ({ ...prev, status: undefined }))}
            className="px-4 py-2 rounded-full whitespace-nowrap border"
            style={{
              backgroundColor: !filters.status ? Colors.goldMuted : Colors.card,
              borderColor: !filters.status ? Colors.gold : Colors.border,
              color: !filters.status ? Colors.gold : Colors.textSecondary
            }}
          >
            <span className="text-sm font-semibold">All</span>
          </button>
          <button
            onClick={() => applyFilter('status', 'Rent')}
            className="px-4 py-2 rounded-full whitespace-nowrap border"
            style={{
              backgroundColor: filters.status === 'Rent' ? Colors.goldMuted : Colors.card,
              borderColor: filters.status === 'Rent' ? Colors.gold : Colors.border,
              color: filters.status === 'Rent' ? Colors.gold : Colors.textSecondary
            }}
          >
            <span className="text-sm font-semibold">For Rent</span>
          </button>
          <button
            onClick={() => applyFilter('status', 'Sell')}
            className="px-4 py-2 rounded-full whitespace-nowrap border"
            style={{
              backgroundColor: filters.status === 'Sell' ? Colors.goldMuted : Colors.card,
              borderColor: filters.status === 'Sell' ? Colors.gold : Colors.border,
              color: filters.status === 'Sell' ? Colors.gold : Colors.textSecondary
            }}
          >
            <span className="text-sm font-semibold">For Sale</span>
          </button>
        </div>

        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl p-6 max-h-[80vh] overflow-y-auto" style={{ backgroundColor: Colors.surface }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: Colors.textPrimary }}>Filters</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X size={24} color={Colors.textPrimary} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold mb-3 tracking-wider" style={{ color: Colors.textSecondary }}>PROPERTY TYPE</h3>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => applyFilter('type', type)}
                        className="px-4 py-2 rounded-xl border text-sm font-medium"
                        style={{
                          backgroundColor: filters.type === type ? Colors.goldMuted : Colors.card,
                          borderColor: filters.type === type ? Colors.gold : Colors.border,
                          color: filters.type === type ? Colors.gold : Colors.textSecondary
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-3 tracking-wider" style={{ color: Colors.textSecondary }}>BHK TYPE</h3>
                  <div className="flex flex-wrap gap-2">
                    {BHK_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => applyFilter('bhkType', type)}
                        className="px-4 py-2 rounded-xl border text-sm font-medium"
                        style={{
                          backgroundColor: filters.bhkType === type ? Colors.goldMuted : Colors.card,
                          borderColor: filters.bhkType === type ? Colors.gold : Colors.border,
                          color: filters.bhkType === type ? Colors.gold : Colors.textSecondary
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-3 tracking-wider" style={{ color: Colors.textSecondary }}>FURNISHING</h3>
                  <div className="flex flex-wrap gap-2">
                    {FURNISHING.map(type => (
                      <button
                        key={type}
                        onClick={() => applyFilter('furnishingStatus', type)}
                        className="px-4 py-2 rounded-xl border text-sm font-medium"
                        style={{
                          backgroundColor: filters.furnishingStatus === type ? Colors.goldMuted : Colors.card,
                          borderColor: filters.furnishingStatus === type ? Colors.gold : Colors.border,
                          color: filters.furnishingStatus === type ? Colors.gold : Colors.textSecondary
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={clearFilters}
                  className="flex-1 h-12 rounded-xl border font-semibold"
                  style={{ backgroundColor: Colors.card, borderColor: Colors.border, color: Colors.textSecondary }}
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-[2] h-12 rounded-xl font-bold"
                  style={{ background: `linear-gradient(to right, ${Colors.gold}, ${Colors.goldDark})`, color: '#000' }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: Colors.gold }}></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <MapPin size={64} color={Colors.border} className="mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2" style={{ color: Colors.textPrimary }}>No Properties Found</p>
            <p className="text-sm mb-6" style={{ color: Colors.textSecondary }}>Try adjusting your filters or search query</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: Colors.goldMuted, color: Colors.gold }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {properties.map((property: Property) => (
              <button
                key={property._id}
                onClick={() => router.push(`/property/${property._id}`)}
                className="rounded-2xl overflow-hidden border hover:scale-105 transition-all"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
              >
                <div className="relative h-40">
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
                  {property.isFeatured && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md" style={{ backgroundColor: Colors.gold }}>
                      <span className="text-[8px] font-extrabold text-black">FEATURED</span>
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
                  <div className="flex items-center gap-1">
                    <MapPin size={10} color={Colors.textSecondary} />
                    <p className="text-xs truncate" style={{ color: Colors.textSecondary }}>
                      {property.area}, {property.city}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
