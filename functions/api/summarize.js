import { GoogleGenAI, Type } from "@google/genai";

export async function onRequestPost(context) {
  try {
    const { text } = await context.request.json();
    const apiKey = context.env.API_KEY;
    
    if (!apiKey) return new Response('Missing API_KEY', { status: 500 });

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `分析以下论文内容并生成 JSON：\n\n${text}`,
      config: {
        systemInstruction: "你是一位医药专家。必须且仅返回 JSON。字段：title, abstract, keyFindings(数组), phageDisplayFocus(针对噬菌体展示技术的总结), wechatDraft(带Emoji的公众号推文)。",
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

    return new Response(response.text, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}