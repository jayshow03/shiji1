import { Shop, Parking, Location } from '../types';
import { MOCK_SHOPS } from '../constants';

const isAMapLoaded = () => typeof window !== 'undefined' && window.AMap;

export const getCurrentPosition = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
        if (!isAMapLoaded()) {
            console.warn("AMap not loaded, using mock location");
            resolve({ lat: 39.9042, lng: 116.4074 }); // Beijing default
            return;
        }

        const AMap = window.AMap;
        AMap.plugin('AMap.Geolocation', function() {
            const geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,
                timeout: 10000,
            });

            geolocation.getCurrentPosition((status: string, result: any) => {
                if (status === 'complete') {
                    resolve({ lat: result.position.lat, lng: result.position.lng });
                } else {
                    console.error("Geolocation failed:", result);
                    resolve({ lat: 39.9042, lng: 116.4074 });
                }
            });
        });
    });
};

export const searchNearbyShops = (keywords: string[], center: Location): Promise<Shop[]> => {
    return new Promise((resolve) => {
        if (!isAMapLoaded()) {
            setTimeout(() => resolve(MOCK_SHOPS), 1500);
            return;
        }

        const AMap = window.AMap;
        AMap.plugin('AMap.PlaceSearch', function() {
            const placeSearch = new AMap.PlaceSearch({
                type: '餐饮服务',
                pageSize: 20,
                extensions: 'all', // Crucial for getting rating, cost, and recommendations
            });
            
            const keyword = keywords.join('|'); 
            
            placeSearch.searchNearBy(keyword, [center.lng, center.lat], 3000, (status: string, result: any) => {
                if (status === 'complete' && result.poiList && result.poiList.pois) {
                    const shops: Shop[] = result.poiList.pois.map((p: any) => {
                        // Extract dishes from biz_ext.recommend or generic recommend field
                        let dishes: string[] = [];
                        const rawRecommend = p.biz_ext?.recommend || p.recommend;
                        if (rawRecommend && typeof rawRecommend === 'string') {
                            dishes = rawRecommend.split(/[,;，；\s]+/).slice(0, 3); // Split and take top 3
                        }

                        return {
                            id: p.id,
                            name: p.name,
                            type: p.type.split(';')[1] || p.type.split(';')[0] || '美食',
                            address: p.address,
                            distance: p.distance,
                            location: { lat: p.location.lat, lng: p.location.lng },
                            rating: p.biz_ext?.rating || (Math.random() * 1.5 + 3.5).toFixed(1), // Fallback rating
                            averageCost: p.biz_ext?.cost || '', // Average price per person
                            featuredItems: dishes,
                            photos: p.photos ? p.photos.map((ph: any) => ph.url) : [],
                        };
                    });
                    resolve(shops);
                } else {
                    resolve([]); 
                }
            });
        });
    });
};

export const getParkingAndDriveTime = (shop: Shop, userLoc: Location): Promise<Shop> => {
    return new Promise((resolve) => {
        if (!isAMapLoaded()) {
            resolve(shop); 
            return;
        }

        const AMap = window.AMap;
        let updatedShop = { ...shop };

        AMap.plugin(['AMap.PlaceSearch', 'AMap.Driving', 'AMap.Walking'], function() {
            // 1. Search Parking within 200m
            const parkingSearch = new AMap.PlaceSearch({
                type: '停车场|充电站', 
                pageSize: 5,
                extensions: 'all'
            });

            parkingSearch.searchNearBy('', [shop.location.lng, shop.location.lat], 200, (status: string, result: any) => {
                let parkingList: Parking[] = [];
                if (status === 'complete' && result.poiList && result.poiList.pois) {
                    parkingList = result.poiList.pois.map((p: any) => {
                         const nameStr = (p.name || '').toLowerCase();
                         const typeStr = (p.type || '').toLowerCase();
                         const hasCharging = nameStr.includes('充电') || typeStr.includes('充电');

                         return {
                            name: p.name,
                            price: p.biz_ext?.cost ? `¥${p.biz_ext.cost}/小时` : '价格未收录',
                            walkDistance: p.distance, 
                            hasCharging: hasCharging
                        };
                    });
                } else {
                    parkingList = [];
                }
                updatedShop.parking = parkingList;

                // 2. Get Drive Time & Distance (User -> Shop)
                const driving = new AMap.Driving({ policy: AMap.DrivingPolicy.LEAST_TIME });
                driving.search(
                    new AMap.LngLat(userLoc.lng, userLoc.lat),
                    new AMap.LngLat(shop.location.lng, shop.location.lat),
                    (dStatus: string, dResult: any) => {
                        if (dStatus === 'complete' && dResult.routes && dResult.routes[0]) {
                            const route = dResult.routes[0];
                            updatedShop.driveTime = Math.ceil(route.time / 60);
                            
                            // Format distance
                            const distMeters = route.distance;
                            updatedShop.driveDistance = distMeters > 1000 
                                ? `${(distMeters / 1000).toFixed(1)}km` 
                                : `${distMeters}m`;
                        } else {
                            // Fallback estimates
                            updatedShop.driveTime = Math.round(shop.distance / 1000 * 5); 
                            updatedShop.driveDistance = shop.distance > 1000 
                                ? `${(shop.distance / 1000).toFixed(1)}km` 
                                : `${shop.distance}m`;
                        }
                        resolve(updatedShop);
                    }
                );
            });
        });
    });
};