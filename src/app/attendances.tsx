import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import EventCard from '../components/EventCard';
import { fetchEvent } from '../utils/fetchEvent';
import { Event } from '../types/event';

export default function Attendances() {
    const { user } = useAuth();
    const [attendances, setAttendances] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendances = async () => {
            if (!user) return;

            try {
                // Katılım ID'lerini al
                const q = query(
                    collection(db, 'attendances', user.id, 'events'),
                    orderBy('purchasedAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                
                // Her katılım için event detaylarını al
                const eventPromises = querySnapshot.docs.map(doc => 
                    fetchEvent(doc.data().eventId)
                );

                const events = await Promise.all(eventPromises);
                setAttendances(events);
                
            } catch (error) {
                console.error('Error fetching attendances:', error);
                Alert.alert('Hata', 'Katılınan etkinlikler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendances();
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
            <Text style={styles.title}>Katıldığım Etkinlikler</Text>
            <FlatList
                data={attendances}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <EventCard event={item} />
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Henüz katıldığınız etkinlik yok</Text>
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