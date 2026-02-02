export interface Location {
    lat: number;
    lng: number;
}

export interface Parking {
    name: string;
    price: string;
    walkDistance: number | string;
    hasCharging: boolean;
    location?: Location; // Added location for navigation
}

export interface Dish {
    name: string;
    price?: string; // Price is optional now as real API usually doesn't provide item-level prices
}

export interface Shop {
    id: string;
    name: string;
    type: string;
    address: string;
    distance: number; // Linear distance
    location: Location;
    rating: number | string;
    photos?: string[];
    parking?: Parking[];
    driveTime?: number; // in minutes
    driveDistance?: string; // e.g. "2.5km"
    averageCost?: string; // e.g. "98"
    featuredItems?: Dish[]; // Recommended dishes
    tags?: string[]; // Review tags like "Service Good", "Cozy"
}

export interface UserPreference {
    text: string;
    moodKeywords?: string[];
}

// Augment window for AMap and SpeechRecognition
declare global {
    interface Window {
        AMap: any;
        _AMapSecurityConfig: any;
        webkitSpeechRecognition: any;
    }
}