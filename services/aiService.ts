
import { SummaryResult } from "../types";

export const summarizePaper = async (text: string): Promise<SummaryResult> => {
  // 我们不再需要在这里引入 GoogleGenAI，一切逻辑都交给 Cloudflare Backend
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // 截取前 25000 字符，这对 Llama-3.1-8b 来说是安全且高效的处理范围
      text: text.substring(0, 25000), 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `AI 节点请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data as SummaryResult;
};
