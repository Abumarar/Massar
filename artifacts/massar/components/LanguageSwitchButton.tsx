import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/context/LanguageContext';
import { useColors } from '@/hooks/useColors';

interface Props {
  compact?: boolean;
  style?: object;
}

export function LanguageSwitchButton({ compact = false, style }: Props) {
  const { language, toggleLanguage, isRTL } = useLanguage();
  const colors = useColors();

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLanguage();
  };

  const isAr = language === 'ar';

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.75 : 1,
        },
        compact && styles.pillCompact,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
    >
      <View style={[styles.innerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.goldSoft }]}>
          <Feather name="globe" size={14} color={colors.gold} />
        </View>
        <Text style={[styles.langText, { color: colors.ink }]}>
          {isAr ? 'English' : 'العربية'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  pillCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  innerRow: {
    alignItems: 'center',
    gap: 7,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
