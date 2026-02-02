import React from 'react';
import { Shop, Parking } from '../types';
import { MapPin, Zap, CircleParking, Navigation2, Footprints, Star, Utensils, Tag, ChevronRight } from 'lucide-react';

interface FoodCardProps {
    shop: Shop;
    emoji?: string;
    onNavigate?: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ shop, emoji = '🍱', onNavigate }) => {
    const getEmoji = (type: string) => {
        if (type.includes('甜') || type.includes('Cake')) return '🍰';
        if (type.includes('火锅') || type.includes('Hotpot')) return '🥘';
        if (type.includes('面') || type.includes('Ramen')) return '🍜';
        if (type.includes('咖') || type.includes('Coffee')) return '☕';
        if (type.includes('肉') || type.includes('BBQ')) return '🥩';
        if (type.includes('酒') || type.includes('Bar')) return '🍺';
        return '🍱';
    };

    const displayEmoji = emoji || getEmoji(shop.type);
    
    // Walking info estimate (approx 80m/min)
    const walkMeters = shop.distance;
    const walkTime = Math.ceil(walkMeters / 80);
    
    const renderRating = () => {
        const r = shop.rating;
        // Check if rating is a valid number string or number
        const isNumeric = r && r !== '暂无评分' && !isNaN(parseFloat(String(r)));
        
        if (isNumeric) {
             return (
                 <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                    <span className="text-stone-800 font-bold text-sm">{r}</span>
                 </div>
             );
        }
        
        return (
             <div className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200/50">
                 暂无评分
             </div>
        );
    };

    const handleParkingClick = (e: React.MouseEvent, p: Parking) => {
        e.stopPropagation();
        if (p.location) {
            const url = `https://uri.amap.com/navigation?to=${p.location.lng},${p.location.lat},${p.name}&mode=car&src=shiji`;
            window.location.href = url;
        } else {
            // Fallback navigate by name if location is missing (rare)
             const url = `https://uri.amap.com/navigation?k=${p.name}&mode=car&src=shiji`;
             window.location.href = url;
        }
    };

    return (
        <div className="w-full h-full bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-stone-200 flex flex-col overflow-hidden select-none">
            {/* Header Area */}
            <div className="h-[18%] bg-stone-50 flex items-center justify-between px-6 relative overflow-hidden group border-b border-stone-100 shrink-0">
                <div className="text-[52px] drop-shadow-sm transform group-hover:scale-110 transition-transform duration-500 cursor-default">
                    {displayEmoji}
                </div>
                <div className="flex flex-col items-end gap-1.5 z-10">
                     {renderRating()}
                     {shop.averageCost ? (
                         <div className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200/50">
                             ¥{shop.averageCost}/人
                         </div>
                     ) : (
                         <div className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                             人均未收录
                         </div>
                     )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 flex flex-col gap-2 overflow-hidden bg-white">
                {/* 1. Title & Address & Tags */}
                <div className="shrink-0">
                    <h2 className="text-xl font-black text-stone-800 leading-tight mb-1 truncate">{shop.name}</h2>
                    
                    <div className="flex items-center text-stone-500 gap-1.5 mb-2">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <p className="text-[11px] truncate font-medium">{shop.address}</p>
                    </div>

                    {/* Review Tags - Prominent (Only if real tags exist) */}
                    {shop.tags && shop.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {shop.tags.map((tag, idx) => (
                                <span key={idx} className="flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                                    <Tag className="w-2.5 h-2.5 mr-1 opacity-50" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="mb-3 h-6"></div> // Spacer to keep layout stable
                    )}
                </div>

                {/* 2. Action Buttons */}
                <div className="grid grid-cols-2 gap-3 shrink-0 mb-1">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigate) onNavigate();
                        }}
                        className="bg-stone-900 text-white p-2.5 rounded-xl flex items-center justify-between shadow-md active:scale-95 transition-transform cursor-pointer group hover:bg-black"
                    >
                        <div className="flex items-center gap-2">
                            <Navigation2 className="w-4 h-4 text-orange-400 fill-current group-hover:animate-bounce" />
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] text-stone-400 font-bold uppercase">导航前往</span>
                                <span className="font-bold text-xs">{shop.driveTime ? `${shop.driveTime} min` : '--'}</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-stone-300 font-medium">{shop.driveDistance || '--'}</span>
                    </button>

                    <div className="bg-white border border-stone-200 p-2.5 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                            <Footprints className="w-4 h-4 text-stone-400" />
                            <div className="flex flex-col">
                                <span className="text-[9px] text-stone-400 font-bold uppercase">步行</span>
                                <span className="text-stone-700 font-bold text-xs">{walkTime} min</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium">{walkMeters}m</span>
                    </div>
                </div>

                {/* 3. Featured Dishes (Honest List) */}
                {shop.featuredItems && shop.featuredItems.length > 0 && (
                    <div className="bg-[#fff9f2] rounded-xl p-3 border border-orange-100 shrink-0">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Utensils className="w-3 h-3 text-orange-500" />
                            <h3 className="text-[10px] font-black text-orange-700 uppercase tracking-wider">网友推荐</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {shop.featuredItems.map((dish, i) => (
                                <span key={i} className="text-[11px] font-bold text-stone-700 bg-white px-2 py-1 rounded border border-orange-200/50 shadow-sm">
                                    {dish.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Parking Section */}
                <div className="flex-1 bg-stone-50 rounded-xl p-3 overflow-y-auto no-scrollbar border border-stone-100 min-h-0 mt-2">
                    <div className="flex items-center justify-between mb-2 sticky top-0 bg-stone-50 z-10 pb-1">
                        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CircleParking className="w-3.5 h-3.5 text-stone-500" /> 
                            <span>周边停车</span>
                            <span className="text-[8px] bg-stone-200 px-1 rounded text-stone-500">点击导航</span>
                        </h3>
                    </div>
                    
                    {shop.parking && shop.parking.length > 0 ? (
                        <div className="space-y-2">
                            {shop.parking.map((p, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={(e) => handleParkingClick(e, p)}
                                    className="bg-white p-2.5 rounded-lg shadow-sm border border-stone-100 flex justify-between items-center cursor-pointer hover:bg-stone-50 hover:border-orange-200 transition-all active:bg-orange-50 group/parking"
                                >
                                    <div className="flex flex-col flex-1 mr-2 min-w-0">
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <span className="text-stone-700 font-bold text-[11px] truncate group-hover/parking:text-orange-700 transition-colors">{p.name}</span>
                                            {p.hasCharging && (
                                                <Zap className="w-3 h-3 fill-green-500 text-green-500 shrink-0" />
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold px-1.5 rounded inline-block ${p.price.includes('免费') ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                                            {p.price}
                                        </span>
                                    </div>
                                    <div className="text-right shrink-0 flex items-center">
                                        <span className="text-stone-400 text-[9px] font-medium flex items-center justify-end gap-0.5 mr-1">
                                            <Footprints className="w-3 h-3" /> {p.walkDistance}m
                                        </span>
                                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover/parking:text-orange-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-stone-400 text-[10px] py-4 flex flex-col items-center">
                             <span>暂无数据</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodCard;