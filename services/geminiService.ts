import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

export interface AnalysisResult {
    keywords: string[];
    emoji: string;
    message: string;
}

export const analyzeUserPreference = async (text: string): Promise<AnalysisResult> => {
    if (!apiKey) {
        console.warn("Gemini API Key missing. Returning default analysis.");
        return {
            keywords: ['美食', '咖啡', '甜点'],
            emoji: '✨',
            message: 'Falling back to local discovery...'
        };
    }

    try {
        const response = await ai.models.generateContent({
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
        return {
            keywords: ['美食'],
            emoji: '🍲',
            message: '用心感受生活...'
        };
    }
};