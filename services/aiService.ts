import { SummaryResult } from "../types";

export const summarizePaper = async (text: string): Promise<SummaryResult> => {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text, 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `请求失败 (${response.status})。请检查 Cloudflare 后台是否已绑定 AI 对象。`);
  }

  return await response.json() as SummaryResult;
};