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
        averageCost: '45',
        driveTime: 12,
        tags: ['环境安静', '适合办公', '咖啡好喝', '甜品精致'],
        featuredItems: [
            { name: '海盐焦糖拿铁' },
            { name: '巴斯克芝士蛋糕' },
            { name: '手冲瑰夏' }
        ],
        parking: [
            { name: 'Sunrise Plaza Parking', price: '¥8/hr', walkDistance: 50, hasCharging: true, location: { lat: 39.901, lng: 116.401 } },
            { name: 'Street Side B', price: 'Free', walkDistance: 120, hasCharging: false, location: { lat: 39.902, lng: 116.402 } }
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
        averageCost: '128',
        driveTime: 25,
        tags: ['食材新鲜', '服务热情', '排队王', '性价比高'],
        featuredItems: [
            { name: '鲜切吊龙' },
            { name: '手工虾滑' },
            { name: '现炸酥肉' }
        ],
        parking: [
            { name: 'Underground Lot A', price: '¥10/hr', walkDistance: 10, hasCharging: false, location: { lat: 39.911, lng: 116.411 } },
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
        averageCost: '65',
        driveTime: 30,
        tags: ['深夜食堂', '汤头浓郁', '一人食', '氛围感'],
        featuredItems: [
            { name: '豚骨拉面' },
            { name: '日式煎饺' },
            { name: '唐扬鸡块' }
        ],
        parking: [
             { name: 'Public Square', price: '¥5/hr', walkDistance: 200, hasCharging: true, location: { lat: 39.921, lng: 116.421 } }
        ]
    }
];

export const APP_NAME = "食 机";
export const APP_SUBTITLE = "Gourmet & Parking";