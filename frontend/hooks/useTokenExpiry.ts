import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { Alert } from 'react-native';

export function useTokenExpiry() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    // Global error handler for token expiry
    const handleError = async (error: any) => {
      if (error?.message === 'TOKEN_EXPIRED') {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await logout();
                router.replace('/login' as any);
              },
            },
          ]
        );
      }
    };

    // This will be called by React Query on error
    return () => {};
  }, [logout, router]);
}
