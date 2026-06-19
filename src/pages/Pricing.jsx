import { Check } from 'lucide-react';
import { plans } from '../data/demoData';
import { useAuth } from '../lib/AuthContext';

export default function Pricing({ onOpenAuth }) {
  const { user, setPlanLocally } = useAuth();

  function handleSelect(plan) {
    if (!user) return onOpenAuth('signup');
    setPlanLocally(plan.id);
  }

  return (
    <div className="container" style={{ padding: '56px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p className="eyebrow" style={{ marginBottom: 10 }}>PLANS</p>
        <h1 style={{ fontSize: 36, marginBottom: 14 }}>Choose how you grow</h1>
        <p style={{ fontSize: 16, color: 'var(--ink-200)' }}>Start free. Upgrade when you're ready for more support.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 980, margin: '0 auto' }} id="pricing-grid">
        {plans.map((p) => {
          const isCurrent = user?.plan === p.id;
          return (
            <div
              key={p.id}
              className="glass-card"
              style={{
                padding: 30,
                border: p.featured ? '1.5px solid var(--magenta-500)' : undefined,
                position: 'relative',
                background: p.featured ? 'rgba(217,70,168,0.05)' : undefined,
              }}
            >
              {p.featured && (
                <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--gradient-aurora)', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </span>
              )}
              <p style={{ fontSize: 13, color: 'var(--lotus-300)', fontWeight: 600, marginBottom: 6 }}>{p.tagline}</p>
              <h3 style={{ fontSize: 24, marginBottom: 14 }}>{p.name}</h3>
              <p style={{ marginBottom: 22 }}>
                <span style={{ fontSize: 32, fontWeight: 700 }}>{p.price === 0 ? '0 UGX' : `UGX ${p.price.toLocaleString()}`}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-400)' }}>/month</span>
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 11 }}>
                {p.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, color: 'var(--ink-200)' }}>
                    <Check size={15} color="#4ADE80" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelect(p)}
                className={p.featured ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', opacity: isCurrent ? 0.6 : 1 }}
                disabled={isCurrent}
              >
                {isCurrent ? 'Current plan' : p.price === 0 ? 'Get started' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 880px) {
          #pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
