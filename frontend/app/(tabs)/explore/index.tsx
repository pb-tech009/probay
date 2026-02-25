import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, FlatList,
  ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { propertyAPI } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';
import { Property, PropertyFilters } from '@/types';
import PropertyCard from '@/components/PropertyCard';

const PROPERTY_TYPES = ['Apartment/Flat', 'Independent House/Villa', 'Penthouse', 'PG/Hostel', 'Office Space', 'Shop/Showroom', 'Plot/Land', 'Warehouse', 'Farm House'];
const BHK_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK+', 'Studio', 'Room'];
const FURNISHING = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const params = useLocalSearchParams();
  const filterType = params.filterType as string;
  
  const [searchText, setSearchText] = useState<string>('');
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  // Apply filter from Services tab navigation
  useEffect(() => {
    if (filterType) {
      setFilters({ type: filterType });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [filterType]);

  const activeFilters: PropertyFilters = {
    ...filters,
    ...(searchText ? { search: searchText } : {}),
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['properties', activeFilters, page],
    queryFn: () => propertyAPI.getProperties(activeFilters, page, 15),
  });

  const properties = data?.properties || [];

  const handleSearch = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handlePropertyPress = useCallback((property: Property) => {
    router.push({ pathname: '/property-detail' as any, params: { id: property._id, data: JSON.stringify(property) } });
  }, []);

  const handleLike = useCallback(async (propertyId: string) => {
    if (!token) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await propertyAPI.likeProperty(token, propertyId);
    } catch (e) {
      console.log('[Explore] Like error:', e);
    }
  }, [token]);

  const applyFilter = useCallback((key: keyof PropertyFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchText('');
    setPage(1);
  }, []);

  const hasActiveFilters = Object.values(filters).some(Boolean) || !!searchText;

  const renderFilterChip = (label: string, key: keyof PropertyFilters, value: string) => {
    const isActive = filters[key] === value;
    return (
      <Pressable
        key={value}
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => applyFilter(key, value)}
      >
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const renderProperty = useCallback(({ item }: { item: Property }) => (
    <PropertyCard
      property={item}
      onPress={() => handlePropertyPress(item)}
      onLike={() => handleLike(item._id)}
      isLiked={user ? item.likes.includes(user._id) : false}
    />
  ), [handlePropertyPress, handleLike, user]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>
          {data?.totalResults ? `${data.totalResults} properties` : 'Find your perfect space'}
        </Text>
        {filterType && (
          <View style={styles.filterAppliedBanner}>
            <Text style={styles.filterAppliedText}>
              🔍 Showing: {filterType}
            </Text>
            <Pressable onPress={() => { setFilters({}); router.setParams({ filterType: undefined }); }}>
              <X size={16} color={Colors.gold} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search society, area, city..."
            placeholderTextColor={Colors.textDark}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            testID="search-input"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => { setSearchText(''); setPage(1); }}>
              <X size={16} color={Colors.textSecondary} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={18} color={hasActiveFilters ? '#000' : Colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.quickFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFiltersContent}>
          <Pressable
            style={[styles.statusChip, !filters.status && styles.statusChipActive]}
            onPress={() => setFilters(prev => ({ ...prev, status: undefined }))}
          >
            <Text style={[styles.statusChipText, !filters.status && styles.statusChipTextActive]}>All</Text>
          </Pressable>
          <Pressable
            style={[styles.statusChip, filters.status === 'Rent' && styles.statusChipActive]}
            onPress={() => applyFilter('status', 'Rent')}
          >
            <Text style={[styles.statusChipText, filters.status === 'Rent' && styles.statusChipTextActive]}>For Rent</Text>
          </Pressable>
          <Pressable
            style={[styles.statusChip, filters.status === 'Sell' && styles.statusChipActive]}
            onPress={() => applyFilter('status', 'Sell')}
          >
            <Text style={[styles.statusChipText, filters.status === 'Sell' && styles.statusChipTextActive]}>For Sale</Text>
          </Pressable>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.centered}>
          <MapPin size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No Properties Found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your filters or search query</Text>
          {hasActiveFilters && (
            <Pressable style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          testID="property-list"
        />
      )}

      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <Pressable onPress={() => setShowFilters(false)}>
                <X size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceInputRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Min Price</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="₹ 0"
                    placeholderTextColor={Colors.textDark}
                    keyboardType="numeric"
                    value={filters.minPrice || ''}
                    onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
                  />
                </View>
                <Text style={styles.priceSeparator}>-</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Max Price</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="₹ Any"
                    placeholderTextColor={Colors.textDark}
                    keyboardType="numeric"
                    value={filters.maxPrice || ''}
                    onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
                  />
                </View>
              </View>

              <Text style={styles.filterSectionTitle}>Property Type</Text>
              <View style={styles.filterChips}>
                {PROPERTY_TYPES.map(t => renderFilterChip(t, 'type', t))}
              </View>

              <Text style={styles.filterSectionTitle}>BHK Type</Text>
              <View style={styles.filterChips}>
                {BHK_TYPES.map(t => renderFilterChip(t, 'bhkType', t))}
              </View>

              <Text style={styles.filterSectionTitle}>Furnishing</Text>
              <View style={styles.filterChips}>
                {FURNISHING.map(t => renderFilterChip(t, 'furnishingStatus', t))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={styles.resetButton} onPress={clearFilters}>
                <Text style={styles.resetButtonText}>Reset All</Text>
              </Pressable>
              <Pressable
                style={styles.applyButton}
                onPress={() => { setShowFilters(false); setPage(1); }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterAppliedBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between',
    backgroundColor: Colors.goldMuted,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  filterAppliedText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  searchRow: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  filterButtonActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  quickFilters: {
    marginTop: 12,
    marginBottom: 8,
  },
  quickFiltersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusChipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  statusChipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  statusChipTextActive: {
    color: Colors.gold,
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
    fontSize: 13,
    marginTop: 4,
  },
  clearButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.goldMuted,
  },
  clearButtonText: {
    color: Colors.gold,
    fontWeight: '600' as const,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 20,
    letterSpacing: 0.5,
  },
  filterChips: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  filterChipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  filterChipTextActive: {
    color: Colors.gold,
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 24,
  },
  resetButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  resetButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  applyButton: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.gold,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  applyButtonText: {
    color: '#000',
    fontWeight: '700' as const,
    fontSize: 15,
  },
  priceInputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 8,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600' as const,
  },
  priceInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  priceSeparator: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginTop: 20,
  },
});
