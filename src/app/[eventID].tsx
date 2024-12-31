import { View, Text, Platform, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Alert, Modal, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext'
import { doc, setDoc, deleteDoc, getDoc, getDocs, query, where, collection, addDoc, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Event } from '../types/event';

interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Timestamp;
}

interface Reminder {
    id: string;
    eventId: string;
    userId: string;
    eventName: string;
    reminderDate: Timestamp;
    eventDate: string;
    imageUrl: string;
}

export default function EventDetails() {
    const { eventID } = useLocalSearchParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isAttending, setIsAttending] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [averageRating, setAverageRating] = useState(0);
    const [hasReminder, setHasReminder] = useState(false);

    useEffect(() => {
        const getEventDetails = async () => {
            const API_KEY = 'wYGNg0lBRAw0rVYktm9HnABJrXPOWTPB';
            const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events';
            try {
                const response = await axios.get(`${BASE_URL}`, {
                    params: {
                        apikey: API_KEY,
                        id: eventID,
                        locale: "*"
                    }
                });
                
                if (response.data._embedded?.events?.[0]) {
                    setEvent(response.data._embedded.events[0]);
                } else {
                    console.error('Event not found');
                    Alert.alert('Hata', 'Etkinlik bulunamadı.');
                }
            } catch (error) {
                console.error('Error fetching event details:', error);
                Alert.alert('Hata', 'Etkinlik detayları yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        }
        getEventDetails();
    }, [])

    useEffect(() => {
        const checkFavorite = async () => {
            if (user && event) {
                const docRef = doc(db, 'favorites', user.id, 'events', event.id);
                const docSnap = await getDoc(docRef);
                setIsFavorite(docSnap.exists());
            }
        };
        checkFavorite();
    }, [user, event]);

    useEffect(() => {
        const checkAttendance = async () => {
            if (!user || !event) return;
            const attendanceRef = collection(db, 'attendances', user.id, 'events');
            const docSnap = await getDocs(query(attendanceRef, where('eventId', '==', event.id)));
            setIsAttending(!docSnap.empty);
        };
        checkAttendance();
    }, [user, event]);

    useEffect(() => {
        if (!eventID) return;

        const q = query(
            collection(db, 'events', eventID.toString(), 'reviews'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Review[];
            setReviews(reviewsData);

            if (reviewsData.length > 0) {
                const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
                setAverageRating(total / reviewsData.length);
            }
        });

        return () => unsubscribe();
    }, [eventID]);

    useEffect(() => {
        const checkReminder = async () => {
            if (!user || !eventID) return;
            
            try {
                const reminderRef = doc(db, 'reminders', `${user.id}_${eventID}`);
                const reminderDoc = await getDoc(reminderRef);
                setHasReminder(reminderDoc.exists());
            } catch (error) {
                console.error('Error checking reminder:', error);
            }
        };

        checkReminder();
    }, [user, eventID]);

    const toggleFavorite = async () => {
        if (!user || !event) return;

        const favoriteRef = doc(db, 'favorites', user.id, 'events', event.id);
        
        try {
            if (isFavorite) {
                await deleteDoc(favoriteRef);
            } else {
                await setDoc(favoriteRef, {
                    eventId: event.id,
                    name: event.name,
                    date: event.dates.start.localDate,
                    venue: event._embedded?.venues[0]?.name,
                    imageUrl: event.images[0].url,
                    addedAt: new Date()
                });
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleBuyTicket = () => {
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async () => {
        try {
            if (!user || !event) return;
            
            await addDoc(collection(db, 'attendances', user.id, 'events'), {
                eventId: event.id,
                name: event.name,
                date: event.dates.start.localDate,
                venue: event._embedded?.venues[0]?.name,
                imageUrl: event.images[0].url,
                purchasedAt: new Date()
            });

            setIsAttending(true);
            setShowPaymentModal(false);
            Alert.alert('Başarılı', 'Etkinlik biletiniz onaylandı!');
        } catch (error) {
            console.error('Error confirming attendance:', error);
            Alert.alert('Hata', 'Bilet alımı sırasında bir hata oluştu.');
        }
    };

    const handleSubmitReview = async () => {
        if (!user) {
            Alert.alert('Hata', 'Yorum yapmak için giriş yapmalısınız.');
            return;
        }

        if (newReview.rating === 0) {
            Alert.alert('Hata', 'Lütfen bir puan verin.');
            return;
        }

        if (newReview.comment.trim().length < 3) {
            Alert.alert('Hata', 'Lütfen en az 3 karakter uzunluğunda bir yorum yazın.');
            return;
        }

        try {
            await addDoc(collection(db, 'events', eventID.toString(), 'reviews'), {
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`,
                rating: newReview.rating,
                comment: newReview.comment,
                createdAt: Timestamp.now()
            });

            setNewReview({ rating: 0, comment: '' });
            Alert.alert('Başarılı', 'Yorumunuz eklendi.');
        } catch (error) {
            console.error('Error adding review:', error);
            Alert.alert('Hata', 'Yorum eklenirken bir hata oluştu.');
        }
    };

    const handleSetReminder = async () => {
        if (!user || !event) {
            Alert.alert('Hata', 'Lütfen giriş yapın');
            return;
        }

        try {
            const reminderRef = doc(db, 'reminders', `${user.id}_${eventID}`);

            if (hasReminder) {
                await deleteDoc(reminderRef);
                setHasReminder(false);
                Alert.alert('Başarılı', 'Hatırlatıcı kaldırıldı');
            } else {
                const eventDate = new Date(event.dates.start.localDate);
                const reminderDate = new Date(eventDate);
                reminderDate.setDate(eventDate.getDate() - 1);

                await setDoc(reminderRef, {
                    eventId: eventID,
                    userId: user.id,
                    eventName: event.name,
                    reminderDate: Timestamp.fromDate(reminderDate),
                    eventDate: event.dates.start.localDate,
                    imageUrl: event.images[0].url,
                    createdAt: Timestamp.now()
                });

                setHasReminder(true);
                Alert.alert('Başarılı', 'Etkinlikten 1 gün önce hatırlatılacak');
            }
        } catch (error) {
            console.error('Reminder error:', error);
            Alert.alert('Hata', 'İşlem sırasında bir hata oluştu');
        }
    };

    const RatingStars = ({ value, onRatingChange }: { value: number, onRatingChange?: (rating: number) => void }) => (
        <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => onRatingChange?.(star)}
                    disabled={!onRatingChange}
                >
                    <Ionicons
                        name={star <= value ? "star" : "star-outline"}
                        size={24}
                        color="#FFD700"
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    if (loading || !event) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeStr?: string) => {
        return timeStr?.slice(0, 5) || '';
    };

    const handleGetDirections = () => {
        const venue = event?._embedded?.venues?.[0];
        if (venue?.location?.latitude && venue?.location?.longitude) {
            const url = Platform.select({
                ios: `maps://app?daddr=${venue?.location?.latitude},${venue?.location?.longitude}`,
                android: `google.navigation:q=${venue?.location?.latitude},${venue?.location?.longitude}`
            });

            if (!url) return;
            
            Linking.canOpenURL(url).then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue?.location?.latitude},${venue?.location?.longitude}`;
                    Linking.openURL(browserUrl);
                }
            });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
            
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: event.images[0].url }} 
                    style={styles.image}
                />
                
                <TouchableOpacity
                    style={styles.reminderIconButton}
                    onPress={handleSetReminder}
                >
                    <Ionicons
                        name={hasReminder ? "notifications" : "notifications-outline"}
                        size={28}
                        color={hasReminder ? "#2196f3" : "white"}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView bounces={false}>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{event.name}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>
                            {formatDate(event.dates.start.localDate)}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>
                            {formatTime(event.dates.start.localTime)}
                        </Text>
                    </View>

                    {event._embedded?.venues?.[0] && (
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>
                                {event._embedded?.venues?.[0]?.name}, {event._embedded?.venues?.[0]?.city?.name}
                            </Text>
                        </View>
                    )}

                    {event.priceRanges && (
                        <View style={styles.infoRow}>
                            <Ionicons name="card-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>
                                {event.priceRanges[0].min} - {event.priceRanges[0].max} {event.priceRanges[0].currency}
                            </Text>
                        </View>
                    )}

                    {event.info && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionTitle}>Etkinlik Detayları</Text>
                            <Text style={styles.descriptionText}>{event.info}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.reviewsSection}>
                    <View style={styles.reviewsHeader}>
                        <Text style={styles.reviewsTitle}>Yorumlar ve Değerlendirmeler</Text>
                        <View style={styles.averageRating}>
                            <Text style={styles.averageRatingText}>
                                {averageRating.toFixed(1)}
                            </Text>
                            <RatingStars value={Math.round(averageRating)} />
                            <Text style={styles.reviewCount}>
                                ({reviews.length} değerlendirme)
                            </Text>
                        </View>
                    </View>

                    <View style={styles.newReviewContainer}>
                        <Text style={styles.newReviewTitle}>Değerlendirmenizi Yazın</Text>
                        <RatingStars 
                            value={newReview.rating} 
                            onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                        />
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Yorumunuzu yazın..."
                            value={newReview.comment}
                            onChangeText={(comment) => setNewReview(prev => ({ ...prev, comment }))}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmitReview}
                        >
                            <Text style={styles.submitButtonText}>Gönder</Text>
                        </TouchableOpacity>
                    </View>

                    {reviews.map(review => (
                        <View key={review.id} style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.userName}>{review.userName}</Text>
                                <RatingStars value={review.rating} />
                            </View>
                            <Text style={styles.comment}>{review.comment}</Text>
                            <Text style={styles.date}>
                                {review.createdAt.toDate().toLocaleDateString('tr-TR')}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, { flex: 2, marginRight: 10, backgroundColor: '#2196f3' }]}
                    onPress={handleBuyTicket}
                >
                    <Text style={styles.buttonText}>Bilet Al</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { flex: 1, marginRight: 10, backgroundColor: '#4CAF50' }]}
                    onPress={handleGetDirections}
                >
                    <Ionicons name="navigate" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { flex: 1, backgroundColor: isFavorite ? '#ff4081' : '#666' }]}
                    onPress={toggleFavorite}
                >
                    <Ionicons 
                        name={isFavorite ? "heart" : "heart-outline"} 
                        size={24} 
                        color="white" 
                    />
                </TouchableOpacity>
            </View>

            <Modal
                visible={showPaymentModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ödemeyi Onayla</Text>
                        <Text style={styles.modalText}>
                            {event?.name} etkinliği için bilet almak istediğinize emin misiniz?
                        </Text>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowPaymentModal(false)}
                            >
                                <Text style={styles.buttonText}>İptal</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleConfirmPayment}
                            >
                                <Text style={styles.buttonText}>Onayla</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 300,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    reminderIconButton: {
        position: 'absolute',
        top: 50,  // StatusBar'ın altında
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#666',
    },
    descriptionContainer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    button: {
        flexDirection: 'row',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        padding: 15,
        borderRadius: 10,
        width: '45%',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#ff4444',
    },
    reviewsSection: {
        padding: 15,
        backgroundColor: '#fff',
        marginTop: 15,
        borderRadius: 10,
    },
    reviewsHeader: {
        marginBottom: 20,
    },
    reviewsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    averageRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    averageRatingText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 10,
    },
    reviewCount: {
        color: '#666',
        marginLeft: 10,
    },
    starsContainer: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    newReviewContainer: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    newReviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    commentInput: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        minHeight: 80,
        marginVertical: 10,
    },
    submitButton: {
        backgroundColor: '#2196f3',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    reviewItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 15,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    userName: {
        fontWeight: 'bold',
    },
    comment: {
        marginBottom: 5,
    },
    date: {
        color: '#666',
        fontSize: 12,
    },
});
