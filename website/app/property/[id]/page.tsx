'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, Heart, Share2, MapPin, Bed, Sofa, BadgeCheck,
  Phone, MessageCircle, Video, Shield, Droplets, Volume2, Star,
  Play, Pause
} from 'lucide-react';
import { propertyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, getImageUrl } from '@/lib/constants';

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', params.id],
    queryFn: () => propertyAPI.getPropertyById(params.id as string),
    enabled: !!params.id,
  });

  useEffect(() => {
    if (property && user) {
      setIsLiked(property.likes?.includes(user._id) || false);
    }
    if (property && token) {
      propertyAPI.trackView(token, property._id).catch(() => {});
    }
  }, [property, user, token]);

  const handleLike = async () => {
    if (!token || !property) return;
    setIsLiked(!isLiked);
    try {
      await propertyAPI.likeProperty(token, property._id);
    } catch (e) {
      setIsLiked(isLiked);
    }
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
    return `₹${price}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: Colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: Colors.gold }}></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: Colors.background }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-4" style={{ color: Colors.textPrimary }}>Property not found</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl font-bold"
            style={{ backgroundColor: Colors.gold, color: '#000' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const images = property.images.length > 0
    ? property.images.map(getImageUrl)
    : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=800&auto=format&fit=crop'];

  const avgSafety = property.reviews.length > 0
    ? property.reviews.reduce((sum: number, r: any) => sum + r.safetyRating, 0) / property.reviews.length
    : 4.5;
  const avgWater = property.reviews.length > 0
    ? property.reviews.reduce((sum: number, r: any) => sum + r.waterRating, 0) / property.reviews.length
    : 4.0;
  const avgTraffic = property.reviews.length > 0
    ? property.reviews.reduce((sum: number, r: any) => sum + r.trafficRating, 0) / property.reviews.length
    : 3.0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <div className="relative h-[400px] md:h-[500px]">
        <div className="relative h-full overflow-hidden">
          {images.map((uri: string, i: number) => (
            <img
              key={i}
              src={uri}
              alt={property.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                i === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent, rgba(0,0,0,0.6))'
          }}></div>
        </div>

        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          >
            <ChevronLeft size={22} color={Colors.white} />
          </button>
          <div className="flex gap-2">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            >
              <Share2 size={18} color={Colors.white} />
            </button>
            <button
              onClick={handleLike}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            >
              <Heart
                size={18}
                color={isLiked ? Colors.red : Colors.white}
                fill={isLiked ? Colors.red : 'transparent'}
              />
            </button>
          </div>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_: string, i: number) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === currentImageIndex ? '20px' : '6px',
                  backgroundColor: i === currentImageIndex ? Colors.white : 'rgba(255,255,255,0.4)'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {property.videoUrl && (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 -mt-10 mb-6 relative z-10">
          <div className="relative h-64 rounded-2xl overflow-hidden border-2" style={{ borderColor: Colors.gold }}>
            <video
              ref={videoRef}
              src={getImageUrl(property.videoUrl)}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={toggleVideoPlayback}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              >
                {isVideoPlaying ? (
                  <Pause size={32} color={Colors.white} fill={Colors.white} />
                ) : (
                  <Play size={32} color={Colors.white} fill={Colors.white} />
                )}
              </button>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <button
                onClick={toggleMute}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              >
                <Volume2 size={20} color={isMuted ? Colors.textSecondary : Colors.white} />
              </button>
              <div className="px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <Video size={12} color={Colors.gold} />
                <span className="text-xs font-bold" style={{ color: Colors.gold }}>Property Video</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: Colors.teal }}>
            <span className="text-[10px] font-extrabold text-white">ZERO BROKERAGE</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg border" style={{
            backgroundColor: property.status === 'Rent' ? Colors.orangeMuted : Colors.tealMuted,
            borderColor: property.status === 'Rent' ? 'rgba(245,158,11,0.3)' : 'rgba(13,148,136,0.3)'
          }}>
            <span className="text-[10px] font-extrabold" style={{
              color: property.status === 'Rent' ? Colors.orange : Colors.teal
            }}>
              FOR {property.status.toUpperCase()}
            </span>
          </div>
          {property.isVerified && (
            <div className="px-3 py-1.5 rounded-lg border flex items-center gap-1" style={{
              backgroundColor: Colors.blueMuted,
              borderColor: 'rgba(59,130,246,0.3)'
            }}>
              <BadgeCheck size={12} color={Colors.blue} />
              <span className="text-[10px] font-extrabold" style={{ color: Colors.blue }}>Verified</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: Colors.gold }}>
          {formatPrice(property.price)}
          {property.status === 'Rent' && <span className="text-base font-normal" style={{ color: Colors.textSecondary }}> /month</span>}
        </h1>

        <h2 className="text-2xl font-bold mb-4" style={{ color: Colors.textPrimary }}>
          {property.title}
        </h2>

        <div className="flex flex-wrap gap-4 mb-6">
          {property.bhkType && (
            <div className="flex items-center gap-2">
              <Bed size={16} color={Colors.gold} />
              <span className="text-sm font-semibold" style={{ color: Colors.textPrimary }}>{property.bhkType}</span>
            </div>
          )}
          {property.furnishingStatus && (
            <div className="flex items-center gap-2">
              <Sofa size={16} color={Colors.gold} />
              <span className="text-sm font-semibold" style={{ color: Colors.textPrimary }}>{property.furnishingStatus}</span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 mb-6">
          <MapPin size={16} color={Colors.textSecondary} className="mt-1" />
          <p className="text-sm" style={{ color: Colors.textSecondary }}>{property.address}</p>
        </div>

        {property.description && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3" style={{ color: Colors.textPrimary }}>Description</h3>
            <p className="text-sm leading-relaxed" style={{ color: Colors.textSecondary }}>{property.description}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3" style={{ color: Colors.textPrimary }}>Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {(property.amenities.length > 0 ? property.amenities : ['Parking', 'Lift', 'WiFi', 'Gym']).map((amenity: string, i: number) => (
              <div key={i} className="px-4 py-2 rounded-xl border" style={{
                backgroundColor: Colors.card,
                borderColor: Colors.border
              }}>
                <span className="text-sm font-medium" style={{ color: Colors.textPrimary }}>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px mb-6" style={{ backgroundColor: Colors.border }}></div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: Colors.textPrimary }}>Society & Area Reviews</h3>
            <button className="text-sm font-bold" style={{ color: Colors.gold }}>Post Review</button>
          </div>
          <ReviewBar label="Safety" rating={avgSafety} color={Colors.green} icon={<Shield size={14} color={Colors.green} />} />
          <ReviewBar label="Water Supply" rating={avgWater} color={Colors.blue} icon={<Droplets size={14} color={Colors.blue} />} />
          <ReviewBar label="Traffic & Noise" rating={avgTraffic} color={Colors.orange} icon={<Volume2 size={14} color={Colors.orange} />} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t p-4" style={{
        backgroundColor: Colors.surface,
        borderColor: Colors.border
      }}>
        <div className="container mx-auto flex items-center gap-4">
          <img
            src={property.owner?.profileImage || `https://i.pravatar.cc/150?u=${property.owner?._id}`}
            alt={property.owner?.name}
            className="w-11 h-11 rounded-full"
          />
          <div className="flex-1">
            <p className="text-xs" style={{ color: Colors.textSecondary }}>Pro Partner</p>
            <p className="text-sm font-bold" style={{ color: Colors.textPrimary }}>{property.owner?.name || 'Owner'}</p>
          </div>
          <div className="flex gap-2">
            <button className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: Colors.goldMuted }}>
              <MessageCircle size={18} color={Colors.gold} />
            </button>
            <button className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: Colors.greenMuted }}>
              <Phone size={18} color={Colors.green} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewBar({ label, rating, color, icon }: { label: string; rating: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium" style={{ color: Colors.textSecondary }}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: Colors.surface }}>
          <div className="h-full rounded-full" style={{ width: `${(rating / 5) * 100}%`, backgroundColor: color }}></div>
        </div>
        <span className="text-sm font-bold w-8 text-right" style={{ color }}>{rating.toFixed(1)}</span>
      </div>
    </div>
  );
}
