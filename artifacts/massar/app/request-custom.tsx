import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useCreatePassengerRideRequest } from '@workspace/api-client-react';

export default function RequestCustomScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [destination, setDestination] = useState('');
  const bookRideMutation = useCreatePassengerRideRequest();

  const handleRequest = async () => {
    if (!destination.trim()) {
      Alert.alert(t('required'), t('enterDestination'));
      return;
    }

    setIsSubmitting(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('locationPermissionDenied'), t('locationRequired'));
        setIsSubmitting(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      await bookRideMutation.mutateAsync({
        data: {
          type: 'custom',
          customSearchText: destination.trim(),
          pickupLat: location.coords.latitude,
          pickupLng: location.coords.longitude,
          destLat: 0, 
          destLng: 0,
          seats: 1,
        }
      });
      Alert.alert(t('requestSent'), t('customSuccess'), [
        { text: isRTL ? 'حسناً' : 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert(t('error'), e.message || (isRTL ? 'تعذر طلب الرحلة' : 'Could not request custom trip'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name={isRTL ? 'arrow-right' : 'arrow-left'} size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{t('searchForTrip')}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="compass" size={48} color={colors.gold} style={{ alignSelf: 'center', marginBottom: 20 }} />
        <Text style={[styles.infoText, { color: colors.ink }]}>
          {t('whereToGo')}
        </Text>
        <Text style={[styles.subInfoText, { color: colors.mutedForeground }]}>
          {t('customTripSubtitle')}
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>{t('destination')}</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.ink,
                borderColor: colors.border,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            value={destination}
            onChangeText={setDestination}
            placeholder={t('destinationPlaceholder')}
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Pressable 
          style={[styles.button, { backgroundColor: colors.primary }, isSubmitting && { opacity: 0.7 }]}
          onPress={handleRequest}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>{t('sendRequest')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
  backButton: { padding: 10, marginHorizontal: 10 },
  title: { fontSize: 22, fontWeight: '800' },
  card: { padding: 24, borderRadius: 20, borderWidth: 1 },
  infoText: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  subInfoText: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, minHeight: 100 },
  button: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '800' },
});
