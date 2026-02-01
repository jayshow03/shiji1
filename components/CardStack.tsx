import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Shop } from '../types';
import FoodCard from './FoodCard';
import { Heart, X } from 'lucide-react';

interface CardStackProps {
    shops: Shop[];
    emoji?: string;
    onSwipeLeft: (shop: Shop) => void;
    onSwipeRight: (shop: Shop) => void;
}

const CardStack: React.FC<CardStackProps> = ({ shops, emoji, onSwipeLeft, onSwipeRight }) => {
    const visibleShops = shops.slice(0, 2);
    const [lastTilt, setLastTilt] = useState(0);
    const processingRef = useRef(false);

    // Device Orientation Handler for "Tilt to Swipe"
    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            // Gamma is the left-to-right tilt in degrees (usually -90 to 90)
            // -90 is left, 90 is right.
            const gamma = event.gamma; 

            if (gamma === null || processingRef.current || shops.length === 0) return;

            // Thresholds for tilt action
            const TILT_THRESHOLD = 35;
            const RESET_THRESHOLD = 10;

            if (Math.abs(gamma) < RESET_THRESHOLD) {
                // Reset state when phone is roughly flat
                setLastTilt(0);
            } else if (Math.abs(lastTilt) < RESET_THRESHOLD) {
                // Only trigger if we came from a "flat" state to avoid repeated triggers while holding tilted
                if (gamma > TILT_THRESHOLD) {
                    // Tilt Right -> Confirm/Navigate
                    processingRef.current = true;
                    onSwipeRight(shops[0]);
                    setTimeout(() => { processingRef.current = false; }, 1000); // Cool down
                } else if (gamma < -TILT_THRESHOLD) {
                    // Tilt Left -> Pass
                    processingRef.current = true;
                    onSwipeLeft(shops[0]);
                    setTimeout(() => { processingRef.current = false; }, 500); // Cool down
                }
                setLastTilt(gamma);
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [shops, onSwipeLeft, onSwipeRight, lastTilt]);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence>
                {visibleShops.map((shop, index) => (
                    <CardItem 
                        key={shop.id}
                        shop={shop}
                        index={index}
                        emoji={emoji}
                        total={visibleShops.length}
                        onSwipeLeft={() => onSwipeLeft(shop)}
                        onSwipeRight={() => onSwipeRight(shop)}
                    />
                ))}
            </AnimatePresence>
            
            {shops.length === 0 && (
                <div className="text-center p-8">
                    <div className="text-6xl mb-4 grayscale opacity-50">🍽️</div>
                    <p className="text-stone-400 font-bold text-sm">附近暂无更多推荐</p>
                </div>
            )}
        </div>
    );
};

interface CardItemProps {
    shop: Shop;
    index: number;
    total: number;
    emoji?: string;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ shop, index, total, emoji, onSwipeLeft, onSwipeRight }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    
    // Swipe Indicators: Left (Red/X), Right (Green/Check or Heart)
    const bgLeft = useTransform(x, [-150, 0], ["rgba(239, 68, 68, 0.1)", "rgba(255,255,255,0)"]); // Red
    const bgRight = useTransform(x, [0, 150], ["rgba(255,255,255,0)", "rgba(249, 115, 22, 0.1)"]); // Orange

    const isFront = index === 0;

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x > 100) {
            onSwipeRight();
        } else if (info.offset.x < -100) {
            onSwipeLeft();
        }
    };

    return (
        <motion.div
            style={{ 
                x: isFront ? x : 0, 
                rotate: isFront ? rotate : 0, 
                opacity: index === 0 ? opacity : 1 - index * 0.1,
                scale: 1 - index * 0.05,
                y: index * 20,
                zIndex: total - index
            }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1 - index * 0.05, opacity: 1, y: index * 20 }}
            exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.4 } }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="absolute w-[340px] h-[620px] cursor-grab active:cursor-grabbing perspective-1000"
        >
            <motion.div style={{ backgroundColor: bgRight }} className="absolute inset-0 z-10 rounded-[24px] pointer-events-none transition-colors" />
            <motion.div style={{ backgroundColor: bgLeft }} className="absolute inset-0 z-10 rounded-[24px] pointer-events-none transition-colors" />
            
            {/* Pass onNavigate handler which triggers swipeRight (navigate) */}
            <FoodCard 
                shop={shop} 
                emoji={emoji} 
                onNavigate={isFront ? onSwipeRight : undefined} 
            />

            {/* Floating Action Icons */}
            {isFront && (
                 <div className="absolute -bottom-24 left-0 right-0 flex justify-center gap-8 pointer-events-auto">
                    <button onClick={onSwipeLeft} className="w-16 h-16 bg-white rounded-full shadow-lg text-stone-300 flex items-center justify-center hover:text-stone-500 hover:scale-110 transition-all border border-stone-100">
                        <X size={32} strokeWidth={3} />
                    </button>
                    <button onClick={onSwipeRight} className="w-16 h-16 bg-orange-500 rounded-full shadow-lg shadow-orange-200 text-white flex items-center justify-center hover:scale-110 hover:bg-orange-600 transition-all ring-4 ring-white">
                        <Heart size={30} strokeWidth={3} fill="currentColor" />
                    </button>
                 </div>
            )}
        </motion.div>
    );
};

export default CardStack;