import React, { useState, useEffect, useCallback } from 'react';
import { Mic, Search } from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '../constants';

interface IntroScreenProps {
    onSearch: (preference: string) => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onSearch }) => {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.webkitSpeechRecognition) {
            const r = new window.webkitSpeechRecognition();
            r.lang = 'zh-CN';
            r.continuous = true;
            r.interimResults = true;

            r.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setText(prev => prev + finalTranscript);
                }
            };

            r.onend = () => setIsListening(false);
            setRecognition(r);
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (!recognition) return;
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            setIsListening(true);
        }
    }, [isListening, recognition]);

    return (
        <div className="absolute inset-0 z-50 bg-[#fdfbf7] p-8 flex flex-col justify-center items-center overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[10%] left-[10%] text-9xl transform -rotate-12">🥦</div>
                <div className="absolute bottom-[20%] right-[5%] text-9xl transform rotate-12">🥩</div>
            </div>

            <div className="z-10 w-full max-w-sm flex flex-col items-center">
                {/* Artistic Title */}
                <h2 className="text-7xl font-art text-stone-900 mb-2 tracking-widest transform -rotate-3 drop-shadow-lg">{APP_NAME}</h2>
                <div className="w-16 h-1.5 bg-orange-500 mb-4 rounded-full"></div>
                <p className="text-stone-400 text-[10px] mb-12 tracking-[0.4em] font-black uppercase">{APP_SUBTITLE}</p>

                <div className="w-full relative mb-10 group">
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="今天想吃点什么？
例如：'想吃点辣的火锅，好停车的地方'" 
                        className="w-full h-48 p-6 rounded-[32px] text-stone-700 bg-white border-2 border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus:border-orange-200 focus:shadow-[0_12px_40px_rgba(251,146,60,0.15)] outline-none text-lg resize-none transition-all placeholder:text-stone-300"
                    />
                    
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <button 
                            onClick={toggleListening}
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform ${isListening ? 'bg-orange-600 scale-110 shadow-orange-200 ring-4 ring-orange-100' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'}`}
                        >
                            <Mic className={`w-7 h-7 ${isListening ? 'animate-pulse' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="mt-8 w-full">
                    <button 
                        onClick={() => onSearch(text)}
                        disabled={!text.trim()}
                        className="w-full bg-stone-900 text-white py-4 rounded-[24px] font-bold text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        <span>开始寻味</span>
                    </button>
                    <p className="text-center text-[10px] text-stone-400 mt-4 font-medium">
                        按住麦克风说出您的需求
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IntroScreen;