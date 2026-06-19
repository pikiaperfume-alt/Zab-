export default function HorizonDivider({ flip = false }) {
  return (
    <div className="horizon-divider" style={{ transform: flip ? 'scaleY(-1)' : 'none' }}>
      <svg viewBox="0 0 1200 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,90 L0,55 L120,30 L260,50 L400,20 L560,48 L700,15 L860,45 L1000,25 L1120,50 L1200,35 L1200,90 Z" fill="#1E1745" opacity="0.7" />
        <path d="M0,90 L0,68 L150,42 L320,62 L480,38 L640,60 L820,32 L960,58 L1100,40 L1200,55 L1200,90 Z" fill="#14102E" opacity="0.9" />
      </svg>
    </div>
  );
}
