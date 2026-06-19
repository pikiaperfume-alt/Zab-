export default function ZabLogo({ size = 36, withWordmark = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="zabGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="0.55" stopColor="#D946A8" />
            <stop offset="1" stopColor="#F0A8D8" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="#14102E" />
        <circle cx="44" cy="32" r="14" fill="url(#zabGrad)" />
        <path d="M40 30c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="#14102E" opacity="0.18" />
        <circle cx="44" cy="25" r="2.6" fill="#F5F3FF" />
        <path d="M38 35c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#F5F3FF" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M14 22h12l-12 16h12" stroke="#F5F3FF" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {withWordmark && (
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.55, color: '#F5F3FF', letterSpacing: '-0.02em' }}>
          ZAB
        </span>
      )}
    </div>
  );
}
