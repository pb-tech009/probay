import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Pressable,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  Home, TrendingUp, Flame, Bell, CheckCircle, Timer,
  Zap, AlertCircle, XCircle, Crown, Star,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getImageUrl } from '@/constants/api';
import { useAuth } from '@/providers/AuthProvider';
import { brokerAPI } from '@/services/api';

interface DashboardStats {
  trustScore: number;
  properties: {
    total: number;
    active: number;
    expired: number;
    expiringSoon: number;
  };
  leads: {
    hot: number;
    new: number;
    closed: number;
    conversionRate: number;
  };
  response: {
    avgResponseTime: number;
    fastResponseRate: number;
  };
  recentActivity: Array<{
    _id: string;
    tenant: { name: string };
    property: { title: string; images: string[] };
    priority: 'hot' | 'warm' | 'casual';
  }>;
}

export default function BrokerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['broker-dashboard', token],
    queryFn: () => brokerAPI.getDashboardStats(token!),
    enabled: !!token,
  });

  const getTrustLevel = (score: number) => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    if (score >= 40) return 'AVERAGE';
    return 'BUILDING';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot': return Colors.red;
      case 'warm': return Colors.orange;
      default: return Colors.blue;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>PRO Dashboard</Text>
          <View style={styles.badge}>
            <Crown size={10} color="#000" />
            <Text style={styles.badgeText}>PRO PARTNER</Text>
          </View>
        </View>
        <Pressable onPress={() => refetch()} style={styles.refreshButton}>
          <Text style={styles.refreshText}>↻</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
      >
        {/* Welcome Section */}
        <LinearGradient
          colors={['rgba(212,175,55,0.2)', Colors.card]}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeIcon}>
              <Crown size={24} color={Colors.gold} />
            </View>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>Welcome Back!</Text>
              <Text style={styles.welcomeSubtitle}>Your PRO Partner Dashboard</Text>
            </View>
          </View>

          <View style={styles.trustScoreRow}>
            <View>
              <Text style={styles.trustLabel}>Trust Score</Text>
              <View style={styles.trustValue}>
                <Text style={styles.trustNumber}>{data?.trustScore || 0}</Text>
                <Text style={styles.trustTotal}>/100</Text>
              </View>
            </View>
            <View style={styles.trustBadge}>
              <Star size={14} color="#000" />
              <Text style={styles.trustBadgeText}>
                {getTrustLevel(data?.trustScore || 0)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <Pressable 
            style={styles.statCard}
            onPress={() => router.push('/lead-management?filter=active' as any)}
          >
            <View style={styles.statHeader}>
              <Home size={20} color={Colors.green} />
              <View style={styles.statTrend}>
                <TrendingUp size={12} color={Colors.green} />
              </View>
            </View>
            <Text style={[styles.statValue, { color: Colors.green }]}>
              {data?.properties.active || 0}
            </Text>
            <Text style={styles.statLabel}>Active Properties</Text>
          </Pressable>

          <Pressable 
            style={styles.statCard}
            onPress={() => router.push('/lead-management?filter=hot' as any)}
          >
            <View style={styles.statHeader}>
              <Flame size={20} color={Colors.orange} />
              <View style={styles.statTrend}>
                <TrendingUp size={12} color={Colors.orange} />
              </View>
            </View>
            <Text style={[styles.statValue, { color: Colors.orange }]}>
              {data?.leads.hot || 0}
            </Text>
            <Text style={styles.statLabel}>Hot Leads</Text>
          </Pressable>

          <Pressable 
            style={styles.statCard}
            onPress={() => router.push('/lead-management?filter=new' as any)}
          >
            <View style={styles.statHeader}>
              <Bell size={20} color={Colors.blue} />
              <View style={styles.statTrend}>
                <TrendingUp size={12} color={Colors.blue} />
              </View>
            </View>
            <Text style={[styles.statValue, { color: Colors.blue }]}>
              {data?.leads.new || 0}
            </Text>
            <Text style={styles.statLabel}>New Leads</Text>
          </Pressable>

          <Pressable 
            style={styles.statCard}
            onPress={() => router.push('/lead-management?filter=closed' as any)}
          >
            <View style={styles.statHeader}>
              <CheckCircle size={20} color={Colors.gold} />
              <View style={styles.statTrend}>
                <TrendingUp size={12} color={Colors.gold} />
              </View>
            </View>
            <Text style={[styles.statValue, { color: Colors.gold }]}>
              {data?.leads.closed || 0}
            </Text>
            <Text style={styles.statLabel}>Closed Deals</Text>
          </Pressable>
        </View>

        {/* Properties Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Properties Overview</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <Home size={18} color={Colors.textPrimary} />
              <Text style={styles.overviewLabel}>Total Properties</Text>
              <Text style={[styles.overviewValue, { color: Colors.textPrimary }]}>
                {data?.properties.total || 0}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.overviewRow}>
              <CheckCircle size={18} color={Colors.green} />
              <Text style={styles.overviewLabel}>Active</Text>
              <Text style={[styles.overviewValue, { color: Colors.green }]}>
                {data?.properties.active || 0}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.overviewRow}>
              <AlertCircle size={18} color={Colors.orange} />
              <Text style={styles.overviewLabel}>Expiring Soon</Text>
              <Text style={[styles.overviewValue, { color: Colors.orange }]}>
                {data?.properties.expiringSoon || 0}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.overviewRow}>
              <XCircle size={18} color={Colors.red} />
              <Text style={styles.overviewLabel}>Expired</Text>
              <Text style={[styles.overviewValue, { color: Colors.red }]}>
                {data?.properties.expired || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Leads Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leads Performance</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Text style={styles.performanceLabel}>Conversion Rate</Text>
              <Text style={styles.performanceValue}>
                {data?.leads.conversionRate || 0}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${data?.leads.conversionRate || 0}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Response Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Response Performance</Text>
          <View style={styles.responseRow}>
            <View style={styles.responseCard}>
              <Timer size={28} color={Colors.blue} />
              <Text style={styles.responseValue}>
                {data?.response.avgResponseTime || 0}m
              </Text>
              <Text style={styles.responseLabel}>Avg Response</Text>
            </View>
            <View style={styles.responseCard}>
              <Zap size={28} color={Colors.orange} />
              <Text style={styles.responseValue}>
                {data?.response.fastResponseRate || 0}%
              </Text>
              <Text style={styles.responseLabel}>Fast Response</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        {data?.recentActivity && data.recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {data.recentActivity.slice(0, 3).map((activity) => (
              <View key={activity._id} style={styles.activityCard}>
                <View style={styles.activityImage}>
                  {activity.property.images?.[0] ? (
                    <Image
                      source={{ uri: getImageUrl(activity.property.images[0]) }}
                      style={styles.activityImageContent}
                      contentFit="cover"
                    />
                  ) : (
                    <Home size={20} color={Colors.textDark} />
                  )}
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{activity.tenant.name}</Text>
                  <Text style={styles.activityProperty} numberOfLines={1}>
                    {activity.property.title}
                  </Text>
                </View>
                <View
                  style={[
                    styles.activityPriority,
                    { backgroundColor: `${getPriorityColor(activity.priority)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.activityPriorityText,
                      { color: getPriorityColor(activity.priority) },
                    ]}
                  >
                    {activity.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backText: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  badge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.gold,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800' as const,
    color: '#000',
    letterSpacing: 0.5,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  refreshText: {
    fontSize: 24,
    color: Colors.gold,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  welcomeHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  trustScoreRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
  },
  trustLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  trustValue: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
  },
  trustNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  trustTotal: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  trustBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.gold,
    borderRadius: 8,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#000',
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%' as any,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statTrend: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  overviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
    gap: 12,
  },
  overviewLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  performanceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  performanceHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  performanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  responseRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  responseCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center' as const,
  },
  responseValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.gold,
    marginTop: 8,
  },
  responseLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center' as const,
  },
  activityCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    gap: 12,
  },
  activityImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  },
  activityImageContent: {
    width: '100%',
    height: '100%',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  activityProperty: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityPriority: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityPriorityText: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
});
