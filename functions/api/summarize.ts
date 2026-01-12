interface Env {
  AI: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { text } = await context.request.json() as { text: string };

    if (!text || text.length < 100) {
      return new Response(JSON.stringify({ error: "提供的文本内容太短或为空，无法进行深度总结。" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemInstruction = `
      你是一位拥有生物医药背景的资深科研专家和百万粉丝级别的微信公众号主笔。
      
      任务：分析提供的学术论文，生成一份高度专业且适合传播的中文总结。
      
      输出必须是严格的 JSON 格式，包含以下字段：
      1. title: 论文的专业中文标题。
      2. abstract: 核心摘要（150字以内）。
      3. keyFindings: 关键发现（字符串数组，每条20-50字）。
      4. phageDisplayFocus: 【深度专项分析】
         - 如果涉及“噬菌体展示技术”（Phage Display），请详细分析库构建、筛选压力、关键肽序列及其生物学活性。
         - 如果不涉及，请回答：“该论文主要关注点不在噬菌体展示技术”。
      5. conclusion: 该研究对所属领域的长远意义。
      6. wechatDraft: 【爆款推文草稿】
         - 标题：使用吸引眼球的标题（例如：重磅突破！XX技术助力XX药物研发）。
         - 正文：段落分明，大量使用 Emoji（🔬, 🧬, 🧪, ✨, 💡）。
         - 结构：包含【前沿导读】、【技术硬核解析】、【专家点评】。
         - 风格：专业但不枯燥，鼓励读者转发。

      注意：禁止输出 JSON 以外的任何字符，禁止包含 Markdown 代码块标记（如 \`\`\`json ）。
    `;

    // 针对 Llama-3.1-8b 优化上下文，截取前 25000 字符
    const truncatedText = text.substring(0, 25000);

    const result = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `以下是需要总结的论文正文：\n\n${truncatedText}` }
      ],
      temperature: 0.6,
      max_tokens: 3000
    });

    const aiResponse = result.response;
    
    // 鲁棒性：尝试从响应中提取 JSON 结构
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : aiResponse;

    try {
      // 验证 JSON 合法性
      JSON.parse(cleanJson);
      return new Response(cleanJson, {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "AI 生成的 JSON 格式不正确", 
        raw: aiResponse 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Cloudflare AI 服务错误: ${err.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};