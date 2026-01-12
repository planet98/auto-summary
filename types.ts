
export interface SummaryResult {
  title: string;
  abstract: string;
  keyFindings: string[];
  phageDisplayFocus: string;
  conclusion: string;
  wechatDraft: string;
}

export interface AppState {
  file: File | null;
  pdfText: string;
  isProcessing: boolean;
  isSummarizing: boolean;
  result: SummaryResult | null;
  error: string | null;
}
