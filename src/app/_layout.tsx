import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, createTamagui } from 'tamagui'
import { config } from '@tamagui/config/v3'
export default function RootLayout() {
    const tamaguiConfig = createTamagui(config)
    return (
        <>
            <TamaguiProvider config={tamaguiConfig}>
                <Stack>
                    <Stack.Screen name="index" options={{
                        title: 'Login',
                        headerShown: true
                    }} />
                    <Stack.Screen name="tabs" />
                </Stack>
                <StatusBar style="auto" />
            </TamaguiProvider>

        </>
    );
}