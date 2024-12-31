import { Tabs } from "expo-router";
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function HomeLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196f3',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          marginBottom: 15,
          backgroundColor: '#f5f5f5',
        },
      })}>
      <Tabs.Screen name="home" options={{title: 'Ana Sayfa'}} />
      <Tabs.Screen name="map" options={{title: 'Harita'}} />
      <Tabs.Screen name="profile" options={{title: 'Profil'}} />
    </Tabs>
  )
}