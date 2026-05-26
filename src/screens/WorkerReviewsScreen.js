import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, SafeAreaView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function WorkerReviewsScreen() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [workerId, setWorkerId] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const profileRes = await api.get('/api/workers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (profileRes.data.success) {
        const id = profileRes.data.data.id
        setWorkerId(id)
        const reviewsRes = await api.get(`/api/reviews/worker/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data)
        }
      }
    } catch (err) {
      console.log('Error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderReview = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.stars}>{'⭐'.repeat(item.rating)}</Text>
      </View>
      {item.comment && <Text style={styles.comment}>{item.comment}</Text>}
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString('en-IN')}
      </Text>
      {item.workerReply && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Your reply:</Text>
          <Text style={styles.replyText}>{item.workerReply}</Text>
        </View>
      )}
    </View>
  )

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#2563EB" /></View>

  return (
    <SafeAreaView style={styles.container}>
      {reviews.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>No reviews yet</Text>
          <Text style={styles.emptySubtext}>Complete jobs to get reviews</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  customerName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  stars: { fontSize: 14 },
  comment: { fontSize: 14, color: '#4B5563', marginBottom: 8, lineHeight: 20 },
  date: { fontSize: 12, color: '#9CA3AF' },
  replyBox: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 10, marginTop: 8 },
  replyLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  replyText: { fontSize: 13, color: '#4B5563' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  emptySubtext: { fontSize: 14, color: '#6B7280', marginTop: 4 },
})
