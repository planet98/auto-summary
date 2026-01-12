
import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult } from "../types";

// API Key is obtained from process.env.API_KEY as per guidelines
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

  // Increased character limit to 100k to better handle academic papers with Gemini 3's large context
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Paper Text:\n\n${text.substring(0, 100000)}`,
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

  // response.text is a getter property, not a method
  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr.trim()) as SummaryResult;
};
