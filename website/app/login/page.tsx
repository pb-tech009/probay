'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ShieldCheck, ArrowRight, ChevronLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.requestOtp(phone);
      setShowOtp(true);
    } catch (e: any) {
      setError(e.response?.data?.msg || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError('Please enter the 4-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await authAPI.verifyOtp(phone, otp);
      login(result.user, result.token);
      if (result.user.role === 'none') {
        router.push('/role-selection');
      } else {
        router.push('/home');
      }
    } catch (e: any) {
      setError(e.response?.data?.msg || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8" style={{ backgroundColor: Colors.background }}>
      <div className="absolute top-0 left-0 right-0 h-[300px] opacity-50" style={{
        background: `linear-gradient(to bottom, ${Colors.goldMuted}, transparent)`
      }}></div>

      <div className="w-full max-w-md relative z-10">
        {showOtp && (
          <button
            onClick={() => { setShowOtp(false); setOtp(''); setError(''); }}
            className="mb-4 p-2 rounded-lg hover:bg-opacity-80 transition-all"
            style={{ backgroundColor: Colors.card }}
          >
            <ChevronLeft size={24} color={Colors.textSecondary} />
          </button>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{
            background: `linear-gradient(135deg, ${Colors.gold}, ${Colors.goldLight})`
          }}>
            <span className="text-2xl font-extrabold text-black">P</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider mb-2" style={{ color: Colors.gold }}>
            PropBay
          </h1>
          <p className="text-xs tracking-widest" style={{ color: Colors.textSecondary }}>
            Your Premium Property Partner
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: Colors.textPrimary }}>
              {showOtp ? 'Verify Your Number' : 'Welcome Back'}
            </h2>
            <p className="text-sm" style={{ color: Colors.textSecondary }}>
              {showOtp ? `We sent a code to +91 ${phone}` : 'Sign in with your mobile number'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: Colors.redMuted, borderLeft: `3px solid ${Colors.red}` }}>
              <p className="text-sm" style={{ color: Colors.red }}>{error}</p>
            </div>
          )}

          {!showOtp ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border" style={{
              backgroundColor: Colors.card,
              borderColor: Colors.border
            }}>
              <Phone size={18} color={Colors.gold} />
              <span className="text-base font-bold" style={{ color: Colors.gold }}>+91</span>
              <input
                type="tel"
                placeholder="Enter phone number"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-transparent outline-none text-base font-medium"
                style={{ color: Colors.textPrimary }}
                onKeyPress={(e) => e.key === 'Enter' && handleRequestOtp()}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl border" style={{
                backgroundColor: Colors.card,
                borderColor: Colors.border
              }}>
                <ShieldCheck size={18} color={Colors.gold} />
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-transparent outline-none text-xl font-bold tracking-widest"
                  style={{ color: Colors.textPrimary }}
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyOtp()}
                />
              </div>
              <button
                onClick={() => { setShowOtp(false); setOtp(''); setError(''); }}
                className="text-xs text-center w-full"
                style={{ color: Colors.textSecondary }}
              >
                Change number?
              </button>
            </div>
          )}

          <button
            onClick={showOtp ? handleVerifyOtp : handleRequestOtp}
            disabled={loading}
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
                <span>{showOtp ? 'Verify & Login' : 'Get OTP'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-[10px] font-semibold tracking-[4px]" style={{ color: Colors.textDark }}>
            ESTABLISHED 2026
          </p>
        </div>
      </div>
    </div>
  );
}
