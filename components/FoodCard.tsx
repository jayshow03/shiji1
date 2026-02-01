import React from 'react';
import { Shop } from '../types';
import { MapPin, Zap, CircleParking, Navigation2, Footprints, Star, Utensils } from 'lucide-react';

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
        return '🍱';
    };

    const displayEmoji = emoji || getEmoji(shop.type);
    
    // Walking info estimate (approx 80m/min)
    const walkMeters = shop.distance;
    const walkTime = Math.ceil(walkMeters / 80);

    return (
        <div className="w-full h-full bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-stone-200 flex flex-col overflow-hidden select-none">
            {/* Header Image Area */}
            <div className="h-[22%] bg-stone-50 flex items-center justify-between px-8 relative overflow-hidden group border-b border-stone-100 shrink-0">
                <div className="text-[70px] drop-shadow-sm transform group-hover:scale-110 transition-transform duration-500 cursor-default">
                    {displayEmoji}
                </div>
                <div className="flex flex-col items-end gap-1 z-10">
                     <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-stone-100 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                        <span className="text-stone-800 font-bold text-sm">{shop.rating}</span>
                     </div>
                     {shop.averageCost && (
                         <div className="text-[10px] font-medium text-stone-400">
                             人均 ¥{shop.averageCost}
                         </div>
                     )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-5 flex flex-col gap-3 overflow-hidden">
                {/* Title & Address */}
                <div>
                    <h2 className="text-xl font-black text-stone-800 leading-tight mb-1 truncate">{shop.name}</h2>
                    <div className="flex items-center text-stone-500 gap-1.5 mb-3">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <p className="text-[11px] truncate font-medium">{shop.address}</p>
                    </div>

                    {/* Action Buttons / Commute Info - Moved Here */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Drive / Navigate Button */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onNavigate) onNavigate();
                            }}
                            className="bg-stone-800 text-white p-3 rounded-xl flex items-center justify-between shadow-md active:scale-95 transition-transform cursor-pointer group hover:bg-stone-900"
                        >
                            <div className="flex items-center gap-2">
                                <Navigation2 className="w-4 h-4 text-orange-400 fill-current group-hover:animate-bounce" />
                                <div className="flex flex-col text-left">
                                    <span className="text-[9px] text-stone-400 font-bold uppercase">驾车前往</span>
                                    <span className="font-bold text-xs">{shop.driveTime ? `${shop.driveTime} min` : '--'}</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-stone-300 font-medium">{shop.driveDistance || '--'}</span>
                        </button>

                        {/* Walk Info */}
                        <div className="bg-white border border-stone-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
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
                </div>

                {/* Recommended Dishes (Top 3) */}
                {shop.featuredItems && shop.featuredItems.length > 0 && (
                    <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100/50">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Utensils className="w-3 h-3 text-orange-500" />
                            <h3 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">必吃推荐</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {shop.featuredItems.map((dish, i) => (
                                <span key={i} className="text-[10px] font-bold text-stone-600 bg-white px-2 py-1 rounded-md shadow-sm border border-orange-100">
                                    {dish}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Parking Section */}
                <div className="flex-1 bg-stone-50 rounded-xl p-3 overflow-y-auto no-scrollbar border border-stone-100 min-h-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CircleParking className="w-3 h-3" /> 周边停车 (200m内)
                        </h3>
                    </div>
                    
                    {shop.parking && shop.parking.length > 0 ? (
                        <div className="space-y-2">
                            {shop.parking.map((p, idx) => (
                                <div key={idx} className="bg-white p-2.5 rounded-lg shadow-sm border border-stone-100 flex justify-between items-center">
                                    <div className="flex flex-col flex-1 mr-2 min-w-0">
                                        <div className="flex items-center gap-1">
                                            <span className="text-stone-700 font-bold text-[11px] truncate">{p.name}</span>
                                            {p.hasCharging && (
                                                <Zap className="w-3 h-3 fill-green-500 text-green-500 shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-orange-600 text-[10px] font-bold mt-0.5">{p.price}</span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-stone-400 text-[10px] font-medium flex items-center justify-end gap-1">
                                            <Footprints className="w-3 h-3" /> {p.walkDistance}m
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-stone-400 text-[10px] py-4">
                             暂无数据或正在搜寻...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodCard;