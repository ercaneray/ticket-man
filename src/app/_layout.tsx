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
                    <Stack.Screen name="tabs" />
                </Stack>
                <StatusBar style="auto" />
        </>
    );
}