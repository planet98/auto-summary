
import React from 'react';
import { SummaryResult } from '../types';

interface SummaryCardProps {
  result: SummaryResult;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ result }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板！');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{result.title}</h2>
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-2">摘要</h3>
          <p className="text-slate-600 leading-relaxed">{result.abstract}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-2">核心发现</h3>
          <ul className="grid gap-3">
            {result.keyFindings.map((finding, idx) => (
              <li key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-slate-700 text-sm leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Special Phage Display Section */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-sm border border-indigo-100 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM11,7h2v2H11Zm0,4h2v6H11Z"/>
          </svg>
        </div>
        <div className="relative z-10">
          <h3 className="flex items-center gap-2 text-xl font-bold text-indigo-900 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            噬菌体展示肽技术专项分析
          </h3>
          <div className="prose prose-blue max-w-none">
            <p className="text-indigo-800 leading-relaxed font-medium">
              {result.phageDisplayFocus}
            </p>
          </div>
        </div>
      </section>

      {/* WeChat Post Draft */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
               <path d="M8.5 2C4.36 2 1 4.79 1 8.23c0 2 .16 3.1 3.24 4.71-.14.52-.5 1.84-.5 1.84l-.1.4c0 .16.08.3.2.37.05.03.11.04.17.04.1 0 .21-.05.28-.13 0 0 1.22-1.44 1.71-2.02.82.21 1.68.32 2.5.32 4.14 0 7.5-2.79 7.5-6.23S12.64 2 8.5 2z" />
             </svg>
             公众号推文草稿 (已优化排版)
          </h3>
          <button 
            onClick={() => handleCopy(result.wechatDraft)}
            className="text-xs font-bold px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
          >
            一键复制全文
          </button>
        </div>
        <div className="p-6 bg-slate-50/30">
          <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed font-mono p-4 bg-white rounded-xl border border-slate-200">
            {result.wechatDraft}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SummaryCard;
