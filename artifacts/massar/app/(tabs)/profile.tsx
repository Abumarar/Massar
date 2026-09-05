import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 100 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>YOUR SPACE</Text>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MA</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>Massar passenger</Text>
            <Text style={styles.phone}>Passenger mode · Prototype</Text>
          </View>
          <Feather name="edit-2" size={17} color={colors.mutedForeground} />
        </View>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.settingsCard}>
          <SettingRow icon="globe" label="Language" value="English / العربية" colors={colors} styles={styles} />
          <SettingRow icon="bell" label="Notifications" value="On" colors={colors} styles={styles} />
          <SettingRow icon="shield" label="Safety and privacy" value="Protected" colors={colors} styles={styles} last />
        </View>

        <View style={styles.brandCard}>
          <View style={styles.brandMark}>
            <Feather name="navigation" size={20} color={colors.gold} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>Massar, مسار</Text>
            <Text style={styles.brandText}>Intercity travel, shared with care.</Text>
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
    settingBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    settingIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
    settingLabel: { color: colors.ink, fontSize: 13, fontWeight: '600', flex: 1 },
    settingValue: { color: colors.mutedForeground, fontSize: 11, marginRight: 8 },
    brandCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, backgroundColor: colors.secondary, marginTop: 18 },
    brandMark: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.petrol, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    brandCopy: { flex: 1 },
    brandTitle: { color: colors.petrol, fontSize: 14, fontWeight: '800' },
    brandText: { color: colors.mutedForeground, fontSize: 11, marginTop: 4 },
  });