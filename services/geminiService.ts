import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to get key safely in a browser environment
const getApiKey = (): string => {
    // 1. Check local storage (user entered it previously)
    let key = localStorage.getItem('GEMINI_API_KEY');
    
    // 2. If no key, ask the user
    if (!key) {
        key = prompt("请输入您的 Google Gemini API Key (它将仅保存在您的本地浏览器中以开启AI功能):", "");
        if (key) {
            localStorage.setItem('GEMINI_API_KEY', key.trim());
        }
    }
    return key || '';
};

// Initialize client conditionally
let ai: GoogleGenAI | null = null;

const getAIClient = () => {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    
    // Create instance if not exists
    if (!ai) {
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

export interface AnalysisResult {
    keywords: string[];
    emoji: string;
    message: string;
}

export const analyzeUserPreference = async (text: string): Promise<AnalysisResult> => {
    const client = getAIClient();

    // If user cancelled the prompt or key is missing, fallback to local mock
    if (!client) {
        console.warn("No Gemini API Key provided. Falling back to local mode.");
        return fallbackAnalysis(text);
    }

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `User says: "${text}". 
            Analyze this text to determine the user's mood and food cravings. 
            Return a JSON object with:
            - 'keywords': A list of 3-5 Chinese search terms for AMap (Gaode Map) (e.g., '火锅', '日料', '甜品').
            - 'emoji': A single emoji representing the vibe.
            - 'message': A very short, poetic, healing message (max 15 chars) in Chinese.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        emoji: { type: Type.STRING },
                        message: { type: Type.STRING }
                    }
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) throw new Error("Empty response from Gemini");
        
        return JSON.parse(jsonText) as AnalysisResult;

    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        
        // Handle invalid key specifically (400/401/403 errors)
        const errStr = JSON.stringify(error);
        if (errStr.includes('400') || errStr.includes('401') || errStr.includes('403') || errStr.includes('PERMISSION_DENIED')) {
            localStorage.removeItem('GEMINI_API_KEY');
            alert("API Key 似乎无效或过期，已自动清除。请重新尝试搜索并输入新的 Key。");
            // Force reload to clear client state could be an option, but let's just fallback for now
        }

        return fallbackAnalysis(text);
    }
};

// Fallback logic for when AI fails or no key
const fallbackAnalysis = (text: string): AnalysisResult => {
     let searchKeywords = ['美食'];
    
    if (text && text.trim().length > 0) {
        const cleanText = text.trim();
        if (cleanText.includes(' ')) {
            searchKeywords = cleanText.split(' ').filter(k => k.length > 0);
        } else {
            searchKeywords = [cleanText];
        }
    }

    const emojis = ['🍱', '🥘', '🍜', '🍣', '🥩', '🥗', '🍔', '🍕'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const messages = [
        "唯有美食与爱不可辜负",
        "好好吃饭，好好爱自己",
        "今天的胃口是自由的",
        "在食物里寻找治愈",
        "生活不仅要吃甜，还要吃肉",
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return {
        keywords: searchKeywords,
        emoji: randomEmoji,
        message: randomMessage
    };
}
