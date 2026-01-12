
import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizePaper = async (text: string): Promise<SummaryResult> => {
  const modelName = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are an expert scientific researcher and a professional science communicator for WeChat Official Accounts.
    Your task is to analyze the provided paper text and extract a comprehensive summary.
    
    CRITICAL REQUIREMENT:
    1. If the paper discusses Phage Display Peptide Technology (噬菌体展示肽技术), create a detailed, technical section for it.
    2. If it is NOT discussed, state "Not specifically addressed in this paper".
    3. Format the final "wechatDraft" field specifically for a WeChat Official Account post, using emojis, clear headings, and engaging Chinese language.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Paper Text:\n\n${text.substring(0, 50000)}`, // Limiting to ~50k chars for safety, though Gemini 3 handles more.
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Main title of the paper" },
          abstract: { type: Type.STRING, description: "Condensed abstract" },
          keyFindings: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of key scientific takeaways"
          },
          phageDisplayFocus: { 
            type: Type.STRING, 
            description: "Dedicated analysis of Phage Display Peptide Technology aspects" 
          },
          conclusion: { type: Type.STRING, description: "Final scientific conclusion" },
          wechatDraft: { 
            type: Type.STRING, 
            description: "A complete WeChat-ready blog post in Chinese, highly engaging and formatted with emojis." 
          },
        },
        required: ["title", "abstract", "keyFindings", "phageDisplayFocus", "conclusion", "wechatDraft"],
      },
    },
  });

  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr) as SummaryResult;
};
