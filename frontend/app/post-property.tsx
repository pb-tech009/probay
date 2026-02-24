import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  ActivityIndicator, Alert, Switch, Platform,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Camera, MapPin, Zap, X, Video as VideoIcon,
  Home, Building2, Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { API_BASE_URL } from '@/constants/api';

const PROPERTY_TYPES = [
  'Apartment/Flat', 'Independent House/Villa', 'Penthouse', 'PG/Hostel',
  'Office Space', 'Shop/Showroom', 'Plot/Land', 'Warehouse/Godown',
  'Farm House', 'Industrial Plot',
];

const BHK_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK+', 'Studio', 'Room'];
const FURNISHING = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const AMENITIES = [
  'Parking', 'Lift', 'Security', 'Power Backup', 'Water 24x7',
  'Garden', 'Gym', 'Swimming Pool', 'CCTV', 'Fire Safety',
];

export default function PostPropertyScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const preSelectedType = params.preSelectedType as string;

  // Form state
  const [propertyType, setPropertyType] = useState(preSelectedType || 'Apartment/Flat');
  const [title, setTitle] = useState(`Premium ${preSelectedType || 'Property'}`);
  const [status, setStatus] = useState<'Rent' | 'Sell'>('Rent');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [area, setArea] = useState('');
  const [societyName, setSocietyName] = useState('');
  const [bhkType, setBhkType] = useState('2BHK');
  const [furnishing, setFurnishing] = useState('Unfurnished');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isDirectOwner, setIsDirectOwner] = useState(true);
  const [brokerageAmount, setBrokerageAmount] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [loading, setLoading] = useState(false);

  const pickImages = useCallback(async () => {
    if (images.length >= 5) {
      Alert.alert('Maximum Limit', 'You can upload maximum 5 images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5 - images.length,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(asset => asset.uri)]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [images]);

  const removeImage = useCallback((index: number) => {
    setImages(images.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [images]);

  const pickVideo = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.7,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      setLoading(true);
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      Alert.alert('Success', 'Location captured successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleAmenity = useCallback((amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const validateForm = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return false;
    }
    if (!price || Number(price) <= 0) {
      Alert.alert('Error', 'Valid price is required');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Address is required');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Error', 'At least one image is required');
      return false;
    }
    return true;
  }, [title, price, address, images]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      
      formData.append('title', title);
      formData.append('type', propertyType);
      formData.append('status', status);
      formData.append('price', price);
      formData.append('address', address);
      formData.append('city', city);
      formData.append('area', area);
      formData.append('description', description);
      formData.append('bhkType', bhkType);
      formData.append('furnishingStatus', furnishing);
      formData.append('isDirectOwner', String(isDirectOwner));
      formData.append('brokerageAmount', brokerageAmount || '0');
      formData.append('negotiationEnabled', String(negotiable));
      formData.append('amenities', JSON.stringify(selectedAmenities));
      
      if (societyName) formData.append('societyName', societyName);
      if (location) {
        formData.append('latitude', String(location.latitude));
        formData.append('longitude', String(location.longitude));
      }

      // Add images
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `image${index}.jpg`;
        formData.append('images', {
          uri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      });

      // Add video if exists
      if (video) {
        const videoFilename = video.split('/').pop() || 'video.mp4';
        formData.append('video', {
          uri: video,
          type: 'video/mp4',
          name: videoFilename,
        } as any);
      }

      const response = await fetch(`${API_BASE_URL}/property/create`, {
        method: 'POST',
        headers: {
          'x-auth-token': token!,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Property posted successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', data.msg || 'Failed to post property');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [validateForm, title, propertyType, status, price, address, city, area, description,
      bhkType, furnishing, isDirectOwner, brokerageAmount, negotiable, selectedAmenities,
      societyName, location, images, video, token]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Post Property</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Post Banner */}
        {preSelectedType && (
          <LinearGradient
            colors={['rgba(212,175,55,0.2)', 'rgba(212,175,55,0.05)']}
            style={styles.quickBanner}
          >
            <Zap size={20} color={Colors.gold} />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>⚡ Quick Post Mode</Text>
              <Text style={styles.bannerSubtitle}>
                Property type pre-selected: {propertyType}
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter property title"
            placeholderTextColor={Colors.textDark}
          />

          <Text style={styles.label}>Status *</Text>
          <View style={styles.radioGroup}>
            <Pressable
              style={[styles.radioButton, status === 'Rent' && styles.radioButtonActive]}
              onPress={() => setStatus('Rent')}
            >
              <Text style={[styles.radioText, status === 'Rent' && styles.radioTextActive]}>
                For Rent
              </Text>
            </Pressable>
            <Pressable
              style={[styles.radioButton, status === 'Sell' && styles.radioButtonActive]}
              onPress={() => setStatus('Sell')}
            >
              <Text style={[styles.radioText, status === 'Sell' && styles.radioTextActive]}>
                For Sale
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Price (₹) *</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price"
            placeholderTextColor={Colors.textDark}
            keyboardType="numeric"
          />
        </View>

        {/* Location Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Details</Text>

          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter complete address"
            placeholderTextColor={Colors.textDark}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Enter city"
            placeholderTextColor={Colors.textDark}
          />

          <Text style={styles.label}>Area</Text>
          <TextInput
            style={styles.input}
            value={area}
            onChangeText={setArea}
            placeholder="Enter area/locality"
            placeholderTextColor={Colors.textDark}
          />

          <Pressable style={styles.locationButton} onPress={getCurrentLocation}>
            <MapPin size={20} color={Colors.gold} />
            <Text style={styles.locationButtonText}>Get Current Location</Text>
          </Pressable>
          {location && (
            <Text style={styles.locationText}>
              📍 GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>

          <Text style={styles.label}>BHK Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipGroup}>
              {BHK_TYPES.map(type => (
                <Pressable
                  key={type}
                  style={[styles.chip, bhkType === type && styles.chipActive]}
                  onPress={() => setBhkType(type)}
                >
                  <Text style={[styles.chipText, bhkType === type && styles.chipTextActive]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.label}>Furnishing Status</Text>
          <View style={styles.radioGroup}>
            {FURNISHING.map(f => (
              <Pressable
                key={f}
                style={[styles.radioButton, furnishing === f && styles.radioButtonActive]}
                onPress={() => setFurnishing(f)}
              >
                <Text style={[styles.radioText, furnishing === f && styles.radioTextActive]}>
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your property..."
            placeholderTextColor={Colors.textDark}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>

          <Text style={styles.label}>Images * (1-5 required)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imageGrid}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} contentFit="cover" />
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <X size={16} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {images.length < 5 && (
                <Pressable style={styles.addImageButton} onPress={pickImages}>
                  <Camera size={24} color={Colors.gold} />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>

          <Text style={styles.label}>Video (optional)</Text>
          {video ? (
            <View style={styles.videoContainer}>
              <VideoIcon size={40} color={Colors.gold} />
              <Text style={styles.videoText}>Video selected</Text>
              <Pressable onPress={() => setVideo(null)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.uploadButton} onPress={pickVideo}>
              <VideoIcon size={20} color={Colors.gold} />
              <Text style={styles.uploadButtonText}>Upload Video</Text>
            </Pressable>
          )}
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {AMENITIES.map(amenity => (
              <Pressable
                key={amenity}
                style={[
                  styles.amenityChip,
                  selectedAmenities.includes(amenity) && styles.amenityChipActive,
                ]}
                onPress={() => toggleAmenity(amenity)}
              >
                {selectedAmenities.includes(amenity) && (
                  <Check size={14} color={Colors.gold} />
                )}
                <Text
                  style={[
                    styles.amenityText,
                    selectedAmenities.includes(amenity) && styles.amenityTextActive,
                  ]}
                >
                  {amenity}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>I am the direct owner</Text>
            <Switch
              value={isDirectOwner}
              onValueChange={setIsDirectOwner}
              trackColor={{ false: Colors.border, true: Colors.goldMuted }}
              thumbColor={isDirectOwner ? Colors.gold : Colors.textDark}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Price negotiable</Text>
            <Switch
              value={negotiable}
              onValueChange={setNegotiable}
              trackColor={{ false: Colors.border, true: Colors.goldMuted }}
              thumbColor={negotiable ? Colors.gold : Colors.textDark}
            />
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Post Property</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  quickBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    marginBottom: 24,
    gap: 12,
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gold,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  radioTextActive: { color: Colors.gold },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.gold,
    marginTop: 12,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: { color: Colors.gold },
  imageGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold,
  },
  videoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  videoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.red,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amenityChipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  amenityTextActive: { color: Colors.gold },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
