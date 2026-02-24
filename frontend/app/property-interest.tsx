import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  Alert, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, IndianRupee, Calendar, Users, Briefcase, MessageSquare } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { leadAPI } from '@/services/api';

export default function PropertyInterestScreen() {
  const { propertyId, propertyTitle } = useLocalSearchParams<{ propertyId: string; propertyTitle: string }>();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [budget, setBudget] = useState('');
  const [moveInDate, setMoveInDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [familyType, setFamilyType] = useState<'bachelor' | 'family' | 'couple'>('bachelor');
  const [jobType, setJobType] = useState<'student' | 'working' | 'business' | 'other'>('working');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!budget || !moveInDate) {
      Alert.alert('Required Fields', 'Please fill budget and move-in date');
      return;
    }

    if (!token || !propertyId) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      await leadAPI.createLead(token, {
        propertyId,
        budget: Number(budget),
        moveInDate: moveInDate.toISOString(),
        familyType,
        jobType,
        tenantNotes: message,
      });

      Alert.alert(
        'Interest Submitted! 🎉',
        'Your request has been sent to the owner. You will be notified when they respond.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit interest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <LinearGradient colors={[Colors.surface, Colors.background]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.white} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Show Interest</Text>
          <Text style={styles.headerSubtitle}>{propertyTitle || 'Property'}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Your Budget</Text>
          <View style={styles.inputContainer}>
            <IndianRupee size={18} color={Colors.gold} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your budget"
              placeholderTextColor={Colors.textSecondary}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Move-in Date</Text>
          <Pressable style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
            <Calendar size={18} color={Colors.gold} style={styles.inputIcon} />
            <Text style={styles.dateText}>{moveInDate.toLocaleDateString('en-IN')}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={moveInDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setMoveInDate(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Family Type</Text>
          <View style={styles.optionsRow}>
            {(['bachelor', 'family', 'couple'] as const).map((type) => (
              <Pressable
                key={type}
                style={[styles.optionButton, familyType === type && styles.optionButtonActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFamilyType(type);
                }}
              >
                <Users size={16} color={familyType === type ? Colors.gold : Colors.textSecondary} />
                <Text style={[styles.optionText, familyType === type && styles.optionTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Profession</Text>
          <View style={styles.optionsRow}>
            {(['student', 'working', 'business', 'other'] as const).map((type) => (
              <Pressable
                key={type}
                style={[styles.optionButton, jobType === type && styles.optionButtonActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setJobType(type);
                }}
              >
                <Briefcase size={16} color={jobType === type ? Colors.gold : Colors.textSecondary} />
                <Text style={[styles.optionText, jobType === type && styles.optionTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Message to Owner (Optional)</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <MessageSquare size={18} color={Colors.gold} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell the owner about yourself..."
              placeholderTextColor={Colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Your contact will be shared with the owner only after they accept your request
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient colors={[Colors.gold, '#D4AF37']} style={styles.submitGradient}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Interest</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  textAreaContainer: {
    alignItems: 'flex-start' as const,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top' as const,
  },
  optionsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.gold,
  },
  infoBox: {
    backgroundColor: Colors.blueMuted,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.blue,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
});
