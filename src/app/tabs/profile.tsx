import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native'
import React from 'react'
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
export default function Profile() {
  const { user, logout } = useAuth();
  if (!user) {
    return <Text>Loading...</Text>;
  }
  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      router.push("/");
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    }
  };
  console.log('User:', user);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>İsim: {user.firstName + " " + user.lastName}</Text>
      <Text>Email: {user.email}</Text>
      <Button title='Çıkış Yap' onPress={() => handleLogout()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});