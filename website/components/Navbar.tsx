'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, Heart, User, Plus, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/lib/constants';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || pathname === '/login' || pathname === '/role-selection') {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: Colors.surface, borderColor: Colors.border }}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/home')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                background: `linear-gradient(135deg, ${Colors.gold}, ${Colors.goldLight})`
              }}>
                <span className="text-lg font-extrabold text-black">P</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-wider" style={{ color: Colors.gold }}>
                  PropBay
                </h1>
                <p className="text-[9px] tracking-widest" style={{ color: Colors.textSecondary }}>
                  PREMIUM PROPERTY PARTNER
                </p>
              </div>
            </button>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => router.push('/home')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                style={{
                  backgroundColor: isActive('/home') ? Colors.goldMuted : 'transparent',
                  color: isActive('/home') ? Colors.gold : Colors.textSecondary
                }}
              >
                <Home size={18} />
                <span className="text-sm font-semibold">Home</span>
              </button>

              <button
                onClick={() => router.push('/explore')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                style={{
                  backgroundColor: isActive('/explore') ? Colors.goldMuted : 'transparent',
                  color: isActive('/explore') ? Colors.gold : Colors.textSecondary
                }}
              >
                <Search size={18} />
                <span className="text-sm font-semibold">Explore</span>
              </button>

              {user?.role === 'owner' ? (
                <>
                  <button
                    onClick={() => router.push('/services')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                    style={{
                      backgroundColor: isActive('/services') ? Colors.goldMuted : 'transparent',
                      color: isActive('/services') ? Colors.gold : Colors.textSecondary
                    }}
                  >
                    <Briefcase size={18} />
                    <span className="text-sm font-semibold">Services</span>
                  </button>

                  <button
                    onClick={() => router.push('/post-property')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all hover:opacity-90 ml-2"
                    style={{
                      background: `linear-gradient(to right, ${Colors.gold}, ${Colors.goldDark})`,
                      color: '#000'
                    }}
                  >
                    <Plus size={18} />
                    <span className="text-sm">Post Property</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push('/services')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                  style={{
                    backgroundColor: isActive('/services') ? Colors.goldMuted : 'transparent',
                    color: isActive('/services') ? Colors.gold : Colors.textSecondary
                  }}
                >
                  <Briefcase size={18} />
                  <span className="text-sm font-semibold">Services</span>
                </button>
              )}

              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                style={{
                  backgroundColor: isActive('/profile') ? Colors.goldMuted : 'transparent',
                  color: isActive('/profile') ? Colors.gold : Colors.textSecondary
                }}
              >
                <User size={18} />
                <span className="text-sm font-semibold">Profile</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t" style={{ backgroundColor: Colors.surface, borderColor: Colors.border }}>
        <div className="flex items-center justify-around px-2 py-3">
          <button
            onClick={() => router.push('/home')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-1"
            style={{
              backgroundColor: isActive('/home') ? Colors.goldMuted : 'transparent',
              color: isActive('/home') ? Colors.gold : Colors.textSecondary
            }}
          >
            <Home size={22} />
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          <button
            onClick={() => router.push('/explore')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-1"
            style={{
              backgroundColor: isActive('/explore') ? Colors.goldMuted : 'transparent',
              color: isActive('/explore') ? Colors.gold : Colors.textSecondary
            }}
          >
            <Search size={22} />
            <span className="text-[10px] font-semibold">Explore</span>
          </button>

          {user?.role === 'owner' && (
            <button
              onClick={() => router.push('/post-property')}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl -mt-4"
              style={{
                background: `linear-gradient(to right, ${Colors.gold}, ${Colors.goldDark})`,
                color: '#000',
                boxShadow: '0 4px 12px rgba(212,175,55,0.3)'
              }}
            >
              <Plus size={24} />
              <span className="text-[10px] font-extrabold">Post</span>
            </button>
          )}

          <button
            onClick={() => router.push('/services')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-1"
            style={{
              backgroundColor: isActive('/services') ? Colors.goldMuted : 'transparent',
              color: isActive('/services') ? Colors.gold : Colors.textSecondary
            }}
          >
            <Briefcase size={22} />
            <span className="text-[10px] font-semibold">Services</span>
          </button>

          <button
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-1"
            style={{
              backgroundColor: isActive('/profile') ? Colors.goldMuted : 'transparent',
              color: isActive('/profile') ? Colors.gold : Colors.textSecondary
            }}
          >
            <User size={22} />
            <span className="text-[10px] font-semibold">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
}

