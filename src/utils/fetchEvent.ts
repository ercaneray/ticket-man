import axios from 'axios';

const API_KEY = 'wYGNg0lBRAw0rVYktm9HnABJrXPOWTPB';
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events';

export const fetchEvent = async (eventId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}`, {
            params: {
                apikey: API_KEY,
                id: eventId,
                locale: "*"
            }
        });
        
        if (response.data._embedded?.events?.[0]) {
            return response.data._embedded.events[0];
        }
        throw new Error('Event not found');
        
    } catch (error) {
        console.error('Error fetching event:', error);
        throw error;
    }
}; 