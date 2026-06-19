import { useState } from 'react';
import { X } from 'lucide-react';
import { projects } from '../data/demoData';
import { useAuth } from '../lib/AuthContext';

export default function Projects({ onOpenAuth }) {
  const { user } = useAuth();
  const [supporting, setSupporting] = useState(null);
  const [localRaised, setLocalRaised] = useState({});

  function handleSupport(p) {
    if (!user) return onOpenAuth('signup');
    setSupporting(p);
  }

  function onContributed(id, amount) {
    setLocalRaised((prev) => ({ ...prev, [id]: (prev[id] || 0) + amount }));
  }

  return (
    <div className="container" style={{ padding: '56px 24px 80px' }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>COMMUNITY PROJECTS</p>
      <h1 style={{ fontSize: 36, marginBottom: 14 }}>Things members are building, together</h1>
      <p style={{ fontSize: 16, color: 'var(--ink-200)', maxWidth: 600, marginBottom: 36, lineHeight: 1.6 }}>
        No unrealistic promises — just transparent updates on projects members voluntarily choose to support.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
        {projects.map((p) => {
          const raised = p.raised + (localRaised[p.id] || 0);
          const pct = Math.min(100, Math.round((raised / p.goal) * 100));
          return (
            <div key={p.id} className="glass-card" style={{ padding: 26 }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{p.emoji}</div>
              <p style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>{p.title}</p>
              <p style={{ fontSize: 13.5, color: 'var(--ink-400)', lineHeight: 1.55, marginBottom: 18 }}>{p.description}</p>

              <div style={{ height: 6, borderRadius: 100, background: 'rgba(245,243,255,0.08)', marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-aurora)', borderRadius: 100, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-400)', marginBottom: 18 }}>
                <span>{p.currency} {raised.toLocaleString()} raised</span>
                <span>{pct}% of goal</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>{p.backers} backers · {p.timeline}</span>
                <button onClick={() => handleSupport(p)} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Support</button>
              </div>
            </div>
          );
        })}
      </div>

      {supporting && (
        <SupportModal
          project={supporting}
          onClose={() => setSupporting(null)}
          onContributed={(amount) => onContributed(supporting.id, amount)}
        />
      )}
    </div>
  );
}

const AMOUNTS = [10000, 25000, 50000, 100000];

function SupportModal({ project, onClose, onContributed }) {
  const [amount, setAmount] = useState(AMOUNTS[1]);
  const [confirmed, setConfirmed] = useState(false);

  function confirm() {
    onContributed(amount);
    setConfirmed(true);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(11,8,32,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: 30, background: 'var(--night-800)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, color: 'var(--ink-400)' }}><X size={20} /></button>

        {!confirmed ? (
          <>
            <h3 style={{ fontSize: 20, marginBottom: 6 }}>Support {project.title}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-400)', marginBottom: 24 }}>Every contribution is shown transparently to backers.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  style={{
                    padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                    border: '1px solid ' + (amount === a ? 'var(--magenta-500)' : 'rgba(245,243,255,0.1)'),
                    background: amount === a ? 'rgba(217,70,168,0.1)' : 'rgba(245,243,255,0.03)',
                  }}
                >
                  UGX {a.toLocaleString()}
                </button>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={confirm}>Contribute UGX {amount.toLocaleString()}</button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🌱</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Thank you for your support</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-400)', marginBottom: 24 }}>You'll receive progress updates on {project.title}.</p>
            <button className="btn-secondary" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
