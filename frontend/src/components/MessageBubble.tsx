'use client';

import { useState } from 'react';
import Spinner from './Spinner';
import SourcesPanel from './SourcesPanel';
import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isWarmingUp?: boolean;
}

/** Lightweight markdown → HTML (no external deps) */
function parseMarkdown(text: string): string {
  const codePlaceholders: string[] = [];

  // Fenced code blocks
  text = text.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => {
    const idx = codePlaceholders.length;
    codePlaceholders.push(
      `<pre class="bg-gray-50 border border-border/80 rounded-xl p-4 overflow-x-auto my-3"><code class="font-mono text-xs text-navy-900">${code
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    );
    return `__CODE_${idx}__`;
  });

  // Escape HTML (except placeholders)
  text = text.replace(/&(?!__CODE_)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Inline code
  text = text.replace(/`([^`]+)`/g,
    `<code class="bg-[#EEF2F7] text-navy px-1.5 py-0.5 rounded-md font-mono text-xs font-semibold">$1</code>`);

  // Headers
  text = text.replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold mt-4 mb-1.5 text-navy">$1</h3>');
  text = text.replace(/^## (.+)$/gm,  '<h2 class="text-base font-bold mt-4 mb-2 text-navy">$1</h2>');
  text = text.replace(/^# (.+)$/gm,   '<h1 class="text-lg font-bold mt-5 mb-2.5 text-navy">$1</h1>');

  // Bold + italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.+?)\*\*/g,   '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g,       '<em>$1</em>');

  // Lists
  text = text.replace(/^[\s]*[-*•] (.+)$/gm,
    '<li class="ml-5 list-disc outside mb-1 text-gray-800 font-normal">$1</li>');
  text = text.replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, '<ul class="mb-3">$&</ul>');
  text = text.replace(/^\d+\. (.+)$/gm,
    '<li class="ml-5 list-decimal outside mb-1 text-gray-800 font-normal">$1</li>');

  // HR
  text = text.replace(/^---$/gm, '<hr class="border-none border-t border-border/60 my-4">');

  // Paragraphs
  text = text.split(/\n{2,}/).map((para) => {
    para = para.trim();
    if (!para) return '';
    if (/^<(h[1-3]|ul|ol|hr|pre|li)/.test(para)) return para;
    return `<p class="mb-2.5 text-gray-800 font-normal leading-relaxed">${para.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  // Restore code blocks
  codePlaceholders.forEach((code, idx) => {
    text = text.replace(`__CODE_${idx}__`, code);
  });

  return text;
}

/** AI avatar — glowing navy gradient square with custom SVG star */
function AIAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-tr from-[#1A3B5C] to-[#2B5784] border border-[#3A8C8A]/25 shadow-xs relative overflow-hidden select-none">
      <span className="absolute inset-0 bg-[#3A8C8A]/10 animate-pulse" />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white relative z-10">
        <path
          d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

/** User avatar — modern teal gradient square with SVG profile icon */
function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-tr from-[#3A8C8A] to-[#4DB5B2] shadow-xs select-none">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

/** Action bar inside AI responses (Copy content, Thumbs feedback) */
function MessageActions({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 mt-2.5 flex-row justify-start select-none">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        title="Copy response"
        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer active:scale-95"
        aria-label="Copy response text"
      >
        {copied ? (
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 animate-fade-in">
            Copied
          </span>
        ) : (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>

      {/* Divider */}
      <span className="text-gray-200 text-[10px] select-none px-1">|</span>

      {/* Thumbs up */}
      <button
        onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
        title="Good response"
        className={`p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer active:scale-95 ${
          feedback === 'like' ? 'text-teal' : 'text-gray-400 hover:text-gray-600'
        }`}
        aria-label="Thumbs up"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </button>

      {/* Thumbs down */}
      <button
        onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
        title="Bad response"
        className={`p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer active:scale-95 ${
          feedback === 'dislike' ? 'text-gold' : 'text-gray-400 hover:text-gray-600'
        }`}
        aria-label="Thumbs down"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
        </svg>
      </button>
    </div>
  );
}

export default function MessageBubble({ message, isWarmingUp }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // ── User message ──
  if (isUser) {
    return (
      <div className="group flex justify-end items-start gap-3.5 mb-6 animate-fade-slide-up px-2 sm:px-4 flex-row-reverse">
        <div className="shrink-0 mt-1 select-none">
          <UserAvatar />
        </div>
        <div className="flex-1 min-w-0 max-w-[80%] sm:max-w-[70%] flex flex-col items-end">
          <div className="px-5 py-3 rounded-[20px] rounded-tr-[4px] bg-gradient-to-r from-[#1A3B5C] to-[#3A8C8A] text-white text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-sm hover:shadow-md transition-all duration-250">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // ── Assistant message ──
  return (
    <div className="group flex justify-start items-start gap-3.5 mb-6 animate-fade-slide-up px-2 sm:px-4">
      <div className="shrink-0 mt-1 select-none">
        <AIAvatar />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-white/85 backdrop-blur-xs border border-border/40 rounded-[20px] rounded-tl-[4px] shadow-sm hover:shadow-md transition-all duration-300 p-5">
          {/* Error state */}
          {message.isError ? (
            <div className="px-4 py-3 rounded-xl text-sm leading-relaxed bg-[#FDF2F2] text-[#9B1C1C] border border-[#F8B4B4]/50 shadow-xs animate-fade-in">
              <p className="font-bold text-xs mb-1">Error Connection</p>
              <p className="font-medium text-xs leading-normal">{message.content}</p>
            </div>

          ) : isWarmingUp && !message.content ? (
            /* Warm-up state */
            <div className="px-1 py-1 text-sm animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-teal animate-ping" />
                <span className="text-xs font-bold text-navy">
                  Loading knowledge base…
                </span>
              </div>
              <p className="text-[11px] mb-2 text-gray-400 font-medium leading-normal">
                First query may take up to 60 seconds to cold-start. Subsequent queries will be instant.
              </p>
              <Spinner />
            </div>

          ) : !message.content ? (
            /* Generic loading */
            <div className="px-1 py-1 animate-fade-in">
              <Spinner />
            </div>

          ) : (
            /* Normal answer */
            <div className="px-0 py-0 text-sm leading-relaxed text-gray-800">
              <div
                className="prose-afrilabs"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
              />
              {/* Copy / feedback menu */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <MessageActions text={message.content} />
              </div>
            </div>
          )}

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <SourcesPanel sources={message.sources} />
          )}
        </div>
      </div>
    </div>
  );
}
