import { useState } from 'react';
import { ArrowRight, Play, Star } from 'lucide-react';
import HorizonDivider from '../components/HorizonDivider';
import { moods, moodRecommendations, sessions, clubs } from '../data/demoData';
import { useAuth } from '../lib/AuthContext';

export default function Home({ onNavigate, onOpenAuth, selectedMood, onSelectMood }) {
  const { user } = useAuth();
  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0];

  return (
    <div>
      {/* Hero */}
      <section style={{ position: 'relative', padding: '72px 0 40px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'center' }} id="hero-grid">
          <div>
            <p className="eyebrow" style={{ marginBottom: 18 }}>RELAX · CONNECT · GROW · TOGETHER</p>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.06, marginBottom: 22 }}>
              {firstName ? `${greeting}, ${firstName}` : 'A wellness ecosystem, not just an app'}
            </h1>
            <p style={{ fontSize: 17, color: 'var(--ink-200)', lineHeight: 1.6, marginBottom: 32, maxWidth: 480 }}>
              ZAB blends AI guidance, real human tutors, and communities who care — so you don't just listen,
              you connect, learn, and grow alongside other people.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => (user ? onNavigate('sessions') : onOpenAuth('signup'))}>
                {user ? 'Start a session' : 'Begin your journey'} <ArrowRight size={16} style={{ display: 'inline', marginLeft: 6, verticalAlign: -2 }} />
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('clubs')}>Explore clubs</button>
            </div>
          </div>

          <MoodCheckIn selectedMood={selectedMood} onSelectMood={onSelectMood} />
        </div>
      </section>

      <HorizonDivider />

      {/* Recommendations based on mood */}
      {selectedMood && (
        <section style={{ padding: '48px 0' }}>
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: 10 }}>FOR HOW YOU'RE FEELING</p>
            <h2 style={{ fontSize: 28, marginBottom: 24 }}>Recommended for you right now</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {moodRecommendations[selectedMood]?.map((rec, i) => (
                <div key={i} className="glass-card" style={{ padding: 22 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--gradient-aurora)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Play size={15} color="white" fill="white" />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sessions preview */}
      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <h2 style={{ fontSize: 28 }}>Today's sessions</h2>
            <button onClick={() => onNavigate('sessions')} style={{ color: 'var(--lotus-300)', fontWeight: 600, fontSize: 14.5 }}>See all →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {sessions.slice(0, 4).map((s) => (
              <div key={s.id} className="glass-card" style={{ padding: 20, cursor: 'pointer' }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{s.cover}</div>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{s.title}</p>
                <p style={{ fontSize: 12.5, color: 'var(--ink-400)' }}>{s.type} · {s.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs preview */}
      <section style={{ padding: '20px 0 72px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <h2 style={{ fontSize: 28 }}>Find your people</h2>
            <button onClick={() => onNavigate('clubs')} style={{ color: 'var(--lotus-300)', fontWeight: 600, fontSize: 14.5 }}>See all clubs →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {clubs.slice(0, 3).map((c) => (
              <div key={c.id} className="glass-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 30, marginBottom: 12 }}>{c.emoji}</div>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{c.name}</p>
                <p style={{ fontSize: 13.5, color: 'var(--ink-400)', lineHeight: 1.5, marginBottom: 14 }}>{c.description}</p>
                <p style={{ fontSize: 12.5, color: 'var(--lotus-300)' }}>{c.members.toLocaleString()} members</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) {
          #hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function MoodCheckIn({ selectedMood, onSelectMood }) {
  return (
    <div className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div className="breathing-orb" aria-hidden="true" style={{ marginBottom: 22 }} />
      <p style={{ fontSize: 13, color: 'var(--ink-400)', marginBottom: 8 }}>Take a deep breath.</p>
      <h3 style={{ fontSize: 19, marginBottom: 22 }}>How are you feeling today?</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {moods.map((m) => (
          <button
            key={m.key}
            onClick={() => onSelectMood(m.key)}
            style={{
              padding: '10px 14px',
              borderRadius: 100,
              fontSize: 13.5,
              fontWeight: 500,
              border: '1px solid ' + (selectedMood === m.key ? 'transparent' : 'rgba(245,243,255,0.14)'),
              background: selectedMood === m.key ? 'var(--gradient-aurora)' : 'rgba(245,243,255,0.04)',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <span>{m.emoji}</span> {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
