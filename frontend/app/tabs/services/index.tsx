import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Home, School, MapPin, Store, Building2, Warehouse,
  Crown, TreePine, Castle, Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

interface PropertyTypeService {
  icon: React.ReactNode;
  title: string;
  propertyType: string;
  color: string;
  bgColor: string;
}

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const isProPartner = user?.role === 'owner' || user?.role === 'broker';

  const propertyServices: PropertyTypeService[] = [
    {
      icon: <Home size={22} color={Colors.blue} />,
      title: 'Resident',
      propertyType: 'Apartment/Flat',
      color: Colors.blue,
      bgColor: Colors.blueMuted,
    },
    {
      icon: <School size={22} color={Colors.red} />,
      title: 'PG/Hostel',
      propertyType: 'PG/Hostel',
      color: Colors.red,
      bgColor: Colors.redMuted,
    },
    {
      icon: <MapPin size={22} color={Colors.green} />,
      title: 'Plots',
      propertyType: 'Plot/Land',
      color: Colors.green,
      bgColor: Colors.greenMuted,
    },
    {
      icon: <Store size={22} color={Colors.orange} />,
      title: 'Shops',
      propertyType: 'Shop/Showroom',
      color: Colors.orange,
      bgColor: Colors.orangeMuted,
    },
    {
      icon: <Building2 size={22} color="#A855F7" />,
      title: 'Offices',
      propertyType: 'Office Space',
      color: '#A855F7',
      bgColor: 'rgba(168, 85, 247, 0.12)',
    },
    {
      icon: <Warehouse size={22} color={Colors.textSecondary} />,
      title: 'Warehouse',
      propertyType: 'Warehouse',
      color: Colors.textSecondary,
      bgColor: 'rgba(156, 163, 175, 0.12)',
    },
    {
      icon: <Crown size={22} color="#EC4899" />,
      title: 'Penthouses',
      propertyType: 'Apartment/Flat',
      color: '#EC4899',
      bgColor: 'rgba(236, 72, 153, 0.12)',
    },
    {
      icon: <TreePine size={22} color={Colors.teal} />,
      title: 'Farm House',
      propertyType: 'Farm House',
      color: Colors.teal,
      bgColor: Colors.tealMuted,
    },
    {
      icon: <Castle size={22} color={Colors.gold} />,
      title: 'Villas',
      propertyType: 'Independent House/Villa',
      color: Colors.gold,
      bgColor: Colors.goldMuted,
    },
  ];

  const handleServicePress = useCallback((propertyType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isProPartner) {
      // PRO PARTNER → Open property posting form with pre-selected type
      router.push({
        pathname: '/post-property',
        params: { preSelectedType: propertyType },
      });
    } else {
      // ELITE MEMBER → Navigate to Explore tab with filter
      router.push({
        pathname: '/(tabs)/explore',
        params: { filterType: propertyType },
      });
    }
  }, [isProPartner]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>
            {isProPartner ? 'Quick Post' : 'All Services'}
          </Text>
          {isProPartner && (
            <View style={styles.proBadge}>
              <Zap size={10} color="#000" />
              <Text style={styles.proBadgeText}>PRO PARTNER</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          {isProPartner 
            ? 'Select property type to post instantly'
            : 'Browse property categories'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {propertyServices.map((service, index) => (
            <Pressable
              key={index}
              style={styles.serviceCard}
              onPress={() => handleServicePress(service.propertyType)}
              testID={`service-${index}`}
            >
              <View style={[styles.serviceIcon, { backgroundColor: service.bgColor }]}>
                {service.icon}
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
            </Pressable>
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  proBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.gold,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#000',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 14,
  },
  serviceCard: {
    width: '31%' as any,
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 10,
  },
  serviceTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
});
