import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Animated,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Phone, ShieldCheck, ArrowRight, ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const { requestOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [showOtp, setShowOtp] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateOtpIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleRequestOtp = useCallback(async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await requestOtp.mutateAsync(phone);
      setShowOtp(true);
      animateOtpIn();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send OTP');
    }
  }, [phone, requestOtp, animateOtpIn]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 4-digit OTP');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await verifyOtp.mutateAsync({ phoneNumber: phone, otp });
      if (result.user.role === 'none') {
        router.replace({ pathname: '/role-selection' as any, params: { userId: result.user._id } });
      } else {
        router.replace('/tabs' as any);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Invalid OTP');
    }
  }, [otp, phone, verifyOtp]);

  const handleButtonPressIn = useCallback(() => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  }, [buttonScale]);

  const handleButtonPressOut = useCallback(() => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  }, [buttonScale]);

  const isLoading = requestOtp.isPending || verifyOtp.isPending;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <LinearGradient
        colors={['rgba(212,175,55,0.08)', 'transparent']}
        style={styles.gradientTop}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {showOtp && (
              <Pressable onPress={() => { setShowOtp(false); setOtp(''); }} style={styles.backButton}>
                <ChevronLeft size={24} color={Colors.textSecondary} />
              </Pressable>
            )}

            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[Colors.gold, Colors.goldLight]}
                style={styles.logoBg}
              >
                <Text style={styles.logoText}>P</Text>
              </LinearGradient>
            </View>

            <Text style={styles.brandName}>PropBay</Text>
            <Text style={styles.brandTagline}>Your Premium Property Partner</Text>
          </Animated.View>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.formTitle}>
              {showOtp ? 'Verify Your Number' : 'Welcome Back'}
            </Text>
            <Text style={styles.formSubtitle}>
              {showOtp
                ? `We sent a code to +91 ${phone}`
                : 'Sign in with your mobile number'}
            </Text>

            {!showOtp ? (
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Phone size={18} color={Colors.gold} />
                </View>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  placeholderTextColor={Colors.textDark}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                  testID="phone-input"
                />
              </View>
            ) : (
              <View style={styles.otpContainer}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <ShieldCheck size={18} color={Colors.gold} />
                  </View>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="Enter 4-digit OTP"
                    placeholderTextColor={Colors.textDark}
                    keyboardType="number-pad"
                    maxLength={4}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                    testID="otp-input"
                  />
                </View>
                <Pressable onPress={() => { setShowOtp(false); setOtp(''); }}>
                  <Text style={styles.changeNumber}>Change number?</Text>
                </Pressable>
              </View>
            )}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Pressable
                onPress={showOtp ? handleVerifyOtp : handleRequestOtp}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={isLoading}
                testID="submit-button"
              >
                <LinearGradient
                  colors={[Colors.gold, Colors.goldDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <>
                      <Text style={styles.submitText}>
                        {showOtp ? 'Verify & Login' : 'Get OTP'}
                      </Text>
                      <ArrowRight size={18} color="#000" />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>ESTABLISHED 2026</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientTop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 48,
  },
  backButton: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    padding: 4,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#000',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  formContainer: {
    gap: 20,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: -12,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  prefix: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '700' as const,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  otpContainer: {
    gap: 12,
  },
  otpInput: {
    letterSpacing: 8,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  changeNumber: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center' as const,
    letterSpacing: 0.5,
  },
  submitButton: {
    height: 56,
    borderRadius: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  submitText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center' as const,
  },
  footerText: {
    color: Colors.textDark,
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: '600' as const,
  },
});
