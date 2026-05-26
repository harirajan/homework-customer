import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Alert
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../api/axios'

const STATUS_COLORS = {
  PENDING:     { bg: '#FEF3C7', text: '#D97706' },
  CONFIRMED:   { bg: '#DBEAFE', text: '#2563EB' },
  IN_PROGRESS: { bg: '#EDE9FE', text: '#7C3AED' },
  COMPLETED:   { bg: '#D1FAE5', text: '#059669' },
  CANCELLED:   { bg: '#F3F4F6', text: '#6B7280' },
}

export default function WorkerBookingDetailScreen({ route, navigation }) {
  const { bookingId } = route.params
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchBooking()
  }, [])

  const fetchBooking = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await api.get(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) setBooking(response.data.data)
    } catch (err) {
      console.log('Error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status, extraData = {}) => {
    setActionLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await api.put(
        `/api/bookings/${bookingId}/status`,
        { status, ...extraData },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.data.success) {
        await fetchBooking()
        Alert.alert('Success', `Booking ${status.toLowerCase()}`)
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirm = () => {
    Alert.alert('Confirm Job', 'Accept this booking?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateStatus('CONFIRMED') }
    ])
  }

  const handleStart = () => {
    Alert.alert('Start Job', 'Show your OTP to the customer to verify your arrival', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start', onPress: () => updateStatus('IN_PROGRESS') }
    ])
  }

  const handleComplete = () => {
    Alert.alert('Complete Job', 'Mark this job as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => updateStatus('COMPLETED', {
          workerNotes: 'Job completed successfully',
          finalAmount: booking.agreedPrice || 500
        })
      }
    ])
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#2563EB" /></View>
  if (!booking) return <View style={styles.centered}><Text>Booking not found</Text></View>

  const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.PENDING

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Status */}
        <View style={[styles.statusBanner, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>{booking.status}</Text>
        </View>

        {/* OTP — show to customer */}
        {booking.arrivalOtp && booking.status !== 'COMPLETED' && (
          <View style={styles.otpCard}>
            <Text style={styles.otpLabel}>Your Arrival OTP</Text>
            <Text style={styles.otpValue}>{booking.arrivalOtp}</Text>
            <Text style={styles.otpHint}>Show this to the customer when you arrive</Text>
          </View>
        )}

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{booking.serviceType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{booking.customerName}</Text>
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
            <Text style={styles.label}>OTP Verified</Text>
            <Text style={styles.value}>{booking.otpVerified ? '✅ Yes' : '⏳ No'}</Text>
          </View>
          {booking.finalAmount && (
            <View style={styles.row}>
              <Text style={styles.label}>Amount</Text>
              <Text style={[styles.value, styles.amount]}>₹{booking.finalAmount}</Text>
            </View>
          )}
        </View>

        {/* Timeline */}
        {booking.auditLog && booking.auditLog.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            {booking.auditLog.map((log, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View>
                  <Text style={styles.timelineStatus}>
                    {log.fromStatus ? `${log.fromStatus} → ${log.toStatus}` : log.toStatus}
                  </Text>
                  <Text style={styles.timelineDate}>
                    {new Date(log.changedAt).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {booking.status === 'PENDING' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.confirmBtn]}
              onPress={handleConfirm}
              disabled={actionLoading}
            >
              {actionLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.actionBtnText}>✅ Confirm Job</Text>
              }
            </TouchableOpacity>
          )}

          {booking.status === 'CONFIRMED' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.startBtn]}
              onPress={handleStart}
              disabled={actionLoading}
            >
              {actionLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.actionBtnText}>▶️ Start Job</Text>
              }
            </TouchableOpacity>
          )}

          {booking.status === 'IN_PROGRESS' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              onPress={handleComplete}
              disabled={actionLoading}
            >
              {actionLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.actionBtnText}>🏁 Complete Job</Text>
              }
            </TouchableOpacity>
          )}
        </View>

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
  otpCard: {
    backgroundColor: '#1D4ED8',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  otpLabel: { color: '#BFDBFE', fontSize: 14, marginBottom: 8 },
  otpValue: { color: '#fff', fontSize: 48, fontWeight: 'bold', letterSpacing: 8 },
  otpHint: { color: '#BFDBFE', fontSize: 12, marginTop: 8, textAlign: 'center' },
  section: { backgroundColor: '#fff', padding: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: { fontSize: 14, color: '#6B7280', flex: 1 },
  value: { fontSize: 14, color: '#1F2937', flex: 2, textAlign: 'right' },
  amount: { color: '#059669', fontWeight: '700', fontSize: 16 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB', marginTop: 4, marginRight: 12 },
  timelineStatus: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  timelineDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  actions: { padding: 16, gap: 10 },
  actionBtn: { borderRadius: 12, padding: 16, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#059669' },
  startBtn: { backgroundColor: '#7C3AED' },
  completeBtn: { backgroundColor: '#2563EB' },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
