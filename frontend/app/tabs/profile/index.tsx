import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Home, Heart, Users, MessageCircle, Settings,
  LogOut, ChevronRight, Crown, Star, Shield, Bell,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { notificationAPI } from '@/services/api';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, token } = useAuth();

  const { data: unreadCount } = useQuery({
    queryKey: ['unread-count', token],
    queryFn: () => notificationAPI.getUnreadCount(token!),
    enabled: !!token,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          router.replace('/login' as any);
        },
      },
    ]);
  }, [logout]);

  const isOwner = user?.role === 'owner';

  const handleMenuPress = useCallback((label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (label) {
      case 'My Properties':
        router.push('/lead-management?filter=all' as any);
        break;
      case 'Dashboard':
        router.push('/broker-dashboard' as any);
        break;
      case 'Verification':
        // Navigate to verification
        break;
      case 'Settings':
        router.push('/settings' as any);
        break;
    }
  }, []);

  const menuItems = [
    { icon: <Home size={20} color={Colors.gold} />, label: 'My Properties', show: isOwner, onPress: () => handleMenuPress('My Properties') },
    { icon: <Crown size={20} color={Colors.gold} />, label: 'Dashboard', show: isOwner, onPress: () => handleMenuPress('Dashboard') },
    { icon: <Shield size={20} color={Colors.green} />, label: 'Verification', show: isOwner, onPress: () => handleMenuPress('Verification') },
    { icon: <Settings size={20} color={Colors.textSecondary} />, label: 'Settings', show: true, onPress: () => handleMenuPress('Settings') },
  ].filter(item => item.show);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Notification Bell */}
      <View style={styles.topBar}>
        <Pressable 
          style={styles.notificationButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/notifications' as any);
          }}
        >
          <Bell size={22} color={Colors.textPrimary} />
          {unreadCount && unreadCount.count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount.count > 9 ? '9+' : unreadCount.count}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[Colors.gold, Colors.goldDark]}
              style={styles.avatarBorder}
            >
              <Image
                source={{ uri: user?.profileImage || `https://i.pravatar.cc/300?u=${user?._id}` }}
                style={styles.avatar}
                contentFit="cover"
              />
            </LinearGradient>
          </View>

          <Text style={styles.name}>{user?.name || 'User'}</Text>
          
          <Pressable 
            style={styles.editButton}
            onPress={() => router.push('/edit-profile' as any)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>

          <View style={styles.roleBadge}>
            <LinearGradient
              colors={isOwner ? ['#2a1f40', '#1a1530'] : ['#152040', '#101830']}
              style={styles.roleBadgeGradient}
            >
              {isOwner ? (
                <Crown size={12} color={Colors.gold} />
              ) : (
                <Star size={12} color={Colors.blue} />
              )}
              <Text style={[styles.roleText, { color: isOwner ? Colors.gold : Colors.blue }]}>
                {isOwner ? 'PRO PARTNER' : 'ELITE MEMBER'}
              </Text>
            </LinearGradient>
          </View>

          <Text style={styles.phone}>
            +91 {user?.phoneNumber || '0000000000'}
          </Text>
        </View>

        {/* Stats Row - Hidden as per requirement */}
        {/* <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.following?.length || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.savedProperties?.length || 0}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View> */}

        {user?.trustScore !== undefined && user.trustScore > 0 && (
          <View style={styles.trustCard}>
            <View style={styles.trustHeader}>
              <Shield size={16} color={Colors.green} />
              <Text style={styles.trustTitle}>Trust Score</Text>
            </View>
            <View style={styles.trustBar}>
              <View style={[styles.trustFill, { width: `${user.trustScore}%` }]} />
            </View>
            <Text style={styles.trustValue}>{user.trustScore}/100</Text>
          </View>
        )}

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Pressable key={index} style={styles.menuItem} onPress={item.onPress} testID={`menu-${index}`}>
              <View style={styles.menuLeft}>
                {item.icon}
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={18} color={Colors.textDark} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout} testID="logout-button">
          <LogOut size={18} color={Colors.red} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badge: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    backgroundColor: Colors.red,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center' as const,
    paddingTop: 24,
    paddingBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  name: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  editButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.goldMuted,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  editButtonText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  roleBadge: {
    marginTop: 8,
  },
  roleBadgeGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  phone: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 40,
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  trustCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trustHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 10,
  },
  trustTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  trustBar: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  trustFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
  trustValue: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 6,
    textAlign: 'right' as const,
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 20,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 6,
  },
  menuLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  menuLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.redMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    color: Colors.red,
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
