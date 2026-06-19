import { sessions, clubs, plans } from '../data/demoData';
import { useAuth } from '../lib/AuthContext';

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const currentPlan = plans.find((p) => p.id === user?.plan) || plans[0];

  return (
    <div className="container" style={{ padding: '56px 24px 80px' }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>YOUR SPACE</p>
      <h1 style={{ fontSize: 32, marginBottom: 36 }}>Welcome back, {user?.name?.split(' ')[0]}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }} id="dash-grid">
        <div className="glass-card" style={{ padding: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-400)', marginBottom: 6 }}>Current plan</p>
          <h3 style={{ fontSize: 22, marginBottom: 14 }}>{currentPlan.name}</h3>
          <p style={{ fontSize: 13.5, color: 'var(--ink-200)', marginBottom: 18 }}>{currentPlan.tagline}</p>
          <button className="btn-secondary" onClick={() => onNavigate('pricing')} style={{ fontSize: 13.5, padding: '9px 18px' }}>
            {user?.plan === 'pro' ? 'Manage plan' : 'Upgrade plan'}
          </button>
        </div>

        <div className="glass-card" style={{ padding: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-400)', marginBottom: 14 }}>This week</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13.5 }}>Sessions completed</span>
            <span style={{ fontWeight: 700 }}>4</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13.5 }}>Mindful minutes</span>
            <span style={{ fontWeight: 700 }}>62</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13.5 }}>Streak</span>
            <span style={{ fontWeight: 700 }}>5 days 🔥</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} id="dash-grid-2">
        <div className="glass-card" style={{ padding: 28 }}>
          <p style={{ fontWeight: 600, marginBottom: 16 }}>Continue listening</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.slice(0, 3).map((s) => (
              <div key={s.id} onClick={() => onNavigate('sessions')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(245,243,255,0.03)', cursor: 'pointer' }}>
                <span style={{ fontSize: 22 }}>{s.cover}</span>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600 }}>{s.title}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--ink-400)' }}>{s.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 28 }}>
          <p style={{ fontWeight: 600, marginBottom: 16 }}>Your clubs</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {clubs.slice(0, 3).map((c) => (
              <div key={c.id} onClick={() => onNavigate('clubs')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(245,243,255,0.03)', cursor: 'pointer' }}>
                <span style={{ fontSize: 22 }}>{c.emoji}</span>
                <p style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          #dash-grid, #dash-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
