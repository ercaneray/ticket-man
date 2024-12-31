import { Tabs } from "expo-router";
import React from 'react'

export default function HomeLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false
      }}>
        <Tabs.Screen name="home" options={{title: 'Ana Sayfa'}} />
        <Tabs.Screen name="profile" options={{title: 'Profil'}} />
    </Tabs>
  )
}