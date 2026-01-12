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
      你是一位生物医药领域的资深科学家，同时也是一位拥有10万+阅读量经验的科普公众号博主。
      
      请分析提供的论文，并输出严格的 JSON 格式数据。
      要求如下：
      1. title: 论文的专业中文标题。
      2. abstract: 核心摘要，控制在150字内。
      3. keyFindings: 数组格式，列出3-5条最硬核的科研突破。
      4. phageDisplayFocus: 【重点项目】
         - 如果文中涉及噬菌体展示技术（Phage Display），必须详细总结：库的类型（七肽/十二肽等）、筛选轮数、关键序列及其亲和力表现。
         - 如果不涉及，请写“本论文未直接涉及噬菌体展示实验细节”。
      5. conclusion: 该研究对行业的实际应用价值。
      6. wechatDraft: 【爆款公众号推文】
         - 标题：起一个吸引业内人士和投资人的标题。
         - 内容：包含【导读】、【硬核解析】、【技术点评】。
         - 排版：大量使用 Emoji（🔬, 🧬, 🚀, 💡, 🧪）使阅读体验轻松愉快。
         - 风格：专业、前沿、充满干货。

      注意：只能输出纯 JSON 字符串，不能包含 \`\`\`json 标签或其他任何文字。
    `;

    // 截取前 25000 字符以适应 Llama 3.1 8B 的最佳性能区间
    const truncatedText = text.substring(0, 25000);

    const result = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `待分析论文：\n\n${truncatedText}` }
      ],
      temperature: 0.6,
      max_tokens: 3000
    });

    let aiResponse = result.response;
    
    // 鲁棒性处理：提取 JSON 部分
    const startIdx = aiResponse.indexOf('{');
    const endIdx = aiResponse.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      aiResponse = aiResponse.substring(startIdx, endIdx + 1);
    }

    try {
      JSON.parse(aiResponse);
      return new Response(aiResponse, {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "AI 响应格式解析失败", 
        raw: aiResponse 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Cloudflare AI 接口异常: ${err.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};