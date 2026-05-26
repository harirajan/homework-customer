import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, SafeAreaView, Alert
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../api/axios'

export default function CreateBookingScreen({ route, navigation }) {
  const { workerId, workerName, hourlyRate } = route.params
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleBook = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your service address')
      return
    }

    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await api.post('/api/bookings', {
        workerId,
        serviceType: 'PLUMBER',
        serviceAddress: address,
        serviceLatitude: 11.2588,
        serviceLongitude: 75.7804,
        customerNotes: notes,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        Alert.alert(
          'Booking Created!',
          'Your booking has been created successfully. The worker will confirm shortly.',
          [{ text: 'OK', onPress: () => navigation.navigate('MyBookings') }]
        )
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.workerSummary}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{workerName?.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.workerName}>{workerName}</Text>
            <Text style={styles.workerRate}>₹{hourlyRate} / hour</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Service Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe the problem (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoItem}>1. Worker confirms your booking</Text>
            <Text style={styles.infoItem}>2. Worker arrives — verify with OTP</Text>
            <Text style={styles.infoItem}>3. Worker completes the job</Text>
            <Text style={styles.infoItem}>4. Pay and leave a review</Text>
          </View>

          <TouchableOpacity
            style={[styles.bookButton, loading && styles.buttonDisabled]}
            onPress={handleBook}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.bookButtonText}>Confirm Booking</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  workerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#2563EB' },
  workerName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  workerRate: { fontSize: 14, color: '#2563EB', marginTop: 2 },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  infoBox: { backgroundColor: '#EFF6FF', borderRadius: 8, padding: 14, marginTop: 16 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#1D4ED8', marginBottom: 8 },
  infoItem: { fontSize: 13, color: '#1E40AF', marginBottom: 4 },
  bookButton: { backgroundColor: '#2563EB', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { opacity: 0.6 },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
