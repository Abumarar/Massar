import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';

type BookingStage = 'home' | 'matches' | 'confirm';

type Captain = {
  id: string;
  name: string;
  initials: string;
  rating: number;
  trips: number;
  vehicle: string;
  plate: string;
  availableSeats: number;
  pickupDistance: string;
  eta: string;
};

type StoredTrip = {
  id: string;
  captain: string;
  vehicle: string;
  route: string;
  seats: number;
  fare: number;
  status: string;
  createdAt: string;
};

const captain: Captain = {
  id: 'captain-ahmad',
  name: 'Ahmad Al-Khatib',
  initials: 'AK',
  rating: 4.9,
  trips: 248,
  vehicle: 'Toyota Corolla · White',
  plate: '32-4821',
  availableSeats: 4,
  pickupDistance: '1.2 km',
  eta: '7 min',
};

const fareByOccupiedSeats: Record<number, number> = {
  1: 12,
  2: 6,
  3: 4,
  4: 3,
};

export default function HomeScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [stage, setStage] = useState<BookingStage>('home');
  const [seats, setSeats] = useState<number>(1);
  const [pickupLabel, setPickupLabel] = useState('Jerash');
  const [isLocating, setIsLocating] = useState(false);

  const perSeatFare = fareByOccupiedSeats[seats] ?? 12;
  const totalFare = perSeatFare * seats;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const pickupText = pickupLabel === 'Jerash' ? t('jerash') : pickupLabel;

  const chooseSeats = (count: number) => {
    void Haptics.selectionAsync();
    setSeats(count);
  };

  const useCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          t('locationPermissionNeeded'),
          t('allowLocation'),
        );
        return;
      }
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setPickupLabel('Current location');
        Alert.alert(
          t('pickupLocated'),
          isRTL
            ? `موقعك جاهز (${current.coords.latitude.toFixed(3)}، ${current.coords.longitude.toFixed(3)}).`
            : `Your position is ready (${current.coords.latitude.toFixed(3)}, ${current.coords.longitude.toFixed(3)}).`,
        );
    } catch {
      Alert.alert(
        t('locationUnavailable'),
        isRTL
          ? 'تعذّر الوصول إلى موقعك. يمكنك المتابعة باستخدام جرش كنقطة انطلاق.'
          : 'We could not access your location. You can continue with Jerash as your pickup.',
      );
    } finally {
      setIsLocating(false);
    }
  };

  const confirmBooking = async () => {
    const trip: StoredTrip = {
      id: `trip-${Date.now()}`,
      captain: captain.name,
      vehicle: captain.vehicle,
      route: `${pickupText} → ${t('amman')}`,
      seats,
      fare: totalFare,
      status: 'Captain requested',
      createdAt: new Date().toISOString(),
    };
    const existing = await AsyncStorage.getItem('@massar/trips');
    const trips: StoredTrip[] = existing ? JSON.parse(existing) : [];
    await AsyncStorage.setItem('@massar/trips', JSON.stringify([trip, ...trips]));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStage('home');
    Alert.alert(
      t('rideRequested'),
      isRTL
        ? `استلم أحمد طلبك لحجز ${seats} ${seats === 1 ? t('seat') : t('seats')}.`
        : `Ahmad has received your request for ${seats} ${seats === 1 ? t('seat') : t('seats')}.`,
      [{ text: t('viewTrip'), onPress: () => router.navigate('/(tabs)/trips') }],
    );
  };

  if (stage === 'matches') {
    return (
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              accessibilityLabel="Back to booking"
              onPress={() => setStage('home')}
              style={styles.iconButton}
            >
              <Feather name="arrow-left" size={21} color={colors.ink} />
            </Pressable>
            <Text style={styles.topBarTitle}>{t('availableRides')}</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.routePill}>
            <View style={styles.routePillDot} />
            <Text style={styles.routePillText}>{pickupText} → {t('amman')}</Text>
            <Text style={styles.routePillSeats}>
              {seats} {seats === 1 ? t('seat') : t('seats')}
            </Text>
          </View>

          <Text style={styles.pageTitle}>{t('betterWayToGo')}</Text>
          <Text style={styles.pageSubtitle}>
            {t('foundCaptain')}
          </Text>

          <Pressable
            accessibilityLabel={`Ride with ${captain.name}`}
            onPress={() => setStage('confirm')}
            style={({ pressed }) => [styles.captainCard, pressed && styles.pressed]}
          >
            <View style={styles.captainCardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{captain.initials}</Text>
              </View>
              <View style={styles.captainNameBlock}>
                <Text style={styles.captainName}>{captain.name}</Text>
                <View style={styles.ratingLine}>
                  <Feather name="star" size={14} color={colors.gold} />
                  <Text style={styles.ratingText}>{captain.rating}</Text>
                  <Text style={styles.tripCount}>· {captain.trips} trips</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
            </View>

            <View style={styles.captainDivider} />

            <View style={styles.vehicleRow}>
              <View style={styles.vehicleIcon}>
                <Feather name="truck" size={17} color={colors.petrol} />
              </View>
              <View>
                <Text style={styles.vehicleTitle}>{captain.vehicle}</Text>
                <Text style={styles.vehicleMeta}>Plate {captain.plate}</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <Metric icon="map-pin" label={t('pickup')} value={captain.pickupDistance} colors={colors} styles={styles} />
              <Metric icon="clock" label={t('arrivesIn')} value={captain.eta} colors={colors} styles={styles} />
              <Metric icon="users" label={t('seatsLeft')} value={`${captain.availableSeats}`} colors={colors} styles={styles} />
            </View>

            <View style={styles.fareBand}>
              <View>
                <Text style={styles.fareLabel}>{t('estimatedTotal')}</Text>
                <Text style={styles.fareNote}>{perSeatFare} JOD {t('perSeat')}</Text>
              </View>
              <Text style={styles.fareAmount}>{totalFare.toFixed(2)} JOD</Text>
            </View>
          </Pressable>

          <View style={styles.infoCallout}>
            <Feather name="info" size={17} color={colors.petrol} />
            <Text style={styles.infoText}>
              {isRTL
                ? `أنت تحجز ${seats} ${seats === 1 ? t('seat') : t('seats')}. يتم حجز المقاعد عند قبول أحمد.`
                : `You are booking ${seats} ${seats === 1 ? t('seat') : t('seats')}. Seats are reserved when Ahmad accepts.`}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (stage === 'confirm') {
    return (
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              accessibilityLabel="Back to matches"
              onPress={() => setStage('matches')}
              style={styles.iconButton}
            >
              <Feather name="arrow-left" size={21} color={colors.ink} />
            </Pressable>
            <Text style={styles.topBarTitle}>{t('confirmRide')}</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <Text style={styles.pageTitle}>{t('readyWhenYouAre')}</Text>
          <Text style={styles.pageSubtitle}>{t('reviewRide')}</Text>

          <View style={styles.confirmCard}>
            <View style={styles.confirmRoute}>
              <View style={styles.routeRail}>
                <View style={styles.routeDotFilled} />
                <View style={styles.routeRailLine} />
                <View style={styles.routeDotOutline} />
              </View>
              <View style={styles.confirmLocations}>
                <LocationRow label={t('pickup')} value={pickupText} colors={colors} styles={styles} />
                <View style={styles.locationGap} />
                <LocationRow label={t('to')} value={t('amman')} colors={colors} styles={styles} destination />
              </View>
            </View>

            <View style={styles.confirmDivider} />

            <View style={styles.confirmLine}>
              <Text style={styles.confirmLabel}>{t('captain')}</Text>
              <Text style={styles.confirmValue}>{captain.name}</Text>
            </View>
            <View style={styles.confirmLine}>
              <Text style={styles.confirmLabel}>{t('passengers')}</Text>
              <Text style={styles.confirmValue}>{seats} {seats === 1 ? t('seat') : t('seats')}</Text>
            </View>
            <View style={styles.confirmLine}>
              <Text style={styles.confirmLabel}>{t('vehicle')}</Text>
              <Text style={styles.confirmValue}>{captain.vehicle}</Text>
            </View>
            <View style={styles.confirmLine}>
              <Text style={styles.confirmLabel}>{t('estimatedTotal')}</Text>
              <Text style={styles.confirmFare}>{totalFare.toFixed(2)} JOD</Text>
            </View>
          </View>

          <View style={styles.privacyNote}>
            <Feather name="shield" size={17} color={colors.mintStrong} />
            <Text style={styles.privacyText}>
              {t('privacyMessage')}
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Confirm and request ride"
            onPress={() => void confirmBooking()}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>{t('requestRide')}</Text>
            <Feather name="arrow-right" size={19} color={colors.primaryForeground} />
          </Pressable>
          <Pressable onPress={() => setStage('matches')} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{t('keepBrowsing')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapPanel}>
          <View style={styles.brandRow}>
            <Image source={require('@/assets/images/icon.png')} style={styles.brandIcon} />
            <View>
              <Text style={styles.brandName}>massar</Text>
              <Text style={styles.brandArabic}>مسار</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>JERASH ↔ AMMAN</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>
            {isRTL ? 'تحرّكوا معًا،\nوادفعوا أقل.' : 'Move together,\npay less.'}
          </Text>
          <Text style={styles.heroArabic}>{isRTL ? 'اختر وجهتك وابدأ رحلتك' : 'Choose a destination and go'}</Text>
        </View>

        <View style={styles.bookingCard}>
          <View style={styles.cardEyebrow}>
            <Feather name="navigation" size={14} color={colors.petrol} />
            <Text style={styles.cardEyebrowText}>{t('planRide')}</Text>
          </View>
          <View style={styles.locationStack}>
            <LocationRow label={t('from')} value={pickupText} colors={colors} styles={styles} />
            <View style={styles.locationConnector} />
            <LocationRow label={t('to')} value={t('amman')} colors={colors} styles={styles} destination />
          </View>
          <Pressable onPress={() => void useCurrentLocation()} style={styles.locationAction}>
            <Feather name={isLocating ? 'loader' : 'crosshair'} size={15} color={colors.petrol} />
            <Text style={styles.locationActionText}>
              {isLocating ? t('findingLocation') : t('useCurrentLocation')}
            </Text>
          </Pressable>

          <View style={styles.bookingDivider} />

          <View style={styles.seatHeader}>
            <View>
              <Text style={styles.seatTitle}>{t('howManySeats')}</Text>
              <Text style={styles.seatSubtitle}>{t('bringEveryone')}</Text>
            </View>
            <View style={styles.seatIcon}>
              <Feather name="users" size={18} color={colors.petrol} />
            </View>
          </View>
          <View style={styles.seatPicker}>
            {[1, 2, 3, 4].map((count) => (
              <Pressable
                key={count}
                accessibilityLabel={`Book ${count} ${count === 1 ? 'seat' : 'seats'}`}
                onPress={() => chooseSeats(count)}
                style={({ pressed }) => [
                  styles.seatOption,
                  seats === count && styles.seatOptionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.seatNumber, seats === count && styles.seatNumberSelected]}>
                  {count}
                </Text>
                <Text style={[styles.seatWord, seats === count && styles.seatWordSelected]}>
                  {count === 1 ? t('seat') : t('seats')}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.farePreview}>
            <Text style={styles.farePreviewLabel}>{t('estimatedTotal')}</Text>
            <View style={styles.farePreviewRight}>
              <Text style={styles.farePreviewAmount}>{totalFare.toFixed(2)} JOD</Text>
              <Text style={styles.farePreviewMeta}>{perSeatFare} JOD / {t('seat')}</Text>
            </View>
          </View>

          <Pressable
            accessibilityLabel="Find a ride"
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setStage('matches');
            }}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>{t('findRide')}</Text>
            <Feather name="arrow-right" size={19} color={colors.primaryForeground} />
          </Pressable>
        </View>

        <View style={styles.promiseRow}>
          <Promise icon="map" label={t('routeMatched')} colors={colors} styles={styles} />
          <Promise icon="shield" label={t('verifiedCaptains')} colors={colors} styles={styles} />
          <Promise icon="credit-card" label={t('fairPricing')} colors={colors} styles={styles} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('recentRides')}</Text>
          <Pressable onPress={() => router.navigate('/(tabs)/trips')}>
            <Text style={styles.sectionAction}>{t('seeAll')}</Text>
          </Pressable>
        </View>
        <View style={styles.recentCard}>
          <View style={styles.recentRouteIcon}>
            <Feather name="arrow-up-right" size={18} color={colors.petrol} />
          </View>
          <View style={styles.recentCopy}>
            <Text style={styles.recentRoute}>{pickupText} → {t('amman')}</Text>
            <Text style={styles.recentMeta}>{t('noCompletedRides')}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </View>
      </ScrollView>
    </View>
  );
}

function LocationRow({
  label,
  value,
  colors,
  styles,
  destination = false,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof createStyles>;
  destination?: boolean;
}) {
  return (
    <View style={styles.locationRow}>
      <View style={[styles.locationMarker, destination && styles.locationMarkerDestination]}>
        <Feather
          name={destination ? 'map-pin' : 'circle'}
          size={destination ? 13 : 10}
          color={destination ? colors.coral : colors.petrol}
        />
      </View>
      <View>
        <Text style={styles.locationLabel}>{label}</Text>
        <Text style={styles.locationValue}>{value}</Text>
      </View>
    </View>
  );
}

function Metric({
  icon,
  label,
  value,
  colors,
  styles,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.metric}>
      <Feather name={icon} size={15} color={colors.mutedForeground} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Promise({
  icon,
  label,
  colors,
  styles,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.promise}>
      <Feather name={icon} size={15} color={colors.mintStrong} />
      <Text style={styles.promiseText}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingHorizontal: 18, paddingTop: 16 },
    mapPanel: {
      backgroundColor: '#e5e5e2',
      borderRadius: 22,
      paddingHorizontal: 22,
      paddingTop: 18,
      paddingBottom: 66,
      overflow: 'hidden',
      minHeight: 238,
      borderWidth: 1,
      borderColor: '#d8d8d4',
    },
    brandRow: { flexDirection: 'row', alignItems: 'center' },
    brandIcon: { width: 38, height: 38, borderRadius: 12, marginRight: 10 },
    brandName: { color: colors.ink, fontSize: 18, fontWeight: '700', letterSpacing: 0.4 },
    brandArabic: { color: colors.petrol, fontSize: 11, fontWeight: '600', marginTop: -1 },
    liveBadge: {
      marginLeft: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold, marginRight: 6 },
    liveText: { color: colors.ink, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
    heroTitle: { color: colors.ink, fontSize: 35, lineHeight: 38, fontWeight: '700', marginTop: 56, letterSpacing: -1 },
    heroArabic: { color: colors.mutedForeground, fontSize: 14, marginTop: 9, fontWeight: '500' },
    bookingCard: {
      backgroundColor: colors.card,
      marginTop: -30,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 2,
      elevation: 4,
    },
    cardEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 18 },
    cardEyebrowText: { color: colors.petrol, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 },
    locationStack: { position: 'relative' },
    locationRow: { flexDirection: 'row', alignItems: 'center', minHeight: 39 },
    locationMarker: {
      width: 27,
      height: 27,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.mint,
      marginRight: 12,
    },
    locationMarkerDestination: { backgroundColor: '#fff0ec' },
    locationLabel: { color: colors.mutedForeground, fontSize: 11, fontWeight: '600', marginBottom: 2 },
    locationValue: { color: colors.ink, fontSize: 17, fontWeight: '600' },
    locationConnector: {
      position: 'absolute',
      left: 13,
      top: 31,
      height: 22,
      borderLeftWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.input,
    },
    locationAction: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12, marginLeft: 39 },
    locationActionText: { color: colors.petrol, fontSize: 12, fontWeight: '600' },
    bookingDivider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
    seatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    seatTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
    seatSubtitle: { color: colors.mutedForeground, fontSize: 12, marginTop: 4 },
    seatIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
    seatPicker: { flexDirection: 'row', gap: 8, marginTop: 14 },
    seatOption: {
      flex: 1,
      minHeight: 58,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    seatOptionSelected: { backgroundColor: colors.petrol, borderColor: colors.petrol },
    seatNumber: { color: colors.ink, fontSize: 19, fontWeight: '700' },
    seatNumberSelected: { color: '#ffffff' },
    seatWord: { color: colors.mutedForeground, fontSize: 9, marginTop: 1, fontWeight: '600' },
    seatWordSelected: { color: '#cde3dd' },
    farePreview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: 12, borderRadius: 13, backgroundColor: colors.secondary },
    farePreviewLabel: { color: colors.secondaryForeground, fontSize: 12, fontWeight: '600' },
    farePreviewRight: { alignItems: 'flex-end' },
    farePreviewAmount: { color: colors.petrol, fontSize: 16, fontWeight: '800' },
    farePreviewMeta: { color: colors.mutedForeground, fontSize: 10, marginTop: 2 },
    primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 54, borderRadius: 16, backgroundColor: colors.petrol, marginTop: 16 },
    primaryButtonText: { color: colors.primaryForeground, fontSize: 15, fontWeight: '700' },
    secondaryButton: { alignItems: 'center', paddingVertical: 15 },
    secondaryButtonText: { color: colors.petrol, fontSize: 14, fontWeight: '600' },
    promiseRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingHorizontal: 4 },
    promise: { alignItems: 'center', gap: 5, flex: 1 },
    promiseText: { color: colors.mutedForeground, fontSize: 9, fontWeight: '600', textAlign: 'center' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 11 },
    sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '700' },
    sectionAction: { color: colors.petrol, fontSize: 12, fontWeight: '700' },
    recentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 17, padding: 13, borderWidth: 1, borderColor: colors.border },
    recentRouteIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
    recentCopy: { flex: 1 },
    recentRoute: { color: colors.ink, fontSize: 13, fontWeight: '700' },
    recentMeta: { color: colors.mutedForeground, fontSize: 11, marginTop: 4 },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
    iconButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    topBarTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
    topBarSpacer: { width: 40 },
    routePill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.mint, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 11 },
    routePillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.mintStrong, marginRight: 7 },
    routePillText: { color: colors.petrol, fontSize: 11, fontWeight: '700' },
    routePillSeats: { color: colors.mintStrong, fontSize: 11, fontWeight: '700', marginLeft: 8, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: '#a8d2c6' },
    pageTitle: { color: colors.ink, fontSize: 29, lineHeight: 33, fontWeight: '700', letterSpacing: -0.6, marginTop: 20 },
    pageSubtitle: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19, marginTop: 7, marginBottom: 18 },
    captainCard: { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16 },
    pressed: { opacity: 0.82 },
    captainCardHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
    avatarText: { color: colors.petrolDark, fontSize: 16, fontWeight: '800' },
    captainNameBlock: { flex: 1 },
    captainName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
    ratingLine: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 5 },
    ratingText: { color: colors.ink, fontSize: 11, fontWeight: '700' },
    tripCount: { color: colors.mutedForeground, fontSize: 11 },
    captainDivider: { height: 1, backgroundColor: colors.border, marginVertical: 15 },
    vehicleRow: { flexDirection: 'row', alignItems: 'center' },
    vehicleIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    vehicleTitle: { color: colors.ink, fontSize: 12, fontWeight: '700' },
    vehicleMeta: { color: colors.mutedForeground, fontSize: 10, marginTop: 3 },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
    metric: { alignItems: 'center', minWidth: 76 },
    metricLabel: { color: colors.mutedForeground, fontSize: 9, marginTop: 5 },
    metricValue: { color: colors.ink, fontSize: 12, fontWeight: '700', marginTop: 3 },
    fareBand: { backgroundColor: colors.petrolDark, borderRadius: 15, padding: 13, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    fareLabel: { color: '#c5ded7', fontSize: 11, fontWeight: '600' },
    fareNote: { color: '#86b9aa', fontSize: 10, marginTop: 3 },
    fareAmount: { color: colors.gold, fontSize: 18, fontWeight: '800' },
    infoCallout: { flexDirection: 'row', gap: 9, backgroundColor: colors.secondary, borderRadius: 15, padding: 13, marginTop: 14 },
    infoText: { flex: 1, color: colors.secondaryForeground, fontSize: 11, lineHeight: 16 },
    confirmCard: { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 17 },
    confirmRoute: { flexDirection: 'row' },
    routeRail: { alignItems: 'center', width: 22, paddingTop: 4 },
    routeDotFilled: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.petrol, borderWidth: 3, borderColor: colors.mint },
    routeRailLine: { height: 32, borderLeftWidth: 1, borderStyle: 'dashed', borderColor: colors.input },
    routeDotOutline: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.coral },
    confirmLocations: { flex: 1, marginLeft: 10 },
    locationGap: { height: 12 },
    confirmDivider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
    confirmLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
    confirmLabel: { color: colors.mutedForeground, fontSize: 12 },
    confirmValue: { color: colors.ink, fontSize: 12, fontWeight: '700', maxWidth: '62%', textAlign: 'right' },
    confirmFare: { color: colors.petrol, fontSize: 15, fontWeight: '800' },
    privacyNote: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 4, marginTop: 17 },
    privacyText: { flex: 1, color: colors.mutedForeground, fontSize: 11, lineHeight: 16 },
  });