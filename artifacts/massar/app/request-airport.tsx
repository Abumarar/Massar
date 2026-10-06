import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useColors } from '@/hooks/useColors';
import { useCreatePassengerRideRequest } from '@workspace/api-client-react';

export default function RequestAirportScreen() {
  const colors = useColors();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bookRideMutation = useCreatePassengerRideRequest();

  const handleRequest = async () => {
    setIsSubmitting(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied', 'Location is required to request a trip.');
        setIsSubmitting(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      await bookRideMutation.mutateAsync({
        data: {
          type: 'airport',
          pickupLat: location.coords.latitude,
          pickupLng: location.coords.longitude,
          destLat: 31.72, // Queen Alia Airport approx
          destLng: 35.99,
          seats: 1,
        }
      });
      Alert.alert('Success', 'Airport trip requested successfully. An admin will assign a captain shortly.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not request trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>Request Airport Trip</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name={"plane" as any} size={48} color={colors.gold} style={{ alignSelf: 'center', marginBottom: 20 }} />
        <Text style={[styles.infoText, { color: colors.ink }]}>
          Need a ride to the airport?
        </Text>
        <Text style={[styles.subInfoText, { color: colors.mutedForeground }]}>
          Our admins will find the nearest available captain for you. The price is fixed at 20 JOD.
        </Text>
        
        <View style={[styles.priceRow, { borderColor: colors.border }]}>
          <Text style={[styles.priceLabel, { color: colors.ink }]}>Fixed Price:</Text>
          <Text style={[styles.priceValue, { color: colors.gold }]}>20 JOD</Text>
        </View>

        <Pressable 
          style={[styles.button, { backgroundColor: colors.primary }, isSubmitting && { opacity: 0.7 }]}
          onPress={handleRequest}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Confirm Request</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, marginTop: 40 },
  backButton: { padding: 10, marginRight: 10 },
  title: { fontSize: 24, fontWeight: '800' },
  card: { padding: 24, borderRadius: 20, borderWidth: 1 },
  infoText: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  subInfoText: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1 },
  priceLabel: { fontSize: 18, fontWeight: '600' },
  priceValue: { fontSize: 24, fontWeight: '800' },
  button: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '800' },
});
