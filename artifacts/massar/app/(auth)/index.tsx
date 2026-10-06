import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function AuthSelectionScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
        <Text style={[styles.title, { color: colors.ink }]}>Welcome to Massar</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>How would you like to continue?</Text>
      </View>

      <View style={styles.optionsContainer}>
        <Pressable 
          style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          // @ts-ignore
          onPress={() => router.push('/(auth)/passenger-login')}
        >
          <Text style={[styles.optionTitle, { color: colors.ink }]}>Passenger</Text>
          <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>Book rides and travel anywhere</Text>
        </Pressable>

        <Pressable 
          style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          // @ts-ignore
          onPress={() => router.push('/(auth)/driver-login')}
        >
          <Text style={[styles.optionTitle, { color: colors.ink }]}>Captain (Driver)</Text>
          <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>Drive and earn with Massar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 60 },
  logo: { width: 100, height: 100, borderRadius: 24, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 18, textAlign: 'center' },
  optionsContainer: { gap: 20 },
  optionCard: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  optionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  optionDesc: { fontSize: 15, textAlign: 'center' },
});
