export interface Location {
    lat: number;
    lng: number;
}

export interface Parking {
    name: string;
    price: string;
    walkDistance: number | string;
    hasCharging: boolean;
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
    featuredItems?: string[]; // Recommended dishes
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