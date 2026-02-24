import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Bell, Check, X, User, Home } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { notificationAPI } from '@/services/api';
import { API_BASE_URL } from '@/constants/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  read: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: notifications, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications', token],
    queryFn: () => notificationAPI.getNotifications(token!, 1, 50),
    enabled: !!token,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationAPI.markAsRead(token!, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const handleAcceptContact = async (leadId: string, notificationId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessingId(notificationId);

    try {
      const response = await fetch(`${API_BASE_URL}/leads/accept-unlock/${leadId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || 'Failed to accept request');
      }

      const data = await response.json();
      
      // Mark notification as read first
      await markAsReadMutation.mutateAsync(notificationId);
      
      Alert.alert('Success', `Contact unlocked! Tenant: ${data.tenantContact?.name}, Phone: ${data.tenantContact?.phoneNumber}`);
      
      // Refresh notifications
      await refetch();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept contact request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectContact = async (notificationId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this contact request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(notificationId);
            try {
              await markAsReadMutation.mutateAsync(notificationId);
              Alert.alert('Success', 'Contact request rejected');
              refetch();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject request');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id);
    }

    // Navigate based on notification type
    if (notification.type === 'new_lead' || notification.type === 'unlock_request') {
      router.push('/lead-management' as any);
    } else if (notification.type === 'lead_update' || notification.type === 'contact_unlocked') {
      // Navigate to property or lead details
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_lead':
      case 'unlock_request':
        return <User size={20} color={Colors.gold} />;
      case 'lead_update':
      case 'contact_unlocked':
        return <Home size={20} color={Colors.blue} />;
      default:
        return <Bell size={20} color={Colors.textSecondary} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  const notificationList = notifications?.notifications || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.backButton} />
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
        {notificationList.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={Colors.textDark} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>You'll see updates here when you get them</Text>
          </View>
        ) : (
          notificationList.map((notification: Notification) => (
            <Pressable
              key={notification._id}
              style={[styles.notificationCard, !notification.read && styles.notificationUnread]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationBody}>{notification.body}</Text>
                <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>

                {/* Show Pro Partner contact when unlocked */}
                {notification.type === 'contact_unlocked' && notification.data?.ownerPhone && (
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Pro Partner Contact:</Text>
                    <Text style={styles.contactPhone}>📞 {notification.data.ownerPhone}</Text>
                  </View>
                )}

                {(notification.type === 'new_lead' || notification.type === 'unlock_request') && !notification.read && (
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectContact(notification._id)}
                      disabled={processingId === notification._id}
                    >
                      <X size={16} color={Colors.red} />
                      <Text style={styles.rejectText}>Reject</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAcceptContact(notification.data?.leadId, notification._id)}
                      disabled={processingId === notification._id}
                    >
                      {processingId === notification._id ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <>
                          <Check size={16} color="#000" />
                          <Text style={styles.acceptText}>Accept</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                )}
              </View>
            </Pressable>
          ))
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
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  notificationCard: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    gap: 12,
  },
  notificationUnread: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  notificationBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textDark,
  },
  contactInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.goldMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  contactLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  rejectButton: {
    backgroundColor: Colors.redMuted,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.red,
  },
  acceptButton: {
    backgroundColor: Colors.gold,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#000',
  },
});
