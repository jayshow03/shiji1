// Mock data in case Map API key is not provided or fails
import { Shop } from './types';

export const MOCK_SHOPS: Shop[] = [
    {
        id: '1',
        name: 'Sunday Morning Coffee',
        type: 'Coffee & Cake',
        address: '123 Healing Blvd, Mindful District',
        distance: 150,
        location: { lat: 39.9, lng: 116.4 },
        rating: 4.9,
        driveTime: 12,
        parking: [
            { name: 'Sunrise Plaza Parking', price: '¥8/hr', walkDistance: 50, hasCharging: true },
            { name: 'Street Side B', price: 'Free', walkDistance: 120, hasCharging: false }
        ]
    },
    {
        id: '2',
        name: 'Soul Comfort Hotpot',
        type: 'Hotpot',
        address: '88 Spicy Lane, Warmth City',
        distance: 450,
        location: { lat: 39.91, lng: 116.41 },
        rating: 4.7,
        driveTime: 25,
        parking: [
            { name: 'Underground Lot A', price: '¥10/hr', walkDistance: 10, hasCharging: false },
        ]
    },
    {
        id: '3',
        name: 'Midnight Ramen',
        type: 'Japanese',
        address: '4 Quiet Corner, Sleepy Town',
        distance: 800,
        location: { lat: 39.92, lng: 116.42 },
        rating: 4.8,
        driveTime: 30,
        parking: [
             { name: 'Public Square', price: '¥5/hr', walkDistance: 200, hasCharging: true }
        ]
    }
];

export const APP_NAME = "食 机";
export const APP_SUBTITLE = "Gourmet & Parking";