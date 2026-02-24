import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Alert } from "react-native";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

// Create query client with global error handler
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on token expiry
        if (error?.message === 'TOKEN_EXPIRED') {
          return false;
        }
        return failureCount < 2;
      },
      onError: (error: any) => {
        if (error?.message === 'TOKEN_EXPIRED') {
          console.log('Token expired detected in query');
        }
      },
    },
    mutations: {
      onError: (error: any) => {
        if (error?.message === 'TOKEN_EXPIRED') {
          console.log('Token expired detected in mutation');
        }
      },
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.textPrimary,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="role-selection" options={{ headerShown: false }} />
      <Stack.Screen name="property-detail" options={{ headerShown: false }} />
      <Stack.Screen name="property-interest" options={{ headerShown: false }} />
      <Stack.Screen name="post-property" options={{ headerShown: false }} />
      <Stack.Screen name="broker-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="liked-properties" options={{ headerShown: false }} />
      <Stack.Screen name="people-follow" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
