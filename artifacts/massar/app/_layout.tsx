import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LanguageProvider } from '@/context/LanguageContext';
import { PricingProvider } from '@/context/PricingContext';
import { setBaseUrl } from '@workspace/api-client-react';
import { I18nManager, View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { useColors } from '@/hooks/useColors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
setBaseUrl(process.env.EXPO_PUBLIC_API_URL || 'https://massar-api.onrender.com');

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as any) === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back', headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="driver" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SocketProvider>
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <LanguageProvider>
                    <PricingProvider>
                      <AuthGuard>
                        <RootLayoutNav />
                      </AuthGuard>
                    </PricingProvider>
                  </LanguageProvider>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </SocketProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
