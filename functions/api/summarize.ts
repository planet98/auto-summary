
import { GoogleGenAI, Type } from "@google/genai";

// Use any for context to resolve the missing 'PagesFunction' type in the build environment
export const onRequestPost = async (context: any) => {
  try {
    const { text } = await context.request.json() as { text: string };

    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), { status: 400 });
    }

    // Always use the required initialization format for Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      You are an expert scientific researcher and a professional science communicator for WeChat Official Accounts.
      Analyze the provided paper text and extract a summary in JSON format.
      
      CRITICAL REQUIREMENT:
      1. If the paper discusses Phage Display Peptide Technology (噬菌体展示肽技术), create a detailed, technical section for it.
      2. Format the "wechatDraft" specifically for a WeChat Official Account post, using emojis, clear headings, and engaging Chinese language.
      3. You MUST output ONLY valid JSON.
    `;

    // Use gemini-3-flash-preview for summarization tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Paper Text:\n\n${text}`,
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
            conclusion: { type: Type.STRING },
            wechatDraft: { type: Type.STRING }
          },
          required: ["title", "abstract", "keyFindings", "phageDisplayFocus", "conclusion", "wechatDraft"],
        },
      },
    });

    // Access the .text property directly as per modern SDK guidelines
    const jsonStr = response.text;

    return new Response(jsonStr, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
