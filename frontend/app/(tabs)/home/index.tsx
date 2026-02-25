import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated, Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Heart, Plus, Sparkles, BedDouble, Building, MapPin, Video } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { propertyAPI } from '@/services/api';
import { getImageUrl } from '@/constants/api';
import { Property } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.95)).current;

  // Check if user needs to select role
  useEffect(() => {
    if (user && user.role === 'none') {
      router.replace({ pathname: '/role-selection' as any, params: { userId: user._id } });
    }
  }, [user]);

  const { data: featuredData } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => propertyAPI.getFeatured(),
  });

  const { data: recentData } = useQuery({
    queryKey: ['recent-properties'],
    queryFn: () => propertyAPI.getProperties({}, 1, 5),
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const featuredProperties = featuredData?.properties || [];
  const recentProperties = recentData?.properties || [];

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
    return `₹${price}`;
  };

  const renderFeaturedCard = (property: Property) => (
    <Pressable
      key={property._id}
      style={styles.featuredCard}
      onPress={() => router.push({ pathname: '/property-detail' as any, params: { id: property._id, data: JSON.stringify(property) } })}
    >
      <Image
        source={{ uri: getImageUrl(property.images[0]) }}
        style={styles.featuredImage}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.featuredOverlay}
      />
      <View style={styles.featuredContent}>
        <View style={styles.featuredBadge}>
          <Sparkles size={10} color="#000" />
          <Text style={styles.featuredBadgeText}>FEATURED</Text>
        </View>
        {property.videoUrl && (
          <View style={styles.videoBadge}>
            <Video size={10} color={Colors.gold} />
            <Text style={styles.videoBadgeText}>VIDEO</Text>
          </View>
        )}
        <Text style={styles.featuredPrice}>{formatPrice(property.price)}</Text>
        <Text style={styles.featuredTitle} numberOfLines={1}>{property.title}</Text>
        <View style={styles.featuredLocation}>
          <MapPin size={11} color={Colors.textSecondary} />
          <Text style={styles.featuredLocationText} numberOfLines={1}>
            {property.area}, {property.city}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const renderRecentCard = (property: Property) => (
    <Pressable
      key={property._id}
      style={styles.recentCard}
      onPress={() => router.push({ pathname: '/property-detail' as any, params: { id: property._id, data: JSON.stringify(property) } })}
    >
      <Image
        source={{ uri: getImageUrl(property.images[0]) }}
        style={styles.recentImage}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.recentContent}>
        <Text style={styles.recentPrice}>{formatPrice(property.price)}</Text>
        <Text style={styles.recentTitle} numberOfLines={1}>{property.title}</Text>
        <Text style={styles.recentLocation} numberOfLines={1}>
          {property.area}, {property.city}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>PropBay</Text>
          <Text style={styles.tagline}>Your Premium Property Partner</Text>
        </View>
        <View style={styles.headerActions}>
          {user?.role === 'owner' && (
            <Pressable
              style={styles.addButton}
              onPress={() => router.push('/create-property' as any)}
            >
              <Plus size={20} color={Colors.gold} />
            </Pressable>
          )}
          <Pressable style={styles.likeButton}>
            <Heart size={20} color={Colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: heroScale }] }}>
          <Pressable
            style={styles.heroContainer}
            onPress={() => router.push('/(tabs)/explore' as any)}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6199f3e209?q=80&w=1200&auto=format&fit=crop' }}
              style={styles.heroImage}
              contentFit="cover"
              transition={500}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.9)']}
              style={styles.heroOverlay}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>FEATURED LUXURY</Text>
              </View>
              <Text style={styles.heroTitle}>The Gold Standard{'\n'}of Architecture</Text>
              <Text style={styles.heroSubtitle}>
                Curated collection of the most prestigious properties in the city.
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.quickActions, { opacity: fadeAnim }]}>
          {/* Post Luxury Listing - Only for Pro Partner */}
          {user?.role === 'owner' && (
            <Pressable style={styles.quickCard} onPress={() => router.push('/create-property' as any)}>
              <Building size={24} color={Colors.gold} />
              <Text style={styles.quickLabel}>POST LUXURY{'\n'}LISTING</Text>
            </Pressable>
          )}
          <Pressable style={[styles.quickCard, user?.role !== 'owner' && styles.quickCardFull]} onPress={() => router.push('/(tabs)/explore' as any)}>
            <BedDouble size={24} color={Colors.gold} />
            <Text style={styles.quickLabel}>PREMIUM{'\n'}STAYS</Text>
          </Pressable>
        </Animated.View>

        {featuredProperties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Properties</Text>
              <Pressable onPress={() => router.push('/(tabs)/explore' as any)}>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {featuredProperties.map(renderFeaturedCard)}
            </ScrollView>
          </View>
        )}

        {recentProperties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Listings</Text>
              <Pressable onPress={() => router.push('/(tabs)/explore' as any)}>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {recentProperties.map(renderRecentCard)}
            </ScrollView>
          </View>
        )}

        <View style={styles.footerBrand}>
          <Text style={styles.footerText}>SINCE 2026</Text>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  likeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    marginHorizontal: 20,
    height: 380,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 28,
  },
  heroBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start' as const,
    marginBottom: 14,
  },
  heroBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row' as const,
    gap: 14,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 120,
    justifyContent: 'space-between',
  },
  quickCardFull: {
    flex: 1,
    width: '100%',
  },
  quickLabel: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    lineHeight: 16,
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  seeAll: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 14,
  },
  featuredCard: {
    width: SCREEN_WIDTH * 0.7,
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  videoBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  videoBadgeText: {
    color: Colors.gold,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  featuredPrice: {
    color: Colors.gold,
    fontSize: 20,
    fontWeight: '800' as const,
  },
  featuredTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  featuredLocation: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 4,
  },
  featuredLocationText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  recentCard: {
    width: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentImage: {
    width: '100%',
    height: 120,
  },
  recentContent: {
    padding: 12,
  },
  recentPrice: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  recentTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  recentLocation: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  footerBrand: {
    alignItems: 'center' as const,
    marginTop: 48,
  },
  footerText: {
    color: 'rgba(212,175,55,0.3)',
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: '700' as const,
  },
});
