'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message, Conversation } from '@/types';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';

const STORAGE_KEY = 'afrilabs-conversations';
const MAX_CONVS = 5;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string>('');
  const [isFirstQuery, setIsFirstQuery] = useState(true);

  const isEmpty = messages.length === 0 && !isLoading;

  useEffect(() => {
    // Default close sidebar on mobile, open on desktop
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConversations(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', sidebarOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [sidebarOpen]);

  const persistConversations = (convs: Conversation[]) => {
    setConversations(convs);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(convs)); } catch { /* full */ }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConvId('');
    setSidebarOpen(false);
  };

  const loadConversation = (conv: Conversation) => {
    setMessages(conv.messages);
    setCurrentConvId(conv.id);
    setSidebarOpen(false);
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    persistConversations(updated);
    if (currentConvId === id) startNewChat();
  };

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content };
      const msgsWithUser = [...messages, userMsg];
      setMessages(msgsWithUser);
      setIsLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error ?? `HTTP ${res.status}`);
        }

        const data = await res.json();
        const assistantMsg: Message = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.answer ?? '',
          sources: data.sources ?? [],
        };

        const finalMsgs = [...msgsWithUser, assistantMsg];
        setMessages(finalMsgs);
        setIsFirstQuery(false);

        const convId = currentConvId || `c-${Date.now()}`;
        const title = content.length > 45 ? `${content.slice(0, 45)}…` : content;
        const updatedConv: Conversation = { id: convId, title, messages: finalMsgs, createdAt: Date.now() };

        const existingIdx = conversations.findIndex((c) => c.id === convId);
        const updatedConvs = existingIdx >= 0
          ? conversations.map((c, i) => (i === existingIdx ? updatedConv : c))
          : [updatedConv, ...conversations].slice(0, MAX_CONVS);

        persistConversations(updatedConvs);
        setCurrentConvId(convId);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: 'assistant', content: `${msg}\n\nPlease make sure the backend server is running on port 8000.`, isError: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, conversations, currentConvId]
  );

  return (
    <div className="app-shell">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        currentConvId={currentConvId}
        onNewChat={startNewChat}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
        onFAQClick={sendMessage}
      />

      {/* Main App Container */}
      <div className="app-main relative">
        
        {/* Universal Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={startNewChat}
        />

        {/* Scrollable message / welcome area */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          isFirstQuery={isFirstQuery}
          onSuggestionClick={sendMessage}
        />

        {/* Pinned input bar (Always present at bottom for consistency) */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
