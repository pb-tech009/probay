import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Crown, Home, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { authAPI } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';

export default function RoleSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { setUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'owner' | 'tenant' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: 'owner' | 'tenant') => {
    setSelectedRole(role);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinue = async () => {
    if (!selectedRole || !userId) return;

    setLoading(true);
    try {
      const updatedUser = await authAPI.selectRole(userId, selectedRole);
      setUser(updatedUser);
      router.replace('/tabs/home' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to select role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>
              Select how you want to use PropBay
            </Text>
          </View>

          <View style={styles.rolesContainer}>
            <Pressable
              style={[
                styles.roleCard,
                selectedRole === 'owner' && styles.roleCardSelected,
              ]}
              onPress={() => handleRoleSelect('owner')}
            >
              <View style={[
                styles.roleIcon,
                { backgroundColor: selectedRole === 'owner' ? Colors.goldMuted : Colors.surface }
              ]}>
                <Crown size={32} color={selectedRole === 'owner' ? Colors.gold : Colors.textSecondary} />
              </View>
              <Text style={[
                styles.roleTitle,
                selectedRole === 'owner' && styles.roleTitleSelected
              ]}>
                Pro Partner
              </Text>
              <Text style={styles.roleDescription}>
                Post properties, manage leads, and connect with tenants
              </Text>
              <View style={styles.roleFeatures}>
                <Text style={styles.featureText}>• Post unlimited properties</Text>
                <Text style={styles.featureText}>• Lead management dashboard</Text>
                <Text style={styles.featureText}>• Direct tenant communication</Text>
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.roleCard,
                selectedRole === 'tenant' && styles.roleCardSelected,
              ]}
              onPress={() => handleRoleSelect('tenant')}
            >
              <View style={[
                styles.roleIcon,
                { backgroundColor: selectedRole === 'tenant' ? Colors.blueMuted : Colors.surface }
              ]}>
                <Home size={32} color={selectedRole === 'tenant' ? Colors.blue : Colors.textSecondary} />
              </View>
              <Text style={[
                styles.roleTitle,
                selectedRole === 'tenant' && styles.roleTitleSelected
              ]}>
                Elite Member
              </Text>
              <Text style={styles.roleDescription}>
                Browse properties, save favorites, and connect with owners
              </Text>
              <View style={styles.roleFeatures}>
                <Text style={styles.featureText}>• Browse all properties</Text>
                <Text style={styles.featureText}>• Advanced search filters</Text>
                <Text style={styles.featureText}>• Save favorite properties</Text>
              </View>
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.continueButton,
              !selectedRole && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedRole || loading}
          >
            <LinearGradient
              colors={selectedRole ? [Colors.gold, '#D4AF37'] : [Colors.border, Colors.border]}
              style={styles.continueGradient}
            >
              {loading ? (
                <ActivityIndicator color={selectedRole ? '#000' : Colors.textSecondary} />
              ) : (
                <>
                  <Text style={[
                    styles.continueText,
                    { color: selectedRole ? '#000' : Colors.textSecondary }
                  ]}>
                    Continue
                  </Text>
                  <ArrowRight size={20} color={selectedRole ? '#000' : Colors.textSecondary} />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center' as const,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginTop: 8,
  },
  rolesContainer: {
    gap: 20,
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  roleCardSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.surface,
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  roleTitleSelected: {
    color: Colors.gold,
  },
  roleDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  roleFeatures: {
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 18,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});