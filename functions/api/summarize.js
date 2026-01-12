export async function onRequestPost(context) {
  try {
    const { text } = await context.request.json();
    const ai = context.env.AI;

    if (!ai) {
      return new Response(JSON.stringify({ error: "未检测到 AI 绑定，请在 Cloudflare 后台设置。" }), { 
        status: 500, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const systemPrompt = `你是一位生物医药专家。请分析论文并返回 JSON 格式。
    必须包含字段：
    - title: 中文标题
    - abstract: 精炼摘要
    - keyFindings: 关键发现数组
    - phageDisplayFocus: 噬菌体展示技术相关内容的专项深度总结
    - wechatDraft: 爆款微信公众号推文草稿（带Emoji，分段清晰，语气亲和）
    
    注意：只返回纯 JSON 对象，不要带 Markdown 代码块标记。`;

    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请分析：\n\n${text.substring(0, 12000)}` }
      ]
    });

    let raw = response.response;
    // 鲁棒性提取 JSON
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    const cleaned = (start !== -1 && end !== -1) ? raw.substring(start, end + 1) : raw;

    return new Response(cleaned, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
}