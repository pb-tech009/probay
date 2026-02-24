import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Building2, UserSearch, Crown, Star, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function RoleSelectionScreen() {
  const { user, selectRole } = useAuth();
  const ownerScale = useRef(new Animated.Value(1)).current;
  const tenantScale = useRef(new Animated.Value(1)).current;

  const handleSelect = useCallback(async (role: string) => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await selectRole.mutateAsync({ userId: user._id, role });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to select role');
    }
  }, [user, selectRole]);

  const animatePressIn = useCallback((anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 0.96, useNativeDriver: true }).start();
  }, []);

  const animatePressOut = useCallback((anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <LinearGradient
        colors={['rgba(212,175,55,0.06)', 'transparent']}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Path</Text>
          <Text style={styles.subtitle}>How would you like to use PropBay?</Text>
        </View>

        <View style={styles.cardsContainer}>
          <Animated.View style={{ transform: [{ scale: ownerScale }] }}>
            <Pressable
              onPress={() => handleSelect('owner')}
              onPressIn={() => animatePressIn(ownerScale)}
              onPressOut={() => animatePressOut(ownerScale)}
              disabled={selectRole.isPending}
              testID="owner-role"
            >
              <LinearGradient
                colors={['#1a1520', '#15101e']}
                style={styles.roleCard}
              >
                <View style={styles.roleIconBg}>
                  <Building2 size={28} color={Colors.gold} />
                </View>
                <View style={styles.roleInfo}>
                  <View style={styles.roleNameRow}>
                    <Text style={styles.roleName}>Pro Partner</Text>
                    <Crown size={16} color={Colors.gold} />
                  </View>
                  <Text style={styles.roleDesc}>List properties for Rent or Sale</Text>
                </View>
                <ChevronRight size={20} color={Colors.textDark} />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: tenantScale }] }}>
            <Pressable
              onPress={() => handleSelect('tenant')}
              onPressIn={() => animatePressIn(tenantScale)}
              onPressOut={() => animatePressOut(tenantScale)}
              disabled={selectRole.isPending}
              testID="tenant-role"
            >
              <LinearGradient
                colors={['#101520', '#0d1018']}
                style={styles.roleCard}
              >
                <View style={[styles.roleIconBg, { backgroundColor: Colors.blueMuted }]}>
                  <UserSearch size={28} color={Colors.blue} />
                </View>
                <View style={styles.roleInfo}>
                  <View style={styles.roleNameRow}>
                    <Text style={styles.roleName}>Elite Member</Text>
                    <Star size={16} color={Colors.blue} />
                  </View>
                  <Text style={styles.roleDesc}>Find your next dream home</Text>
                </View>
                <ChevronRight size={20} color={Colors.textDark} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        {selectRole.isPending && (
          <ActivityIndicator color={Colors.gold} style={styles.loader} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  cardsContainer: {
    gap: 16,
  },
  roleCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  roleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  roleNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  roleDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  loader: {
    marginTop: 24,
  },
});
