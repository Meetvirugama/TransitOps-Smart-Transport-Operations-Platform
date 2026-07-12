import React, { useState, useRef, useEffect } from 'react';
import api from '../config/api';

const SUGGESTED_PROMPTS = [
  'What is the current fleet utilization?',
  'Which vehicles need attention?',
  'How many trips are active right now?',
  'Give me a summary of today\'s operations',
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl rounded-bl-sm bg-white/5 border border-white/8 w-fit">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-dark-muted animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  );
}

function Message({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-[10px] mr-2 mt-0.5 shrink-0">
          🤖
        </div>
      )}
      <div
        className={`max-w-[82%] px-3 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-brand/20 border border-brand/30 text-dark-text rounded-br-sm'
            : 'bg-white/5 border border-white/8 text-dark-text rounded-bl-sm'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your TransitOps AI Assistant. Ask me anything about your fleet, trips, or drivers.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setShowPulse(false);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userText });
      if (res.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I couldn\'t connect to the AI service. Please ensure the backend is running and the Gemini API key is configured.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          background: 'rgba(7, 10, 18, 0.97)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.8), 0 0 40px -8px rgba(178, 94, 19, 0.12)',
        }}
        aria-label="AI Fleet Assistant Chat"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8 bg-white/2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-sm">
              🤖
            </div>
            <div>
              <div className="text-xs font-bold text-dark-text font-heading">Fleet AI Assistant</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span>
                <span className="text-[10px] text-dark-muted font-mono">Powered by Gemini</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-dark-muted hover:text-dark-text transition-colors text-xl leading-none cursor-pointer w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/5"
            aria-label="Close AI chat"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[340px] min-h-[200px]">
          {messages.map((msg, i) => (
            <Message key={i} role={msg.role} content={msg.content} />
          ))}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="w-6 h-6 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-[10px] mr-2 mt-0.5 shrink-0">
                🤖
              </div>
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts — shown only at the start */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/10 text-dark-muted hover:border-brand/40 hover:text-dark-text hover:bg-brand/5 transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/8 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your fleet..."
            disabled={loading}
            className="flex-1 bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-xs text-dark-text placeholder-dark-muted outline-none focus:border-brand/40 focus:bg-white/6 transition-all disabled:opacity-50"
            aria-label="Chat input"
            maxLength={1000}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
            aria-label="Send message"
            style={{ boxShadow: '0 4px 12px rgba(178, 94, 19, 0.3)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #B25E13 0%, #c46816 100%)',
          boxShadow: isOpen
            ? '0 8px 25px rgba(178, 94, 19, 0.5)'
            : '0 4px 18px rgba(178, 94, 19, 0.35)',
        }}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI Fleet Assistant'}
        aria-expanded={isOpen}
      >
        {/* Pulse ring — shown when chat hasn't been opened yet */}
        {showPulse && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-brand opacity-50 animate-ping" style={{ animationDuration: '2s' }}></span>
        )}
        <span className="text-xl transition-transform duration-200" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          {isOpen ? '✕' : '🤖'}
        </span>
      </button>
    </>
  );
}
