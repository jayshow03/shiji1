export interface AnalysisResult {
    keywords: string[];
    emoji: string;
    message: string;
}

// 纯本地逻辑，不再连接任何AI服务
export const analyzeUserPreference = async (text: string): Promise<AnalysisResult> => {
    // 模拟一点点处理时间，让UI过渡更自然
    await new Promise(resolve => setTimeout(resolve, 600));

    let keywords = ['美食'];
    let emoji = '🍽️';

    const cleanText = text.trim();

    if (cleanText.length > 0) {
        // 简单的关键词提取逻辑
        // 如果用户输入了空格，就按空格分割，否则直接用整句
        if (cleanText.includes(' ') || cleanText.includes('，') || cleanText.includes(',')) {
            keywords = cleanText.split(/[ ,，]+/).filter(k => k.length > 0);
        } else {
            keywords = [cleanText];
        }

        // 简单的 Emoji 匹配逻辑
        if (cleanText.includes('火锅') || cleanText.includes('辣')) emoji = '🥘';
        else if (cleanText.includes('面') || cleanText.includes('粉')) emoji = '🍜';
        else if (cleanText.includes('咖啡') || cleanText.includes('茶')) emoji = '☕';
        else if (cleanText.includes('甜') || cleanText.includes('糕')) emoji = '🍰';
        else if (cleanText.includes('肉') || cleanText.includes('排') || cleanText.includes('烧烤')) emoji = '🥩';
        else if (cleanText.includes('日料') || cleanText.includes('寿司')) emoji = '🍣';
        else if (cleanText.includes('酒')) emoji = '🍺';
        else if (cleanText.includes('素') || cleanText.includes('沙拉')) emoji = '🥗';
    }

    const messages = [
        "唯有美食与爱不可辜负",
        "好好吃饭，好好爱自己",
        "今天的胃口是自由的",
        "在食物里寻找治愈",
        "生活不仅要吃甜，还要吃肉",
        "人间烟火气，最抚凡人心",
        "吃饱了才有力气生活"
    ];
    
    // 随机选择一句治愈语
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return {
        keywords,
        emoji,
        message: randomMessage
    };
};
