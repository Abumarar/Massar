import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, RefreshControl } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useListRides, useAcceptRide } from '@workspace/api-client-react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DriverDashboardScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  // For testing purposes, driverId is random or saved
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@massar/driverId').then(id => {
      if (!id) {
        id = `driver-test-${Date.now()}`;
        AsyncStorage.setItem('@massar/driverId', id);
      }
      setDriverId(id);
    });
  }, []);

  const { data: rides, isLoading, refetch } = useListRides({ status: 'pending' });
  const acceptRideMutation = useAcceptRide();

  const handleAcceptRide = async (rideId: string) => {
    if (!driverId) return;
    try {
      await acceptRideMutation.mutateAsync({
        rideId,
        data: { driverId }
      });
      Alert.alert(isRTL ? "تم قبول الرحلة" : "Ride Accepted", isRTL ? "تم بنجاح" : "Successfully accepted ride");
      refetch();
    } catch (e) {
      Alert.alert("Error", "Could not accept ride");
    }
  };

  const copy = isRTL ? {
    title: "لوحة تحكم السائق",
    subtitle: "الرحلات المتاحة",
    noRides: "لا توجد رحلات متاحة حالياً.",
    accept: "قبول الرحلة",
    seats: "مقاعد",
    fare: "دينار",
    back: "رجوع",
    refreshing: "جاري التحديث...",
  } : {
    title: "Driver Dashboard",
    subtitle: "Available Rides",
    noRides: "No available rides at the moment.",
    accept: "Accept Ride",
    seats: "seats",
    fare: "JOD",
    back: "Back",
    refreshing: "Refreshing...",
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name={isRTL ? "arrow-right" : "arrow-left"} size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{copy.title}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 20 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
        
        {rides && rides.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={colors.border} />
            <Text style={styles.emptyText}>{copy.noRides}</Text>
          </View>
        )}

        {rides && rides.map(ride => (
          <View key={ride.id} style={styles.rideCard}>
            <View style={styles.rideTop}>
              <View style={styles.routePill}>
                <Feather name="map-pin" size={12} color={colors.petrol} style={{ marginRight: 6 }} />
                <Text style={styles.routeText}>{ride.route}</Text>
              </View>
              <Text style={styles.timeText}>
                {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.rideDetails}>
              <View style={styles.detailItem}>
                <Feather name="users" size={16} color={colors.mutedForeground} />
                <Text style={styles.detailText}>{ride.seats} {copy.seats}</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="credit-card" size={16} color={colors.mutedForeground} />
                <Text style={styles.detailText}>{ride.fare.toFixed(2)} {copy.fare}</Text>
              </View>
            </View>
            <Pressable 
              onPress={() => handleAcceptRide(ride.id)} 
              disabled={acceptRideMutation.isPending}
              style={[styles.acceptBtn, acceptRideMutation.isPending && { opacity: 0.6 }]}
            >
              <Text style={styles.acceptBtnText}>{copy.accept}</Text>
              <Feather name="check" size={18} color={colors.primaryForeground} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
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
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: colors.mutedForeground, fontSize: 15, fontWeight: '600' },
  rideCard: { 
    backgroundColor: colors.card, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: colors.border, 
    padding: 16,
    marginBottom: 16,
  },
  rideTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  routePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.mint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  routeText: { color: colors.petrol, fontSize: 12, fontWeight: '700' },
  timeText: { color: colors.mutedForeground, fontSize: 12, fontWeight: '600' },
  rideDetails: { flexDirection: 'row', gap: 24, marginBottom: 20 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  acceptBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  acceptBtnText: { color: colors.primaryForeground, fontSize: 15, fontWeight: '800' },
});
