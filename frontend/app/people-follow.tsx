import React from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Users, ArrowLeft, Crown, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { socialAPI } from '@/services/api';
import { User } from '@/types';

export default function PeopleFollowScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const { data: socialData, isLoading } = useQuery({
    queryKey: ['social-stats'],
    queryFn: () => socialAPI.getSocialStats(token!),
    enabled: !!token,
  });

  const handleUnfollow = async (userId: string) => {
    if (!token) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await socialAPI.followUser(token, userId);
      // Refetch data
    } catch (error) {
      console.log('Unfollow error:', error);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <Image
        source={{ uri: item.profileImage || `https://i.pravatar.cc/150?u=${item._id}` }}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.role === 'owner' ? (
            <Crown size={14} color={Colors.gold} />
          ) : (
            <Star size={14} color={Colors.blue} />
          )}
        </View>
        <Text style={styles.userRole}>
          {item.role === 'owner' ? 'Pro Partner' : 'Elite Member'}
        </Text>
        <Text style={styles.userPhone}>+91 {item.phoneNumber}</Text>
      </View>
      <Pressable
        style={styles.unfollowButton}
        onPress={() => handleUnfollow(item._id)}
      >
        <Text style={styles.unfollowText}>Unfollow</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>People I Follow</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : !socialData?.following?.length ? (
        <View style={styles.centered}>
          <Users size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>Not Following Anyone</Text>
          <Text style={styles.emptySubtitle}>
            People you follow will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={socialData.following}
          renderItem={renderUser}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  centered: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingBottom: 60,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 16,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center' as const,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  userRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  unfollowButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.redMuted,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  unfollowText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.red,
  },
});