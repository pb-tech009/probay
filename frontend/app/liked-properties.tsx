import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Heart, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { authAPI } from '@/services/api';
import PropertyCard from '@/components/PropertyCard';
import { Property } from '@/types';

export default function LikedPropertiesScreen() {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  const { data: savedProperties, isLoading } = useQuery({
    queryKey: ['saved-properties'],
    queryFn: async () => {
      if (!token || !user?.savedProperties?.length) return [];
      // In a real app, you'd fetch the full property details
      // For now, we'll show a placeholder
      return [];
    },
    enabled: !!token,
  });

  const handlePropertyPress = (property: Property) => {
    router.push({
      pathname: '/property-detail',
      params: { id: property._id, data: JSON.stringify(property) },
    });
  };

  const handleLike = async (propertyId: string) => {
    // Handle unlike
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <PropertyCard
      property={item}
      onPress={() => handlePropertyPress(item)}
      onLike={() => handleLike(item._id)}
      isLiked={true}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ArrowLeft size={24} color={Colors.textPrimary} onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Liked Properties</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : savedProperties?.length === 0 ? (
        <View style={styles.centered}>
          <Heart size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No Liked Properties</Text>
          <Text style={styles.emptySubtitle}>
            Properties you like will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedProperties}
          renderItem={renderProperty}
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
    paddingTop: 8,
    paddingBottom: 40,
  },
});