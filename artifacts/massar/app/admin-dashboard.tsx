import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useListAdminRideRequests } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'standard' | 'airport' | 'custom'>('all');

  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      Alert.alert(
        isRTL ? 'غير مصرح' : 'Unauthorized',
        isRTL
          ? 'لوحة التحكم الإدارية مخصصة للمشرفين فقط.'
          : 'The admin dashboard is restricted to administrators.',
        [{ text: isRTL ? 'الرجوع' : 'Go Back', onPress: () => router.replace('/(tabs)' as any) }]
      );
    }
  }, [user, isRTL]);

  const { data: requests, isLoading, isRefetching, refetch } = useListAdminRideRequests({
    query: { enabled: user?.role === 'admin' } as any,
  });

  const allRequests = Array.isArray(requests) ? requests : [];

  const filteredRequests = allRequests.filter((r: any) => {
    if (activeFilter === 'all') return true;
    return r.type === activeFilter;
  });

  const handleAssignCaptain = (requestId: string) => {
    Alert.alert(
      isRTL ? 'تعيين كابتن' : 'Assign Captain',
      isRTL
        ? `سيتم فتح نافذة اختيار كابتن متاح للطلب رقم: ${requestId.slice(0, 8)}...`
        : `Select an available captain for request: ${requestId.slice(0, 8)}...`
    );
  };

  const getBadgeColor = (type?: string) => {
    switch (type) {
      case 'airport':
        return { bg: colors.goldSoft, text: colors.gold, icon: 'send' as const, label: isRTL ? 'مطار الملكة علياء' : 'Airport' };
      case 'custom':
        return { bg: colors.secondary, text: colors.primary, icon: 'compass' as const, label: isRTL ? 'رحلة خاصة' : 'Custom' };
      default:
        return { bg: colors.mint, text: colors.ink, icon: 'map-pin' as const, label: isRTL ? 'بين المحافظات' : 'Standard' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'requested':
      case 'searching':
        return isRTL ? 'قيد الانتظار' : 'Pending';
      case 'accepted':
      case 'matched':
        return isRTL ? 'تم القبول' : 'Accepted';
      case 'in_progress':
        return isRTL ? 'جارية' : 'In Progress';
      case 'completed':
        return isRTL ? 'مكتملة' : 'Completed';
      case 'cancelled':
        return isRTL ? 'ملغية' : 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name={isRTL ? 'arrow-right' : 'arrow-left'} size={22} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>
          {isRTL ? 'لوحة تحكم العمليات (Admin)' : 'Admin Operations'}
        </Text>
        <Pressable onPress={() => refetch()} style={styles.refreshButton}>
          <Feather name="refresh-cw" size={18} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryTitle, { color: colors.ink }]}>
            {isRTL ? 'كافة طلبات الركاب' : 'Passenger Ride Requests'}
          </Text>
          <Text style={[styles.summarySubtitle, { color: colors.mutedForeground }]}>
            {isRTL
              ? `إجمالي الطلبات المسجلة: ${allRequests.length} طلب`
              : `Total recorded requests: ${allRequests.length}`}
          </Text>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {[
            { id: 'all', label: isRTL ? `الكل (${allRequests.length})` : `All (${allRequests.length})` },
            { id: 'standard', label: isRTL ? 'بين المحافظات' : 'Standard' },
            { id: 'airport', label: isRTL ? 'المطار' : 'Airport' },
            { id: 'custom', label: isRTL ? 'خاصة' : 'Custom' },
          ].map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveFilter(tab.id as any)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? colors.gold : colors.card,
                    borderColor: active ? colors.gold : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: active ? colors.primaryForeground : colors.mutedForeground, fontWeight: active ? '700' : '500' },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.gold} style={{ marginTop: 40 }} />
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.ink }]}>
              {isRTL ? 'لا توجد طلبات رحلات حالياً' : 'No ride requests found'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              {isRTL ? 'ستظهر طلبات الركاب الجديدة هنا فور إرسالها' : 'New passenger requests will show up here immediately'}
            </Text>
          </View>
        ) : (
          filteredRequests.map((req: any) => {
            const badge = getBadgeColor(req.type);
            const statusLabel = getStatusText(req.status);
            return (
              <View
                key={req.id}
                style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                    <Feather name={badge.icon} size={13} color={badge.text} />
                    <Text style={[styles.typeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.statusText, { color: colors.ink }]}>{statusLabel}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  {/* Route / Destination */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                      {isRTL ? 'المسار / الوجهة:' : 'Route / Dest:'}
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.ink }]}>
                      {req.routeName || req.customSearchText || (req.routeId ? req.routeId : (isRTL ? 'غير محدد' : 'N/A'))}
                    </Text>
                  </View>

                  {/* Passenger */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                      {isRTL ? 'الراكب:' : 'Passenger:'}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.detailValue, { color: colors.ink }]}>
                        {req.passenger?.fullName || (isRTL ? 'غير معروف' : 'Unknown')}
                      </Text>
                      {req.passenger?.phone && (
                        <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                          {req.passenger.phone}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Seats & Fare */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                      {isRTL ? 'المقاعد والسعر:' : 'Seats & Fare:'}
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.gold, fontWeight: '800' }]}>
                      {req.seatsRequested ?? 1} {isRTL ? 'مقعد' : 'seats'} • {req.estimatedFare ? `${req.estimatedFare} JOD` : '—'}
                    </Text>
                  </View>

                  {/* Time */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                      {isRTL ? 'وقت الطلب:' : 'Requested:'}
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.mutedForeground, fontSize: 12 }]}>
                      {req.createdAt ? new Date(req.createdAt).toLocaleString(isRTL ? 'ar-JO' : 'en-US') : '—'}
                    </Text>
                  </View>
                </View>

                {/* Assign Captain button */}
                <Pressable
                  style={[styles.assignButton, { backgroundColor: colors.gold }]}
                  onPress={() => handleAssignCaptain(req.id)}
                >
                  <Feather name="user-plus" size={16} color={colors.primaryForeground} />
                  <Text style={[styles.assignButtonText, { color: colors.primaryForeground }]}>
                    {isRTL ? 'تعيين كابتن' : 'Assign Captain'}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backButton: { padding: 6, borderRadius: 8 },
  refreshButton: { padding: 6, borderRadius: 8 },
  title: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 16 },
  summaryContainer: { marginBottom: 16 },
  summaryTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  summarySubtitle: { fontSize: 13 },

  filterScroll: { marginBottom: 16 },
  filterContent: { gap: 8, paddingVertical: 4 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 13 },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 17, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', maxWidth: 280 },

  requestCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, gap: 6 },
  typeText: { fontSize: 12, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },

  cardBody: { gap: 10, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start' },
  detailLabel: { width: 110, fontSize: 13, fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 14, fontWeight: '600' },

  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  assignButtonText: { fontSize: 14, fontWeight: '700' },
});
