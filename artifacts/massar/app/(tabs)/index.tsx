import React, { useMemo, useState, useEffect } from 'react';
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
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useSearchMatchingCaptains, useCreateRideRequest, MatchingCaptain } from '@workspace/api-client-react';
import { JORDAN_GOVERNORATES } from '@/constants/governorates';

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

const getPassengerId = async () => {
  let id = await AsyncStorage.getItem('@massar/passengerId');
  if (!id) {
    id = `pass-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await AsyncStorage.setItem('@massar/passengerId', id);
  }
  return id;
};

export default function HomeScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [passengerId, setPassengerId] = useState<string | null>(null);
  
  // Filtering state
  const [activeTab, setActiveTab] = useState<'standard' | 'hourly'>('standard');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>(JORDAN_GOVERNORATES[0]);
  
  // Booking flow state
  const [selectedRide, setSelectedRide] = useState<MatchingCaptain | null>(null);
  const [seatsToBook, setSeatsToBook] = useState(1);

  useEffect(() => {
    getPassengerId().then(setPassengerId);
  }, []);

  const { data: rides, isLoading } = useSearchMatchingCaptains({ routeId: 'amman-jerash', pickupLat: 32, pickupLng: 35, destLat: 32.1, destLng: 35.1, seats: 1 });
  const bookRideMutation = useCreateRideRequest();

  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const confirmBooking = async () => {
    if (!passengerId || !selectedRide) return;
    try {
      const booking = await bookRideMutation.mutateAsync({
        data: {
          captainId: selectedRide.captainId,
          routeId: 'amman-jerash',
          pickupLat: 32,
          pickupLng: 35,
          destLat: 32.1,
          destLng: 35.1,
          seats: seatsToBook,
        }
      });
      
      const trip: StoredTrip = {
        id: booking.id,
        captain: `Driver ${selectedRide.captainId.slice(-4)}`,
        vehicle: 'Car',
        route: selectedRide.vehicleMakeModel || 'Unknown',
        seats: seatsToBook,
        fare: booking.estimatedFare,
        status: isRTL ? 'مؤكد' : 'Confirmed',
        createdAt: booking.createdAt,
      };
      
      const saved = await AsyncStorage.getItem('@massar/trips');
      const existing: StoredTrip[] = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem('@massar/trips', JSON.stringify([trip, ...existing]));
      
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedRide(null);
      setSeatsToBook(1);
      
      Alert.alert(
        t('rideRequested'),
        isRTL
          ? `تم تأكيد حجز ${seatsToBook} ${seatsToBook === 1 ? t('seat') : t('seats')}.`
          : `Your booking for ${seatsToBook} ${seatsToBook === 1 ? t('seat') : t('seats')} is confirmed!`,
        [{ text: t('viewTrip'), onPress: () => router.navigate('/(tabs)/trips') }],
      );
    } catch (e) {
      Alert.alert('Error', 'Could not book ride');
    }
  };

  const copy = isRTL ? {
    feedTitle: "الرحلات المتاحة",
    feedSubtitle: "تصفح واختر رحلتك",
    standard: "رحلات عادية",
    hourly: "تأجير بالساعة",
    filterGov: "المحافظة:",
    noRides: "لا توجد رحلات متاحة بهذه المواصفات.",
    bookTitle: "تأكيد الحجز",
    bookSubtitle: "اختر عدد المقاعد للحجز",
    requestBtn: "تأكيد الحجز",
    cancelBtn: "إلغاء",
    hours: "ساعات",
    pricePerHour: "دينار / ساعة",
    available: "متاح",
    perSeat: "دينار / مقعد",
  } : {
    feedTitle: "Available Trips",
    feedSubtitle: "Browse and book your next ride",
    standard: "Standard",
    hourly: "Hourly (Hangout)",
    filterGov: "Governorate:",
    noRides: "No rides available matching these filters.",
    bookTitle: "Confirm Booking",
    bookSubtitle: "Select number of seats to book",
    requestBtn: "Confirm Booking",
    cancelBtn: "Cancel",
    hours: "hours",
    pricePerHour: "JOD / hour",
    available: "available",
    perSeat: "JOD / seat",
  };

  // Confirmation screen overlay
  if (selectedRide) {
    const isHourly = false;
    const totalFare = selectedRide.estimatedFare;
    
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: bottomInset + 100 }]}>
          <View style={styles.topBar}>
            <Pressable onPress={() => { setSelectedRide(null); setSeatsToBook(1); }} style={styles.iconButton}>
              <Feather name="arrow-left" size={21} color={colors.ink} />
            </Pressable>
            <Text style={styles.topBarTitle}>{copy.bookTitle}</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <Text style={styles.confirmSubtitle}>{copy.bookSubtitle}</Text>
          
          <View style={styles.confirmCard}>
            <View style={styles.confirmRouteRow}>
              <View style={styles.confirmRouteIcon}>
                <Feather name={isHourly ? "clock" : "navigation"} size={18} color={colors.gold} />
              </View>
              <Text style={styles.confirmRouteText}>
                {isHourly ? `${selectedRide.vehicleMakeModel} · hours` : selectedRide.vehicleMakeModel}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            {!isHourly && (
              <>
                <Text style={styles.seatPickerLabel}>{isRTL ? 'عدد المقاعد' : 'Number of Seats'}</Text>
                <View style={styles.seatPicker}>
                  {[1, 2, 3, 4].map(count => (
                    <Pressable 
                      key={count} 
                      disabled={count > selectedRide.availableSeats}
                      onPress={() => { void Haptics.selectionAsync(); setSeatsToBook(count); }} 
                      style={[
                        styles.seatOption, 
                        seatsToBook === count && styles.seatOptionSelected,
                        count > selectedRide.availableSeats && { opacity: 0.25 }
                      ]}
                    >
                      <Text style={[styles.seatNumber, seatsToBook === count && styles.seatNumberSelected]}>{count}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            
            <View style={styles.confirmSummary}>
              <View style={styles.confirmLine}>
                <Text style={styles.confirmLabel}>{isRTL ? 'سعر المقعد' : 'Price per seat'}</Text>
                <Text style={styles.confirmValue}>{selectedRide.estimatedFare.toFixed(2)} JOD</Text>
              </View>
              <View style={styles.confirmLine}>
                <Text style={styles.confirmLabel}>{isRTL ? 'عدد المقاعد' : 'Seats'}</Text>
                <Text style={styles.confirmValue}>×{seatsToBook}</Text>
              </View>
              <View style={styles.confirmDividerThin} />
              <View style={styles.confirmLine}>
                <Text style={styles.confirmTotalLabel}>{t('estimatedTotal')}</Text>
                <Text style={styles.confirmTotalValue}>{totalFare.toFixed(2)} JOD</Text>
              </View>
            </View>
          </View>

          <Pressable onPress={confirmBooking} style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.85 }]}>
            <Text style={styles.primaryButtonText}>{copy.requestBtn}</Text>
            <Feather name="check" size={19} color={colors.primaryForeground} />
          </Pressable>
          <Pressable onPress={() => setSelectedRide(null)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{copy.cancelBtn}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Filter rides based on type and governorate
  const filteredRides = Array.isArray(rides) ? rides : [];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.headerArea, { paddingTop: insets.top + 10 }]}>
        <View style={styles.brandRow}>
          <Image source={require('@/assets/images/icon.png')} style={styles.brandIcon} />
          <View>
            <Text style={styles.brandName}>Massar</Text>
            <Text style={styles.brandArabic}>مسار</Text>
          </View>
        </View>
        <Pressable accessibilityLabel={t('profile')} onPress={() => router.navigate('/(tabs)/profile')} style={styles.profileButton}>
          <Feather name="user" size={17} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 100 }]} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{copy.feedTitle}</Text>
          <Text style={styles.heroSubtitle}>{copy.feedSubtitle}</Text>
        </View>
        
        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <Pressable 
            style={[styles.typeBtn, activeTab === 'standard' && styles.typeBtnActive]} 
            onPress={() => setActiveTab('standard')}
          >
            <Feather name="navigation" size={14} color={activeTab === 'standard' ? colors.primaryForeground : colors.mutedForeground} style={{ marginRight: 6 }} />
            <Text style={[styles.typeText, activeTab === 'standard' && styles.typeTextActive]}>{copy.standard}</Text>
          </Pressable>
          <Pressable 
            style={[styles.typeBtn, activeTab === 'hourly' && styles.typeBtnActive]} 
            onPress={() => setActiveTab('hourly')}
          >
            <Feather name="clock" size={14} color={activeTab === 'hourly' ? colors.primaryForeground : colors.mutedForeground} style={{ marginRight: 6 }} />
            <Text style={[styles.typeText, activeTab === 'hourly' && styles.typeTextActive]}>{copy.hourly}</Text>
          </Pressable>
        </View>

        {/* Governorate Filter */}
        <Text style={styles.filterLabel}>{copy.filterGov}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.govScroll} contentContainerStyle={styles.govContent}>
          {JORDAN_GOVERNORATES.map(gov => (
            <Pressable 
              key={gov} 
              style={[styles.govChip, selectedGovernorate === gov && styles.govChipActive]}
              onPress={() => setSelectedGovernorate(gov)}
            >
              <Text style={[styles.govText, selectedGovernorate === gov && styles.govTextActive]}>{gov}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={{ height: 20 }} />

        {/* Loading */}
        {isLoading && (
          <View style={styles.emptyState}>
            <Feather name="loader" size={32} color={colors.gold} style={{ opacity: 0.6 }} />
            <Text style={styles.emptyText}>{isRTL ? 'جاري التحميل...' : 'Loading trips...'}</Text>
          </View>
        )}
        
        {/* Empty state */}
        {!isLoading && filteredRides.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="map" size={28} color={colors.gold} />
            </View>
            <Text style={styles.emptyTitle}>{isRTL ? 'لا توجد رحلات' : 'No trips available'}</Text>
            <Text style={styles.emptyText}>{copy.noRides}</Text>
          </View>
        )}

        {/* Trip cards */}
        {filteredRides.map(ride => (
          <Pressable 
            key={ride.captainId} 
            onPress={() => {
              void Haptics.selectionAsync();
              setSelectedRide(ride);
              setSeatsToBook(1);
            }} 
            style={({ pressed }) => [styles.tripCard, pressed && { transform: [{ scale: 0.98 }] }]}
          >
            {/* Driver info header */}
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>{ride.captainId.slice(-2).toUpperCase()}</Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>Driver {ride.captainId.slice(-4)}</Text>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={12} color={colors.gold} />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
              <Pressable style={styles.bookBtn} onPress={() => { setSelectedRide(ride); setSeatsToBook(1); }}>
                <Text style={styles.bookBtnText}>{isRTL ? 'حجز' : 'Book'}</Text>
                <Feather name="arrow-right" size={14} color={colors.primaryForeground} />
              </Pressable>
            </View>
            
            {/* Route pill */}
            <View style={styles.tripRouteRow}>
              <View style={styles.tripRouteIcon}>
                <Feather name={activeTab === 'hourly' ? "clock" : "navigation"} size={14} color={colors.gold} />
              </View>
              <Text style={styles.tripRouteText}>
                {ride.vehicleMakeModel}
              </Text>
            </View>

            {/* Metrics */}
            <View style={styles.metricsRow}>
              {activeTab === 'standard' && (
                <View style={styles.metricChip}>
                  <Feather name="users" size={13} color={colors.petrol} />
                  <Text style={styles.metricText}>{ride.availableSeats} {copy.available}</Text>
                </View>
              )}
              <View style={styles.fareChip}>
                <Text style={styles.fareAmount}>{ride.estimatedFare.toFixed(2)}</Text>
                <Text style={styles.fareCurrency}>{activeTab === 'hourly' ? copy.pricePerHour : copy.perSeat}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  
  // Header
  headerArea: { 
    paddingHorizontal: 18, 
    paddingBottom: 14, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: colors.card, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandIcon: { width: 42, height: 42, borderRadius: 14, marginRight: 10 },
  brandName: { color: colors.ink, fontSize: 19, fontWeight: '800', letterSpacing: 0.3 },
  brandArabic: { color: colors.gold, fontSize: 11, fontWeight: '700', marginTop: -1 },
  profileButton: { 
    width: 42, 
    height: 42, 
    borderRadius: 14, 
    backgroundColor: colors.secondary, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  content: { paddingHorizontal: 18, paddingTop: 14 },
  
  // Hero
  heroSection: { marginBottom: 22 },
  heroTitle: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  heroSubtitle: { color: colors.mutedForeground, fontSize: 14, marginTop: 6 },

  // Type toggle
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  typeBtnActive: { backgroundColor: colors.petrol },
  typeText: { fontSize: 13, fontWeight: '700', color: colors.mutedForeground },
  typeTextActive: { color: colors.primaryForeground },

  // Governorate chips
  filterLabel: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  govScroll: { flexDirection: 'row' },
  govContent: { paddingRight: 18 },
  govChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  govChipActive: { backgroundColor: colors.goldSoft, borderColor: colors.gold },
  govText: { fontSize: 13, fontWeight: '600', color: colors.mutedForeground },
  govTextActive: { color: colors.gold, fontWeight: '800' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { 
    width: 72, 
    height: 72, 
    borderRadius: 24, 
    backgroundColor: colors.goldSoft, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8,
  },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.mutedForeground, fontSize: 13, textAlign: 'center', maxWidth: 260 },

  // Trip card
  tripCard: { 
    backgroundColor: colors.card, 
    borderRadius: 22, 
    borderWidth: 1, 
    borderColor: colors.border, 
    padding: 16,
    marginBottom: 14,
  },
  
  // Driver row
  driverRow: { flexDirection: 'row', alignItems: 'center' },
  driverAvatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 15, 
    backgroundColor: colors.petrol, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12,
  },
  driverAvatarText: { color: colors.gold, fontSize: 14, fontWeight: '800' },
  driverInfo: { flex: 1 },
  driverName: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  ratingText: { color: colors.mutedForeground, fontSize: 11, fontWeight: '800' },
  
  bookBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: colors.gold, 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 12,
  },
  bookBtnText: { color: colors.primaryForeground, fontSize: 13, fontWeight: '800' },

  // Route row
  tripRouteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  tripRouteIcon: { 
    width: 34, 
    height: 34, 
    borderRadius: 11, 
    backgroundColor: colors.goldSoft, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 10,
  },
  tripRouteText: { color: colors.ink, fontSize: 13, fontWeight: '700', flex: 1 },
  
  // Metrics
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  metricChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.mint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  metricText: { color: colors.petrol, fontSize: 12, fontWeight: '700' },
  fareChip: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  fareAmount: { color: colors.gold, fontSize: 20, fontWeight: '800' },
  fareCurrency: { color: colors.mutedForeground, fontSize: 11, fontWeight: '600' },

  // Booking confirmation
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  iconButton: { 
    width: 42, 
    height: 42, 
    borderRadius: 14, 
    backgroundColor: colors.card, 
    borderWidth: 1, 
    borderColor: colors.border, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  topBarTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  confirmSubtitle: { color: colors.mutedForeground, fontSize: 14, marginBottom: 20 },
  
  confirmCard: { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 18 },
  confirmRouteRow: { flexDirection: 'row', alignItems: 'center' },
  confirmRouteIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 13, 
    backgroundColor: colors.goldSoft, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12,
  },
  confirmRouteText: { color: colors.ink, fontSize: 15, fontWeight: '700', flex: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
  
  seatPickerLabel: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 12 },
  seatPicker: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  seatOption: { 
    flex: 1, 
    minHeight: 52, 
    borderRadius: 14, 
    borderWidth: 2, 
    borderColor: colors.border, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: colors.background,
  },
  seatOptionSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  seatNumber: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  seatNumberSelected: { color: colors.primaryForeground },
  
  confirmSummary: { backgroundColor: colors.background, borderRadius: 14, padding: 14, marginTop: 4 },
  confirmLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, alignItems: 'center' },
  confirmLabel: { color: colors.mutedForeground, fontSize: 13 },
  confirmValue: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  confirmDividerThin: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  confirmTotalLabel: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  confirmTotalValue: { color: colors.gold, fontSize: 20, fontWeight: '800' },
  
  primaryButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    minHeight: 56, 
    borderRadius: 16, 
    backgroundColor: colors.gold, 
    marginTop: 24,
  },
  primaryButtonText: { color: colors.primaryForeground, fontSize: 16, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', paddingVertical: 16 },
  secondaryButtonText: { color: colors.mutedForeground, fontSize: 14, fontWeight: '700' },
});