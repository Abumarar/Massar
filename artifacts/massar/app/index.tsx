import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

/**
 * Root index route ('/').
 * Dispatches cleanly to (tabs), driver-dashboard, or (auth) depending on authentication state.
 * Resolves the root route collision between (auth)/index and (tabs)/index.
 */
export default function RootIndexScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/(auth)' as any);
    } else if (user.role === 'captain') {
      router.replace('/driver-dashboard' as any);
    } else {
      router.replace('/(tabs)' as any);
    }
  }, [user, isLoading]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
