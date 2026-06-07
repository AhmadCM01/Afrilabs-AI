'use client';

import Image from 'next/image';

interface WelcomeScreenProps {
  onSuggestionClick: (q: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  {
    label: 'About AfriLabs',
    text: 'What is AfriLabs and how many hubs are in the network?',
    theme: {
      border: 'hover:border-[#3A8C8A]/30',
      bgHover: 'hover:bg-[#3A8C8A]/[0.02]',
      shadowHover: 'hover:shadow-[#3A8C8A]/10',
      badgeBg: 'bg-[#3A8C8A]/10 text-[#3A8C8A]',
      iconColor: 'text-[#3A8C8A]',
      accentBg: 'bg-[#3A8C8A]',
    }
  },
  {
    label: 'Programmes',
    text: 'What is the AfriLabs Capacity Building Programme (ACBP)?',
    theme: {
      border: 'hover:border-emerald-500/30',
      bgHover: 'hover:bg-emerald-500/[0.02]',
      shadowHover: 'hover:shadow-emerald-500/10',
      badgeBg: 'bg-emerald-500/10 text-emerald-700',
      iconColor: 'text-emerald-600',
      accentBg: 'bg-emerald-500',
    }
  },
  {
    label: 'Reports',
    text: 'What are the key findings from the 2024 AfriLabs Impact Report?',
    theme: {
      border: 'hover:border-rose-500/30',
      bgHover: 'hover:bg-rose-500/[0.02]',
      shadowHover: 'hover:shadow-rose-500/10',
      badgeBg: 'bg-rose-500/10 text-rose-700',
      iconColor: 'text-rose-600',
      accentBg: 'bg-rose-500',
    }
  },
  {
    label: 'Initiatives',
    text: 'What initiatives does AfriLabs have for women entrepreneurs?',
    theme: {
      border: 'hover:border-amber-500/30',
      bgHover: 'hover:bg-amber-500/[0.02]',
      shadowHover: 'hover:shadow-amber-500/10',
      badgeBg: 'bg-amber-500/10 text-amber-700',
      iconColor: 'text-amber-600',
      accentBg: 'bg-amber-500',
    }
  },
];

function getSuggestionIcon(label: string) {
  switch (label) {
    case 'About AfriLabs':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3A8C8A] shrink-0">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'Programmes':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 shrink-0">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case 'Reports':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600 shrink-0">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'Initiatives':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 shrink-0">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    default:
      return null;
  }
}

export default function WelcomeScreen({ onSuggestionClick, isLoading }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full px-4 py-4 md:py-6 animate-fade-in bg-[radial-gradient(circle_at_top,_var(--color-sidebar)_0%,_var(--color-cream)_60%)]">
      
      {/* Center Stack Container */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 gap-5 md:gap-6">
        
        {/* 1. Logo & Greeting */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 md:mb-3 animate-fade-slide-up select-none">
            <Image
              src="/afrilabs-logo.png"
              alt="AfriLabs Logo"
              width={124}
              height={36}
              priority
              style={{ width: 'auto', height: 'auto', objectFit: 'contain' }}
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A3B5C] tracking-tight mb-1.5 select-none">
            Welcome to AfriLabs AI
          </h1>

          <p className="max-w-md text-xs md:text-sm text-gray-500 font-semibold leading-relaxed">
            Ask anything about Africa&apos;s largest network of innovation hubs.
          </p>
        </div>

        {/* 2. Enhanced Interactive Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-1">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(s.text)}
              className={`group relative flex flex-col p-5 md:py-6 md:px-6 bg-white/85 backdrop-blur-xs border border-border/40 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer h-full text-left focus:outline-none focus:ring-2 focus:ring-teal/10 overflow-hidden ${s.theme.border} ${s.theme.bgHover} ${s.theme.shadowHover}`}
            >
              {/* Left Accent Indicator Bar */}
              <span className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2 ${s.theme.accentBg}`} />
              
              <div className="pl-3 w-full flex flex-col h-full justify-between">
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${s.theme.badgeBg}`}>
                      {getSuggestionIcon(s.label)}
                    </div>
                    <span className="font-extrabold text-[#1A3B5C] text-[13px] tracking-tight">
                      {s.label}
                    </span>
                  </div>
                  {/* Subtle hover chevron arrow */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" className="text-gray-300 group-hover:text-teal group-hover:translate-x-0.5 transition-all duration-200">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                
                <span className="pl-0.5 text-gray-500 text-xs font-semibold leading-relaxed break-words">
                  {s.text}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 3. Quick-Tip shortcut chip */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 select-none animate-fade-in mt-1 select-none">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 border border-amber-200/50 text-amber-700 font-extrabold text-[9px] uppercase tracking-wider shadow-2xs">
            Tip
          </span>
          <span>
            Try: <button onClick={() => onSuggestionClick("What are the key findings from the 2024 AfriLabs Impact Report?")} className="text-teal hover:underline font-semibold cursor-pointer">"What are the key findings..."</button>
          </span>
        </div>

      </div>
    </div>
  );
}
