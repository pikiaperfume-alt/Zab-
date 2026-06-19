import ZabLogo from './ZabLogo';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(245,243,255,0.07)', padding: '48px 0 32px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <ZabLogo size={28} />
        <p style={{ fontSize: 13, color: 'var(--ink-400)' }}>Relax. Connect. Grow. Together.</p>
        <p style={{ fontSize: 12.5, color: 'var(--ink-400)' }}>© {new Date().getFullYear()} ZAB. All rights reserved.</p>
      </div>
    </footer>
  );
}
