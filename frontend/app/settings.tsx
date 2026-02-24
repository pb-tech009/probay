import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Bell, Shield, Eye, HelpCircle, FileText,
  Globe, Smartphone, Moon, Volume2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleToggle = (setter: (value: boolean) => void, currentValue: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!currentValue);
  };

  const handleMenuPress = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (label) {
      case 'Privacy Policy':
        // Navigate to privacy policy
        break;
      case 'Terms of Service':
        // Navigate to terms
        break;
      case 'Help & Support':
        // Navigate to help
        break;
      case 'About':
        Alert.alert('PropBay', 'Version 1.0.0\nBuilt with React Native');
        break;
    }
  };

  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          icon: <Bell size={20} color={Colors.blue} />,
          label: 'Push Notifications',
          type: 'switch' as const,
          value: pushNotifications,
          onToggle: () => handleToggle(setPushNotifications, pushNotifications),
        },
        {
          icon: <Volume2 size={20} color={Colors.orange} />,
          label: 'Sound',
          type: 'switch' as const,
          value: soundEnabled,
          onToggle: () => handleToggle(setSoundEnabled, soundEnabled),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: <Moon size={20} color={Colors.purple} />,
          label: 'Dark Mode',
          type: 'switch' as const,
          value: darkMode,
          onToggle: () => handleToggle(setDarkMode, darkMode),
        },
        {
          icon: <Globe size={20} color={Colors.green} />,
          label: 'Language',
          type: 'menu' as const,
          value: 'English',
          onPress: () => handleMenuPress('Language'),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: <Shield size={20} color={Colors.green} />,
          label: 'Privacy Settings',
          type: 'menu' as const,
          onPress: () => handleMenuPress('Privacy Settings'),
        },
        {
          icon: <Eye size={20} color={Colors.textSecondary} />,
          label: 'Profile Visibility',
          type: 'menu' as const,
          value: 'Public',
          onPress: () => handleMenuPress('Profile Visibility'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={20} color={Colors.blue} />,
          label: 'Help & Support',
          type: 'menu' as const,
          onPress: () => handleMenuPress('Help & Support'),
        },
        {
          icon: <FileText size={20} color={Colors.textSecondary} />,
          label: 'Privacy Policy',
          type: 'menu' as const,
          onPress: () => handleMenuPress('Privacy Policy'),
        },
        {
          icon: <FileText size={20} color={Colors.textSecondary} />,
          label: 'Terms of Service',
          type: 'menu' as const,
          onPress: () => handleMenuPress('Terms of Service'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: <Smartphone size={20} color={Colors.gold} />,
          label: 'App Version',
          type: 'menu' as const,
          value: '1.0.0',
          onPress: () => handleMenuPress('About'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.settingItemLast,
                  ]}
                  onPress={item.type === 'menu' ? item.onPress : undefined}
                  disabled={item.type === 'switch'}
                >
                  <View style={styles.settingLeft}>
                    {item.icon}
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.settingRight}>
                    {item.type === 'switch' ? (
                      <Switch
                        value={item.value as boolean}
                        onValueChange={item.onToggle}
                        trackColor={{ false: Colors.border, true: Colors.goldMuted }}
                        thumbColor={(item.value as boolean) ? Colors.gold : Colors.textDark}
                      />
                    ) : (
                      item.value && (
                        <Text style={styles.settingValue}>{item.value}</Text>
                      )
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
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
    alignItems: 'center' as const,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  settingRight: {
    alignItems: 'flex-end' as const,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});