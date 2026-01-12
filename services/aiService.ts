
import { SummaryResult } from "../types";

export const summarizePaper = async (text: string): Promise<SummaryResult> => {
  // 此时直接调用同域下的 api 接口，安全性更高且不需要在前端配置 Token
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.substring(0, 15000), // 限制长度以适应免费模型上下文
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `服务器请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data as SummaryResult;
};
