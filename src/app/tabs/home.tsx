import { useEffect } from 'react'
import { View, Text } from 'react-native'
import React from 'react'
import axios from 'axios'
export default function home() {
  const API_KEY = 'wYGNg0lBRAw0rVYktm9HnABJrXPOWTPB';
  const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            apikey: API_KEY,         // API Key query parameter
            countryCode: 'US',       // ABD etkinliklerini filtreler
            keyword: 'Rock'          // 'Rock' anahtar kelimesi ile arama
          }
        });
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }

    fetchEvents();

  }, [])
  return (
    <View>
      <Text>Etkinlik Sayfası</Text>
    </View>
  )
}