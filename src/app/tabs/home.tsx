import { useEffect, useState } from 'react'
import { View, Text, FlatList } from 'react-native'
import React from 'react'
import axios from 'axios'
import EventCard from '../../components/EventCard'
export default function home() {
  const [events, setEvents] = useState([]);
  const API_KEY = 'wYGNg0lBRAw0rVYktm9HnABJrXPOWTPB';
  const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            apikey: API_KEY,
            countryCode: 'TR'
          }
        });
        setEvents(response.data._embedded.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }
    fetchEvents();
  }, [])
  return (
    <View>
      <FlatList data={events} renderItem={({ item }) => <EventCard event={item} />} keyExtractor={item => item.id} />
    </View>
  )
}