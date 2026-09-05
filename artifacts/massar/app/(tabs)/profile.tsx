import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';

export default function ProfileScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { t, language, isRTL, setLanguage } = useLanguage();
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 100 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{t('yourSpace')}</Text>
        <Text style={styles.title}>{t('profile')}</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MA</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>Massar passenger</Text>
            <Text style={styles.phone}>{t('passengerMode')}</Text>
          </View>
          <Feather name="edit-2" size={17} color={colors.mutedForeground} />
        </View>

        <Text style={styles.sectionLabel}>{t('preferences')}</Text>
        <View style={styles.settingsCard}>
          <View style={[styles.languageRow, styles.settingBorder]}>
            <View style={styles.settingIcon}>
              <Feather name="globe" size={16} color={colors.petrol} />
            </View>
            <Text style={styles.settingLabel}>{t('language')}</Text>
            <View style={styles.languageToggle}>
              <Pressable
                accessibilityLabel={t('languageEnglish')}
                onPress={() => setLanguage('en')}
                style={[styles.languageOption, language === 'en' && styles.languageOptionActive]}
              >
                <Text style={[styles.languageOptionText, language === 'en' && styles.languageOptionTextActive]}>EN</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={t('languageArabic')}
                onPress={() => setLanguage('ar')}
                style={[styles.languageOption, language === 'ar' && styles.languageOptionActive]}
              >
                <Text style={[styles.languageOptionText, language === 'ar' && styles.languageOptionTextActive]}>ع</Text>
              </Pressable>
            </View>
          </View>
          <SettingRow icon="bell" label={t('notifications')} value="On" colors={colors} styles={styles} />
          <SettingRow icon="shield" label={t('safetyPrivacy')} value={t('protected')} colors={colors} styles={styles} last />
        </View>

        <View style={styles.brandCard}>
          <View style={styles.brandMark}>
            <Feather name="navigation" size={20} color={colors.gold} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>Massar, مسار</Text>
            <Text style={styles.brandText}>{t('intercityCare')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  colors,
  styles,
  last = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof createStyles>;
  last?: boolean;
}) {
  return (
    <View style={[styles.settingRow, !last && styles.settingBorder]}>
      <View style={styles.settingIcon}>
        <Feather name={icon} size={16} color={colors.petrol} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
      <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 18, paddingTop: 20 },
    eyebrow: { color: colors.petrol, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
    title: { color: colors.ink, fontSize: 30, fontWeight: '700', marginTop: 7, letterSpacing: -0.6 },
    profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.petrolDark, borderRadius: 22, padding: 17, marginTop: 25 },
    avatar: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: colors.petrolDark, fontSize: 17, fontWeight: '800' },
    profileCopy: { flex: 1 },
    name: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
    phone: { color: '#b8d9d0', fontSize: 11, marginTop: 5 },
    sectionLabel: { color: colors.mutedForeground, fontSize: 11, fontWeight: '700', marginTop: 28, marginBottom: 10, letterSpacing: 0.3 },
    settingsCard: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 },
    settingRow: { flexDirection: 'row', alignItems: 'center', minHeight: 61 },
    languageRow: { flexDirection: 'row', alignItems: 'center', minHeight: 61 },
    settingBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    settingIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
    settingLabel: { color: colors.ink, fontSize: 13, fontWeight: '600', flex: 1 },
    settingValue: { color: colors.mutedForeground, fontSize: 11, marginRight: 8 },
    languageToggle: { flexDirection: 'row', backgroundColor: colors.secondary, borderRadius: 10, padding: 3, gap: 2 },
    languageOption: { minWidth: 31, height: 27, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    languageOptionActive: { backgroundColor: colors.petrol },
    languageOptionText: { color: colors.mutedForeground, fontSize: 10, fontWeight: '800' },
    languageOptionTextActive: { color: colors.primaryForeground },
    brandCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, backgroundColor: colors.secondary, marginTop: 18 },
    brandMark: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.petrol, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    brandCopy: { flex: 1 },
    brandTitle: { color: colors.petrol, fontSize: 14, fontWeight: '800' },
    brandText: { color: colors.mutedForeground, fontSize: 11, marginTop: 4 },
  });