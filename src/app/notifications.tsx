import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
    id: string;
    title: string;
    body: string;
    createdAt: Date;
    read: boolean;
}

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    let row: Array<any> = [];
    let prevOpenedRow: any;

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        
        try {
            const q = query(
                collection(db, 'users', user.id, 'notifications'),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const notificationsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate()
            })) as Notification[];
            
            setNotifications(notificationsData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            Alert.alert('Hata', 'Bildirimler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        Alert.alert(
            'Bildirimi Sil',
            'Bu bildirimi silmek istediğinize emin misiniz?',
            [
                {
                    text: 'İptal',
                    style: 'cancel'
                },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(
                                doc(db, 'users', user!.id, 'notifications', notificationId)
                            );
                            setNotifications(prev => 
                                prev.filter(notification => notification.id !== notificationId)
                            );
                        } catch (error) {
                            console.error('Error deleting notification:', error);
                            Alert.alert('Hata', 'Bildirim silinirken bir hata oluştu');
                        }
                    }
                }
            ]
        );
    };

    const closeRow = (index: number) => {
        if (prevOpenedRow && prevOpenedRow !== row[index]) {
            prevOpenedRow.close();
        }
        prevOpenedRow = row[index];
    };

    const renderRightActions = () => {
        return (
            <TouchableOpacity style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={24} color="#fff" />
            </TouchableOpacity>
        );
    };

    const renderNotification = ({ item, index }: { item: Notification; index: number }) => (
        <Swipeable
            ref={ref => row[index] = ref}
            renderRightActions={renderRightActions}
            onSwipeableOpen={() => closeRow(index)}
            overshootRight={false}
            rightThreshold={40}
            onSwipeableRightOpen={() => deleteNotification(item.id)}
        >
            <View style={[styles.notificationItem, !item.read && styles.unread]}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </Text>
            </View>
        </Swipeable>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196f3" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Henüz bildiriminiz yok</Text>
                    </View>
                )}
            />
        </GestureHandlerRootView>
    );
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
    notificationItem: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    unread: {
        backgroundColor: '#f0f9ff',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    body: {
        color: '#666',
        marginBottom: 5,
    },
    date: {
        color: '#999',
        fontSize: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
}); 