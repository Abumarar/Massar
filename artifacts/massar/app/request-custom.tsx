import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useColors } from '@/hooks/useColors';
import { useCreatePassengerRideRequest } from '@workspace/api-client-react';

export default function RequestCustomScreen() {
  const colors = useColors();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [destination, setDestination] = useState('');
  const bookRideMutation = useCreatePassengerRideRequest();

  const handleRequest = async () => {
    if (!destination.trim()) {
      Alert.alert('Required', 'Please enter your destination');
      return;
    }

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
          type: 'custom',
          customSearchText: destination,
          pickupLat: location.coords.latitude,
          pickupLng: location.coords.longitude,
          destLat: 0, 
          destLng: 0,
          seats: 1,
        }
      });
      Alert.alert('Request Sent', 'Your custom trip request has been sent to the admins. A captain will be assigned to you soon.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not request custom trip');
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
        <Text style={[styles.title, { color: colors.ink }]}>Search for a Trip</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={48} color={colors.gold} style={{ alignSelf: 'center', marginBottom: 20 }} />
        <Text style={[styles.infoText, { color: colors.ink }]}>
          Where do you want to go?
        </Text>
        <Text style={[styles.subInfoText, { color: colors.mutedForeground }]}>
          Tell us your destination and an admin will find a captain for you.
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Destination</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.ink, borderColor: colors.border }]}
            value={destination}
            onChangeText={setDestination}
            placeholder="e.g. Amman to Aqaba, Friday 10 AM"
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Pressable 
          style={[styles.button, { backgroundColor: colors.primary }, isSubmitting && { opacity: 0.7 }]}
          onPress={handleRequest}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Send Request</Text>
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
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, minHeight: 100 },
  button: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '800' },
});
