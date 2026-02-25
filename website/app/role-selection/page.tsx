'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Building2, ArrowRight } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/lib/constants';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { user, login, token } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'owner' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectRole = async () => {
    if (!selectedRole || !user || !token) return;
    setLoading(true);
    try {
      const result = await authAPI.selectRole(token, user._id, selectedRole);
      login(result.user, token);
      router.push('/home');
    } catch (e) {
      alert('Failed to select role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8" style={{ backgroundColor: Colors.background }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: Colors.textPrimary }}>
            Choose Your Role
          </h1>
          <p className="text-base" style={{ color: Colors.textSecondary }}>
            Select how you want to use PropBay
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setSelectedRole('tenant')}
            className="p-8 rounded-2xl border-2 transition-all hover:scale-105"
            style={{
              backgroundColor: selectedRole === 'tenant' ? Colors.goldMuted : Colors.card,
              borderColor: selectedRole === 'tenant' ? Colors.gold : Colors.border
            }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{
              backgroundColor: selectedRole === 'tenant' ? Colors.gold : Colors.surface
            }}>
              <Home size={32} color={selectedRole === 'tenant' ? '#000' : Colors.gold} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: Colors.textPrimary }}>
              Elite Member
            </h3>
            <p className="text-sm" style={{ color: Colors.textSecondary }}>
              Find and book premium properties
            </p>
          </button>

          <button
            onClick={() => setSelectedRole('owner')}
            className="p-8 rounded-2xl border-2 transition-all hover:scale-105"
            style={{
              backgroundColor: selectedRole === 'owner' ? Colors.goldMuted : Colors.card,
              borderColor: selectedRole === 'owner' ? Colors.gold : Colors.border
            }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{
              backgroundColor: selectedRole === 'owner' ? Colors.gold : Colors.surface
            }}>
              <Building2 size={32} color={selectedRole === 'owner' ? '#000' : Colors.gold} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: Colors.textPrimary }}>
              Pro Partner
            </h3>
            <p className="text-sm" style={{ color: Colors.textSecondary }}>
              List and manage your properties
            </p>
          </button>
        </div>

        <button
          onClick={handleSelectRole}
          disabled={!selectedRole || loading}
          className="w-full h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-base transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, ${Colors.gold}, ${Colors.goldDark})`,
            color: '#000'
          }}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
