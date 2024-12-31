import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, getDocs } from 'firebase/firestore';

export default function Profile() {
  const { user, logout } = useAuth();
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.email}`;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      router.push("/");
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };

  useEffect(() => {
    const getFavoriteCount = async () => {
      if (!user) return;
      const q = query(collection(db, 'favorites', user.id, 'events'));
      const snapshot = await getDocs(q);
      setFavoriteCount(snapshot.size);
    };
    getFavoriteCount();
  }, [user]);

  useEffect(() => {
    const getAttendanceCount = async () => {
      if (!user) return;
      const q = query(collection(db, 'attendances', user.id, 'events'));
      const snapshot = await getDocs(q);
      setAttendanceCount(snapshot.size);
    };
    getAttendanceCount();
  }, [user]);

  const menuItems = [
    {
      title: 'Favorilerim',
      icon: 'heart-outline' as const,
      onPress: () => router.push('/favorites'),
      badge: favoriteCount
    },
    {
      title: 'Katıldığım Etkinlikler',
      icon: 'calendar-outline' as const,
      onPress: () => router.push('/attendances'),
      badge: attendanceCount
    },
    {
      title: 'Bildirimler',
      icon: 'notifications-outline' as const,
      onPress: () => console.log('Bildirimler'),
    },
    {
      title: 'Ayarlar',
      icon: 'settings-outline' as const,
      onPress: () => console.log('Ayarlar'),
    },
    {
      title: 'Çıkış Yap',
      icon: 'log-out-outline' as const,
      onPress: handleLogout,
      color: '#ff4444'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={user?.photoURL ? { uri: user.photoURL } : { uri: avatarUrl }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <Ionicons 
                  name={item.icon} 
                  size={24} 
                  color={item.color || '#333'} 
                />
                <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
                  {item.title}
                </Text>
              </View>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  badge: {
    backgroundColor: '#ff4081',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});