import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, SafeAreaView, TouchableOpacity
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

export default function WorkerBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await api.get('/api/bookings/worker/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setBookings(response.data.data)
      }
    } catch (err) {
      console.log('Error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === filter)

  const renderBooking = ({ item }) => {
    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.PENDING
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('WorkerBookingDetail', { bookingId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.customerName}>👤 {item.customerName}</Text>
        <Text style={styles.address} numberOfLines={1}>📍 {item.serviceAddress}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
          {item.finalAmount && <Text style={styles.amount}>₹{item.finalAmount}</Text>}
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#2563EB" /></View>

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filters}>
        {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => setFilter(s)}
            style={[styles.filterBtn, filter === s && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No jobs found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderBooking}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          onRefresh={fetchBookings}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filters: { flexDirection: 'row', padding: 12, gap: 6, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexWrap: 'wrap' },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterBtnActive: { backgroundColor: '#2563EB' },
  filterText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  list: { padding: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serviceType: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  customerName: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  address: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 12, color: '#9CA3AF' },
  amount: { fontSize: 16, fontWeight: '700', color: '#059669' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
})
