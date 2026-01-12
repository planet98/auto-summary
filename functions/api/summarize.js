
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Re-implemented using Google Gemini API and fixed template literal syntax errors
export async function onRequestPost(context) {
  try {
    const { text } = await context.request.json();
    
    // Always use GoogleGenAI with process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `你是一位生物医药专家。请分析论文并直接返回 JSON。
    不要返回任何 Markdown 代码块标签（不要 \`\`\`json 这种开头）。
    JSON 格式要求：
    {
      "title": "中文标题",
      "abstract": "精炼摘要",
      "keyFindings": ["发现1", "发现2"],
      "phageDisplayFocus": "如果涉及噬菌体展示肽技术，请详细总结；否则写‘本文未涉及’",
      "wechatDraft": "微信公众号推文，多用 Emoji，语气专业且吸引人"
    }`;

    // Fix: Using gemini-3-pro-preview for scientific reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `分析论文内容（限100000字）：\n\n${text.substring(0, 100000)}`,
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

    // response.text is a getter
    const cleaned = response.text || "{}";

    return new Response(cleaned, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
}
