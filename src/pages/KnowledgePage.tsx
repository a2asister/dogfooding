import { useState } from 'react';
import { BookOpen, X, ChevronRight, Sparkles } from 'lucide-react';
import { knowledgeList } from '../data/knowledge';
import type { KnowledgeItem } from '../types';

function formatContent(content: string): React.ReactNode {
  return content.split('\n').map((line, index) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={index} className="font-bold mt-5 mb-2 text-text-dark text-base">
          {line.replace(/\*\*/g, '')}
        </p>
      );
    }
    if (line.startsWith('- ')) {
      return (
        <p key={index} className="ml-5 text-text-medium mt-1.5">
          • {line.slice(2)}
        </p>
      );
    }
    if (line.trim() === '') {
      return <br key={index} />;
    }
    return (
      <p key={index} className="text-text-medium leading-relaxed mt-2">
        {line}
      </p>
    );
  });
}

export function KnowledgePage() {
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeItem | null>(null);

  const categories = [...new Set(knowledgeList.map((k) => k.category))];

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className="mb-10">
        <div className="bg-gradient-to-r from-primary-blue/8 via-primary-light-blue/12 to-primary-blue/8 rounded-3xl p-7 md:p-9 border border-primary-blue/10">
          <div className="flex items-start gap-5">
            <div className="hidden md:flex w-16 h-16 bg-gradient-to-br from-primary-blue to-primary-light-blue rounded-2xl items-center justify-center flex-shrink-0 shadow-md">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-text-dark mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-orange md:hidden" fill="currentColor" />
                发电知识小百科
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-text-medium leading-relaxed max-w-2xl">
                点击卡片了解更多发电相关的知识，每个知识点都用大白话讲解，轻松理解复杂的发电原理~
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-12 pb-6 md:pb-8">
        {categories.map((category, categoryIndex) => {
          const categoryKnowledge = knowledgeList.filter((k) => k.category === category);
          
          return (
            <div 
              key={category} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${categoryIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1.5 h-8 bg-gradient-to-b from-primary-blue to-primary-light-blue rounded-full" />
                <h3 className="text-lg md:text-xl font-bold text-text-dark">
                  {category}
                </h3>
                <span className="text-xs px-3 py-1.5 bg-primary-blue/10 text-primary-blue rounded-full font-medium">
                  {categoryKnowledge.length} 个知识点
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {categoryKnowledge.map((knowledge, index) => (
                  <button
                    key={knowledge.id}
                    onClick={() => setSelectedKnowledge(knowledge)}
                    className="w-full text-left bg-white rounded-2xl p-6 md:p-7 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 active:translate-y-0 border border-border-light group"
                    style={{ animationDelay: `${(categoryIndex * 0.1) + (index * 0.05)}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-text-dark mb-3 text-base md:text-lg group-hover:text-primary-blue transition-colors">
                          {knowledge.title}
                        </h4>
                        <p className="text-sm md:text-base text-text-light line-clamp-2 leading-relaxed">
                          {knowledge.summary}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-text-light group-hover:text-primary-blue group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                    <div className="mt-5 flex items-center gap-2">
                      <span className="text-xs md:text-sm px-3 py-1.5 bg-gradient-to-r from-primary-blue/10 to-primary-light-blue/10 text-primary-blue rounded-full font-medium">
                        {knowledge.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-20 md:hidden" />

      {selectedKnowledge && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedKnowledge(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary-blue to-primary-light-blue p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1 text-xs md:text-sm px-3 py-1.5 bg-white/20 text-white rounded-full font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    {selectedKnowledge.category}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-white mt-3 leading-tight">
                    {selectedKnowledge.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedKnowledge(null)}
                  className="p-2 md:p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto max-h-[55vh]">
              <div className="bg-gradient-to-r from-primary-blue/5 to-primary-light-blue/5 rounded-2xl p-5 md:p-6 mb-6 border border-primary-blue/10">
                <p className="text-text-medium leading-relaxed text-sm md:text-base">
                  💡 {selectedKnowledge.summary}
                </p>
              </div>
              <div className="text-sm md:text-base">
                {formatContent(selectedKnowledge.content)}
              </div>
            </div>

            <div className="p-5 md:p-6 border-t border-border-light bg-border-subtle/50">
              <button
                onClick={() => setSelectedKnowledge(null)}
                className="w-full py-4 bg-gradient-to-r from-primary-blue to-primary-light-blue text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-blue/20 flex items-center justify-center gap-2 group"
              >
                <span>我学到了</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
