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
                        headerShown: true
                    }} />
                    <Stack.Screen name="signup" options={{
                        title: 'Sign Up',
                        headerShown: true
                    }} />
                    <Stack.Screen name="[eventID]" options={{
                        title: 'Event Details',
                        headerShown: true,
                        presentation: 'modal',
                        animation: 'fade_from_bottom'
                    }} />
                    <Stack.Screen name="tabs" />
                </Stack>
                <StatusBar style="auto" />
            </AuthProvider>
        </>
    );
}