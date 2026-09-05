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

const fareBySeats: Record<number, number> = { 1: 12, 2: 6, 3: 4, 4: 3 };

export default function HomeScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stage, setStage] = useState<BookingStage>('home');
  const [seats, setSeats] = useState(1);
  const [pickupLabel, setPickupLabel] = useState('Jerash');
  const [isLocating, setIsLocating] = useState(false);
  const pickupText = pickupLabel === 'Jerash' ? t('jerash') : pickupLabel;
  const perSeatFare = fareBySeats[seats] ?? 12;
  const totalFare = perSeatFare * seats;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const selectSeats = (count: number) => {
    void Haptics.selectionAsync();
    setSeats(count);
  };

  const useCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(t('locationPermissionNeeded'), t('allowLocation'));
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
      status: isRTL ? 'بانتظار قبول السائق' : 'Captain requested',
      createdAt: new Date().toISOString(),
    };
    const saved = await AsyncStorage.getItem('@massar/trips');
    const existing: StoredTrip[] = saved ? JSON.parse(saved) : [];
    await AsyncStorage.setItem('@massar/trips', JSON.stringify([trip, ...existing]));
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
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 100 }]} showsVerticalScrollIndicator={false}>
          <TopBar title={t('availableRides')} onBack={() => setStage('home')} colors={colors} styles={styles} />
          <View style={styles.routePill}>
            <View style={styles.routePillDot} />
            <Text style={styles.routePillText}>{pickupText} → {t('amman')}</Text>
            <Text style={styles.routePillSeats}>{seats} {seats === 1 ? t('seat') : t('seats')}</Text>
          </View>
          <Text style={styles.pageTitle}>{t('betterWayToGo')}</Text>
          <Text style={styles.pageSubtitle}>{t('foundCaptain')}</Text>

          <Pressable onPress={() => setStage('confirm')} style={({ pressed }) => [styles.captainCard, pressed && styles.pressed]}>
            <View style={styles.captainHeader}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{captain.initials}</Text></View>
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
            <View style={styles.divider} />
            <View style={styles.vehicleRow}>
              <View style={styles.vehicleIcon}><Feather name="truck" size={17} color={colors.petrol} /></View>
              <View>
                <Text style={styles.vehicleTitle}>{captain.vehicle}</Text>
                <Text style={styles.vehicleMeta}>{t('plate')} {captain.plate}</Text>
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
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 100 }]} showsVerticalScrollIndicator={false}>
          <TopBar title={t('confirmRide')} onBack={() => setStage('matches')} colors={colors} styles={styles} />
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
                <LocationRow label={t('pickup')} value={pickupText} destination={false} colors={colors} styles={styles} />
                <View style={styles.locationGap} />
                <LocationRow label={t('to')} value={t('amman')} destination colors={colors} styles={styles} />
              </View>
            </View>
            <View style={styles.divider} />
            <SummaryLine label={t('captain')} value={captain.name} styles={styles} />
            <SummaryLine label={t('passengers')} value={`${seats} ${seats === 1 ? t('seat') : t('seats')}`} styles={styles} />
            <SummaryLine label={t('vehicle')} value={captain.vehicle} styles={styles} />
            <SummaryLine label={t('estimatedTotal')} value={`${totalFare.toFixed(2)} JOD`} styles={styles} emphasis />
          </View>
          <View style={styles.privacyNote}>
            <Feather name="shield" size={17} color={colors.mintStrong} />
            <Text style={styles.privacyText}>{t('privacyMessage')}</Text>
          </View>
          <Pressable onPress={() => void confirmBooking()} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
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
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.mapPanel}>
          <View style={[styles.mapRoad, styles.mapRoadOne]} />
          <View style={[styles.mapRoad, styles.mapRoadTwo]} />
          <View style={[styles.mapRoad, styles.mapRoadThree]} />
          <View style={styles.mapTopBar}>
            <View style={styles.brandRow}>
              <Image source={require('@/assets/images/icon.png')} style={styles.brandIcon} />
              <View>
                <Text style={styles.brandName}>Masar</Text>
                <Text style={styles.brandArabic}>مسار</Text>
              </View>
            </View>
            <Pressable accessibilityLabel={t('profile')} onPress={() => router.navigate('/(tabs)/profile')} style={styles.mapProfileButton}>
              <Feather name="user" size={17} color={colors.ink} />
            </Pressable>
          </View>
          <View style={styles.mapRouteBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.mapRouteText}>{pickupText} ↔ {t('amman')}</Text>
          </View>
          <View style={styles.mapRouteLine} />
          <View style={[styles.mapMarker, styles.mapMarkerStart]}><View style={styles.mapMarkerCore} /></View>
          <View style={[styles.mapMarker, styles.mapMarkerEnd]}><Feather name="map-pin" size={13} color={colors.primaryForeground} /></View>
          <Text style={styles.heroTitle}>{t('tagline')}</Text>
          <Text style={styles.heroArabic}>{isRTL ? 'Your trip starts from here' : 'توصلها بثقة'}</Text>
        </View>

        <View style={styles.bookingCard}>
          <View style={styles.cardEyebrow}>
            <Feather name="navigation" size={14} color={colors.petrol} />
            <Text style={styles.cardEyebrowText}>{t('planRide')}</Text>
          </View>
          <View style={styles.locationStack}>
            <LocationRow label={t('from')} value={pickupText} colors={colors} styles={styles} />
            <View style={styles.locationConnector} />
            <LocationRow label={t('to')} value={t('amman')} destination colors={colors} styles={styles} />
          </View>
          <Pressable onPress={() => void useCurrentLocation()} style={styles.locationAction}>
            <Feather name={isLocating ? 'loader' : 'crosshair'} size={15} color={colors.petrol} />
            <Text style={styles.locationActionText}>{isLocating ? t('findingLocation') : t('useCurrentLocation')}</Text>
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.seatHeader}>
            <View>
              <Text style={styles.seatTitle}>{t('howManySeats')}</Text>
              <Text style={styles.seatSubtitle}>{t('bringEveryone')}</Text>
            </View>
            <View style={styles.seatIcon}><Feather name="users" size={18} color={colors.petrol} /></View>
          </View>
          <View style={styles.seatPicker}>
            {[1, 2, 3, 4].map((count) => (
              <Pressable key={count} accessibilityLabel={`${count} ${count === 1 ? t('seat') : t('seats')}`} onPress={() => selectSeats(count)} style={({ pressed }) => [styles.seatOption, seats === count && styles.seatOptionSelected, pressed && styles.pressed]}>
                <Text style={[styles.seatNumber, seats === count && styles.seatNumberSelected]}>{count}</Text>
                <Text style={[styles.seatWord, seats === count && styles.seatWordSelected]}>{count === 1 ? t('seat') : t('seats')}</Text>
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
          <Pressable accessibilityLabel={t('findRide')} onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStage('matches'); }} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
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
          <Pressable onPress={() => router.navigate('/(tabs)/trips')}><Text style={styles.sectionAction}>{t('seeAll')}</Text></Pressable>
        </View>
        <View style={styles.recentCard}>
          <View style={styles.recentRouteIcon}><Feather name="arrow-up-right" size={18} color={colors.petrol} /></View>
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

function TopBar({ title, onBack, colors, styles }: { title: string; onBack: () => void; colors: ReturnType<typeof useColors>; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.topBar}>
      <Pressable accessibilityLabel="Back" onPress={onBack} style={styles.iconButton}><Feather name="arrow-left" size={21} color={colors.ink} /></Pressable>
      <Text style={styles.topBarTitle}>{title}</Text>
      <View style={styles.topBarSpacer} />
    </View>
  );
}

function LocationRow({ label, value, destination, colors, styles }: { label: string; value: string; destination?: boolean; colors: ReturnType<typeof useColors>; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.locationRow}>
      <View style={[styles.locationMarker, destination && styles.locationMarkerDestination]}>
        <Feather name={destination ? 'map-pin' : 'circle'} size={destination ? 13 : 10} color={destination ? colors.coral : colors.petrol} />
      </View>
      <View><Text style={styles.locationLabel}>{label}</Text><Text style={styles.locationValue}>{value}</Text></View>
    </View>
  );
}

function SummaryLine({ label, value, styles, emphasis = false }: { label: string; value: string; styles: ReturnType<typeof createStyles>; emphasis?: boolean }) {
  return <View style={styles.confirmLine}><Text style={styles.confirmLabel}>{label}</Text><Text style={emphasis ? styles.confirmFare : styles.confirmValue}>{value}</Text></View>;
}

function Metric({ icon, label, value, colors, styles }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; colors: ReturnType<typeof useColors>; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.metric}><Feather name={icon} size={15} color={colors.mutedForeground} /><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function Promise({ icon, label, colors, styles }: { icon: keyof typeof Feather.glyphMap; label: string; colors: ReturnType<typeof useColors>; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.promise}><Feather name={icon} size={15} color={colors.mintStrong} /><Text style={styles.promiseText}>{label}</Text></View>;
}

const createStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 14 },
  mapPanel: { backgroundColor: '#e4e6e8', borderRadius: 22, minHeight: 248, padding: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#d7dade', position: 'relative' },
  mapRoad: { position: 'absolute', height: 18, borderRadius: 10, backgroundColor: '#f5f5f3', opacity: 0.9 },
  mapRoadOne: { width: 330, top: 108, left: -35, transform: [{ rotate: '-18deg' }] },
  mapRoadTwo: { width: 280, top: 172, right: -70, transform: [{ rotate: '26deg' }] },
  mapRoadThree: { width: 230, top: 48, right: -30, transform: [{ rotate: '-42deg' }] },
  mapTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandIcon: { width: 40, height: 40, borderRadius: 13, marginRight: 10 },
  brandName: { color: colors.ink, fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
  brandArabic: { color: colors.gold, fontSize: 11, fontWeight: '700', marginTop: -1 },
  mapProfileButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  mapRouteBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#ffffff', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 7, marginTop: 22 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold, marginRight: 7 },
  mapRouteText: { color: colors.ink, fontSize: 10, fontWeight: '700' },
  mapRouteLine: { position: 'absolute', left: 73, top: 126, width: 152, height: 5, borderRadius: 3, backgroundColor: colors.routeLine, transform: [{ rotate: '-15deg' }] },
  mapMarker: { position: 'absolute', width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  mapMarkerStart: { left: 55, top: 113, backgroundColor: '#ffffff', borderWidth: 5, borderColor: colors.gold },
  mapMarkerEnd: { right: 70, top: 78, backgroundColor: colors.petrol },
  mapMarkerCore: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.petrol },
  heroTitle: { color: colors.ink, fontSize: 32, lineHeight: 36, fontWeight: '800', marginTop: 38, maxWidth: 285, letterSpacing: -0.8 },
  heroArabic: { color: colors.mutedForeground, fontSize: 14, marginTop: 7, fontWeight: '600' },
  bookingCard: { backgroundColor: colors.card, marginTop: -26, borderRadius: 23, padding: 18, borderWidth: 1, borderColor: colors.border, zIndex: 2, elevation: 4 },
  cardEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 17 },
  cardEyebrowText: { color: colors.petrol, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  locationStack: { position: 'relative' },
  locationRow: { flexDirection: 'row', alignItems: 'center', minHeight: 39 },
  locationMarker: { width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mint, marginRight: 12 },
  locationMarkerDestination: { backgroundColor: '#fff0e7' },
  locationLabel: { color: colors.mutedForeground, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  locationValue: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  locationConnector: { position: 'absolute', left: 13, top: 31, height: 22, borderLeftWidth: 1, borderStyle: 'dashed', borderColor: colors.input },
  locationAction: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12, marginLeft: 39 },
  locationActionText: { color: colors.petrol, fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
  seatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seatTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  seatSubtitle: { color: colors.mutedForeground, fontSize: 12, marginTop: 4 },
  seatIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  seatPicker: { flexDirection: 'row', gap: 8, marginTop: 14 },
  seatOption: { flex: 1, minHeight: 58, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  seatOptionSelected: { backgroundColor: colors.petrol, borderColor: colors.petrol },
  seatNumber: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  seatNumberSelected: { color: colors.primaryForeground },
  seatWord: { color: colors.mutedForeground, fontSize: 9, marginTop: 1, fontWeight: '600' },
  seatWordSelected: { color: '#ffffff' },
  farePreview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: 12, borderRadius: 13, backgroundColor: colors.secondary },
  farePreviewLabel: { color: colors.secondaryForeground, fontSize: 12, fontWeight: '700' },
  farePreviewRight: { alignItems: 'flex-end' },
  farePreviewAmount: { color: colors.petrol, fontSize: 16, fontWeight: '800' },
  farePreviewMeta: { color: colors.mutedForeground, fontSize: 10, marginTop: 2 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 54, borderRadius: 15, backgroundColor: colors.primary, marginTop: 16 },
  primaryButtonText: { color: colors.primaryForeground, fontSize: 15, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', paddingVertical: 15 },
  secondaryButtonText: { color: colors.petrol, fontSize: 14, fontWeight: '700' },
  promiseRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingHorizontal: 4 },
  promise: { alignItems: 'center', gap: 5, flex: 1 },
  promiseText: { color: colors.mutedForeground, fontSize: 9, fontWeight: '600', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 11 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  sectionAction: { color: colors.petrol, fontSize: 12, fontWeight: '800' },
  recentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 17, padding: 13, borderWidth: 1, borderColor: colors.border },
  recentRouteIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  recentCopy: { flex: 1 },
  recentRoute: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  recentMeta: { color: colors.mutedForeground, fontSize: 11, marginTop: 4 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  iconButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  topBarSpacer: { width: 40 },
  routePill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.mint, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 11 },
  routePillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold, marginRight: 7 },
  routePillText: { color: colors.petrol, fontSize: 11, fontWeight: '800' },
  routePillSeats: { color: colors.mintStrong, fontSize: 11, fontWeight: '800', marginLeft: 8, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: colors.input },
  pageTitle: { color: colors.ink, fontSize: 29, lineHeight: 33, fontWeight: '800', letterSpacing: -0.6, marginTop: 20 },
  pageSubtitle: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19, marginTop: 7, marginBottom: 18 },
  captainCard: { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16 },
  pressed: { opacity: 0.82 },
  captainHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  avatarText: { color: colors.petrolDark, fontSize: 16, fontWeight: '800' },
  captainNameBlock: { flex: 1 },
  captainName: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  ratingLine: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 5 },
  ratingText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  tripCount: { color: colors.mutedForeground, fontSize: 11 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  vehicleTitle: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  vehicleMeta: { color: colors.mutedForeground, fontSize: 10, marginTop: 3 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  metric: { alignItems: 'center', minWidth: 76 },
  metricLabel: { color: colors.mutedForeground, fontSize: 9, marginTop: 5 },
  metricValue: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 3 },
  fareBand: { backgroundColor: colors.petrolDark, borderRadius: 15, padding: 13, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareLabel: { color: '#dce4ee', fontSize: 11, fontWeight: '700' },
  fareNote: { color: '#aebbd0', fontSize: 10, marginTop: 3 },
  fareAmount: { color: colors.gold, fontSize: 18, fontWeight: '800' },
  infoCallout: { flexDirection: 'row', gap: 9, backgroundColor: colors.secondary, borderRadius: 15, padding: 13, marginTop: 14 },
  infoText: { flex: 1, color: colors.secondaryForeground, fontSize: 11, lineHeight: 16 },
  confirmCard: { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 17 },
  confirmRoute: { flexDirection: 'row' },
  routeRail: { alignItems: 'center', width: 22, paddingTop: 4 },
  routeDotFilled: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.petrol, borderWidth: 3, borderColor: colors.mint },
  routeRailLine: { height: 32, borderLeftWidth: 1, borderStyle: 'dashed', borderColor: colors.input },
  routeDotOutline: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.gold },
  confirmLocations: { flex: 1, marginLeft: 10 },
  locationGap: { height: 12 },
  confirmLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  confirmLabel: { color: colors.mutedForeground, fontSize: 12 },
  confirmValue: { color: colors.ink, fontSize: 12, fontWeight: '800', maxWidth: '62%', textAlign: 'right' },
  confirmFare: { color: colors.petrol, fontSize: 15, fontWeight: '800' },
  privacyNote: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 4, marginTop: 17 },
  privacyText: { flex: 1, color: colors.mutedForeground, fontSize: 11, lineHeight: 16 },
});