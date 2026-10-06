import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useListPassengerRideRequests } from '@workspace/api-client-react';

export default function AdminDashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  
  // In a real app, ensure user.role === 'admin' before showing this
  // For demo, we just proceed.
  
  // Use the API hook to get ride requests. We might filter them manually if the backend doesn't support ?type=
  const { data: requests, isLoading, refetch } = useListPassengerRideRequests();
  
  // Filter for special requests (airport and custom)
  // TypeScript might complain if `type` and `customSearchText` aren't yet in the generated Zod/Orval types,
  // but we added them to the OpenAPI spec, so they should be there after codegen.
  const specialRequests = Array.isArray(requests) 
    ? requests.filter((r: any) => r.type === 'airport' || r.type === 'custom')
    : [];

  const handleAssignCaptain = (requestId: string) => {
    // Here an admin would open a modal to select an available captain
    // For now, we'll just show an alert
    Alert.alert('Assign Captain', 'This would open a list of available captains to assign to request: ' + requestId);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>Admin Dashboard</Text>
        <Pressable onPress={() => refetch()} style={styles.refreshButton}>
          <Feather name="refresh-cw" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryTitle, { color: colors.ink }]}>Special Requests</Text>
          <Text style={[styles.summarySubtitle, { color: colors.mutedForeground }]}>
            Review and assign captains to Airport and Custom trips.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.gold} style={{ marginTop: 40 }} />
        ) : specialRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={48} color={colors.mint} />
            <Text style={[styles.emptyText, { color: colors.ink }]}>No pending special requests</Text>
          </View>
        ) : (
          specialRequests.map((req: any) => (
            <View key={req.id} style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: req.type === 'airport' ? colors.goldSoft : colors.mint }]}>
                  <Feather name={(req.type === 'airport' ? 'plane' : 'search') as any} size={14} color={req.type === 'airport' ? colors.gold : colors.petrol} />
                  <Text style={[styles.typeText, { color: req.type === 'airport' ? colors.gold : colors.petrol }]}>
                    {req.type === 'airport' ? 'Airport Trip' : 'Custom Trip'}
                  </Text>
                </View>
                <Text style={[styles.statusText, { color: colors.mutedForeground }]}>{req.status}</Text>
              </View>

              <View style={styles.cardBody}>
                {req.type === 'custom' && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Destination:</Text>
                    <Text style={[styles.detailValue, { color: colors.ink }]}>{req.customSearchText || 'N/A'}</Text>
                  </View>
                )}
                {req.type === 'airport' && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Price:</Text>
                    <Text style={[styles.detailValue, { color: colors.gold, fontWeight: '800' }]}>20 JOD</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Passenger:</Text>
                  <Text style={[styles.detailValue, { color: colors.ink }]}>{req.passenger?.fullName || 'Unknown'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Requested At:</Text>
                  <Text style={[styles.detailValue, { color: colors.ink }]}>{new Date(req.createdAt).toLocaleTimeString()}</Text>
                </View>
              </View>

              <Pressable 
                style={[styles.assignButton, { backgroundColor: colors.primary }]}
                onPress={() => handleAssignCaptain(req.id)}
              >
                <Text style={[styles.assignButtonText, { color: colors.primaryForeground }]}>Assign Captain</Text>
                <Feather name="user-plus" size={16} color={colors.primaryForeground} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  refreshButton: { padding: 4 },
  title: { fontSize: 20, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  summaryContainer: { marginBottom: 24 },
  summaryTitle: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  summarySubtitle: { fontSize: 14 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 16 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  
  requestCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  typeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  
  cardBody: { gap: 12, marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start' },
  detailLabel: { width: 90, fontSize: 13, fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 14, fontWeight: '700' },
  
  assignButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 12, gap: 8 },
  assignButtonText: { fontSize: 14, fontWeight: '800' },
});
