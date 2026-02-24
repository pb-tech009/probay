import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If user is logged in, redirect to tabs (home)
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // If not logged in, redirect to login
  return <Redirect href="/login" />;
}
