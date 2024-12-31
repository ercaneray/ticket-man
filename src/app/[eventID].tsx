import { View, Text, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function EventDetails() {
    
    const { eventID } = useLocalSearchParams();
    const [event, setEvent] = useState({});
    useEffect(() => {
        const getEventDetails = async () => {
            const API_KEY = 'wYGNg0lBRAw0rVYktm9HnABJrXPOWTPB';
            const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
            try {
                const response = await axios.get(BASE_URL, {
                    params: {
                        apikey: API_KEY,
                        id: eventID
                    }
                });
                console.log(response.data._embedded.events[0]);
                setEvent(response.data._embedded.events[0]);
            } catch (error) {
                console.error('Error fetching event details:', error);
            }
        }
        getEventDetails();
        
    }, [])
    return (
        <View>
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
            <Text>{event.name}</Text>
        </View>
    )
}
