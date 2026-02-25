'use client';

import { useRouter } from 'next/navigation';
import { Crown, Star, Heart, LayoutDashboard, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/lib/constants';
import Navbar from '@/components/Navbar';

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: Colors.background }}>
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: Colors.textPrimary }}>
            Services
          </h1>
          <p className="text-sm" style={{ color: Colors.textSecondary }}>
            Explore our premium property services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.role === 'owner' ? (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                className="p-6 rounded-2xl border hover:scale-105 transition-all"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{
                  backgroundColor: Colors.goldMuted
                }}>
                  <LayoutDashboard size={28} color={Colors.gold} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: Colors.textPrimary }}>
                  Dashboard
                </h3>
                <p className="text-sm" style={{ color: Colors.textSecondary }}>
                  View your property stats and performance
                </p>
              </button>

              <button
                onClick={() => router.push('/post-property')}
                className="p-6 rounded-2xl border hover:scale-105 transition-all"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{
                  backgroundColor: Colors.tealMuted
                }}>
                  <Crown size={28} color={Colors.teal} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: Colors.textPrimary }}>
                  Post Property
                </h3>
                <p className="text-sm" style={{ color: Colors.textSecondary }}>
                  List your premium properties
                </p>
              </button>

              <button
                className="p-6 rounded-2xl border hover:scale-105 transition-all"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{
                  backgroundColor: Colors.blueMuted
                }}>
                  <TrendingUp size={28} color={Colors.blue} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: Colors.textPrimary }}>
                  Lead Management
                </h3>
                <p className="text-sm" style={{ color: Colors.textSecondary }}>
                  Manage your property leads
                </p>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/saved')}
                className="p-6 rounded-2xl border hover:scale-105 transition-all"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{
                  backgroundColor: Colors.redMuted
                }}>
                  <Heart size={28} color={Colors.red} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: Colors.textPrimary }}>
                  Saved Properties
                </h3>
                <p className="text-sm" style={{ color: Colors.textSecondary }}>
                  View your favorite properties
                </p>
              </button>

              <button
                className="p-6 rounded-2xl border hover:scale-105 transition-all"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{
                  backgroundColor: Colors.goldMuted
                }}>
                  <Star size={28} color={Colors.gold} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: Colors.textPrimary }}>
                  Property Alerts
                </h3>
                <p className="text-sm" style={{ color: Colors.textSecondary }}>
                  Get notified about new properties
                </p>
              </button>

              <button
                className="p-6 rounded-2xl border hover:scale-105 transition-all"
                style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{
                  backgroundColor: Colors.tealMuted
                }}>
                  <Shield size={28} color={Colors.teal} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: Colors.textPrimary }}>
                  Verified Properties
                </h3>
                <p className="text-sm" style={{ color: Colors.textSecondary }}>
                  Browse verified listings only
                </p>
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
