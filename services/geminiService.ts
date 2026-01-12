
import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult } from "../types";

// API Key is obtained from process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Summarizes a scientific paper using Gemini 3 Pro for deep reasoning.
 * Follows @google/genai guidelines for text generation and structured JSON output.
 */
export const summarizePaper = async (text: string): Promise<SummaryResult> => {
  // Use 'gemini-3-pro-preview' for complex reasoning tasks like STEM paper analysis
  const modelName = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    You are an expert scientific researcher and a professional science communicator for WeChat Official Accounts.
    Your task is to analyze the provided paper text and extract a comprehensive summary.
    
    CRITICAL REQUIREMENT:
    1. If the paper discusses Phage Display Peptide Technology (噬菌体展示肽技术), create a detailed, technical section for it.
    2. If it is NOT discussed, state "Not specifically addressed in this paper".
    3. Format the final "wechatDraft" field specifically for a WeChat Official Account post, using emojis, clear headings, and engaging Chinese language.
  `;

  // Use ai.models.generateContent directly with model name and prompt
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
