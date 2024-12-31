import { View, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Event {
  name: string;
  id: string;
  _embedded?: {
    venues?: [{
      name: string;
      location: {
        latitude: string;
        longitude: string;
      };
      city: {
        name: string;
      };
    }];
  };
}

export default function MapScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const ISTANBUL_REGION = {
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  const fetchEvents = async () => {
    try {
      const API_KEY = 'wYGNg0lBRAw0rVYktm9HnABJrXPOWTPB';
      const response = await axios.get(
        'https://app.ticketmaster.com/discovery/v2/events.json',
        {
          params: {
            apikey: API_KEY,
            countryCode: 'TR',
            city: 'Istanbul',
            size: 100,
            sort: 'date,asc'
          }
        }
      );
      
      const eventsWithLocations = response.data._embedded?.events.filter(
        (event: Event) => event._embedded?.venues?.[0]?.location
      ) || [];
      
      setEvents(eventsWithLocations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: '/[eventID]',
      params: { eventID: eventId },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={ISTANBUL_REGION}
      >
        {events.map((event) => {
          const venue = event._embedded?.venues?.[0];
          if (venue?.location) {
            return (
              <Marker
                key={event.id}
                coordinate={{
                  latitude: parseFloat(venue.location.latitude),
                  longitude: parseFloat(venue.location.longitude),
                }}
              >
                <Callout
                  onPress={() => handleEventPress(event.id)}
                  tooltip
                >
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle} numberOfLines={2}>
                      {event.name}
                    </Text>
                    <Text style={styles.calloutVenue}>
                      <Ionicons name="location-outline" size={12} color="#666" />
                      {' '}{venue.name}
                    </Text>
                    <TouchableOpacity style={styles.calloutButton}>
                      <Text style={styles.calloutButtonText}>Detaylar</Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              </Marker>
            );
          }
          return null;
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutVenue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calloutButton: {
    backgroundColor: '#2196f3',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 