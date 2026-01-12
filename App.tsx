
import React, { useState } from 'react';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import { extractTextFromPdf } from './utils/pdfProcessor';
// Switch from Cloudflare proxy to direct Gemini service for better context handling
import { summarizePaper } from './services/geminiService';
import { AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    file: null,
    pdfText: '',
    isProcessing: false,
    isSummarizing: false,
    result: null,
    error: null,
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setState(prev => ({ ...prev, error: '请上传有效的 PDF 文件。' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      file, 
      error: null, 
      isProcessing: true, 
      result: null 
    }));

    try {
      const text = await extractTextFromPdf(file);
      setState(prev => ({ ...prev, pdfText: text, isProcessing: false }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, error: '提取 PDF 文本失败，请重试。', isProcessing: false }));
    }
  };

  const startAnalysis = async () => {
    if (!state.pdfText) return;
    
    setState(prev => ({ ...prev, isSummarizing: true, error: null }));
    
    try {
      // Direct call to Gemini service
      const summary = await summarizePaper(state.pdfText);
      setState(prev => ({ ...prev, result: summary, isSummarizing: false }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        error: err.message || 'AI 总结失败，请检查 API Key 配置。', 
        isSummarizing: false 
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        {!state.result && (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                快速理解学术前沿
              </h2>
              <p className="text-lg text-slate-600">
                使用 Google Gemini AI 深度剖析技术论文。
              </p>
            </div>

            <div className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ${
              state.file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 bg-white'
            }`}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={state.isProcessing || state.isSummarizing}
              />
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  {state.isProcessing ? (
                    <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {state.file ? state.file.name : '点击或拖拽 PDF 到这里'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">支持超大文本长论文深度分析</p>
                </div>
              </div>
            </div>

            {state.file && !state.isProcessing && (
              <button
                onClick={startAnalysis}
                disabled={state.isSummarizing}
                className="w-full sm:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
              >
                {state.isSummarizing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Gemini AI 正在生成总结...
                  </>
                ) : (
                  '开始 AI 深度分析'
                )}
              </button>
            )}

            {state.error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
                {state.error}
              </div>
            )}
          </div>
        )}

        {state.result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setState(prev => ({ ...prev, result: null, file: null, pdfText: '' }))}
                className="text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm font-bold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                重新上传
              </button>
              <div className="text-xs text-slate-400 font-medium">
                Powered by Google Gemini AI
              </div>
            </div>
            
            <SummaryCard result={state.result} />
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 mt-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2024 文献阅读 AI 助手 | 部署于 Cloudflare | Powered by Gemini
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
