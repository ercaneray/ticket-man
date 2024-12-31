import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
export default function RootLayout() {
    return (
        <>
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
        </>
    );
}