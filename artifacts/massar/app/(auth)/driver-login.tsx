import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function DriverLoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const colors = useColors();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter your phone number and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ phone, password });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
        <Text style={[styles.title, { color: colors.ink }]}>Captain Login</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Log in to drive and earn</Text>
      </View>

      <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.ink, borderColor: colors.border }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+962 7..."
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.ink, borderColor: colors.border }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
          />
        </View>

        <Pressable
          style={[styles.button, { backgroundColor: colors.gold }, isSubmitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: '#fff' }]}>Log in</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Don't have a captain account?</Text>
        <Link href={"/(auth)/driver-register" as any} asChild>
          <Pressable>
            <Text style={[styles.link, { color: colors.gold }]}>Sign up as Captain</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { padding: 20, borderRadius: 24, borderWidth: 1 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
  button: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 8 },
  footerText: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '800' },
});
