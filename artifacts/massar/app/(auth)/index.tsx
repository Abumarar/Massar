import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitchButton } from '@/components/LanguageSwitchButton';

export default function AuthSelectionScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();

  const handleSelectRole = (route: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar with Language Switcher */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(insets.top, 16),
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View style={styles.brandTag}>
          <Text style={[styles.brandTagText, { color: colors.gold }]}>MASSAR</Text>
          <Text style={[styles.brandTagSub, { color: colors.mutedForeground }]}>مسار</Text>
        </View>

        <LanguageSwitchButton />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.logoContainer, { shadowColor: colors.gold }]}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          <View style={[styles.badgePill, { backgroundColor: colors.goldSoft }]}>
            <Text style={[styles.badgeText, { color: colors.gold }]}>🇯🇴 {t('jordan')}</Text>
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
            {t('welcomeToMassar')}
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
            {t('welcomeSubtitle')}
          </Text>
        </View>

        <Text
          style={[
            styles.sectionPrompt,
            {
              color: colors.mutedForeground,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {t('chooseAccountType')}
        </Text>

        {/* Role Cards */}
        <View style={styles.optionsContainer}>
          {/* Passenger Card */}
          <Pressable
            style={({ pressed }) => [
              styles.roleCard,
              {
                backgroundColor: colors.card,
                borderColor: pressed ? colors.primary : colors.border,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
            onPress={() => handleSelectRole('/(auth)/passenger-login')}
          >
            <View
              style={[
                styles.cardHeaderRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: colors.goldSoft }]}>
                <Feather name="user" size={24} color={colors.primary} />
              </View>

              <View
                style={[
                  styles.roleTextCol,
                  { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.roleTitleRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Text style={[styles.roleTitle, { color: colors.ink }]}>
                    {t('passengerRole')}
                  </Text>
                  <View style={[styles.roleBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                      {isRTL ? 'تنقل مريح' : 'Rider'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.roleDesc,
                    {
                      color: colors.mutedForeground,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t('passengerRoleDesc')}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.actionRow,
                {
                  borderTopColor: colors.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>
                {t('logIn')} / {t('signUp')}
              </Text>
              <Feather
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={18}
                color={colors.primary}
              />
            </View>
          </Pressable>

          {/* Captain Card */}
          <Pressable
            style={({ pressed }) => [
              styles.roleCard,
              styles.captainBorder,
              {
                backgroundColor: colors.card,
                borderColor: pressed ? colors.gold : colors.border,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
            onPress={() => handleSelectRole('/(auth)/driver-login')}
          >
            <View
              style={[
                styles.cardHeaderRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: colors.petrolDark }]}>
                <Feather name="navigation" size={22} color={colors.gold} />
              </View>

              <View
                style={[
                  styles.roleTextCol,
                  { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.roleTitleRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Text style={[styles.roleTitle, { color: colors.ink }]}>
                    {t('captainRole')}
                  </Text>
                  <View style={[styles.roleBadge, { backgroundColor: colors.goldSoft }]}>
                    <Text style={[styles.roleBadgeText, { color: colors.gold }]}>
                      {isRTL ? 'كابتن معتمد' : 'Captain'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.roleDesc,
                    {
                      color: colors.mutedForeground,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t('captainRoleDesc')}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.actionRow,
                {
                  borderTopColor: colors.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Text style={[styles.actionText, { color: colors.gold }]}>
                {t('logIn')} / {t('signUp')}
              </Text>
              <Feather
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={18}
                color={colors.gold}
              />
            </View>
          </Pressable>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustFooter}>
          <View style={[styles.trustItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Feather name="shield" size={14} color={colors.gold} />
            <Text style={[styles.trustText, { color: colors.mutedForeground }]}>
              {t('verifiedCaptains')}
            </Text>
          </View>
          <View style={styles.trustDot} />
          <View style={[styles.trustItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Feather name="check-circle" size={14} color={colors.gold} />
            <Text style={[styles.trustText, { color: colors.mutedForeground }]}>
              {t('fairPricing')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTagText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandTagSub: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 86,
    height: 86,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  sectionPrompt: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  optionsContainer: {
    gap: 16,
  },
  roleCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  captainBorder: {
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  roleIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTextCol: {
    flex: 1,
  },
  roleTitleRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  roleTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  roleDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 12,
  },
  trustItem: {
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trustDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
});
