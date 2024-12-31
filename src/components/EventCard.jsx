import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router';

export default function EventCard({ event }) {
    const handlePress = () => {
        const eventID = event.id;
        console.log('EventCard pressed', event.id);
        router.push({
            pathname: '/[eventID]',
            params: { eventID },
          });
    }
    return (
        <TouchableOpacity onPress={() => { handlePress() }}>
            <View>
                <View style={styles.container}>
                    <Text style={styles.title}>{event.name}</Text>
                    <Text style={styles.date}>{event.dates.start.localDate}</Text>
                    <Image style={styles.image} source={{ uri: event.images[0].url }} />
                </View>
            </View>
        </TouchableOpacity>
    )


}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 15,
        color: 'gray',
    },
    description: {
        fontSize: 15,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
})