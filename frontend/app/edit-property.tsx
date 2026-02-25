import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Save } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { API_BASE_URL } from '@/constants/api';

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch property data
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/property/${id}`);
      if (!response.ok) throw new Error('Property not found');
      return response.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (property) {
      setTitle(property.title || '');
      setPrice(property.price?.toString() || '');
      setDescription(property.description || '');
      setAddress(property.address || '');
    }
  }, [property]);

  const handleSave = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert('Error', 'Title and Price are required');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/property/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          price: Number(price),
          description: description.trim(),
          address: address.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || 'Failed to update property');
      }

      Alert.alert('Success', 'Property updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setSaving(true);
            try {
              const response = await fetch(`${API_BASE_URL}/property/delete/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Failed to delete property');
              }

              Alert.alert('Success', 'Property deleted successfully', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/profile' as any) }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete property');
              setSaving(false);
            }
          },
        },
      ]
    );
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

  if (!property) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Property not found</Text>
        <Text style={styles.errorSubtext}>This property may have been deleted</Text>
        <Pressable onPress={() => router.back()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Edit Property</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Property Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter property title"
              placeholderTextColor={Colors.textDark}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Enter price"
              placeholderTextColor={Colors.textDark}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter full address"
              placeholderTextColor={Colors.textDark}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter property description"
              placeholderTextColor={Colors.textDark}
              multiline
              numberOfLines={5}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Note: Images, amenities, and other details can be updated from the full property management dashboard.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={saving}
        >
          <Text style={styles.deleteButtonText}>Delete Property</Text>
        </Pressable>

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={saving ? [Colors.textDark, Colors.textDark] : [Colors.gold, Colors.goldDark]}
            style={styles.saveButtonGradient}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Save size={18} color="#000" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
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
    paddingHorizontal: 40,
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
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
    paddingBottom: 100,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  infoBox: {
    backgroundColor: Colors.blueMuted,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
    marginTop: 12,
  },
  infoText: {
    color: Colors.blue,
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    paddingHorizontal: 20,
    flexDirection: 'row' as const,
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: Colors.redMuted,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  deleteButtonText: {
    color: Colors.red,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  saveButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 16,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  errorText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  errorButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.gold,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#000',
    fontWeight: '700' as const,
  },
});
