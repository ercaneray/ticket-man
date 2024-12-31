import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Settings() {
    const { user } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        // Kullanıcının bildirim ayarını Firestore'dan al
        const fetchNotificationSettings = async () => {
            if (!user) return;
            try {
                const userSettingsRef = doc(db, 'users', user.id, 'settings', 'notifications');
                const docSnap = await getDoc(userSettingsRef);
                if (docSnap.exists()) {
                    setNotificationsEnabled(docSnap.data().enabled);
                }
            } catch (error) {
                console.error('Error fetching notification settings:', error);
            }
        };

        fetchNotificationSettings();
    }, [user]);

    const toggleNotifications = async (value: boolean) => {
        if (!user) return;

        try {
            // Firestore'a kaydet
            const userSettingsRef = doc(db, 'users', user.id, 'settings', 'notifications');
            await setDoc(userSettingsRef, {
                enabled: value,
                updatedAt: serverTimestamp()
            });

            setNotificationsEnabled(value);

            if (value) {
                // Bildirimleri aç
                const { status } = await Notifications.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Hata', 'Bildirim izni verilmedi');
                    setNotificationsEnabled(false);
                    return;
                }
            }
        } catch (error) {
            console.error('Error updating notification settings:', error);
            Alert.alert('Hata', 'Ayarlar kaydedilirken bir hata oluştu');
        }
    };

    const sendTestNotification = async () => {
        if (!user) {
            Alert.alert('Hata', 'Lütfen giriş yapın');
            return;
        }

        if (!notificationsEnabled) {
            Alert.alert('Bilgi', 'Bildirimleri açmadan test bildirimi gönderemezsiniz');
            return;
        }

        try {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Hata', 'Bildirim izni verilmemiş');
                return;
            }

            // Bildirim gönder
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Bildirim Testi",
                    body: "Bildirim deneme",
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null,
            });

            // Firestore'a kaydet
            await addDoc(collection(db, 'users', user.id, 'notifications'), {
                title: "Bildirim Testi",
                body: "Bildirim deneme",
                createdAt: serverTimestamp(),
                read: false,
                type: 'test'
            });

            Alert.alert('Başarılı', 'Test bildirimi gönderildi ve kaydedildi');
        } catch (error : any) {
            console.error('Notification error:', error);
            Alert.alert('Hata', 'Bildirim gönderilemedi: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                    <Ionicons name="notifications-outline" size={24} color="#666" />
                    <Text style={styles.settingText}>Bildirim Ayarları</Text>
                </View>
                <Switch
                    value={notificationsEnabled}
                    onValueChange={toggleNotifications}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={notificationsEnabled ? '#2196f3' : '#f4f3f4'}
                />
            </View>

            <TouchableOpacity 
                style={styles.settingItem}
                onPress={sendTestNotification}
            >
                <View style={styles.settingLeft}>
                    <Ionicons name="paper-plane-outline" size={24} color="#666" />
                    <Text style={styles.settingText}>Bildirim Testi</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        marginLeft: 15,
        fontSize: 16,
        color: '#333',
    },
    settingDisabled: {
        opacity: 0.7,
    },
    settingTextDisabled: {
        color: '#999',
    },
}); 