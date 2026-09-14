import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';

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

export default function TripsScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const [trips, setTrips] = useState<StoredTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    const saved = await AsyncStorage.getItem('@massar/trips');
    setTrips(saved ? JSON.parse(saved) : []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTrips();
    }, [loadTrips]),
  );

  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{t('journal')}</Text>
            <Text style={styles.title}>{t('yourRides')}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Feather name="bookmark" size={19} color={colors.gold} />
          </View>
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="map" size={24} color={colors.gold} />
            </View>
            <Text style={styles.emptyTitle}>{t('nextRoute')}</Text>
            <Text style={styles.emptyText}>{t('nextRouteDescription')}</Text>
          </View>
        ) : (
          trips.map((trip) => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.statusRow}>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{trip.status}</Text>
                </View>
                <Text style={styles.dateText}>{new Date(trip.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.routeRow}>
                <View style={styles.routeIcon}>
                  <Feather name="navigation" size={19} color={colors.gold} />
                </View>
                <View style={styles.routeCopy}>
                  <Text style={styles.routeText}>{trip.route}</Text>
                  <Text style={styles.routeMeta}>{trip.vehicle}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </View>
              <View style={styles.tripFooter}>
                <Text style={styles.footerText}>{trip.seats} {trip.seats === 1 ? t('seat') : t('seats')}</Text>
                <Text style={styles.footerFare}>{trip.fare.toFixed(2)} JOD</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 18, paddingTop: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    eyebrow: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
    title: { color: colors.ink, fontSize: 30, fontWeight: '800', marginTop: 7, letterSpacing: -0.6 },
    headerIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.goldSoft },
    emptyState: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 110 },
    emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.goldSoft, marginBottom: 17 },
    emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', textAlign: 'center' },
    emptyText: { color: colors.mutedForeground, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8 },
    tripCard: { backgroundColor: colors.card, borderRadius: 21, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 13 },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 6 },
    statusText: { color: colors.success, fontSize: 10, fontWeight: '700' },
    dateText: { color: colors.mutedForeground, fontSize: 10 },
    routeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
    routeIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
    routeCopy: { flex: 1 },
    routeText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
    routeMeta: { color: colors.mutedForeground, fontSize: 11, marginTop: 5 },
    tripFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.border },
    footerText: { color: colors.mutedForeground, fontSize: 11 },
    footerFare: { color: colors.gold, fontSize: 14, fontWeight: '800' },
  });