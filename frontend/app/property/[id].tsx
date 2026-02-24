import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated,
  Dimensions, Linking, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, Heart, Share2, MapPin, Bed, Sofa, BadgeCheck,
  Phone, MessageCircle, Calendar, HandCoins, Video,
  Shield, Droplets, Volume2, Star,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { getImageUrl, API_BASE_URL } from '@/constants/api';
import { Property } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { propertyAPI, leadAPI } from '@/services/api';
import { Lead } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [leadStatus, setLeadStatus] = useState<{ hasLead: boolean; lead?: Lead } | null>(null);
  const [loadingLead, setLoadingLead] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  // Fetch property data
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/property/${id}`);
      if (!response.ok) throw new Error('Property not found');
      return response.json() as Promise<Property>;
    },
    enabled: !!id,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    if (property && user) {
      setIsLiked(property.likes?.includes(user._id) || false);
    }
    if (property && token) {
      propertyAPI.trackView(token, property._id).catch(() => {});
      
      // Check lead status for contact lock
      if (user?.role === 'tenant') {
        leadAPI.checkLeadStatus(token, property._id)
          .then(setLeadStatus)
          .catch(() => setLeadStatus({ hasLead: false }))
          .finally(() => setLoadingLead(false));
      } else {
        setLoadingLead(false);
      }
    }
  }, [property]);

  const handleLike = async () => {
    if (!token || !property) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLiked(!isLiked);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    try {
      await propertyAPI.likeProperty(token, property._id);
    } catch (e) {
      setIsLiked(isLiked);
    }
  };

  const makeCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openWhatsApp = (phoneNumber: string) => {
    const url = `https://wa.me/91${phoneNumber}?text=Hi, I am interested in your property on PropBay.`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  const handleRequestContact = () => {
    if (!property) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/property-interest',
      params: {
        propertyId: property._id,
        propertyTitle: property.title,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading property...</Text>
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Property not found</Text>
        <Text style={styles.errorSubtext}>This property may have been deleted or is no longer available</Text>
        <Pressable onPress={() => router.back()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const isContactLocked = user?.role === 'tenant' && !leadStatus?.lead?.contactUnlocked;
  const hasActiveLead = leadStatus?.hasLead && leadStatus?.lead?.status !== 'expired';

  const images = property.images.length > 0
    ? property.images.map(getImageUrl)
    : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=800&auto=format&fit=crop'];

  const ownerName = property.owner?.name || 'Owner';
  const ownerPhone = property.owner?.phoneNumber || '';
  const displayPhone = isContactLocked ? '*** *** ****' : ownerPhone;

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
    return `₹${price}`;
  };

  const avgSafety = property.reviews.length > 0
    ? property.reviews.reduce((sum, r) => sum + r.safetyRating, 0) / property.reviews.length
    : 4.5;
  const avgWater = property.reviews.length > 0
    ? property.reviews.reduce((sum, r) => sum + r.waterRating, 0) / property.reviews.length
    : 4.0;
  const avgTraffic = property.reviews.length > 0
    ? property.reviews.reduce((sum, r) => sum + r.trafficRating, 0) / property.reviews.length
    : 3.0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
          >
            {images.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.heroImage} contentFit="cover" transition={300} />
            ))}
          </ScrollView>

          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <ChevronLeft size={22} color={Colors.white} />
            </Pressable>
            <View style={styles.topBarRight}>
              <Pressable style={styles.iconButton} onPress={() => {}}>
                <Share2 size={18} color={Colors.white} />
              </Pressable>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Pressable style={styles.iconButton} onPress={handleLike}>
                  <Heart size={18} color={isLiked ? Colors.red : Colors.white} fill={isLiked ? Colors.red : 'transparent'} />
                </Pressable>
              </Animated.View>
            </View>
          </View>

          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === currentImageIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <Animated.View style={[styles.contentSection, { opacity: fadeAnim }]}>
          <View style={styles.badgesRow}>
            {property.isDirectOwner && (
              <View style={styles.zeroBrokerageBadge}>
                <Text style={styles.zeroBrokerageText}>ZERO BROKERAGE</Text>
              </View>
            )}
            <View style={[styles.statusBadge, {
              backgroundColor: property.status === 'Rent' ? Colors.orangeMuted : Colors.tealMuted,
              borderColor: property.status === 'Rent' ? 'rgba(245,158,11,0.3)' : 'rgba(13,148,136,0.3)',
            }]}>
              <Text style={[styles.statusBadgeText, {
                color: property.status === 'Rent' ? Colors.orange : Colors.teal,
              }]}>
                FOR {property.status.toUpperCase()}
              </Text>
            </View>
            {property.isVerified && (
              <View style={styles.verifiedBadge}>
                <BadgeCheck size={12} color={Colors.blue} />
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            )}
          </View>

          <Text style={styles.price}>{formatPrice(property.price)}
            {property.status === 'Rent' && <Text style={styles.perMonth}> /month</Text>}
          </Text>

          {property.isDirectOwner && (
            <View style={styles.directOwnerRow}>
              <Star size={13} color={Colors.teal} />
              <Text style={styles.directOwnerText}>Directly listed by Owner - No Broker</Text>
            </View>
          )}

          <Text style={styles.propertyTitle}>{property.title}</Text>

          <View style={styles.featuresRow}>
            {property.bhkType && (
              <View style={styles.featureItem}>
                <Bed size={16} color={Colors.gold} />
                <Text style={styles.featureText}>{property.bhkType}</Text>
              </View>
            )}
            {property.furnishingStatus && (
              <View style={styles.featureItem}>
                <Sofa size={16} color={Colors.gold} />
                <Text style={styles.featureText}>{property.furnishingStatus}</Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{property.address}</Text>
          </View>

          {property.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{property.description}</Text>
            </View>
          )}

          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {(property.amenities.length > 0 ? property.amenities : ['Parking', 'Lift', 'WiFi', 'Gym']).map((amenity, i) => (
                <View key={i} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomBarInner}>
          <Image
            source={{ uri: property.owner?.profileImage || `https://i.pravatar.cc/150?u=${property.owner?._id}` }}
            style={styles.ownerAvatar}
            contentFit="cover"
          />
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerRole}>Pro Partner</Text>
            <Text style={styles.ownerName}>{ownerName}</Text>
            {isContactLocked && (
              <Text style={styles.lockedPhone}>🔒 {displayPhone}</Text>
            )}
          </View>
          
          {isContactLocked ? (
            <Pressable
              style={styles.requestContactButton}
              onPress={handleRequestContact}
            >
              <LinearGradient colors={[Colors.gold, '#D4AF37']} style={styles.requestContactGradient}>
                <Text style={styles.requestContactText}>
                  {hasActiveLead ? 'Request Sent' : 'Request Contact'}
                </Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <View style={styles.contactActions}>
              <Pressable
                style={[styles.contactButton, { backgroundColor: Colors.goldMuted }]}
                onPress={() => {}}
              >
                <MessageCircle size={18} color={Colors.gold} />
              </Pressable>
              <Pressable
                style={[styles.contactButton, { backgroundColor: Colors.greenMuted }]}
                onPress={() => ownerPhone && makeCall(ownerPhone)}
              >
                <Phone size={18} color={Colors.green} />
              </Pressable>
              <Pressable
                style={[styles.contactButton, { backgroundColor: 'rgba(37, 211, 102, 0.12)' }]}
                onPress={() => ownerPhone && openWhatsApp(ownerPhone)}
              >
                <MessageCircle size={18} color="#25D366" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
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
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 40,
  },
  errorText: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  errorSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center' as const,
    marginTop: 8,
    lineHeight: 20,
  },
  errorButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: Colors.gold,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#000',
    fontWeight: '700' as const,
    fontSize: 15,
  },
  imageContainer: {
    height: 380,
    position: 'relative' as const,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 380,
  },
  topBar: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topBarRight: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dots: {
    position: 'absolute' as const,
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: Colors.white,
    width: 20,
  },
  contentSection: {
    padding: 24,
  },
  badgesRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 16,
  },
  zeroBrokerageBadge: {
    backgroundColor: Colors.teal,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  zeroBrokerageText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: Colors.blueMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  verifiedBadgeText: {
    color: Colors.blue,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  price: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  perMonth: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  directOwnerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    marginTop: 8,
  },
  directOwnerText: {
    color: Colors.teal,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 14,
  },
  featuresRow: {
    flexDirection: 'row' as const,
    gap: 16,
    marginTop: 14,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  featureText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  locationRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 6,
    marginTop: 24,
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  descriptionSection: {
    marginTop: 24,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  descriptionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  amenitiesSection: {
    marginTop: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  amenityTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amenityText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  bottomBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  bottomBarInner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ownerRole: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  ownerName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  lockedPhone: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  requestContactButton: {
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  requestContactGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  requestContactText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  contactActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  contactButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
