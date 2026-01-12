
interface Env {
  AI: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { text } = await context.request.json() as { text: string };

    if (!text) {
      return new Response(JSON.stringify({ error: "未接收到文本" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 提示词工程：专门为生物医药公众号和科研背景设计
    const systemInstruction = `
      你是一位拥有博士学位的生物医药领域顶级科普博主。
      请根据提供的学术论文文本，生成一份深度总结。
      
      你需要输出以下 JSON 格式的内容（且仅输出 JSON）：
      1. title: 论文的中文学术标题（专业且准确）。
      2. abstract: 简明扼要的中文摘要（150字以内）。
      3. keyFindings: 3-5个核心科研突破，以数组形式呈现。
      4. phageDisplayFocus: 
         - 这是核心重点！如果论文涉及噬菌体展示肽技术 (Phage Display Peptide Technology)，请从以下维度深度解析：库的容量与质量、筛选策略（Biopanning）、验证手段以及发现的关键肽段序列或功能。
         - 如果不涉及，请回答：“该论文背景中未重点讨论噬菌体展示肽技术的实验细节”。
      5. conclusion: 该研究对行业或临床的潜在影响。
      6. wechatDraft: 
         - 这是一个可以直接发布到微信公众号的推文草稿。
         - 标题要吸睛（如：重磅！XX技术突破，攻克XX难题...）。
         - 正文使用丰富的 Emoji（如 🔬, 🧬, 🚀, 💡）。
         - 段落之间使用分界线（如 ---）。
         - 包含“前沿导读”、“深度解析”、“实验亮点”等板块。
         - 语气要专业且充满激情，适合业内人士阅读分享。

      注意：只能输出纯 JSON，严禁任何前导或后继文字。
    `;

    // 截取 25000 字符，确保在 Workers AI 的上下文窗口内获得最佳效果
    const truncatedText = text.substring(0, 25000);

    const result = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `论文内容：\n\n${truncatedText}` }
      ],
      temperature: 0.6,
      max_tokens: 2048
    });

    const aiResponse = result.response;
    
    // 清理输出中的 Markdown 代码块标识
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : aiResponse;

    try {
      JSON.parse(cleanJson);
      return new Response(cleanJson, {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "AI 响应解析异常", 
        raw: aiResponse 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Cloudflare Workers AI 服务异常: ${err.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
