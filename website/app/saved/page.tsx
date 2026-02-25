'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart } from 'lucide-react';
import { Colors } from '@/lib/constants';
import Navbar from '@/components/Navbar';

export default function SavedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: Colors.goldMuted }}>
            <Heart size={40} color={Colors.gold} />
          </div>
          <p className="text-lg font-semibold mb-2" style={{ color: Colors.textPrimary }}>No saved properties yet</p>
          <p className="text-sm mb-6" style={{ color: Colors.textSecondary }}>
            Start exploring and save your favorite properties
          </p>
          <button
            onClick={() => router.push('/explore')}
            className="px-6 py-3 rounded-xl font-bold"
            style={{ background: `linear-gradient(to right, ${Colors.gold}, ${Colors.goldDark})`, color: '#000' }}
          >
            Explore Properties
          </button>
        </div>
      </main>
    </div>
  );
}
