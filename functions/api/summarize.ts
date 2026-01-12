interface Env {
  AI: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { text } = await context.request.json() as { text: string };

    if (!text || text.length < 50) {
      return new Response(JSON.stringify({ error: "提供的文本内容太短，无法分析。" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemInstruction = `
      你是一位生物医学专家和资深科学博主。请分析提供的论文内容，并返回严格的 JSON 格式。
      
      输出 JSON 结构：
      {
        "title": "中文标题",
        "abstract": "150字内精华摘要",
        "keyFindings": ["核心发现1", "核心发现2", "核心发现3"],
        "phageDisplayFocus": "如果涉及噬菌体展示技术，请详细说明库、序列、亲和力等；如果不涉及，请注明。",
        "conclusion": "研究意义",
        "wechatDraft": "一篇完整的、排版精美且带有大量 Emoji 的微信公众号推文。包含导读、正文深度解析、结尾总结。"
      }

      注意：只能返回纯 JSON，不要包含任何解释文字或 \`\`\` 标记。
    `;

    // 限制长度以确保模型响应速度和上下文窗口
    const truncatedText = text.substring(0, 15000);

    const result = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `请分析以下论文：\n\n${truncatedText}` }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    let rawResponse = result.response;
    
    // 清理可能存在的 Markdown 标签
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : rawResponse;

    try {
      JSON.parse(cleanedJson);
      return new Response(cleanedJson, {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (e) {
      console.error("JSON 解析错误:", e);
      return new Response(JSON.stringify({ 
        error: "AI 响应格式解析失败，请重试。", 
        debug: rawResponse.substring(0, 100) 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: `服务器错误: ${err.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};