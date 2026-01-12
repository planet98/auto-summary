import React from 'react';
import { SummaryResult } from '../types';

interface SummaryCardProps {
  result: SummaryResult;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ result }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('推文内容已复制到剪贴板，可直接粘贴到公众号后台！');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 核心概览 */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{result.title}</h2>
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">研究摘要</h3>
          <p className="text-slate-600 leading-relaxed">{result.abstract}</p>
        </div>
        
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">关键科研突破</h3>
          <ul className="grid gap-3">
            {result.keyFindings.map((finding, idx) => (
              <li key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-slate-700 text-sm leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 专项技术解析：噬菌体展示 */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
          </svg>
        </div>
        <div className="relative z-10">
          <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
            <span className="p-1.5 bg-white/20 rounded-lg">🧬</span>
            噬菌体展示肽技术 (Phage Display) 专项深度解析
          </h3>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
            <p className="leading-relaxed text-blue-50 font-medium">
              {result.phageDisplayFocus}
            </p>
          </div>
        </div>
      </section>

      {/* 公众号推文生成区 */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
             <span className="text-green-400">●</span> 微信公众号推文草稿
          </h3>
          <button 
            onClick={() => handleCopy(result.wechatDraft)}
            className="text-xs font-bold px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-lg active:scale-95"
          >
            一键复制全文
          </button>
        </div>
        <div className="p-6 bg-slate-50">
          <div className="whitespace-pre-wrap text-slate-800 text-sm leading-relaxed font-sans p-6 bg-white rounded-xl border border-slate-200 shadow-inner max-h-[500px] overflow-y-auto">
            {result.wechatDraft}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SummaryCard;