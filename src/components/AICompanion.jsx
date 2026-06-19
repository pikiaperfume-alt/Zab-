import { useEffect, useRef, useState } from 'react';
import { useNetworkStatus } from '../lib/network';
import { Sparkles, X, Send } from 'lucide-react';
import {
  sendToZabAI,
  availableZabAIProviders,
  zabAIProviderLabels,
  initialZabAIProvider,
} from '../lib/gemini';
import {
  isSupabaseReady,
  saveConversation,
  loadConversationHistory,
} from '../lib/supabase';

// Generate or retrieve a persistent user ID for the session
function getUserId() {
  let userId = localStorage.getItem('zab_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('zab_user_id', userId);
  }
  return userId;
}

export default function AICompanion({ mood }) {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(initialZabAIProvider);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi, I'm your ZAB companion. How are you arriving today?" },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const endRef = useRef(null);
  const userIdRef = useRef(getUserId());
  const network = useNetworkStatus();
  const lowDataMode = network.saveData || network.cellular;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Load conversation history from Supabase when component mounts or opens
  useEffect(() => {
    if (isSupabaseReady && open && !lowDataMode) {
      loadConversationHistory(userIdRef.current, 1).then(({ conversations, error }) => {
        if (error) {
          console.warn('[ZAB] Could not load history:', error);
        } else if (conversations.length > 0) {
          const lastConversation = conversations[0];
          if (lastConversation.messages && lastConversation.messages.length > 0) {
            // Optionally restore previous conversation
            // Commented out by default to avoid disrupting fresh chats
            // setMessages(lastConversation.messages);
          }
        }
      });
    }
  }, [open, lowDataMode]);

  async function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;
    const next = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setThinking(true);
    const reply = await sendToZabAI(
      next.map((m) => ({ role: m.role, text: m.text })),
      text,
      { mood, provider: selectedProvider }
    );
    const finalMessages = [...next, { role: 'assistant', text: reply }];
    setMessages(finalMessages);
    setThinking(false);

    // Save conversation to Supabase asynchronously
    if (isSupabaseReady) {
      setIsSaving(true);
      const { error } = await saveConversation(
        userIdRef.current,
        finalMessages,
        mood
      );
      if (error) {
        console.warn('[ZAB] Conversation not saved:', error);
      }
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open ZAB AI companion"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 90,
          width: 60, height: 60, borderRadius: '50%',
          background: 'var(--gradient-aurora)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(139,92,246,0.4)',
          transition: 'transform 0.2s ease',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? <X size={24} color="white" /> : <Sparkles size={24} color="white" />}
      </button>

      {open && (
        <div
          className="glass-card"
          style={{
            position: 'fixed', bottom: 96, right: 24, zIndex: 90,
            width: 340, maxWidth: 'calc(100vw - 48px)', height: 460,
            background: 'var(--night-800)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(245,243,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-aurora)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14.5 }}>ZAB Companion</p>
                <p style={{ fontSize: 11.5, color: 'var(--ink-400)' }}>AI-guided, here anytime</p>
              </div>
            </div>
            {availableZabAIProviders.length > 0 && (
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#F5F3FF',
                  border: '1px solid rgba(245,243,255,0.12)',
                  borderRadius: 999,
                  padding: '8px 10px',
                  fontSize: 12,
                }}
              >
                {['auto', ...availableZabAIProviders].map((provider) => (
                  <option key={provider} value={provider}>
                    {zabAIProviderLabels[provider] ?? provider}
                  </option>
                ))}
              </select>
            )}
          </div>
          {lowDataMode && (
            <div style={{ marginTop: 8, color: 'var(--ink-400)', fontSize: 12 }}>
              Low data mode is enabled: conversation history is disabled to reduce mobile bandwidth.
            </div>
          )}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? 'var(--gradient-aurora)' : 'rgba(245,243,255,0.06)',
                  padding: '10px 14px',
                  borderRadius: 16,
                  borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                  borderBottomLeftRadius: m.role === 'user' ? 16 : 4,
                  fontSize: 13.5,
                  lineHeight: 1.45,
                }}
              >
                {m.text}
              </div>
            ))}
            {thinking && (
              <div style={{ alignSelf: 'flex-start', fontSize: 13, color: 'var(--ink-400)', padding: '6px 14px' }}>
                thinking…
              </div>
            )}
            {isSaving && (
              <div style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--ink-300)', padding: '4px 14px', opacity: 0.7 }}>
                saving…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: 14, borderTop: '1px solid rgba(245,243,255,0.08)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share what's on your mind…"
              style={{
                flex: 1, background: 'rgba(245,243,255,0.05)', border: '1px solid rgba(245,243,255,0.12)',
                borderRadius: 100, padding: '10px 16px', color: '#F5F3FF', fontSize: 13.5,
              }}
            />
            <button type="submit" aria-label="Send" style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--gradient-aurora)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Send size={15} color="white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
