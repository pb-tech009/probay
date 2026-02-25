'use client';

import { useRouter } from 'next/navigation';
import { User, Phone, Crown, Star, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/lib/constants';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-2xl pb-24 md:pb-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center" style={{
            background: `linear-gradient(135deg, ${Colors.gold}, ${Colors.goldLight})`
          }}>
            <User size={48} color="#000" />
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: Colors.textPrimary }}>
            {user.name || 'User'}
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Phone size={14} color={Colors.textSecondary} />
            <p className="text-sm" style={{ color: Colors.textSecondary }}>
              +91 {user.phoneNumber}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl" style={{
            backgroundColor: user.role === 'owner' ? Colors.goldMuted : Colors.blueMuted
          }}>
            {user.role === 'owner' ? (
              <>
                <Crown size={16} color={Colors.gold} />
                <span className="text-sm font-bold" style={{ color: Colors.gold }}>Pro Partner</span>
              </>
            ) : (
              <>
                <Star size={16} color={Colors.blue} />
                <span className="text-sm font-bold" style={{ color: Colors.blue }}>Elite Member</span>
              </>
            )}
          </div>
        </div>

        {user.role === 'owner' && user.trustScore !== undefined && (
          <div className="p-6 rounded-2xl border mb-6" style={{
            backgroundColor: Colors.card,
            borderColor: Colors.border
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: Colors.textSecondary }}>Trust Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold" style={{ color: Colors.gold }}>
                    {user.trustScore}
                  </span>
                  <span className="text-lg" style={{ color: Colors.textSecondary }}>/100</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                backgroundColor: Colors.goldMuted
              }}>
                <Star size={32} color={Colors.gold} fill={Colors.gold} />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {user.role === 'owner' && (
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full p-4 rounded-xl border flex items-center justify-between hover:opacity-80 transition-all"
              style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: Colors.goldMuted
                }}>
                  <Crown size={20} color={Colors.gold} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold" style={{ color: Colors.textPrimary }}>Dashboard</p>
                  <p className="text-xs" style={{ color: Colors.textSecondary }}>View your stats</p>
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => router.push('/saved')}
            className="w-full p-4 rounded-xl border flex items-center justify-between hover:opacity-80 transition-all"
            style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                backgroundColor: Colors.redMuted
              }}>
                <Star size={20} color={Colors.red} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: Colors.textPrimary }}>Saved Properties</p>
                <p className="text-xs" style={{ color: Colors.textSecondary }}>Your favorites</p>
              </div>
            </div>
          </button>

          <button
            className="w-full p-4 rounded-xl border flex items-center justify-between hover:opacity-80 transition-all"
            style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                backgroundColor: Colors.blueMuted
              }}>
                <Settings size={20} color={Colors.blue} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: Colors.textPrimary }}>Settings</p>
                <p className="text-xs" style={{ color: Colors.textSecondary }}>App preferences</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="w-full p-4 rounded-xl border flex items-center justify-between hover:opacity-80 transition-all"
            style={{ backgroundColor: Colors.redMuted, borderColor: Colors.red }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                backgroundColor: Colors.red
              }}>
                <LogOut size={20} color="#fff" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: Colors.red }}>Logout</p>
                <p className="text-xs" style={{ color: Colors.red }}>Sign out of your account</p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center mt-12">
          <p className="text-[10px] font-semibold tracking-[4px]" style={{ color: Colors.textDark }}>
            SINCE 2026
          </p>
        </div>
      </main>
    </div>
  );
}
