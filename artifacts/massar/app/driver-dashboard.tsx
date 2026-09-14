import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, RefreshControl, TextInput, KeyboardAvoidingView } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useListRides, useCreateRide } from '@workspace/api-client-react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JORDAN_GOVERNORATES } from '@/constants/governorates';

export default function DriverDashboardScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const [driverId, setDriverId] = useState<string | null>(null);
  
  // Form state
  const [tripType, setTripType] = useState<'standard' | 'hourly'>('standard');
  const [selectedGovernorate, setSelectedGovernorate] = useState(JORDAN_GOVERNORATES[0]);
  const [route, setRoute] = useState('Jerash -> Amman');
  const [totalSeats, setTotalSeats] = useState('4');
  const [farePerSeat, setFarePerSeat] = useState('2.5');
  const [rentalHours, setRentalHours] = useState('4');

  useEffect(() => {
    AsyncStorage.getItem('@massar/driverId').then(id => {
      if (!id) {
        id = `driver-test-${Date.now()}`;
        AsyncStorage.setItem('@massar/driverId', id);
      }
      setDriverId(id);
    });
  }, []);

  const { data: rides, isLoading, refetch } = useListRides(
    { driverId: driverId ?? undefined },
    { query: { enabled: !!driverId } as any }
  );
  const createRideMutation = useCreateRide();

  const handleCreateRide = async () => {
    if (!driverId) return;
    try {
      await createRideMutation.mutateAsync({
        data: {
          driverId,
          route: tripType === 'standard' ? route : selectedGovernorate,
          totalSeats: parseInt(totalSeats, 10) || 4,
          farePerSeat: parseFloat(farePerSeat) || 2.5,
          type: tripType,
          rentalHours: tripType === 'hourly' ? parseInt(rentalHours, 10) : undefined,
        }
      });
      Alert.alert(isRTL ? "تم إنشاء الرحلة" : "Ride Created", isRTL ? "تمت إضافة الرحلة بنجاح" : "Your ride is now available for passengers.");
      refetch();
    } catch (e) {
      Alert.alert("Error", "Could not create ride");
    }
  };

  const copy = isRTL ? {
    title: "لوحة تحكم السائق",
    createRide: "إنشاء رحلة جديدة",
    myRides: "رحلاتي المتاحة",
    noRides: "لا توجد رحلات متاحة حالياً.",
    publish: "نشر الرحلة",
    route: "المسار",
    seats: "مقاعد",
    available: "مقاعد متاحة",
    fare: "دينار للمقعد",
    pricePerHour: "دينار للساعة",
    hours: "عدد الساعات",
    refreshing: "جاري التحديث...",
    statusOpen: "متاح",
    statusFull: "ممتلئ",
    standard: "رحلة عادية",
    hourly: "تأجير بالساعة (Hangout)",
    governorate: "المحافظة",
  } : {
    title: "Driver Dashboard",
    createRide: "Create New Ride",
    myRides: "My Available Rides",
    noRides: "You haven't created any rides.",
    publish: "Publish Ride",
    route: "Route",
    seats: "Seats",
    available: "available",
    fare: "JOD / seat",
    pricePerHour: "JOD / hour",
    hours: "Hours",
    refreshing: "Refreshing...",
    statusOpen: "Open",
    statusFull: "Full",
    standard: "Standard Trip",
    hourly: "Hourly Rental (Hangout)",
    governorate: "Governorate",
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.backBtn}>
          <Feather name={isRTL ? "arrow-right" : "arrow-left"} size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{copy.title}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 20 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <Text style={styles.subtitle}>{copy.createRide}</Text>
        
        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <Pressable 
            style={[styles.typeBtn, tripType === 'standard' && styles.typeBtnActive]} 
            onPress={() => setTripType('standard')}
          >
            <Text style={[styles.typeText, tripType === 'standard' && styles.typeTextActive]}>{copy.standard}</Text>
          </Pressable>
          <Pressable 
            style={[styles.typeBtn, tripType === 'hourly' && styles.typeBtnActive]} 
            onPress={() => setTripType('hourly')}
          >
            <Text style={[styles.typeText, tripType === 'hourly' && styles.typeTextActive]}>{copy.hourly}</Text>
          </Pressable>
        </View>

        <View style={styles.formCard}>
          {tripType === 'standard' ? (
            <>
              <Text style={styles.label}>{copy.route}</Text>
              <TextInput 
                style={styles.input} 
                value={route}
                onChangeText={setRoute}
                placeholder="e.g. Jerash -> Amman"
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>{copy.governorate}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.govScroll}>
                {JORDAN_GOVERNORATES.map(gov => (
                  <Pressable 
                    key={gov} 
                    style={[styles.govBtn, selectedGovernorate === gov && styles.govBtnActive]}
                    onPress={() => setSelectedGovernorate(gov)}
                  >
                    <Text style={[styles.govText, selectedGovernorate === gov && styles.govTextActive]}>{gov}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>{tripType === 'hourly' ? copy.hours : copy.seats}</Text>
              <TextInput 
                style={styles.input} 
                value={tripType === 'hourly' ? rentalHours : totalSeats}
                onChangeText={tripType === 'hourly' ? setRentalHours : setTotalSeats}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>{tripType === 'hourly' ? copy.pricePerHour : copy.fare}</Text>
              <TextInput 
                style={styles.input} 
                value={farePerSeat}
                onChangeText={setFarePerSeat}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <Pressable 
            onPress={handleCreateRide} 
            disabled={createRideMutation.isPending}
            style={({ pressed }) => [
              styles.primaryBtn, 
              (createRideMutation.isPending || pressed) && { opacity: 0.7 }
            ]}
          >
            <Text style={styles.primaryBtnText}>{copy.publish}</Text>
            <Feather name="plus" size={18} color={colors.primaryForeground} />
          </Pressable>
        </View>

        <Text style={[styles.subtitle, { marginTop: 32 }]}>{copy.myRides}</Text>
        
        {isLoading ? (
          <View style={styles.emptyState}>
            <Feather name="loader" size={48} color={colors.petrol} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyText}>{copy.refreshing}</Text>
          </View>
        ) : (!Array.isArray(rides) || rides.length === 0) ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Feather name="list" size={32} color={colors.petrol} />
            </View>
            <Text style={styles.emptyText}>{copy.noRides}</Text>
          </View>
        ) : (
          rides.map(ride => (
            <View key={ride.id} style={styles.rideCard}>
              <View style={styles.rideTop}>
                <View style={styles.routePill}>
                  <Feather name={ride.type === 'hourly' ? 'clock' : 'map-pin'} size={12} color={colors.petrol} style={{ marginRight: 6 }} />
                  <Text style={styles.routeText}>{ride.type === 'hourly' ? `${ride.route} (${ride.rentalHours} ${copy.hours})` : ride.route}</Text>
                </View>
                <View style={[styles.statusBadge, ride.status === 'full' && styles.statusBadgeFull]}>
                  <Text style={[styles.statusText, ride.status === 'full' && styles.statusTextFull]}>
                    {ride.status === 'full' ? copy.statusFull : copy.statusOpen}
                  </Text>
                </View>
              </View>
              <View style={styles.rideDetails}>
                {ride.type !== 'hourly' && (
                  <View style={styles.detailItem}>
                    <Feather name="users" size={16} color={colors.mutedForeground} />
                    <Text style={styles.detailText}>{ride.availableSeats}/{ride.totalSeats} {copy.available}</Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <Feather name="credit-card" size={16} color={colors.mutedForeground} />
                  <Text style={styles.detailText}>{ride.farePerSeat.toFixed(2)} {ride.type === 'hourly' ? copy.pricePerHour : copy.fare}</Text>
                </View>
              </View>
              <Text style={styles.timeText}>
                {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  content: { padding: 18 },
  subtitle: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 16 },
  
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 13,
  },
  typeBtnActive: { backgroundColor: colors.petrol },
  typeText: { fontSize: 14, fontWeight: '700', color: colors.mutedForeground },
  typeTextActive: { color: '#FFFFFF' },

  formCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  
  govScroll: { marginBottom: 16, flexDirection: 'row' },
  govBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  govBtnActive: { backgroundColor: colors.goldSoft, borderColor: colors.gold },
  govText: { fontSize: 13, fontWeight: '600', color: colors.mutedForeground },
  govTextActive: { color: colors.gold, fontWeight: '800' },

  primaryBtn: {
    backgroundColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 16 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 28, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.mutedForeground, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  
  rideCard: { 
    backgroundColor: colors.card, 
    borderRadius: 22, 
    borderWidth: 1, 
    borderColor: colors.border, 
    padding: 16,
    marginBottom: 16,
  },
  rideTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  routePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.goldSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  routeText: { color: colors.gold, fontSize: 12, fontWeight: '700' },
  statusBadge: { backgroundColor: colors.successSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusBadgeFull: { backgroundColor: '#FFECEC' },
  statusText: { color: colors.success, fontSize: 11, fontWeight: '700' },
  statusTextFull: { color: '#E53E3E' },
  timeText: { color: colors.mutedForeground, fontSize: 12, fontWeight: '600', marginTop: 12 },
  rideDetails: { flexDirection: 'row', gap: 24 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
});
