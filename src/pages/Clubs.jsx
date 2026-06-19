import { useState } from 'react';
import { Users, Check } from 'lucide-react';
import { clubs } from '../data/demoData';
import { useAuth } from '../lib/AuthContext';

export default function Clubs({ onOpenAuth }) {
  const { user } = useAuth();
  const [joined, setJoined] = useState(new Set());

  function toggleJoin(id) {
    if (!user) return onOpenAuth('signup');
    setJoined((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="container" style={{ padding: '56px 24px 80px' }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>WELLNESS CLUBS</p>
      <h1 style={{ fontSize: 36, marginBottom: 14 }}>Communities built around shared interests</h1>
      <p style={{ fontSize: 16, color: 'var(--ink-200)', maxWidth: 580, marginBottom: 36, lineHeight: 1.6 }}>
        Group chats, voice rooms, weekly meetups, and guided sessions — find people who get it.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
        {clubs.map((c) => {
          const isJoined = joined.has(c.id);
          return (
            <div key={c.id} className="glass-card" style={{ padding: 26 }}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>{c.emoji}</div>
              <p style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>{c.name}</p>
              <p style={{ fontSize: 13.5, color: 'var(--ink-400)', lineHeight: 1.55, marginBottom: 18, minHeight: 42 }}>{c.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, color: 'var(--ink-400)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={13} /> {c.members.toLocaleString()}
                </span>
                <button
                  onClick={() => toggleJoin(c.id)}
                  style={{
                    padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                    background: isJoined ? 'rgba(74,222,128,0.12)' : 'var(--gradient-aurora)',
                    color: isJoined ? '#4ADE80' : 'white',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  {isJoined && <Check size={13} />} {isJoined ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
