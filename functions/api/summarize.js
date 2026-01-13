import { GoogleGenAI, Type } from "@google/genai";

export async function onRequestPost(context) {
  try {
    const { text } = await context.request.json();
    // 优先从 context.env 获取 Cloudflare 环境变量
    const apiKey = context.env.API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "未在环境变量中配置 API_KEY。" }), { 
        status: 500, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // 使用 gemini-3-pro-preview 处理科学文献
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `分析以下论文内容并提取核心信息：\n\n${text.substring(0, 40000)}`,
      config: {
        systemInstruction: "你是一位医药专家。你必须且仅能返回纯 JSON 格式数据，不得包含任何 Markdown 代码块标签（如 ```json）或前导/后缀文字。若涉及噬菌体展示技术请重点分析，若无则注明。微信推文需包含 Emoji 且语气生动。",
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
          required: ["title", "abstract", "keyFindings", "phageDisplayFocus", "conclusion", "wechatDraft"]
        }
      }
    });

    let rawOutput = response.text || "";
    
    // 鲁棒性：使用正则表达式从输出中精确提取 JSON 部分
    // 即使模型输出了“这是 JSON：{...}”，也能正确提取
    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI 响应未包含有效的 JSON 结构");
    }
    
    const cleanedJson = jsonMatch[0];

    return new Response(cleanedJson, {
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      error: err.message,
      tip: "请确保 Cloudflare Pages 绑定了正确的 API_KEY 环境变量。"
    }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
}