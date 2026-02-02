import { Shop, Parking, Location, Dish } from '../types';
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

// Helper to safely extract biz_ext fields which might be arrays or strings
const getBizExtField = (poi: any, field: string): string | undefined => {
    const bizExt = poi.biz_ext;
    if (!bizExt) return undefined;
    
    const val = bizExt[field];
    if (val === undefined || val === null) return undefined;
    
    // AMap sometimes returns [] for empty fields
    if (Array.isArray(val)) {
        return val.length > 0 ? String(val[0]) : undefined;
    }
    
    const strVal = String(val);
    return strVal.trim() === '' ? undefined : strVal;
};

// Helper to clean up tags from API
const extractRealTags = (poi: any): string[] => {
    const tags: string[] = [];
    
    // 1. Get from biz_ext tags (The most authentic source)
    if (poi.biz_ext?.tag) {
        // Handle various separators
        const rawTags = poi.biz_ext.tag.split(/[,;，\s]/);
        tags.push(...rawTags.filter((t: string) => t.length > 0 && t.length < 8).slice(0, 4));
    }

    // 2. Add objective rating tag if high score
    const ratingVal = parseFloat(poi.biz_ext?.rating);
    if (!isNaN(ratingVal) && ratingVal >= 4.6) {
        tags.push('高分好评');
    }

    // 3. Fallback to Type info if tags are scarce
    if (tags.length < 2 && poi.type) {
        const types = poi.type.split(';');
        if (types.length >= 3) tags.push(types[2]);
        else if (types.length >= 2) tags.push(types[1]);
    }

    return [...new Set(tags)].slice(0, 4);
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
            
            placeSearch.searchNearBy(keyword, [center.lng, center.lat], 5000, (status: string, result: any) => {
                if (status === 'complete' && result.poiList && result.poiList.pois) {
                    const shops: Shop[] = result.poiList.pois.map((p: any) => {
                        // Robust extraction for cost and rating
                        const avgCostStr = getBizExtField(p, 'cost'); 
                        const ratingStr = getBizExtField(p, 'rating') || '暂无评分';
                        const typeStr = p.type || '美食';

                        // Extract dishes strictly from API
                        let dishes: Dish[] = [];
                        const rawRecommend = p.biz_ext?.recommend || p.recommend;
                        
                        if (rawRecommend && typeof rawRecommend === 'string' && rawRecommend.length > 0) {
                            const names = rawRecommend.split(/[,;，；\s]+/).filter((n:string) => n.length > 0).slice(0, 6);
                            dishes = names.map((name: string) => ({
                                name: name
                                // No fake price generation
                            }));
                        } 

                        // Extract tags strictly from API
                        const tags = extractRealTags(p);

                        return {
                            id: p.id,
                            name: p.name,
                            type: typeStr.split(';')[1] || typeStr.split(';')[0] || '美食',
                            address: p.address,
                            distance: p.distance,
                            location: { lat: p.location.lat, lng: p.location.lng },
                            rating: ratingStr,
                            averageCost: avgCostStr,
                            featuredItems: dishes,
                            tags: tags,
                            photos: p.photos ? p.photos.map((ph: any) => ph.url) : [],
                        };
                    });
                    
                    // Filter out shops with very poor data quality if desired, or just show what we have
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
            // 1. Search Parking within 300m
            const parkingSearch = new AMap.PlaceSearch({
                type: '停车场|充电站', 
                pageSize: 5,
                extensions: 'all'
            });

            parkingSearch.searchNearBy('', [shop.location.lng, shop.location.lat], 300, (status: string, result: any) => {
                let parkingList: Parking[] = [];
                if (status === 'complete' && result.poiList && result.poiList.pois) {
                    parkingList = result.poiList.pois.map((p: any) => {
                         const nameStr = (p.name || '').toLowerCase();
                         const typeStr = (p.type || '').toLowerCase();
                         const hasCharging = nameStr.includes('充电') || typeStr.includes('充电');

                         // Try to extract cost from address or type if biz_ext is empty
                         let price = '价格未收录';
                         if (p.biz_ext?.cost) {
                             const costVal = p.biz_ext.cost;
                             price = `¥${Array.isArray(costVal) ? costVal[0] : costVal}/小时`;
                         }
                         
                         return {
                            name: p.name.replace('停车场', ''),
                            price: price,
                            walkDistance: p.distance, 
                            hasCharging: hasCharging,
                            location: { lat: p.location.lat, lng: p.location.lng } // Capture location for navigation
                        };
                    });
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
                            // Simple fallback math if routing fails
                            updatedShop.driveTime = Math.round(shop.distance / 1000 * 5) + 5; 
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