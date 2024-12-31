import { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import axios from 'axios'
import EventCard from '../../components/EventCard'
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Event {
  id: string;
  name: string;
  dates: {
    start: {
      localDate: string;
    };
  };
  images: {
    url: string;
  }[];
  classifications?: {
    segment: {
      name: string;
    };
  }[];
}

const categories = [
  { id: 'all', name: 'Tümü', icon: 'grid-outline' as const },
  { id: 'Music', name: 'Müzik', icon: 'musical-notes-outline' as const },
  { id: 'Sports', name: 'Spor', icon: 'basketball-outline' as const },
  { id: 'Arts & Theatre', name: 'Sanat', icon: 'color-palette-outline' as const },
  { id: 'Family', name: 'Aile', icon: 'people-outline' as const },
];

// Ana bileşenin dışında tanımlama
const ListHeader = ({
  searchQuery,
  handleSearch,
  selectedCategory,
  setSelectedCategory
}: {
  searchQuery: string;
  handleSearch: (text: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Etkinlikler</Text>
      <Text style={styles.headerSubtitle}>Yakındaki etkinlikleri keşfedin</Text>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Etkinlik ara..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#666"
        />
        {searchQuery !== '' && (
          <Ionicons
            name="close-circle"
            size={20}
            color="#666"
            onPress={() => handleSearch('')}
          />
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        keyboardShouldPersistTaps="always"
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon} 
              size={20} 
              color={selectedCategory === category.id ? '#fff' : '#666'} 
            />
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default function Home() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const API_KEY = 'wYGNg0lBRAw0rVYktm9HnABJrXPOWTPB';
  const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          apikey: API_KEY,
          countryCode: 'TR',
          size: 200
        }
      });
      setAllEvents(response.data._embedded?.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const setSelectedCategoryCallback = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = searchQuery === '' || 
        event.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        event.classifications?.some(
          classification => classification.segment?.name === selectedCategory
        );

      return matchesSearch && matchesCategory;
    });
  }, [allEvents, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredEvents}
        renderItem={({ item, index }) => <EventCard event={item} />}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <ListHeader
            searchQuery={searchQuery}
            handleSearch={handleSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategoryCallback}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2196f3"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={50} color="#666" />
            <Text style={styles.emptyText}>Etkinlik bulunamadı</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingRight: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#2196f3',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});