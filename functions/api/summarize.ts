interface Env {
  AI: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { text } = await context.request.json() as { text: string };

    if (!text || text.length < 100) {
      return new Response(JSON.stringify({ error: "文本内容太短，无法分析。" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemInstruction = `
      你是一位生物医药领域的资深专家，擅长将复杂的学术论文转化为通俗易懂且极具吸引力的科普内容。
      请分析论文并输出严格的 JSON 格式。
      
      重点要求：
      1. 必须包含一个专门的部分解析“噬菌体展示肽技术 (Phage Display)”，如果文中没提到，请写“本文未涉及”。
      2. 生成一段直接用于微信公众号发布的推文草稿（wechatDraft），包含 Emoji 排版、吸引人的标题和清晰的结构。
      
      JSON 结构如下：
      {
        "title": "中文论文标题",
        "abstract": "核心摘要（150字内）",
        "keyFindings": ["发现1", "发现2", "发现3"],
        "phageDisplayFocus": "针对噬菌体展示技术的专项分析内容",
        "conclusion": "研究意义总结",
        "wechatDraft": "带有Emoji的爆款公众号推文"
      }
      
      注意：只返回 JSON，不要包含 Markdown 代码块标记。
    `;

    // 限制输入长度
    const truncatedText = text.substring(0, 15000);

    const result = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `分析以下论文内容：\n\n${truncatedText}` }
      ],
      temperature: 0.6
    });

    let aiResponse = result.response;
    
    // 鲁棒性提取 JSON
    const startMatch = aiResponse.indexOf('{');
    const endMatch = aiResponse.lastIndexOf('}');
    if (startMatch !== -1 && endMatch !== -1) {
      aiResponse = aiResponse.substring(startMatch, endMatch + 1);
    }

    return new Response(aiResponse, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};