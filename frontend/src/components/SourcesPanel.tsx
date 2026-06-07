'use client';

import { useState } from 'react';
import { Source } from '@/types';

interface SourcesPanelProps {
  sources: Source[];
}

function getSourceIcon(docType: string) {
  switch (docType) {
    case 'report':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500 shrink-0">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'blog':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case 'programme':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case 'hub':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 shrink-0">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="9" y1="22" x2="9" y2="16" />
          <line x1="15" y1="22" x2="15" y2="16" />
        </svg>
      );
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

function DocBadge({ docType }: { docType: string }) {
  const labels: Record<string, string> = {
    report: 'Report',
    blog: 'Blog',
    programme: 'Programme',
    hub: 'Hub',
  };
  const label = labels[docType] ?? docType;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[9px] font-extrabold uppercase tracking-wider border border-gray-200/50 select-none">
      {getSourceIcon(docType)}
      {label}
    </span>
  );
}

export default function SourcesPanel({ sources }: SourcesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-border/30 select-none">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-bold transition-all duration-200 hover:opacity-80 cursor-pointer text-teal focus:outline-none"
      >
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {isOpen ? 'Hide Sources' : `Show ${sources.length} Source${sources.length !== 1 ? 's' : ''}`}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Grid of structured source cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {sources.map((src, i) => {
              const isActive = activeIdx === i;
              const labels: Record<string, string> = {
                report: 'Report',
                blog: 'Blog',
                programme: 'Programme',
                hub: 'Hub',
              };
              const label = labels[src.doc_type] ?? src.doc_type;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIdx(isActive ? null : i)}
                  className={`group flex flex-col p-3 rounded-xl border text-left min-w-0 transition-all duration-250 cursor-pointer ${
                    isActive 
                      ? 'bg-white border-[#3A8C8A] shadow-xs font-semibold' 
                      : 'bg-cream/45 border-border/50 hover:bg-white hover:border-[#3A8C8A]/35 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5 w-full">
                    <span className={`shrink-0 w-5 h-5 rounded-full text-[9px] font-extrabold flex items-center justify-center border transition-colors ${
                      isActive 
                        ? 'bg-[#3A8C8A] border-[#3A8C8A] text-white' 
                        : 'bg-white border-border/80 text-gray-400 group-hover:text-teal group-hover:border-teal/30'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 group-hover:text-gray-500 transition-colors">
                      {label}
                    </span>
                    {src.country && src.country !== 'Unknown' && (
                      <span className="text-[9px] text-gray-400 font-bold shrink-0 truncate max-w-[80px] ml-auto">
                        {src.country}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-gray-700 truncate w-full tracking-tight group-hover:text-navy transition-colors">
                    {src.title || 'Untitled Source'}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected source details box */}
          {activeIdx !== null && sources[activeIdx] && (
            <div className="p-4 rounded-xl border border-border/40 bg-cream/50 backdrop-blur-xs animate-fade-in relative text-xs text-gray-600 shadow-sm">
              <button
                onClick={() => setActiveIdx(null)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-md hover:bg-black/5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                aria-label="Close details"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <span className="font-extrabold text-navy">Source Details [{activeIdx + 1}]</span>
                <DocBadge docType={sources[activeIdx].doc_type} />
                {sources[activeIdx].country && sources[activeIdx].country !== 'Unknown' && (
                  <span className="text-gray-400 font-bold bg-white/70 px-1.5 py-0.5 rounded border border-gray-200/50">📍 {sources[activeIdx].country}</span>
                )}
              </div>
              
              <p className="font-bold text-gray-800 mb-1.5">{sources[activeIdx].title}</p>
              
              {sources[activeIdx].page_content && (
                <div className="relative pl-4 border-l-4 border-l-[#3A8C8A] bg-white p-3.5 rounded-r-xl border border-y border-r border-border/30 mt-2 font-medium text-gray-700 leading-relaxed italic shadow-sm">
                  <span className="absolute -top-2.5 -left-1.5 text-4xl text-teal/10 font-serif select-none pointer-events-none">“</span>
                  &ldquo;{sources[activeIdx].page_content}&rdquo;
                </div>
              )}
              
              {sources[activeIdx].source_url && (
                <a
                  href={sources[activeIdx].source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3.5 font-bold text-[#3A8C8A] hover:text-navy hover:underline transition-colors select-none text-xs"
                >
                  View original source
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
