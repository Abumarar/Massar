import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
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
import { normalizePhone } from '@/utils/phone';

export default function DriverRegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();

  const handleRegister = async () => {
    const cleanName = fullName.trim();
    const cleanPhone = normalizePhone(phone);

    if (!cleanName || !cleanPhone || !password) {
      Alert.alert(t('registrationFailed'), t('fillAllFields'));
      return;
    }

    setIsSubmitting(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await register({ fullName: cleanName, phone: cleanPhone, password, role: 'captain' });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/driver-dashboard' as any);
    } catch (error: any) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('registrationFailed'), error?.message || t('invalidCredentials'));
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
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.roleBadge, { backgroundColor: colors.petrolDark }]}>
              <Feather name="navigation" size={12} color={colors.gold} />
              <Text style={[styles.roleBadgeText, { color: colors.gold }]}>
                {t('captainRole')}
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
              {t('captainRegisterTitle')}
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
              {t('captainRegisterSub')}
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
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.labelRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Feather name="user" size={14} color={colors.gold} />
                <Text style={[styles.label, { color: colors.ink }]}>
                  {t('fullName')}
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrap,
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
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t('fullNamePlaceholder')}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.labelRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Feather name="phone" size={14} color={colors.gold} />
                <Text style={[styles.label, { color: colors.ink }]}>
                  {t('phoneNumber')}
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrap,
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.labelRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Feather name="lock" size={14} color={colors.gold} />
                <Text style={[styles.label, { color: colors.ink }]}>
                  {t('password')}
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrap,
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
                  placeholder={t('passwordRegisterPlaceholder')}
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

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: colors.gold,
                  opacity: isSubmitting ? 0.7 : pressed ? 0.88 : 1,
                },
              ]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                  {t('signUpCaptain')}
                </Text>
              )}
            </Pressable>
          </View>

          {/* Already have an account */}
          <View
            style={[
              styles.footerRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              {t('alreadyHaveAccount')}
            </Text>
            <Link href={"/(auth)/driver-login" as any} asChild>
              <Pressable>
                <Text style={[styles.footerLink, { color: colors.gold }]}>
                  {t('logIn')}
                </Text>
              </Pressable>
            </Link>
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
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontSize: 25,
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
  inputWrap: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  countryBadge: {
    paddingHorizontal: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    marginRight: 6,
  },
  countryText: {
    fontSize: 13,
    fontWeight: '800',
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontSize: 15,
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
});
