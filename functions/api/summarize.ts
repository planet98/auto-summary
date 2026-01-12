
interface Env {
  AI: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { text } = await context.request.json() as { text: string };

    if (!text) {
      return new Response(JSON.stringify({ error: "未接收到有效的文本内容" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemInstruction = `
      你是一位资深的学术研究员和专业的生物医药领域公众号博主。
      请分析提供的论文文本，并严格按照 JSON 格式输出总结。
      
      要求：
      1. 标题 (title): 论文的中文标题。
      2. 摘要 (abstract): 150字以内的中文核心摘要。
      3. 核心发现 (keyFindings): 包含3-5个关键结论的数组。
      4. 噬菌体展示技术专项 (phageDisplayFocus): 
         - 如果论文涉及噬菌体展示肽技术 (Phage Display Peptide Technology)，请详细描述其在该研究中的应用、库的构建、筛选逻辑或关键多肽。
         - 如果不涉及，请写“该研究未直接应用噬菌体展示肽技术”。
      5. 结论 (conclusion): 总结该研究的科学价值。
      6. 公众号推文草稿 (wechatDraft): 
         - 采用微信公众号排版风格。
         - 使用吸引人的爆款标题。
         - 包含丰富的表情符号 (Emoji)。
         - 段落清晰，包含“研究背景”、“核心突破”、“专家点评”等板块。
         - 语言生动有趣，适合公众号读者阅读。

      必须仅输出有效的 JSON 字符串，严禁包含任何 Markdown 标签或多余解释。
    `;

    // 截取 30000 字符以平衡性能与效果
    const truncatedText = text.substring(0, 30000);

    const result = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `以下是论文内容：\n\n${truncatedText}` }
      ],
      temperature: 0.6
    });

    const aiResponse = result.response;
    
    // 清洗 JSON 内容，防止模型输出前后包含 ```json 标签
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : aiResponse;

    try {
      JSON.parse(cleanJson);
      return new Response(cleanJson, {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "AI 响应格式解析失败", 
        raw: aiResponse 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: `AI 节点错误: ${err.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
