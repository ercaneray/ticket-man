import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Event } from '../types/event';

export default function EventCard({ event }: { event: Event }) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

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

    const toggleFavorite = async (e: any) => {
        e.stopPropagation(); // Kart navigasyonunu engelle
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

    const handlePress = () => {
        const eventID = event.id;
        router.push({
            pathname: '/[eventID]',
            params: { eventID },
        });
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

    const getVenueInfo = () => {
        const venue = event._embedded?.venues?.[0];
        if (venue) {
            return venue.city ? `${venue.name}, ${venue.city.name}` : venue.name;
        }
        return '';
    };

    return (
        <TouchableOpacity 
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.95}
        >
            <Image 
                style={styles.image} 
                source={{ uri: event.images[0].url }}
                resizeMode="cover"
            />
            <View style={styles.overlay} />
            
            <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={toggleFavorite}
            >
                <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={24} 
                    color={isFavorite ? "#ff4081" : "white"} 
                />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.dateContainer}>
                    <Text style={styles.date}>
                        {formatDate(event.dates.start.localDate)}
                    </Text>
                    {event.dates.start.localTime && (
                        <Text style={styles.time}>
                            {formatTime(event.dates.start.localTime)}
                        </Text>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={2}>
                        {event.name}
                    </Text>
                    
                    {getVenueInfo() && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={16} color="#fff" />
                            <Text style={styles.location} numberOfLines={1}>
                                {getVenueInfo()}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    )
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 15,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        height: 200,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 15,
    },
    content: {
        ...StyleSheet.absoluteFillObject,
        padding: 15,
        justifyContent: 'space-between',
    },
    dateContainer: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    date: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    time: {
        color: '#fff',
        fontSize: 12,
        marginTop: 2,
    },
    infoContainer: {
        width: '100%',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    location: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 8,
        zIndex: 2,
    },
});