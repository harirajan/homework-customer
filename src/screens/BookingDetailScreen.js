import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Alert, TextInput
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../api/axios'

const STATUS_COLORS = {
  PENDING:     { bg: '#FEF3C7', text: '#D97706' },
  CONFIRMED:   { bg: '#DBEAFE', text: '#2563EB' },
  IN_PROGRESS: { bg: '#EDE9FE', text: '#7C3AED' },
  COMPLETED:   { bg: '#D1FAE5', text: '#059669' },
  CANCELLED:   { bg: '#F3F4F6', text: '#6B7280' },
  DISPUTED:    { bg: '#FEE2E2', text: '#DC2626' },
}

export default function BookingDetailScreen({ route, navigation }) {
  const { bookingId } = route.params
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)

  useEffect(() => {
    fetchBooking()
  }, [])

  const fetchBooking = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await api.get(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setBooking(response.data.data)
      }
    } catch (err) {
      console.log('Error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter the OTP from the worker')
      return
    }
    setOtpLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await api.post(
        `/api/bookings/${bookingId}/verify-otp?otp=${otp}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.data.success) {
        Alert.alert('Success', 'Worker arrival verified!')
        fetchBooking()
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'OTP verification failed')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token')
              const response = await api.put(
                `/api/bookings/${bookingId}/status`,
                { status: 'CANCELLED', reason: 'Cancelled by customer' },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              if (response.data.success) {
                Alert.alert('Cancelled', 'Your booking has been cancelled', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ])
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to cancel booking')
            }
          }
        }
      ]
    )
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#2563EB" /></View>
  if (!booking) return <View style={styles.centered}><Text>Booking not found</Text></View>

  const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.PENDING

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {booking.status}
          </Text>
        </View>

        {/* Booking Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{booking.serviceType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Worker</Text>
            <Text style={styles.value}>{booking.workerName || 'Unassigned'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{booking.serviceAddress}</Text>
          </View>
          {booking.customerNotes && (
            <View style={styles.row}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{booking.customerNotes}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>
              {new Date(booking.createdAt).toLocaleDateString('en-IN')}
            </Text>
          </View>
          {booking.finalAmount && (
            <View style={styles.row}>
              <Text style={styles.label}>Amount</Text>
              <Text style={[styles.value, styles.amount]}>₹{booking.finalAmount}</Text>
            </View>
          )}
        </View>

        {/* OTP Section — show when IN_PROGRESS and not verified */}
        {booking.status === 'IN_PROGRESS' && !booking.otpVerified && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verify Worker Arrival</Text>
            <Text style={styles.otpHint}>
              Ask the worker for the OTP to confirm they have arrived
            </Text>
            <View style={styles.otpRow}>
              <TextInput
                style={styles.otpInput}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.otpButton}
                onPress={handleVerifyOtp}
                disabled={otpLoading}
              >
                {otpLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.otpButtonText}>Verify</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* OTP verified */}
        {booking.otpVerified && (
          <View style={styles.verifiedBanner}>
            <Text style={styles.verifiedText}>✅ Worker arrival verified</Text>
          </View>
        )}

        {/* Audit Log */}
        {booking.auditLog && booking.auditLog.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            {booking.auditLog.map((log, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>
                    {log.fromStatus ? `${log.fromStatus} → ${log.toStatus}` : log.toStatus}
                  </Text>
                  <Text style={styles.timelineBy}>by {log.changedByName}</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(log.changedAt).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Cancel Button */}
        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBanner: { padding: 16, alignItems: 'center' },
  statusText: { fontSize: 18, fontWeight: '700' },
  section: { backgroundColor: '#fff', padding: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: { fontSize: 14, color: '#6B7280', flex: 1 },
  value: { fontSize: 14, color: '#1F2937', flex: 2, textAlign: 'right' },
  amount: { color: '#059669', fontWeight: '700', fontSize: 16 },
  otpHint: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  otpRow: { flexDirection: 'row', gap: 8 },
  otpInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    backgroundColor: '#F9FAFB',
  },
  otpButton: { backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 20, justifyContent: 'center' },
  otpButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  verifiedBanner: { backgroundColor: '#D1FAE5', padding: 14, alignItems: 'center', marginTop: 8 },
  verifiedText: { color: '#059669', fontWeight: '600', fontSize: 15 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB', marginTop: 4, marginRight: 12 },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  timelineBy: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  timelineDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  cancelButton: { backgroundColor: '#FEE2E2', margin: 16, borderRadius: 12, padding: 16, alignItems: 'center' },
  cancelButtonText: { color: '#DC2626', fontWeight: '700', fontSize: 16 },
})
