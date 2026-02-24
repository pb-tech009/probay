import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
// import * as Notifications from 'expo-notifications';
import { User } from '@/types';
import { API_BASE_URL } from '@/constants/api';
// import { registerForPushNotificationsAsync, saveFCMToken, addNotificationReceivedListener, addNotificationResponseReceivedListener } from '@/services/notificationService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  requestOtp: ReturnType<typeof useMutation>;
  verifyOtp: ReturnType<typeof useMutation>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const notificationListener = useRef<any>();
  // const responseListener = useRef<any>();

  useEffect(() => {
    loadStoredAuth();
    
    // Listen for token expiry errors
    const handleTokenExpiry = async () => {
      await logout();
    };

    // Store handler for global access
    (global as any).handleTokenExpiry = handleTokenExpiry;

    return () => {
      delete (global as any).handleTokenExpiry;
    };
  }, []);

  // Temporarily disabled - requires app rebuild for native modules
  // useEffect(() => {
  //   if (user && token) {
  //     registerPushNotifications();
  //   }

  //   notificationListener.current = addNotificationReceivedListener(notification => {
  //     console.log('📬 Notification received:', notification);
  //   });

  //   responseListener.current = addNotificationResponseReceivedListener(response => {
  //     console.log('👆 Notification tapped:', response);
  //   });

  //   return () => {
  //     if (notificationListener.current) {
  //       Notifications.removeNotificationSubscription(notificationListener.current);
  //     }
  //     if (responseListener.current) {
  //       Notifications.removeNotificationSubscription(responseListener.current);
  //     }
  //   };
  // }, [user, token]);

  // const registerPushNotifications = async () => {
  //   try {
  //     const pushToken = await registerForPushNotificationsAsync();
  //     if (pushToken && token) {
  //       await saveFCMToken(pushToken, token);
  //     }
  //   } catch (error) {
  //     console.error('Error registering push notifications:', error);
  //   }
  // };

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('user_data'),
      ]);

      if (storedToken && storedUser) {
        setTokenState(storedToken);
        setUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      await AsyncStorage.setItem('user_data', JSON.stringify(newUser));
    } else {
      await AsyncStorage.removeItem('user_data');
    }
  };

  const setToken = async (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      await AsyncStorage.setItem('auth_token', newToken);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
  };

  const logout = async () => {
    setUserState(null);
    setTokenState(null);
    await AsyncStorage.multiRemove(['auth_token', 'user_data']);
  };

  const requestOtp = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send OTP');
      }
      return response.json();
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid OTP');
      }
      const data = await response.json();
      await setToken(data.token);
      await setUser(data.user);
      return data;
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        logout,
        isLoading,
        requestOtp,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
