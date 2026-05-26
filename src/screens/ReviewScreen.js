import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, SafeAreaView, Alert
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../api/axios'

export default function ReviewScreen({ route, navigation }) {
  const { bookingId, workerName } = route.params
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating')
      return
    }
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await api.post('/api/reviews', {
        bookingId,
        rating,
        comment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        Alert.alert('Thank you!', 'Your review has been submitted', [
          { text: 'OK', onPress: () => navigation.navigate('MyBookings') }
        ])
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Rate your experience</Text>
        <Text style={styles.workerName}>with {workerName}</Text>

        {/* Star Rating */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
            >
              <Text style={[styles.star, star <= rating && styles.starActive]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingLabel}>
          {rating === 0 && 'Tap to rate'}
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent!'}
        </Text>

        {/* Comment */}
        <TextInput
          style={styles.input}
          placeholder="Write a comment (optional)"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Submit Review</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
  workerName: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  star: { fontSize: 48, color: '#D1D5DB' },
  starActive: { color: '#F59E0B' },
  ratingLabel: { textAlign: 'center', fontSize: 14, color: '#6B7280', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: { backgroundColor: '#2563EB', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skipBtn: { alignItems: 'center' },
  skipText: { color: '#9CA3AF', fontSize: 14 },
})
