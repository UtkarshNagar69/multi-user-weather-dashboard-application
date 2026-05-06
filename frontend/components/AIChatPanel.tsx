'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { ChatMessage } from '@/types';

export default function AIChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat(trimmed, [...messages, userMsg]);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);

      // If the AI added/removed a city, refresh the dashboard
      if (res.action === 'city_added' || res.action === 'city_removed') {
        qc.invalidateQueries({ queryKey: ['dashboard'] });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Which city is warmest?',
    'Should I carry an umbrella?',
    'Compare all my cities',
    'Add Paris to my dashboard',
  ];

  return (
    <>
      {/* FAB Button */}
      <button
        id="ai-chat-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle AI chat"
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 100,
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4), 0 0 0 0 rgba(99,102,241,0.3)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          fontSize: '1.5rem',
          animation: !open ? 'fabPulse 2s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08) rotate(-4deg)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.4)';
        }}
      >
        {open ? '✕' : '🤖'}
      </button>

      <style>{`
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(99,102,241,0.4), 0 0 0 0 rgba(99,102,241,0.3); }
          50% { box-shadow: 0 8px 32px rgba(99,102,241,0.4), 0 0 0 8px rgba(99,102,241,0); }
        }
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ai-msg-md strong { font-weight: 700; color: var(--text-primary); }
        .ai-msg-md p { margin: 0 0 6px; }
        .ai-msg-md ul, .ai-msg-md ol { margin: 4px 0; padding-left: 18px; }
      `}</style>

      {/* Chat Panel */}
      {open && (
        <div
          style={{
            position: 'fixed', bottom: '92px', right: '24px', zIndex: 99,
            width: '400px', maxWidth: 'calc(100vw - 48px)',
            height: '520px', maxHeight: 'calc(100vh - 140px)',
            background: 'linear-gradient(135deg, rgba(10, 17, 40, 0.97), rgba(5, 10, 24, 0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'chatSlideIn 0.3s ease forwards',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                WeatherBot
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                AI-powered weather assistant
              </p>
            </div>
            <button
              onClick={() => { setMessages([]); }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
                fontSize: '0.72rem', color: 'var(--text-muted)', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            {/* Welcome message */}
            {messages.length === 0 && !loading && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '20px' }}>
                <div style={{ fontSize: '2.4rem' }}>🌤️</div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>
                  Hi! I&apos;m your WeatherBot
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, maxWidth: '280px' }}>
                  Ask me about weather in your cities, get outfit recommendations, or manage your dashboard with natural language.
                </p>
                {/* Suggestion chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '4px' }}>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      style={{
                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '16px', padding: '6px 14px', cursor: 'pointer',
                        fontSize: '0.75rem', color: 'var(--accent-purple)', transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  className={msg.role === 'assistant' ? 'ai-msg-md' : ''}
                  style={{
                    maxWidth: '85%', padding: '10px 14px', borderRadius: '14px',
                    fontSize: '0.84rem', lineHeight: 1.6, wordBreak: 'break-word',
                    ...(msg.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                          color: 'white', borderBottomRightRadius: '4px',
                        }
                      : {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: 'var(--text-secondary)', borderBottomLeftRadius: '4px',
                        }),
                  }}
                >
                  {formatMessage(msg.content)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px', padding: '12px 18px',
                  display: 'flex', gap: '5px', alignItems: 'center',
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-indigo)', animation: 'typingDot 1.2s ease infinite 0s' }} />
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-indigo)', animation: 'typingDot 1.2s ease infinite 0.2s' }} />
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-indigo)', animation: 'typingDot 1.2s ease infinite 0.4s' }} />
                </div>
              </div>
            )}
          </div>

          <style>{`
            @keyframes typingDot {
              0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
              40% { opacity: 1; transform: scale(1); }
            }
          `}</style>

          {/* Input */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: '8px', flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your weather…"
              disabled={loading}
              maxLength={500}
              className="input-glass"
              style={{ flex: 1, padding: '11px 14px', fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                background: input.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.04)',
                border: input.trim() ? 'none' : '1px solid rgba(255,255,255,0.06)',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s ease',
                boxShadow: input.trim() ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? 'white' : 'rgba(255,255,255,0.2)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// Simple markdown-like formatting for AI responses
function formatMessage(content: string): React.ReactNode {
  // Handle **bold** and split by newlines
  const lines = content.split('\n');
  return lines.map((line, i) => {
    // Replace **text** with bold
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const formatted = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );

    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={i} style={{ paddingLeft: '8px', display: 'flex', gap: '6px', marginBottom: '2px' }}>
          <span style={{ color: 'var(--accent-indigo)', flexShrink: 0 }}>•</span>
          <span>{formatted.slice(1)}</span>
        </div>
      );
    }

    return (
      <span key={i}>
        {formatted}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}
