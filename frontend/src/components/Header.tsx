'use client';

import Image from 'next/image';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

export default function Header({ sidebarOpen, onToggleSidebar, onNewChat }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full flex items-center justify-between px-4 lg:px-6 h-14 shrink-0 bg-cream/80 backdrop-blur-md border-b border-border/40 select-none">
      
      {/* Sidebar toggle button (Left slot) */}
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger (lg:hidden) */}
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-gray-200/50 active:scale-95 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="2.2" strokeLinecap="round">
            {sidebarOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6"  x2="21" y2="6" />
                <line x1="3" y1="12" x2="16" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {/* Desktop Chevron (hidden lg:flex) */}
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl border border-border/50 bg-white hover:bg-cream text-gray-500 hover:text-gray-800 transition-all duration-200 cursor-pointer active:scale-95 shadow-xs hover:shadow-sm"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="animate-fade-in">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="animate-fade-in">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>
      </div>

      {/* Brand Logo & Name (Center slot) */}
      <div className="flex items-center gap-2.5 select-none">
        <Image
          src="/afrilabs-logo.png"
          alt="AfriLabs Logo"
          width={96}
          height={26}
          priority
          style={{ width: 'auto', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Actions (Right slot) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          aria-label="Start new chat"
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-gray-200/50 active:scale-95 text-navy cursor-pointer"
          title="New Chat"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>

    </header>
  );
}
