import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  Home, Flame, Bell, CheckCircle, MapPin, IndianRupee, Calendar, User, RefreshCw,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getImageUrl, API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/providers/AuthProvider';
import { brokerAPI } from '@/services/api';

type FilterType = 'all' | 'active' | 'hot' | 'new' | 'closed';

export default function LeadManagementScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const initialFilter = (params.filter as FilterType) || 'all';
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);

  const { data: properties, isLoading: loadingProps, refetch: refetchProps, isRefetching: refetchingProps } = useQuery({
    queryKey: ['broker-properties', token],
    queryFn: () => brokerAPI.getMyProperties(token!),
    enabled: !!token,
  });

  const { data: leads, isLoading: loadingLeads, refetch: refetchLeads, isRefetching: refetchingLeads } = useQuery({
    queryKey: ['broker-leads', token],
    queryFn: () => brokerAPI.getMyLeads(token!),
    enabled: !!token,
  });

  const handleRefresh = () => {
    refetchProps();
    refetchLeads();
  };

  const handleRepostProperty = async (propertyId: string) => {
    Alert.alert(
      'Repost Property',
      'This will extend your property listing by 30 days. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Repost',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/property/renew/${propertyId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to repost property');
              }

              Alert.alert('Success', 'Property reposted successfully!');
              refetchProps();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to repost property');
            }
          },
        },
      ]
    );
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getFilteredData = () => {
    if (activeFilter === 'all') {
      return { properties: properties || [], leads: leads || [] };
    }
    if (activeFilter === 'active') {
      return { properties: properties?.filter((p: any) => p.status === 'active') || [], leads: [] };
    }
    if (activeFilter === 'hot') {
      return { properties: [], leads: leads?.filter((l: any) => l.priority === 'hot') || [] };
    }
    if (activeFilter === 'new') {
      return { properties: [], leads: leads?.filter((l: any) => l.status === 'new') || [] };
    }
    if (activeFilter === 'closed') {
      return { properties: [], leads: leads?.filter((l: any) => l.status === 'closed') || [] };
    }
    return { properties: [], leads: [] };
  };

  const filteredData = getFilteredData();
  const isLoading = loadingProps || loadingLeads;
  const isRefreshing = refetchingProps || refetchingLeads;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot': return Colors.red;
      case 'warm': return Colors.orange;
      default: return Colors.blue;
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)}Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(2)}L`;
    return price.toLocaleString('en-IN');
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
        <Text style={styles.title}>Lead Management</Text>
        <View style={styles.backButton} />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <Pressable
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, activeFilter === 'active' && styles.filterTabActive]}
          onPress={() => setActiveFilter('active')}
        >
          <Home size={14} color={activeFilter === 'active' ? '#000' : Colors.textSecondary} />
          <Text style={[styles.filterText, activeFilter === 'active' && styles.filterTextActive]}>
            Active Properties
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, activeFilter === 'hot' && styles.filterTabActive]}
          onPress={() => setActiveFilter('hot')}
        >
          <Flame size={14} color={activeFilter === 'hot' ? '#000' : Colors.textSecondary} />
          <Text style={[styles.filterText, activeFilter === 'hot' && styles.filterTextActive]}>
            Hot Leads
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, activeFilter === 'new' && styles.filterTabActive]}
          onPress={() => setActiveFilter('new')}
        >
          <Bell size={14} color={activeFilter === 'new' ? '#000' : Colors.textSecondary} />
          <Text style={[styles.filterText, activeFilter === 'new' && styles.filterTextActive]}>
            New Leads
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, activeFilter === 'closed' && styles.filterTabActive]}
          onPress={() => setActiveFilter('closed')}
        >
          <CheckCircle size={14} color={activeFilter === 'closed' ? '#000' : Colors.textSecondary} />
          <Text style={[styles.filterText, activeFilter === 'closed' && styles.filterTextActive]}>
            Closed Leads
          </Text>
        </Pressable>
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
      >
        {/* Properties Section */}
        {filteredData.properties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Properties ({filteredData.properties.length})</Text>
            {filteredData.properties.map((property: any) => (
              <Pressable
                key={property._id}
                style={styles.propertyCard}
                onPress={() => router.push(`/property/${property._id}` as any)}
              >
                <View style={styles.propertyImage}>
                  {property.images?.[0] ? (
                    <Image
                      source={{ uri: getImageUrl(property.images[0]) }}
                      style={styles.propertyImageContent}
                      contentFit="cover"
                    />
                  ) : (
                    <Home size={32} color={Colors.textDark} />
                  )}
                  {property.isExpired ? (
                    <View style={[styles.statusBadge, { backgroundColor: Colors.red }]}>
                      <Text style={styles.statusText}>EXPIRED</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: Colors.green }]}>
                      <Text style={styles.statusText}>{property.status?.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {property.title}
                  </Text>
                  <View style={styles.propertyRow}>
                    <MapPin size={12} color={Colors.textSecondary} />
                    <Text style={styles.propertyLocation} numberOfLines={1}>
                      {property.location?.city}
                    </Text>
                  </View>
                  {property.expiresAt && !property.isExpired && (
                    <View style={styles.expiryInfo}>
                      <Calendar size={10} color={getDaysRemaining(property.expiresAt) <= 7 ? Colors.red : Colors.textDark} />
                      <Text style={[styles.expiryText, getDaysRemaining(property.expiresAt) <= 7 && styles.expiryWarning]}>
                        {getDaysRemaining(property.expiresAt)} days left
                      </Text>
                    </View>
                  )}
                  <View style={styles.propertyFooter}>
                    <View style={styles.propertyRow}>
                      <IndianRupee size={12} color={Colors.gold} />
                      <Text style={styles.propertyPrice}>
                        ₹{formatPrice(property.price)}
                      </Text>
                    </View>
                    <View style={styles.propertyActions}>
                      {property.isExpired || getDaysRemaining(property.expiresAt) <= 7 ? (
                        <Pressable 
                          style={styles.repostButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRepostProperty(property._id);
                          }}
                        >
                          <RefreshCw size={12} color="#fff" />
                          <Text style={styles.repostText}>Repost</Text>
                        </Pressable>
                      ) : null}
                      <Pressable 
                        style={styles.editPropertyButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push(`/edit-property?id=${property._id}` as any);
                        }}
                      >
                        <Text style={styles.editPropertyText}>Edit</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Leads Section */}
        {filteredData.leads.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leads ({filteredData.leads.length})</Text>
            {filteredData.leads.map((lead: any) => (
              <View key={lead._id} style={styles.leadCard}>
                <View style={styles.leadHeader}>
                  <View style={styles.leadUser}>
                    <View style={styles.leadAvatar}>
                      <User size={16} color={Colors.gold} />
                    </View>
                    <View>
                      <Text style={styles.leadName}>{lead.tenant?.name || 'Unknown'}</Text>
                      <Text style={styles.leadPhone}>{lead.tenant?.phoneNumber}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: `${getPriorityColor(lead.priority)}20` },
                    ]}
                  >
                    <Text
                      style={[styles.priorityText, { color: getPriorityColor(lead.priority) }]}
                    >
                      {lead.priority?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.leadProperty}>
                  <Home size={14} color={Colors.textSecondary} />
                  <Text style={styles.leadPropertyText} numberOfLines={1}>
                    {lead.property?.title}
                  </Text>
                </View>
                <View style={styles.leadFooter}>
                  <View style={styles.leadDate}>
                    <Calendar size={12} color={Colors.textDark} />
                    <Text style={styles.leadDateText}>
                      {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                  <Text style={[styles.leadStatus, { color: Colors.gold }]}>
                    {lead.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {filteredData.properties.length === 0 && filteredData.leads.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No data found</Text>
            <Text style={styles.emptySubtext}>Try changing the filter</Text>
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
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingRight: 40,
    flexDirection: 'row' as const,
  },
  filterTab: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    flexShrink: 0,
  },
  filterTabActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    flexShrink: 0,
  },
  filterTextActive: {
    color: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  propertyCard: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    gap: 12,
  },
  propertyImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  },
  propertyImageContent: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '800' as const,
    color: '#fff',
  },
  propertyInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  propertyRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  propertyLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  propertyFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
    marginTop: 8,
  },
  propertyActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  expiryInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 4,
  },
  expiryText: {
    fontSize: 10,
    color: Colors.textDark,
  },
  expiryWarning: {
    color: Colors.red,
    fontWeight: '700' as const,
  },
  repostButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.gold,
    borderRadius: 8,
  },
  repostText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#000',
  },
  editPropertyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.goldMuted,
    borderRadius: 8,
  },
  editPropertyText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  leadCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  leadHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
    marginBottom: 10,
  },
  leadUser: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  leadAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  leadName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  leadPhone: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  leadProperty: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 10,
  },
  leadPropertyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  leadFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
  },
  leadDate: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  leadDateText: {
    fontSize: 11,
    color: Colors.textDark,
  },
  leadStatus: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textDark,
    marginTop: 4,
  },
});
