import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from "../contexts/AuthContext";
export default function RootLayout() {
    return (
        <>
            <AuthProvider>
                <Stack>
                    <Stack.Screen name="index" options={{
                        title: 'Login',
                        headerShown: false
                    }} />
                    <Stack.Screen name="signup" options={{
                        title: 'Sign Up',
                        headerShown: false
                    }} />
                    <Stack.Screen name="[eventID]" options={{
                        title: 'Event Details',
                        headerShown: false,
                        presentation: 'modal',
                        animation: 'fade_from_bottom'
                    }} />
                    <Stack.Screen name="favorites" options={{
                        title: 'Favoriler',
                        headerShown: false,
                        presentation: 'modal',
                        animation: 'fade_from_bottom'
                    }} />
                    <Stack.Screen name="attendances" options={{
                        title: 'Katıldığım Etkinlikler',
                        headerShown: false,
                        presentation: 'modal',
                        animation: 'fade_from_bottom'
                    }} />
                    <Stack.Screen name="tabs" options={{
                        headerShown: false
                    }} />
                </Stack>
                <StatusBar style="auto" />
            </AuthProvider>
        </>
    );
}