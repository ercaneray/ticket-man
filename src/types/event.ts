export interface Event {
    id: string;
    name: string;
    dates: {
        start: {
            localDate: string;
            localTime?: string;
        };
    };
    images: { url: string }[];
    _embedded?: {
        venues: [{
            name: string;
            city?: {
                name: string;
            };
            address?: {
                line1: string;
            };
            location?: {
                latitude: string;
                longitude: string;
            };
        }];
    };
    priceRanges?: {
        min: number;
        max: number;
        currency: string;
    }[];
    url?: string;
    info?: string;
} 