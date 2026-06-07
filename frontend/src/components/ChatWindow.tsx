'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';
import Spinner from './Spinner';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  isFirstQuery: boolean;
  onSuggestionClick: (q: string) => void;
}

function LoadingAvatar() {
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

export default function ChatWindow({ messages, isLoading, isFirstQuery, onSuggestionClick }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <main className="flex-1 min-h-0 overflow-y-auto bg-cream flex flex-col items-center">
      {isEmpty ? (
        /* WelcomeScreen fills the scroll area and centres its content */
        <div className="flex h-full w-full">
          <WelcomeScreen onSuggestionClick={onSuggestionClick} isLoading={isLoading} />
        </div>
      ) : (
        /* Message feed: centred column, no overflow issues */
        <div className="w-full max-w-2xl px-4 pt-8 pb-8">
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isWarmingUp={isFirstQuery && i === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 mb-6 animate-fade-slide-up">
              <div className="mt-0.5 shrink-0">
                <LoadingAvatar />
              </div>
              <div
                className="px-4 py-4 rounded-2xl rounded-tl-md min-w-0 bg-white border border-gray-200/80 shadow-sm"
              >
                {isFirstQuery ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#3A8C8A' }} />
                      <span className="text-xs font-semibold text-[#1A3B5C]">Loading knowledge base…</span>
                    </div>
                    <p className="text-xs mb-3 text-gray-400">
                      First query may take up to 60 seconds. Subsequent queries will be instant.
                    </p>
                    <Spinner />
                  </div>
                ) : (
                  <Spinner />
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </main>
  );
}
