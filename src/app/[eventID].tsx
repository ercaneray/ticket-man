import { View, Text, Platform, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Alert, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext'
import { doc, setDoc, deleteDoc, getDoc, getDocs, query, where, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Event } from '../types/event';

export default function EventDetails() {
    const { eventID } = useLocalSearchParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isAttending, setIsAttending] = useState(false);

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
            <ScrollView bounces={false}>
                <Image 
                    source={{ uri: event.images[0].url }} 
                    style={styles.image}
                />
                
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
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, { flex: 2, marginRight: 10 }]}
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
    image: {
        width: '100%',
        height: 300,
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
});
