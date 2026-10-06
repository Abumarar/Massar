import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function PassengerRegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const colors = useColors();

  const handleRegister = async () => {
    if (!fullName || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ fullName, phone, password, role: 'passenger' });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.ink }]}>Create Passenger Account</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Join Massar to book rides</Text>
      </View>

      <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.ink, borderColor: colors.border }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ahmad Al-Khatib"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

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
            placeholder="Create a password"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
          />
        </View>

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }, isSubmitting && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Sign up</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Already have an account?</Text>
        <Link href={"/(auth)/passenger-login" as any} asChild>
          <Pressable>
            <Text style={[styles.link, { color: colors.primary }]}>Log in</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40, marginTop: 40 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { padding: 20, borderRadius: 24, borderWidth: 1 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
  button: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 8, paddingBottom: 40 },
  footerText: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '800' },
});
