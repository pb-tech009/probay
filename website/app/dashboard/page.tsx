'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Home, TrendingUp, Flame, Bell, Crown, Star } from 'lucide-react';
import { brokerAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/lib/constants';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['broker-dashboard', token],
    queryFn: () => brokerAPI.getDashboardStats(token!),
    enabled: !!token && user?.role === 'owner',
  });

  if (user?.role !== 'owner') {
    router.push('/home');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: Colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: Colors.gold }}></div>
      </div>
    );
  }

  const getTrustLevel = (score: number) => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    if (score >= 40) return 'AVERAGE';
    return 'BUILDING';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: Colors.textPrimary }}>
            PRO Dashboard
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: Colors.gold }}>
            <Crown size={12} color="#000" />
            <span className="text-xs font-extrabold text-black">PRO PARTNER</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border mb-8" style={{
          background: `linear-gradient(135deg, ${Colors.goldMuted}, ${Colors.card})`,
          borderColor: 'rgba(212,175,55,0.3)'
        }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm mb-1" style={{ color: Colors.textSecondary }}>Trust Score</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold" style={{ color: Colors.gold }}>
                  {data?.trustScore || 0}
                </span>
                <span className="text-xl" style={{ color: Colors.textSecondary }}>/100</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl flex items-center gap-2" style={{ backgroundColor: Colors.gold }}>
              <Star size={14} color="#000" fill="#000" />
              <span className="text-sm font-extrabold text-black">
                {getTrustLevel(data?.trustScore || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
            <div className="flex items-center justify-between mb-4">
              <Home size={24} color={Colors.green} />
              <TrendingUp size={16} color={Colors.green} />
            </div>
            <p className="text-3xl font-extrabold mb-1" style={{ color: Colors.green }}>
              {data?.properties.active || 0}
            </p>
            <p className="text-sm" style={{ color: Colors.textSecondary }}>Active Properties</p>
          </div>

          <div className="p-6 rounded-2xl border" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
            <div className="flex items-center justify-between mb-4">
              <Flame size={24} color={Colors.orange} />
              <TrendingUp size={16} color={Colors.orange} />
            </div>
            <p className="text-3xl font-extrabold mb-1" style={{ color: Colors.orange }}>
              {data?.leads.hot || 0}
            </p>
            <p className="text-sm" style={{ color: Colors.textSecondary }}>Hot Leads</p>
          </div>

          <div className="p-6 rounded-2xl border" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
            <div className="flex items-center justify-between mb-4">
              <Bell size={24} color={Colors.blue} />
              <TrendingUp size={16} color={Colors.blue} />
            </div>
            <p className="text-3xl font-extrabold mb-1" style={{ color: Colors.blue }}>
              {data?.leads.new || 0}
            </p>
            <p className="text-sm" style={{ color: Colors.textSecondary }}>New Leads</p>
          </div>

          <div className="p-6 rounded-2xl border" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
            <div className="flex items-center justify-between mb-4">
              <Star size={24} color={Colors.gold} />
              <TrendingUp size={16} color={Colors.gold} />
            </div>
            <p className="text-3xl font-extrabold mb-1" style={{ color: Colors.gold }}>
              {data?.leads.closed || 0}
            </p>
            <p className="text-sm" style={{ color: Colors.textSecondary }}>Closed Deals</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: Colors.textPrimary }}>Properties Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: Colors.textSecondary }}>Total Properties</span>
                <span className="text-lg font-bold" style={{ color: Colors.textPrimary }}>
                  {data?.properties.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: Colors.textSecondary }}>Active</span>
                <span className="text-lg font-bold" style={{ color: Colors.green }}>
                  {data?.properties.active || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: Colors.textSecondary }}>Expiring Soon</span>
                <span className="text-lg font-bold" style={{ color: Colors.orange }}>
                  {data?.properties.expiringSoon || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: Colors.textSecondary }}>Expired</span>
                <span className="text-lg font-bold" style={{ color: Colors.red }}>
                  {data?.properties.expired || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: Colors.textPrimary }}>Leads Performance</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: Colors.textSecondary }}>Conversion Rate</span>
                <span className="text-lg font-bold" style={{ color: Colors.gold }}>
                  {data?.leads.conversionRate || 0}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: Colors.surface }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data?.leads.conversionRate || 0}%`,
                    backgroundColor: Colors.gold
                  }}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: Colors.textSecondary }}>Avg Response Time</span>
                <span className="text-lg font-bold" style={{ color: Colors.blue }}>
                  {data?.response.avgResponseTime || 0}m
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: Colors.textSecondary }}>Fast Response Rate</span>
                <span className="text-lg font-bold" style={{ color: Colors.orange }}>
                  {data?.response.fastResponseRate || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
