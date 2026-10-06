import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useListRoutes, useCreatePassengerRideRequest } from '@workspace/api-client-react';
import type { Route } from '@workspace/api-client-react';

export default function RequestRideScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [seats, setSeats] = useState(1);

  const routesQuery = useListRoutes();
  const createMutation = useCreatePassengerRideRequest();

  const routes = routesQuery.data ?? [];

  const handleSubmit = async () => {
    if (!selectedRoute) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'الرجاء اختيار مسار' : 'Please select a route',
      );
      return;
    }

    try {
      await createMutation.mutateAsync({
        data: {
          routeId: selectedRoute.id,
          // Default pickup/dest to route origin/destination centroids
          // In a real app these come from a map picker
          pickupLat: 32.0,
          pickupLng: 35.8,
          destLat: 31.9,
          destLng: 35.9,
          seats,
          type: 'standard',
        },
      });

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        isRTL ? 'تم الطلب!' : 'Request Sent!',
        isRTL
          ? `تم إرسال طلب رحلتك (${seats} ${seats === 1 ? 'مقعد' : 'مقاعد'}) بنجاح. سيتواصل معك الكابتن قريباً.`
          : `Your ride request for ${seats} ${seats === 1 ? 'seat' : 'seats'} was submitted. A captain will be assigned shortly.`,
        [
          {
            text: isRTL ? 'عرض رحلاتي' : 'View My Trips',
            onPress: () => router.replace('/(tabs)/trips' as any),
          },
          { text: isRTL ? 'حسناً' : 'OK', onPress: () => router.back() },
        ],
      );
    } catch (e: any) {
      Alert.alert(isRTL ? 'خطأ' : 'Error', e?.message ?? (isRTL ? 'تعذر إرسال الطلب' : 'Could not submit request'));
    }
  };

  const estimatedFare = selectedRoute ? selectedRoute.baseFare * seats : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>
          {isRTL ? 'طلب رحلة' : 'Request a Ride'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.goldSoft }]}>
            <Feather name="navigation" size={28} color={colors.gold} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.ink }]}>
            {isRTL ? 'اختر مسارك وقم بتقديم طلب الرحلة' : 'Choose your route and request a ride'}
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            {isRTL
              ? 'سيتم مراجعة طلبك وتعيين كابتن متاح لك'
              : 'Your request will appear in the admin dashboard and a captain will be assigned'}
          </Text>
        </View>

        {/* Routes */}
        <Text style={[styles.sectionLabel, { color: colors.ink }]}>
          {isRTL ? 'اختر المسار' : 'Select Route'}
        </Text>

        {routesQuery.isLoading && (
          <ActivityIndicator color={colors.gold} style={{ marginVertical: 20 }} />
        )}

        {routesQuery.isError && (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {isRTL ? 'تعذر تحميل المسارات' : 'Could not load routes. Make sure the API server is running.'}
          </Text>
        )}

        {routes.map((route) => {
          const isSelected = selectedRoute?.id === route.id;
          return (
            <Pressable
              key={route.id}
              onPress={() => {
                void Haptics.selectionAsync();
                setSelectedRoute(route);
              }}
              style={[
                styles.routeCard,
                {
                  backgroundColor: isSelected ? colors.goldSoft : colors.card,
                  borderColor: isSelected ? colors.gold : colors.border,
                },
              ]}
            >
              <View style={styles.routeLeft}>
                <View
                  style={[
                    styles.routeIconBox,
                    { backgroundColor: isSelected ? colors.gold : colors.secondary },
                  ]}
                >
                  <Feather
                    name="map-pin"
                    size={16}
                    color={isSelected ? colors.primaryForeground : colors.mutedForeground}
                  />
                </View>
                <View style={styles.routeTextBlock}>
                  <Text style={[styles.routeName, { color: colors.ink }]}>{route.name}</Text>
                  <Text style={[styles.routeOriginDest, { color: colors.mutedForeground }]}>
                    {route.origin} → {route.destination}
                  </Text>
                </View>
              </View>
              <View style={styles.routeRight}>
                <Text style={[styles.routeFare, { color: colors.gold }]}>
                  {route.baseFare} JOD
                </Text>
                <Text style={[styles.routePerSeat, { color: colors.mutedForeground }]}>
                  {isRTL ? '/مقعد' : '/seat'}
                </Text>
                {isSelected && (
                  <View style={[styles.checkIcon, { backgroundColor: colors.gold }]}>
                    <Feather name="check" size={12} color={colors.primaryForeground} />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}

        {/* Seats */}
        {selectedRoute && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.ink, marginTop: 28 }]}>
              {isRTL ? 'عدد المقاعد' : 'Number of Seats'}
            </Text>
            <View style={styles.seatRow}>
              {[1, 2, 3, 4].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    setSeats(n);
                  }}
                  style={[
                    styles.seatBtn,
                    {
                      backgroundColor: seats === n ? colors.gold : colors.card,
                      borderColor: seats === n ? colors.gold : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.seatNum,
                      { color: seats === n ? colors.primaryForeground : colors.ink },
                    ]}
                  >
                    {n}
                  </Text>
                  <Text
                    style={[
                      styles.seatLabel,
                      { color: seats === n ? colors.primaryForeground : colors.mutedForeground },
                    ]}
                  >
                    {isRTL ? 'مقعد' : n === 1 ? 'seat' : 'seats'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Summary card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                  {isRTL ? 'المسار' : 'Route'}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.ink }]}>{selectedRoute.name}</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                  {isRTL ? 'المقاعد' : 'Seats'}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.ink }]}>×{seats}</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryTotalLabel, { color: colors.ink }]}>
                  {isRTL ? 'الإجمالي المقدر' : 'Estimated Total'}
                </Text>
                <Text style={[styles.summaryTotalValue, { color: colors.gold }]}>
                  {estimatedFare.toFixed(2)} JOD
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom submit button */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={!selectedRoute || createMutation.isPending}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: selectedRoute ? colors.gold : colors.secondary,
              opacity: pressed || createMutation.isPending ? 0.8 : 1,
            },
          ]}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Feather
                name="send"
                size={18}
                color={selectedRoute ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.submitText,
                  { color: selectedRoute ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {isRTL ? 'إرسال الطلب' : 'Submit Request'}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof import('@/hooks/useColors').useColors>) =>
  StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: { fontSize: 17, fontWeight: '800' },

    // Scroll content
    scroll: { paddingHorizontal: 18, paddingTop: 24 },

    // Hero
    hero: { alignItems: 'center', marginBottom: 32 },
    heroIcon: {
      width: 72,
      height: 72,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    heroTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
    heroSub: { fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 280 },

    // Section
    sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    errorText: { fontSize: 13, textAlign: 'center', marginVertical: 16 },

    // Route cards
    routeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 18,
      borderWidth: 1.5,
      padding: 14,
      marginBottom: 10,
    },
    routeLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    routeIconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    routeTextBlock: { flex: 1 },
    routeName: { fontSize: 15, fontWeight: '800' },
    routeOriginDest: { fontSize: 12, marginTop: 2 },
    routeRight: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
    routeFare: { fontSize: 18, fontWeight: '800' },
    routePerSeat: { fontSize: 11 },
    checkIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },

    // Seats
    seatRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    seatBtn: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 2,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    seatNum: { fontSize: 22, fontWeight: '800' },
    seatLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },

    // Summary
    summaryCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    summaryLabel: { fontSize: 13 },
    summaryValue: { fontSize: 14, fontWeight: '700' },
    summaryDivider: { height: 1, marginVertical: 4 },
    summaryTotalLabel: { fontSize: 15, fontWeight: '800' },
    summaryTotalValue: { fontSize: 22, fontWeight: '800' },

    // Footer
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 18,
      paddingTop: 12,
      borderTopWidth: 1,
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      height: 56,
      borderRadius: 18,
    },
    submitText: { fontSize: 16, fontWeight: '800' },
  });
