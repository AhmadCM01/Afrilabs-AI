'use client';

import { useState, useEffect, useRef } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Call the backend API
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">AfriLabs AI</h1>
          <p className="mt-1 text-sm text-gray-600">Africa's Wisdom Assistant - Powered by RAG</p>
        </div>
      </header>

      {/* Main chat area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6 max-w-4xl mx-auto">
        {/* Welcome message when no chat history */}
        {messages.length === 0 && (
          <div className="text-center">
            <div className="mb-6">
              <span className="text-4xl">🌍</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to AfriLabs AI</h2>
            <p className="text-gray-600 mb-6">
              Ask me anything about AfriLabs' programmes, reports, hubs, and initiatives across Africa.
            </p>
            <div className="space-y-3 text-left max-w-2xl mx-auto">
              <p className="flex items-start text-sm text-gray-500">
                <span className="flex-shrink-0 mr-2">•</span>
                <span>What is the AfriLabs Capacity Building Programme?</span>
              </p>
              <p className="flex items-start text-sm text-gray-500">
                <span className="flex-shrink-0 mr-2">•</span>
                <span>Which innovation hubs are in West Africa?</span>
              </p>
              <p className="flex items-start text-sm text-gray-500">
                <span className="flex-shrink-0 mr-2">•</span>
                <span>What are the key findings from the 2024 Impact Report?</span>
              </p>
              <p className="flex items-start text-sm text-gray-500">
                <span className="flex-shrink-0 mr-2">•</span>
                <span>How can organizations join the AfriLabs network?</span>
              </p>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div>
          {messages.map((message, index) => (
            <div key={index} className="max-w-[80%]">
              {message.role === 'user' ? (
                <div className="ml-auto">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-gray-900">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div className="mr-auto">
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-gray-900">
                    {message.content}
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Loading indicator */}
          {loading && (
            <div className="max-w-[80%] mr-auto">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse animate-pulse-delay-200"></div>
                <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse animate-pulse-delay-400"></div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Scroll spacer */}
        <div ref={messagesEndRef} />
      </main>

      {/* Input area */}
      <footer className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about AfriLabs..."
              className="flex-1 min-h-[48px] rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={loading || input.trim() === ''}
              className={`px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                loading
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}