import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import EventCard from '../components/EventCard';
import { fetchEvent } from '../utils/fetchEvent';
import { Event } from '../types/event';

interface FavoriteEvent {
    eventId: string;
    name: string;
    date: string;
    venue: string;
    imageUrl: string;
    addedAt: Date;
}

export default function FavoriteEvents() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;

            try {
                // Favori ID'lerini al
                const q = query(
                    collection(db, 'favorites', user.id, 'events'),
                    orderBy('addedAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                
                // Her favori için event detaylarını al
                const eventPromises = querySnapshot.docs.map(doc => 
                    fetchEvent(doc.data().eventId)
                );

                const events = await Promise.all(eventPromises);
                setFavorites(events);
                
            } catch (error) {
                console.error('Error fetching favorites:', error);
                Alert.alert('Hata', 'Favoriler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196f3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Favori Etkinliklerim</Text>
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <EventCard event={item} />
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Henüz favori etkinliğiniz yok</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    eventCard: {
        marginBottom: 15,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
}); 