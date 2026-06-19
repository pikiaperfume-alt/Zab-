import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ZabLogo from './ZabLogo';
import { useAuth } from '../lib/AuthContext';

const NAV_ITEMS = [
  { key: 'home', label: 'Home' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'clubs', label: 'Clubs' },
  { key: 'tutors', label: 'Tutors' },
  { key: 'projects', label: 'Projects' },
  { key: 'pricing', label: 'Pricing' },
];

export default function NavBar({ page, onNavigate, onOpenAuth }) {
  const { user, logOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(14px)',
        background: 'rgba(11, 8, 32, 0.72)',
        borderBottom: '1px solid rgba(245,243,255,0.07)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <button onClick={() => onNavigate('home')} aria-label="ZAB home">
          <ZabLogo size={34} />
        </button>

        <nav style={{ display: 'flex', gap: 4 }} className="desktop-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={{
                padding: '10px 16px',
                borderRadius: 100,
                fontSize: 14.5,
                fontWeight: 500,
                color: page === item.key ? '#F5F3FF' : 'var(--ink-400)',
                background: page === item.key ? 'rgba(245,243,255,0.08)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
          {user ? (
            <>
              <button className="btn-secondary" style={{ padding: '9px 18px', fontSize: 14 }} onClick={() => onNavigate('dashboard')}>
                {user.name?.split(' ')[0] || 'You'}
              </button>
              <button
                onClick={logOut}
                style={{ fontSize: 14, color: 'var(--ink-400)', padding: '9px 10px' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onOpenAuth('login')} style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink-200)', padding: '10px 14px' }}>
                Log in
              </button>
              <button className="btn-primary" style={{ padding: '11px 22px', fontSize: 14.5 }} onClick={() => onOpenAuth('signup')}>
                Get Started
              </button>
            </>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu" style={{ display: 'none' }}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu" style={{ padding: '8px 24px 20px', display: 'none', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
              style={{ textAlign: 'left', padding: '12px 8px', fontSize: 16, color: page === item.key ? '#F5F3FF' : 'var(--ink-400)' }}
            >
              {item.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {user ? (
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { onNavigate('dashboard'); setMobileOpen(false); }}>Dashboard</button>
            ) : (
              <>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { onOpenAuth('login'); setMobileOpen(false); }}>Log in</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => { onOpenAuth('signup'); setMobileOpen(false); }}>Get Started</button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 880px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .mobile-menu { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
