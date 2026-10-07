import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitchButton } from '@/components/LanguageSwitchButton';

export default function PassengerLoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();

  const handleLogin = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || !password) {
      Alert.alert(t('loginFailed'), t('enterPhoneAndPassword'));
      return;
    }

    setIsSubmitting(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await login({ phone: cleanPhone, password });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    } catch (error: any) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('loginFailed'),
        error?.message || t('invalidCredentials'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(insets.top, 16),
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          accessibilityLabel={t('back')}
        >
          <Feather
            name={isRTL ? 'arrow-right' : 'arrow-left'}
            size={20}
            color={colors.ink}
          />
        </Pressable>

        <LanguageSwitchButton />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header & Logo */}
          <View style={styles.header}>
            <View style={[styles.logoWrap, { shadowColor: colors.primary }]}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>

            <View style={[styles.roleBadge, { backgroundColor: colors.goldSoft }]}>
              <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                {t('passengerRole')}
              </Text>
            </View>

            <Text
              style={[
                styles.title,
                {
                  color: colors.ink,
                  textAlign: 'center',
                },
              ]}
            >
              {t('passengerLoginTitle')}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.mutedForeground,
                  textAlign: 'center',
                },
              ]}
            >
              {t('passengerLoginSub')}
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.labelRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Feather name="phone" size={14} color={colors.primary} />
                <Text style={[styles.label, { color: colors.ink }]}>
                  {t('phoneNumber')}
                </Text>
              </View>

              <View
                style={[
                  styles.phoneInputWrap,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <View style={[styles.countryBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.countryText, { color: colors.ink }]}>🇯🇴 +962</Text>
                </View>

                <TextInput
                  style={[
                    styles.inputField,
                    {
                      color: colors.ink,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('phonePlaceholder')}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.labelRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Feather name="lock" size={14} color={colors.primary} />
                <Text style={[styles.label, { color: colors.ink }]}>
                  {t('password')}
                </Text>
              </View>

              <View
                style={[
                  styles.passwordInputWrap,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      color: colors.ink,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('passwordPlaceholder')}
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />

                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  accessibilityLabel="Toggle password visibility"
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: colors.primary,
                  opacity: isSubmitting ? 0.7 : pressed ? 0.88 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.submitButtonText, { color: colors.primaryForeground }]}>
                  {t('logIn')}
                </Text>
              )}
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <View
            style={[
              styles.footerRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              {t('dontHaveAccount')}
            </Text>
            <Link href={"/(auth)/passenger-register" as any} asChild>
              <Pressable>
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  {t('signUp')}
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Switch to Captain */}
          <View style={styles.roleSwitchWrap}>
            <Text style={[styles.switchPrompt, { color: colors.mutedForeground }]}>
              {t('areYouCaptain')}
            </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/driver-login' as any)}
              style={({ pressed }) => [
                styles.switchBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.switchBtnText, { color: colors.gold }]}>
                {t('switchToCaptain')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  phoneInputWrap: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
  },
  countryBadge: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  countryText: {
    fontSize: 13,
    fontWeight: '800',
  },
  passwordInputWrap: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    paddingHorizontal: 10,
  },
  eyeBtn: {
    padding: 6,
  },
  submitButton: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#F5841F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerRow: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
  },
  roleSwitchWrap: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  switchPrompt: {
    fontSize: 13,
    marginBottom: 8,
  },
  switchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  switchBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
