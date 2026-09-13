import React from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { calculateFare, usePricing } from '@/context/PricingContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { t, language, isRTL, setLanguage } = useLanguage();
  const { pricing, updatePricing } = usePricing();
  const router = useRouter();
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

        <Pressable onPress={() => router.push('/driver')} style={({ pressed }) => [styles.driverCard, pressed && { opacity: 0.82 }]}>
          <View style={styles.driverIcon}>
            <Feather name="truck" size={18} color={colors.gold} />
          </View>
          <View style={styles.driverCopy}>
            <Text style={styles.driverTitle}>{isRTL ? 'انضم إلى مسار كسائق' : 'Drive with Massar'}</Text>
            <Text style={styles.driverDescription}>{isRTL ? 'قدّم بياناتك ووثائق مركبتك للمراجعة.' : 'Submit your details and vehicle documents for review.'}</Text>
          </View>
          <Feather name="arrow-up-right" size={18} color={colors.gold} />
        </Pressable>

        <Pressable onPress={() => router.push('/driver-dashboard')} style={({ pressed }) => [styles.driverCard, { marginTop: 10, backgroundColor: colors.secondary }, pressed && { opacity: 0.82 }]}>
          <View style={[styles.driverIcon, { backgroundColor: colors.background }]}>
            <Feather name="grid" size={18} color={colors.petrol} />
          </View>
          <View style={styles.driverCopy}>
            <Text style={[styles.driverTitle, { color: colors.petrol }]}>{isRTL ? 'لوحة تحكم السائق' : 'Driver Dashboard'}</Text>
            <Text style={[styles.driverDescription, { color: colors.mutedForeground }]}>{isRTL ? 'عرض وقبول الرحلات المتاحة.' : 'View and accept available rides.'}</Text>
          </View>
          <Feather name="arrow-right" size={18} color={colors.petrol} />
        </Pressable>

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

        <Text style={styles.sectionLabel}>{t('riderPricing')}</Text>
        <View style={styles.pricingCard}>
          <View style={styles.pricingHeader}>
            <View style={styles.pricingIcon}>
              <Feather name="sliders" size={17} color={colors.gold} />
            </View>
            <View style={styles.pricingCopy}>
              <Text style={styles.pricingTitle}>{t('riderPricing')}</Text>
              <Text style={styles.pricingDescription}>{t('riderPricingDescription')}</Text>
            </View>
          </View>
          <PriceField
            label={t('baseSeatPrice')}
            value={pricing.baseFare}
            onChange={(value) => updatePricing({ baseFare: value })}
            colors={colors}
            styles={styles}
          />
          <View style={styles.pricingFieldRow}>
            <PriceField
              label={t('discountThreeSeats')}
              value={pricing.discount3}
              onChange={(value) => updatePricing({ discount3: value })}
              colors={colors}
              styles={styles}
            />
            <PriceField
              label={t('discountFourSeats')}
              value={pricing.discount4}
              onChange={(value) => updatePricing({ discount4: value })}
              colors={colors}
              styles={styles}
            />
          </View>
          <Text style={styles.previewTitle}>{t('pricingPreview')}</Text>
          <View style={styles.previewGrid}>
            {[1, 2, 3, 4].map((count) => {
              const quote = calculateFare(count, pricing);
              return (
                <View key={count} style={styles.previewItem}>
                  <Text style={styles.previewSeats}>{count === 4 ? t('wholeCar') : `${count} ${count === 1 ? t('seat') : t('seats')}`}</Text>
                  <Text style={styles.previewAmount}>{quote.total.toFixed(2)} JOD</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.pricingRule}>{t('pricingRule')}</Text>
        </View>

        <View style={styles.brandCard}>
          <Image source={require('@/assets/images/icon.png')} style={styles.brandMark} />
          <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>Massar, مسار</Text>
            <Text style={styles.brandText}>{t('tagline')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PriceField({
  label,
  value,
  onChange,
  colors,
  styles,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.priceField}>
      <Text style={styles.priceLabel}>{label}</Text>
      <View style={styles.priceInputWrap}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="decimal-pad"
          onChangeText={(text) => onChange(Number(text.replace(',', '.')) || 0)}
          style={styles.priceInput}
          value={value === 0 ? '' : String(value)}
          placeholder="0"
          placeholderTextColor={colors.mutedForeground}
        />
        <Text style={styles.currencyLabel}>JOD</Text>
      </View>
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
    phone: { color: '#cbd4e3', fontSize: 11, marginTop: 5 },
    driverCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.petrol, borderRadius: 20, padding: 15, marginTop: 14 },
    driverIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#2a354b', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
    driverCopy: { flex: 1 },
    driverTitle: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
    driverDescription: { color: '#cbd4e3', fontSize: 11, lineHeight: 16, marginTop: 3, paddingRight: 8 },
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
    brandMark: { width: 40, height: 40, borderRadius: 14, marginRight: 12 },
    brandCopy: { flex: 1 },
    brandTitle: { color: colors.petrol, fontSize: 14, fontWeight: '800' },
    brandText: { color: colors.mutedForeground, fontSize: 11, marginTop: 4 },
    pricingCard: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 15 },
    pricingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    pricingIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.petrolDark, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    pricingCopy: { flex: 1 },
    pricingTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
    pricingDescription: { color: colors.mutedForeground, fontSize: 11, lineHeight: 16, marginTop: 3 },
    pricingFieldRow: { flexDirection: 'row', gap: 10 },
    priceField: { flex: 1, marginBottom: 12 },
    priceLabel: { color: colors.mutedForeground, fontSize: 10, fontWeight: '700', marginBottom: 6 },
    priceInputWrap: { flexDirection: 'row', alignItems: 'center', minHeight: 43, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, paddingHorizontal: 10 },
    priceInput: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '800', paddingVertical: 8 },
    currencyLabel: { color: colors.mutedForeground, fontSize: 10, fontWeight: '800' },
    previewTitle: { color: colors.ink, fontSize: 11, fontWeight: '800', marginTop: 3, marginBottom: 8 },
    previewGrid: { flexDirection: 'row', gap: 6 },
    previewItem: { flex: 1, backgroundColor: colors.secondary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
    previewSeats: { color: colors.mutedForeground, fontSize: 9, textAlign: 'center' },
    previewAmount: { color: colors.petrol, fontSize: 11, fontWeight: '800', marginTop: 3 },
    pricingRule: { color: colors.mutedForeground, fontSize: 10, lineHeight: 15, marginTop: 10 },
  });