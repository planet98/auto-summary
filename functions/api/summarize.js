import { GoogleGenAI, Type } from "@google/genai";

export async function onRequestPost(context) {
  try {
    const { text } = await context.request.json();
    
    // 从环境变量获取 API KEY
    const apiKey = context.env.API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "未配置 API_KEY 环境变量。" }), { 
        status: 500, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `你是一位生物医药专家。请分析论文并返回 JSON 格式的深度总结。
    必须严格遵守 JSON 格式，不要包含任何前导词（如“以下是总结”）、尾随词或 Markdown 代码块标签。
    
    字段要求：
    - title: 论文中文标题
    - abstract: 精炼摘要（150字以内）
    - keyFindings: 关键科学发现的字符串数组
    - phageDisplayFocus: 针对“噬菌体展示肽技术”的专项深度分析。如果论文未涉及，请说明。
    - wechatDraft: 专门为微信公众号准备的推文草稿。要求：分段清晰、使用丰富的 Emoji、标题吸引人、语气专业且生动、适合直接复制粘贴。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `请对以下论文文本进行深度解析和公众号化总结：\n\n${text.substring(0, 50000)}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            abstract: { type: Type.STRING },
            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            phageDisplayFocus: { type: Type.STRING },
            wechatDraft: { type: Type.STRING }
          },
          required: ["title", "abstract", "keyFindings", "phageDisplayFocus", "wechatDraft"]
        }
      }
    });

    let rawText = response.text || "{}";
    
    // 鲁棒性处理：如果 AI 依然返回了非 JSON 字符，强行提取第一个 { 和最后一个 } 之间的内容
    let cleanedJson = rawText.trim();
    const firstBrace = cleanedJson.indexOf('{');
    const lastBrace = cleanedJson.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
    }

    // 尝试验证是否为合法 JSON，防止前端解析报错
    try {
      JSON.parse(cleanedJson);
    } catch (e) {
      // 如果解析失败，说明内容可能被截断或损坏，尝试简单的清理
      console.error("JSON validation failed for response:", cleanedJson);
    }

    return new Response(cleanedJson, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
}