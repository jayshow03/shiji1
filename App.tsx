import React, { useState, useEffect } from 'react';
import IntroScreen from './components/IntroScreen';
import CardStack from './components/CardStack';
import { Shop, Location } from './types';
import { analyzeUserPreference } from './services/geminiService';
import { getCurrentPosition, searchNearbyShops, getParkingAndDriveTime } from './services/mapService';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import { APP_NAME } from './constants';

const App: React.FC = () => {
    const [view, setView] = useState<'intro' | 'loading' | 'cards'>('intro');
    const [shops, setShops] = useState<Shop[]>([]);
    const [statusText, setStatusText] = useState('初始化中...');
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [moodEmoji, setMoodEmoji] = useState<string>('');
    const [moodMessage, setMoodMessage] = useState<string>('');

    const handleSearch = async (preferenceText: string) => {
        setView('loading');
        
        try {
            setStatusText('正在解读你的味蕾...');
            const analysis = await analyzeUserPreference(preferenceText);
            setMoodEmoji(analysis.emoji);
            setMoodMessage(analysis.message);
            
            setStatusText('定位当前位置...');
            const location = await getCurrentPosition();
            setUserLocation(location);

            setStatusText(`正在搜寻: ${analysis.keywords.join(' / ')}...`);
            let foundShops = await searchNearbyShops(analysis.keywords, location);

            if (foundShops.length === 0) {
                foundShops = await searchNearbyShops(['美食'], location);
            }

            if (foundShops.length > 0) {
                setStatusText('获取周边停车与充电信息...');
                const firstShopEnriched = await getParkingAndDriveTime(foundShops[0], location);
                foundShops[0] = firstShopEnriched;
                setShops(foundShops);
                setView('cards');
                
                enrichRemainingShops(foundShops, location);
            } else {
                setStatusText('附近似乎没有合适的店铺...');
                setTimeout(() => setView('intro'), 2000);
            }

        } catch (error) {
            console.error(error);
            setStatusText('请检查网络或GPS权限...');
            setTimeout(() => setView('intro'), 2000);
        }
    };

    const enrichRemainingShops = async (currentShops: Shop[], location: Location) => {
        const enrichedList = [...currentShops];
        for (let i = 1; i < Math.min(enrichedList.length, 5); i++) {
            enrichedList[i] = await getParkingAndDriveTime(enrichedList[i], location);
        }
        setShops(enrichedList);
    };

    const handleSwipeLeft = () => {
        setShops(prev => prev.slice(1));
        if (shops.length > 2 && userLocation && !shops[2].parking) {
           getParkingAndDriveTime(shops[2], userLocation).then(enrichedShop => {
               setShops(current => {
                   const newShops = [...current];
                   if(newShops[2] && newShops[2].id === enrichedShop.id) {
                       newShops[2] = enrichedShop;
                   }
                   return newShops;
               });
           });
        }
    };

    const handleSwipeRight = (shop: Shop) => {
        const url = `https://uri.amap.com/navigation?to=${shop.location.lng},${shop.location.lat},${shop.name}&mode=car&src=shiji`;
        window.location.href = url;
    };

    return (
        <div className="w-full h-screen bg-stone-100 flex flex-col items-center justify-center relative overflow-hidden text-stone-800">
             {/* Abstract Food Shapes Background */}
             <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-200/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[80px]" />
            </div>

            <div className="w-full max-w-md h-full md:h-[95vh] md:max-h-[850px] relative flex flex-col md:border-[12px] md:border-white md:rounded-[40px] md:shadow-xl overflow-hidden bg-[#fdfbf7]">
                
                {view === 'intro' && (
                    <IntroScreen onSearch={handleSearch} />
                )}

                {view === 'loading' && (
                    <div className="flex-1 flex flex-col items-center justify-center z-50 p-10 text-center">
                        <div className="text-8xl mb-6 animate-bounce drop-shadow-md">{moodEmoji || '🍽️'}</div>
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                        <p className="text-orange-600 text-xs font-bold tracking-[0.2em] uppercase">{statusText}</p>
                        {moodMessage && (
                            <p className="mt-8 text-stone-500 font-medium italic text-lg">"{moodMessage}"</p>
                        )}
                    </div>
                )}

                {view === 'cards' && (
                    <div className="flex-1 flex flex-col relative z-10">
                        <header className="pt-8 pb-2 text-center z-20 flex flex-col items-center select-none">
                            <div className="flex items-center gap-2 text-orange-600 mb-1 transform -rotate-2">
                                <h1 className="text-5xl font-art tracking-wide drop-shadow-sm">{APP_NAME}</h1>
                            </div>
                            <div className="w-12 h-1 bg-black mt-1 mb-2 rounded-full"></div>
                        </header>
                        
                        <main className="flex-1 relative flex items-center justify-center px-4 pb-20">
                            <CardStack 
                                shops={shops} 
                                emoji={moodEmoji}
                                onSwipeLeft={handleSwipeLeft} 
                                onSwipeRight={handleSwipeRight} 
                            />
                        </main>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;