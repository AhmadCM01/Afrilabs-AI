'use client';

import Image from 'next/image';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onNewChat: () => void;
}

export default function MobileHeader({ onMenuClick, onNewChat }: MobileHeaderProps) {
  return (
    <header
      className="flex lg:hidden items-center justify-between px-4 h-14 shrink-0 bg-cream border-b border-border/50"
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        aria-label="Open sidebar"
        className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-gray-200/50 active:bg-gray-200"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6"  x2="21" y2="6" />
          <line x1="3" y1="12" x2="16" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Logo + badge */}
      <div className="flex items-center gap-2">
        <Image
          src="/afrilabs-logo.png"
          alt="AfriLabs"
          width={100}
          height={30}
          priority
          style={{ objectFit: 'contain' }}
        />
        <span
          className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ backgroundColor: '#1A3B5C', color: 'white' }}
        >
          AI
        </span>
      </div>

      {/* New chat — compose icon */}
      <button
        onClick={onNewChat}
        aria-label="New chat"
        className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-gray-200/50 active:bg-gray-200"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1A3B5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </header>
  );
}
