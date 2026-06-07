'use client';

import Image from 'next/image';
import { Conversation } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConvId: string;
  onNewChat: () => void;
  onLoadConversation: (conv: Conversation) => void;
  onDeleteConversation: (id: string) => void;
  onFAQClick: (q: string) => void;
}

const FAQ_ITEMS = [
  {
    label: 'About AfriLabs',
    question: 'What is AfriLabs and how many hubs are in the network?',
  },
  {
    label: 'Programmes',
    question: 'What is the AfriLabs Capacity Building Programme (ACBP)?',
  },
  {
    label: 'Reports',
    question: 'What are the key findings from the 2024 AfriLabs Impact Report?',
  },
  {
    label: 'Initiatives',
    question: 'What initiatives does AfriLabs have for women entrepreneurs?',
  },
];

export default function Sidebar({
  isOpen,
  onClose,
  conversations,
  currentConvId,
  onNewChat,
  onLoadConversation,
  onDeleteConversation,
  onFAQClick,
}: SidebarProps) {
  return (
    <aside
      aria-label="Sidebar navigation"
      className={`app-sidebar ${isOpen ? 'open' : 'collapsed'}`}
    >
      {/* ── Brand header ── */}
      <div className="shrink-0 flex flex-col gap-2 px-5 pt-5 pb-4 border-b border-border/40 select-none">
        <div className="flex items-center justify-between">
          <Image
            src="/afrilabs-logo.png"
            alt="AfriLabs Logo"
            width={118}
            height={34}
            priority
            style={{ width: 'auto', height: 'auto', objectFit: 'contain', objectPosition: 'left' }}
          />
          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal/10 border border-teal/20 text-[#3A8C8A] tracking-wider select-none shadow-xs">
            v1.2
          </span>
        </div>
        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
          Knowledge Assistant
        </span>
      </div>

      {/* ── New Chat button ── */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <button
          onClick={() => { onNewChat(); onClose(); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#1A3B5C] to-[#3A8C8A] text-white shadow-md shadow-[#1A3B5C]/15 hover:shadow-lg hover:shadow-[#3A8C8A]/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:rotate-90 transition-transform duration-300">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
        </button>
      </div>

      {/* ── Scrollable list of recent conversations & FAQ ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-4 mt-2">
        
        {/* Recent sessions */}
        {conversations.length > 0 ? (
          <div className="flex flex-col">
            <p className="px-2 pb-2 pt-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase select-none">
              Recent
            </p>
            <ul className="space-y-1">
              {conversations.map((conv) => {
                const active = conv.id === currentConvId;
                return (
                  <li key={conv.id}>
                    <div className="flex items-center gap-1 w-full group animate-fade-in">
                      <button
                        onClick={() => { onLoadConversation(conv); onClose(); }}
                        className={`flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all duration-200 border text-left focus:outline-none ${
                          active 
                            ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-border/80 font-bold text-[#1A3B5C]' 
                            : 'hover:bg-white/60 hover:shadow-xs border-transparent hover:border-border/40 text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <span className="truncate w-full block font-semibold text-xs text-gray-700 group-hover:text-navy transition-colors">
                          {conv.title}
                        </span>
                      </button>
                      <button
                        onClick={() => onDeleteConversation(conv.id)}
                        aria-label="Delete conversation"
                        className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer active:scale-95"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center gap-2">
            <p className="text-[10px] font-semibold text-gray-400 leading-normal">
              Conversations will appear here.
            </p>
          </div>
        )}

        {/* HELP & FAQ Navigation Group */}
        <div className="flex flex-col mt-6 pt-5 border-t border-border/40 animate-fade-in">
          <p className="px-2 pb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase select-none">
            Help &amp; FAQ
          </p>
          <ul className="space-y-1">
            {FAQ_ITEMS.map((faq, idx) => (
              <li key={idx}>
                <button
                  onClick={() => { onFAQClick(faq.question); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-transparent hover:border-border/65 rounded-lg transition-all duration-200 group text-left cursor-pointer focus:outline-none"
                >
                  <span className="truncate flex-1 font-bold text-xs text-gray-500 group-hover:text-navy transition-colors">
                    {faq.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Sidebar Footer — anchored to bottom, never clips ── */}
      <div className="mt-auto pb-5 px-4 pt-3 border-t border-border/50 flex flex-col gap-2 shrink-0 bg-sidebar/50">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Avatar circle */}
            <div className="relative shrink-0 select-none">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm bg-gradient-to-tr from-[#3A8C8A] to-[#4DB5B2]"
              >
                U
              </div>
              {/* Online Indicator Badge */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-sidebar"></span>
              </span>
            </div>
            
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate leading-tight">User Account</p>
              <p className="text-[9.5px] font-semibold text-gray-400 truncate leading-normal">user@afrilabs.com</p>
            </div>
          </div>

          {/* Settings / Gear button */}
          <button 
            aria-label="Settings"
            onClick={() => alert("Settings configuration feature coming soon!")}
            className="shrink-0 p-2 rounded-xl border border-border/40 bg-white hover:bg-cream hover:text-navy text-gray-500 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-45 transition-transform duration-300">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
        
        <p className="text-[9.5px] leading-normal font-medium text-gray-400/90 mt-1 select-none">
          Powered by AfriLabs&apos; knowledge base — reports, programmes &amp; member hubs.
        </p>
      </div>
    </aside>
  );
}
