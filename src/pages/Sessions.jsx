import { useState } from 'react';
import { Play, Lock } from 'lucide-react';
import { sessions } from '../data/demoData';
import { useAuth } from '../lib/AuthContext';

const FILTERS = ['All', 'Meditation', 'Breathing', 'Sleep Story', 'Sleep Music', 'Binaural'];

export default function Sessions({ onOpenAuth, onUpgrade }) {
  const [filter, setFilter] = useState('All');
  const { user } = useAuth();
  const [playing, setPlaying] = useState(null);

  const filtered = filter === 'All' ? sessions : sessions.filter((s) => s.type === filter);

  function canAccess(s) {
    if (s.tier === 'free') return true;
    if (!user) return false;
    if (s.tier === 'sleep') return user.plan === 'sleep' || user.plan === 'pro';
    if (s.tier === 'pro') return user.plan === 'pro';
    return false;
  }

  function handlePlay(s) {
    if (!user) return onOpenAuth('signup');
    if (!canAccess(s)) return onUpgrade();
    setPlaying(s.id);
  }

  return (
    <div className="container" style={{ padding: '56px 24px 80px' }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>SESSIONS</p>
      <h1 style={{ fontSize: 36, marginBottom: 28 }}>Meditation, breathing & sleep</h1>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: 100, fontSize: 13.5, fontWeight: 500,
              background: filter === f ? 'var(--gradient-aurora)' : 'rgba(245,243,255,0.05)',
              border: '1px solid ' + (filter === f ? 'transparent' : 'rgba(245,243,255,0.1)'),
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
        {filtered.map((s) => {
          const locked = !canAccess(s);
          return (
            <div key={s.id} className="glass-card" style={{ padding: 22, position: 'relative' }}>
              {s.tier !== 'free' && (
                <span style={{
                  position: 'absolute', top: 16, right: 16, fontSize: 10.5, fontWeight: 700,
                  padding: '4px 9px', borderRadius: 100, background: 'rgba(217,70,168,0.18)', color: 'var(--dawn-400)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {s.tier === 'sleep' ? 'Sleep+' : 'Pro'}
                </span>
              )}
              <div style={{ fontSize: 36, marginBottom: 16 }}>{s.cover}</div>
              <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{s.title}</p>
              <p style={{ fontSize: 13, color: 'var(--ink-400)', marginBottom: 18 }}>{s.type} · {s.duration}</p>
              <button
                onClick={() => handlePlay(s)}
                style={{
                  width: '100%', padding: '10px', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
                  background: locked ? 'rgba(245,243,255,0.05)' : 'var(--gradient-aurora)',
                  color: locked ? 'var(--ink-200)' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {locked ? <Lock size={13} /> : <Play size={13} fill="white" />}
                {locked ? 'Unlock' : playing === s.id ? 'Playing…' : 'Play'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
