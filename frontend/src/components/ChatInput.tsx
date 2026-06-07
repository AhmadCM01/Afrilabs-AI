'use client';

import { useState, useRef, useCallback } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  floating?: boolean;
}

export default function ChatInput({ onSend, isLoading, floating = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    autoResize();
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading;

  const inputField = (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-border/70 rounded-3xl transition-all duration-300 focus-within:ring-4 focus-within:ring-[#3A8C8A]/10 focus-within:border-teal/50 shadow-sm focus-within:shadow-md w-full">
      
      {/* Attachment clip icon (Mock button) */}
      <button
        type="button"
        title="Attach file"
        onClick={() => alert("File attachments feature is coming soon!")}
        className="shrink-0 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#1A3B5C] transition-all duration-200 cursor-pointer active:scale-95"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      </button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about AfriLabs…"
        rows={1}
        disabled={isLoading}
        className="flex-1 text-sm leading-relaxed bg-transparent outline-none placeholder:text-gray-400 disabled:opacity-50 min-h-[22px] max-h-[160px] overflow-y-auto font-medium py-1.5 px-1"
        style={{ color: '#111827', fontFamily: 'inherit', resize: 'none' }}
        aria-label="Chat message input"
      />

      {/* Circle Arrow Up Send button (ChatGPT reference) */}
      <button
        onClick={handleSubmit}
        disabled={!canSend}
        aria-label="Send message"
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
          canSend 
            ? 'bg-gradient-to-tr from-[#1A3B5C] to-[#3A8C8A] text-white hover:scale-105 active:scale-95 cursor-pointer shadow-sm' 
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className={canSend ? 'text-white' : 'text-gray-300'}>
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  );

  if (floating) {
    return (
      <div className="w-full flex flex-col items-center">
        {inputField}
        {/* Keyboard hint */}
        <p className="text-center text-[10px] mt-2 text-gray-400 select-none">
          <span className="text-gray-500 font-semibold">Enter</span> to send
          &nbsp;·&nbsp;
          <span className="text-gray-500 font-semibold">Shift+Enter</span> for new line
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-t from-cream via-cream to-transparent pt-3 pb-6 px-4 shrink-0 flex justify-center">
      <div className="w-full max-w-2xl">
        {inputField}
        {/* Keyboard hint */}
        <p className="text-center text-[10px] mt-2 text-gray-400 select-none">
          <span className="text-gray-500 font-semibold">Enter</span> to send
          &nbsp;·&nbsp;
          <span className="text-gray-500 font-semibold">Shift+Enter</span> for new line
        </p>
      </div>
    </div>
  );
}
