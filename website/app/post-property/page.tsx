'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, MapPin, X, Video as VideoIcon, Check } from 'lucide-react';
import { propertyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/lib/constants';

const BHK_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK+', 'Studio', 'Room'];
const FURNISHING = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const AMENITIES = [
  'Parking', 'Lift', 'Security', 'Power Backup', 'Water 24x7',
  'Garden', 'Gym', 'Swimming Pool', 'CCTV', 'Fire Safety',
];

export default function PostPropertyPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('Premium Property');
  const [status, setStatus] = useState<'Rent' | 'Sell'>('Rent');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [area, setArea] = useState('');
  const [bhkType, setBhkType] = useState('2BHK');
  const [furnishing, setFurnishing] = useState('Unfurnished');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files.slice(0, 5 - images.length)]);
    setError('');
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration > 15) {
          alert(`⚠️ Video Too Long\n\nYour video is ${Math.round(videoElement.duration)} seconds.\n\nMaximum allowed: 15 seconds.\n\nWe'll use the first 15 seconds automatically.`);
        }
        setVideo(file);
      };
      videoElement.src = URL.createObjectURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Valid price is required');
      return;
    }
    if (!address.trim()) {
      setError('Address is required');
      return;
    }
    if (images.length === 0) {
      setError('At least one image is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', 'Apartment/Flat');
      formData.append('status', status);
      formData.append('price', price);
      formData.append('address', address);
      formData.append('city', city);
      formData.append('area', area);
      formData.append('description', description);
      formData.append('bhkType', bhkType);
      formData.append('furnishingStatus', furnishing);
      formData.append('amenities', JSON.stringify(selectedAmenities));
      formData.append('isDirectOwner', 'true');

      images.forEach((file) => {
        formData.append('images', file);
      });

      if (video) {
        formData.append('video', video);
      }

      await propertyAPI.createProperty(token!, formData);
      alert('Property posted successfully!');
      router.push('/home');
    } catch (e: any) {
      setError(e.response?.data?.msg || 'Failed to post property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: Colors.background }}>
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: Colors.surface, borderColor: Colors.border }}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl border"
              style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
            >
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: Colors.textPrimary }}>Post Property</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: Colors.redMuted, borderLeft: `3px solid ${Colors.red}` }}>
            <p className="text-sm" style={{ color: Colors.red }}>{error}</p>
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: Colors.textPrimary }}>Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter property title"
                className="w-full p-4 rounded-xl border outline-none"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border, color: Colors.textPrimary }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>Status *</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setStatus('Rent')}
                  className="flex-1 p-4 rounded-xl border font-semibold"
                  style={{
                    backgroundColor: status === 'Rent' ? Colors.goldMuted : Colors.card,
                    borderColor: status === 'Rent' ? Colors.gold : Colors.border,
                    color: status === 'Rent' ? Colors.gold : Colors.textSecondary
                  }}
                >
                  For Rent
                </button>
                <button
                  onClick={() => setStatus('Sell')}
                  className="flex-1 p-4 rounded-xl border font-semibold"
                  style={{
                    backgroundColor: status === 'Sell' ? Colors.goldMuted : Colors.card,
                    borderColor: status === 'Sell' ? Colors.gold : Colors.border,
                    color: status === 'Sell' ? Colors.gold : Colors.textSecondary
                  }}
                >
                  For Sale
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>Price (₹) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className="w-full p-4 rounded-xl border outline-none"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border, color: Colors.textPrimary }}
              />
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: Colors.textPrimary }}>Location Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>Address *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                className="w-full p-4 rounded-xl border outline-none resize-none"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border, color: Colors.textPrimary }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full p-4 rounded-xl border outline-none"
                  style={{ backgroundColor: Colors.card, borderColor: Colors.border, color: Colors.textPrimary }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Enter area/locality"
                  className="w-full p-4 rounded-xl border outline-none"
                  style={{ backgroundColor: Colors.card, borderColor: Colors.border, color: Colors.textPrimary }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: Colors.textPrimary }}>Property Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>BHK Type</label>
              <div className="flex flex-wrap gap-2">
                {BHK_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setBhkType(type)}
                    className="px-4 py-2 rounded-xl border font-semibold"
                    style={{
                      backgroundColor: bhkType === type ? Colors.goldMuted : Colors.card,
                      borderColor: bhkType === type ? Colors.gold : Colors.border,
                      color: bhkType === type ? Colors.gold : Colors.textSecondary
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>Furnishing Status</label>
              <div className="flex gap-3">
                {FURNISHING.map(f => (
                  <button
                    key={f}
                    onClick={() => setFurnishing(f)}
                    className="flex-1 p-4 rounded-xl border font-semibold"
                    style={{
                      backgroundColor: furnishing === f ? Colors.goldMuted : Colors.card,
                      borderColor: furnishing === f ? Colors.gold : Colors.border,
                      color: furnishing === f ? Colors.gold : Colors.textSecondary
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your property..."
                rows={5}
                className="w-full p-4 rounded-xl border outline-none resize-none"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border, color: Colors.textPrimary }}
              />
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: Colors.textPrimary }}>Media</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>Images * (1-5 required)</label>
              <div className="flex flex-wrap gap-3">
                {images.map((file, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    >
                      <X size={16} color="#fff" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
                  >
                    <Camera size={24} color={Colors.gold} />
                    <span className="text-xs mt-1" style={{ color: Colors.textSecondary }}>Add Photo</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: Colors.textSecondary }}>Video (optional)</label>
              <p className="text-xs mb-3" style={{ color: Colors.orange }}>⚠️ Maximum: 15 seconds. Longer videos will be trimmed automatically.</p>
              {video ? (
                <div className="p-4 rounded-xl border flex items-center gap-3" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
                  <VideoIcon size={40} color={Colors.gold} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: Colors.textPrimary }}>Video selected (max 15 sec)</p>
                    <p className="text-xs" style={{ color: Colors.textSecondary }}>{video.name}</p>
                  </div>
                  <button onClick={() => setVideo(null)} className="text-sm font-bold" style={{ color: Colors.red }}>Remove</button>
                </div>
              ) : (
                <label className="p-4 rounded-xl border flex items-center justify-center gap-2 cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
                >
                  <VideoIcon size={20} color={Colors.gold} />
                  <span className="text-sm font-semibold" style={{ color: Colors.gold }}>Upload Video (15 sec max)</span>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: Colors.textPrimary }}>Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(amenity => (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className="px-4 py-2 rounded-xl border flex items-center gap-2 font-semibold"
                style={{
                  backgroundColor: selectedAmenities.includes(amenity) ? Colors.goldMuted : Colors.card,
                  borderColor: selectedAmenities.includes(amenity) ? Colors.gold : Colors.border,
                  color: selectedAmenities.includes(amenity) ? Colors.gold : Colors.textSecondary
                }}
              >
                {selectedAmenities.includes(amenity) && <Check size={14} color={Colors.gold} />}
                {amenity}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 rounded-xl font-bold text-base transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, ${Colors.gold}, ${Colors.goldDark})`,
            color: '#000'
          }}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black mx-auto"></div>
          ) : (
            'Post Property'
          )}
        </button>
      </main>
    </div>
  );
}
